import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { runMigrations } from 'stripe-replit-sync';
import { getStripeSync } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";
import { pool } from "./db";

const app = express();
const httpServer = createServer(app);

// Increase timeouts for large file uploads (30 minutes)
httpServer.timeout = 1800000;
httpServer.headersTimeout = 1800000;
httpServer.keepAliveTimeout = 1800000;
httpServer.requestTimeout = 1800000;

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Initialize Stripe schema and sync data on startup
async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    log('DATABASE_URL not set, skipping Stripe initialization', 'stripe');
    return;
  }

  try {
    log('Initializing Stripe schema...', 'stripe');
    await runMigrations({ 
      databaseUrl,
      schemaName: 'stripe'
    } as any);
    log('Stripe schema ready', 'stripe');

    // Get StripeSync instance
    const stripeSync = await getStripeSync();

    // Set up managed webhook
    log('Setting up managed webhook...', 'stripe');
    const domains = process.env.REPLIT_DOMAINS?.split(',') || [];
    if (domains.length > 0) {
      const webhookBaseUrl = `https://${domains[0]}`;
      try {
        const result = await stripeSync.findOrCreateManagedWebhook(
          `${webhookBaseUrl}/api/stripe/webhook`
        );
        if (result && result.webhook) {
          log(`Webhook configured: ${result.webhook.url}`, 'stripe');
        } else {
          log('Webhook created but no URL returned', 'stripe');
        }
      } catch (webhookError: any) {
        log(`Webhook setup warning: ${webhookError.message}`, 'stripe');
        // Continue even if webhook setup fails - it may already exist
      }
    } else {
      log('No REPLIT_DOMAINS found, skipping webhook setup', 'stripe');
    }

    // Sync all existing Stripe data in background
    log('Syncing Stripe data in background...', 'stripe');
    stripeSync.syncBackfill()
      .then(() => log('Stripe data synced', 'stripe'))
      .catch((err: any) => log(`Error syncing Stripe data: ${err.message}`, 'stripe'));

  } catch (error: any) {
    log(`Failed to initialize Stripe: ${error.message}`, 'stripe');
  }
}

async function runDataMigrations() {
  try {
    // Rename "Adar Jokes 2026 #1" → "Joke Track Academy" in JKP category
    await pool.query(
      `UPDATE videos SET title = 'Joke Track Academy'
       WHERE id = '06bfa733-9464-499a-b55c-b3e6cdd68df2'
       AND title != 'Joke Track Academy'`
    );

    // Create "Series / Ongoing" category if it doesn't exist
    await pool.query(
      `INSERT INTO video_categories (id, name, parent_category_id)
       VALUES (gen_random_uuid()::varchar, 'Series / Ongoing', NULL)
       ON CONFLICT (name) DO NOTHING`
    );

    // Move "The ultimate letter/ Iggeres Haramban {part 1}" to Series / Ongoing
    await pool.query(
      `UPDATE videos SET category_id = (
         SELECT id FROM video_categories WHERE name = 'Series / Ongoing' LIMIT 1
       )
       WHERE id = '5b8df136-6468-437c-96cf-b3320ad948c8'`
    );

    // ── Schema: user_video_views unique constraint (deduplicate per user/video) ──
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes
          WHERE tablename = 'user_video_views'
          AND indexname = 'user_video_views_user_video_unique'
        ) THEN
          -- Remove duplicates first (keep earliest entry)
          DELETE FROM user_video_views
          WHERE id NOT IN (
            SELECT MIN(id) FROM user_video_views GROUP BY user_id, video_id
          );
          -- Add unique constraint
          ALTER TABLE user_video_views
          ADD CONSTRAINT user_video_views_user_video_unique UNIQUE (user_id, video_id);
          -- Reset view counts to match unique actual viewers
          UPDATE videos v
          SET view_count = (
            SELECT COUNT(*) FROM user_video_views uvv WHERE uvv.video_id = v.id
          );
        END IF;
      END $$
    `);

    // ── Schema: direct_messages table ───────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS direct_messages (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        from_admin BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // ── Schema: dashboard_banners table ─────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS dashboard_banners (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
        title TEXT NOT NULL,
        subtitle TEXT,
        image_url TEXT,
        video_id VARCHAR,
        is_active BOOLEAN DEFAULT TRUE,
        is_auto_generated BOOLEAN DEFAULT FALSE,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // ── Seed: story sub-categories (idempotent by name + parent) ────────────
    const storiesRow = await pool.query(
      `SELECT id FROM video_categories WHERE name = 'Stories' AND parent_category_id IS NULL LIMIT 1`
    );
    if (storiesRow.rows.length > 0) {
      const storiesId = storiesRow.rows[0].id;
      const subCats = [
        'Shabbos Stories',
        'Yom Tov Stories',
        'Emunah Stories',
        'Middos & Character',
        'Tzaddikim Stories',
        'Everyday Life',
        'History & Miracles',
      ];
      for (let i = 0; i < subCats.length; i++) {
        await pool.query(
          `INSERT INTO video_categories (id, name, sort_order, parent_category_id)
           VALUES (gen_random_uuid()::varchar, $1, $2, $3)
           ON CONFLICT (name) DO NOTHING`,
          [subCats[i], i + 1, storiesId]
        );
      }
    }

    // ── Categorize Stories videos into subcategories by title (idempotent) ─────
    if (storiesRow.rows.length > 0) {
      const storiesId = storiesRow.rows[0].id;
      // Map: subcategory name → array of video titles that belong there
      const categoryTitleMap: Record<string, string[]> = {
        'Yom Tov Stories': [
          'Chanukah 2022', 'Copy of Purim 5780', 'Pesach #1 - Jump',
          'Purim The Train Conductor', 'chol hamod 4', 'chol hamoed #2',
          'new story chol hamod 3',
        ],
        'Shabbos Stories': [
          'Avos Ubonim 2', 'Avos Ubonim Vayeira', 'Lutzk Avos Ubonim',
        ],
        'Tzaddikim Stories': [
          'DEJE REBBE', "R' Chaim kaniefsky", 'Ishbitz',
          "The Rebbe's Coffee", 'Ger Lutzk', 'Sar Hamazel',
        ],
        'Emunah Stories': [
          'Yearning', 'Searching for Happiness', 'Higher and Higher', 'Dreams',
          'Ill Always be There For you', '6 Constant Mitzvos', 'become jewish',
          'Two Brothers - Two Worlds Apart', 'Moving to Israel', 'Lila',
          'The Cancelled Snowtubing Trip',
        ],
        'History & Miracles': [
          'Operation Thunderbolt', 'The Great Escape', 'The Versailles Disaster',
          'The Incredible Story of the MIG 21', 'Henry Ford', 'War Time',
          'insane hostege rescue', 'Stuck in Moscow', 'The Boston Surgeon',
          'The 4 Minute Mile', 'Living on the Lebanon Border',
          'Vintage Lakewood & A Miracle in St. Louis', 'The Secret Mission',
          'Prisoner Exchange', 'African', 'California on Fire', 'Facing the Giants',
          'The black coat', 'japan', 'japan 2', 'japan 3',
          'Parshas Ki Sisa', 'Parshas Teruma', 'Parshas Tetzave',
          'A prisoner on the loose', 'Sharks in tank', 'Siamese Twins',
          'The Science of a Boom', 'Moshlei 1',
        ],
        'Middos & Character': [
          'Marginal Gains', 'Marshmellow experiment', 'The Partnership',
          'Advice from a Billlionaire', 'The mean Grocer new!',
          'The Homeless Restaurant Owner', 'Who Packs Your Parachute',
          'Speed & Humility', 'The Convention', 'STOP',
          "It's All in the Preparation", 'Why two Executives', 'The Misfit',
          'A Unique Competition in London', 'Yossel the Contractor',
          'Do Barbers exist?', 'Ziggy',
        ],
        'Everyday Life': [
          'My First Flight', 'Pizza Place', 'Garbage can', 'Elevator experiment',
          'Pinks HOt Dogs', 'Check the Cameras!', 'Visiting MDY', 'florida',
          'football in south bend', 'Army Trick Gone Wrong! 🤣 See What Happened! 😲',
          'Batting cages 2', 'Crash', 'Cocoa cola', 'Sprayed with gas',
          'Shibuya Scramble', 'plane', 'MC DONALDS', '51 minutes', 'shewki',
          'weel chair', 'Camp Video cchf', "mendy's revenge",
          'The Road Coninues', '⏯️⏸️▶️ no show party',
        ],
      };
      for (const [subCatName, titles] of Object.entries(categoryTitleMap)) {
        if (!titles.length) continue;
        await pool.query(
          `UPDATE videos
           SET category_id = (
             SELECT vc.id FROM video_categories vc
             WHERE vc.name = $1
               AND vc.parent_category_id = $2
             LIMIT 1
           )
           WHERE title = ANY($3)
             AND category_id = $2`,
          [subCatName, storiesId, titles]
        );
      }
    }

    // ── Seed: banner slides from recent Stories videos (if banners table is empty) ──
    const bannerCount = await pool.query(`SELECT COUNT(*) FROM dashboard_banners`);
    if (parseInt(bannerCount.rows[0].count) === 0) {
      // Pick up to 6 recent ready Stories videos with thumbnails
      const recentStories = await pool.query(`
        SELECT v.id, v.title, v.thumbnail_path
        FROM videos v
        JOIN video_categories vc ON v.category_id = vc.id
        WHERE (vc.name = 'Stories' OR vc.parent_category_id = (
          SELECT id FROM video_categories WHERE name = 'Stories' AND parent_category_id IS NULL LIMIT 1
        ))
        AND v.status = 'ready'
        AND v.thumbnail_path IS NOT NULL
        AND v.thumbnail_path != ''
        ORDER BY v.created_at DESC
        LIMIT 6
      `);
      for (let i = 0; i < recentStories.rows.length; i++) {
        const { id, title, thumbnail_path } = recentStories.rows[i];
        await pool.query(
          `INSERT INTO dashboard_banners (id, title, subtitle, image_url, video_id, is_active, is_auto_generated, display_order)
           VALUES (gen_random_uuid()::varchar, $1, $2, $3, $4, TRUE, TRUE, $5)`,
          [title, 'New story just added — tap to watch!', thumbnail_path, id, i]
        );
      }
    }

    log('Data migrations complete', 'migration');
  } catch (err: any) {
    log(`Data migration error: ${err.message}`, 'migration');
  }
}

(async () => {
  // Initialize Stripe first
  await initStripe();

  // Run one-time data migrations
  await runDataMigrations();

  // Register Stripe webhook route BEFORE express.json()
  // This is critical - webhook needs raw Buffer, not parsed JSON
  app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      const signature = req.headers['stripe-signature'];

      if (!signature) {
        return res.status(400).json({ error: 'Missing stripe-signature' });
      }

      try {
        const sig = Array.isArray(signature) ? signature[0] : signature;

        if (!Buffer.isBuffer(req.body)) {
          log('Webhook error: req.body is not a Buffer', 'stripe');
          return res.status(500).json({ error: 'Webhook processing error' });
        }

        await WebhookHandlers.processWebhook(req.body as Buffer, sig);
        res.status(200).json({ received: true });
      } catch (error: any) {
        log(`Webhook error: ${error.message}`, 'stripe');
        res.status(400).json({ error: 'Webhook processing error' });
      }
    }
  );

  // CORS configuration for mobile app and web access
  app.use(cors({
    origin: true, // Allow all origins (mobile apps, web)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  // Now apply JSON middleware for all other routes
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false }));

  // Request logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        log(logLine);
      }
    });

    next();
  });

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    log(`Error: ${message} (${status})`, 'error');
    console.error(err);
    
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  // Setup vite in development, serve static in production
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
