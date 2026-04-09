import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { runMigrations } from 'stripe-replit-sync';
import { getStripeSync, getUncachableStripeClient } from "./stripeClient";
import { getUncachableResendClient } from "./resendClient";
import { FROM_EMAIL, getPasswordResetEmail } from "./emailTemplates";
import { WebhookHandlers } from "./webhookHandlers";
import { pool } from "./db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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
          'Ger Lutzk', 'Sar Hamazel',
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

    // ── Schema: email_notifications column on users ──────────────────────────
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true`);

    // ── Schema: video_favorites table ────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS video_favorites (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        video_id VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (user_id, video_id)
      )
    `);

    // ── Schema: video_progress table ─────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS video_progress (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        video_id VARCHAR NOT NULL,
        position_seconds INTEGER DEFAULT 0,
        duration_seconds INTEGER,
        completed BOOLEAN DEFAULT false,
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (user_id, video_id)
      )
    `);

    // ── Schema: video_likes table ─────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS video_likes (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        video_id VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (user_id, video_id)
      )
    `);

    // ── Schema: notifications table ───────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        body TEXT,
        video_id VARCHAR,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // "The Rebbe's Coffee" belongs in Films, not Tzaddikim Stories
    await pool.query(
      `UPDATE videos SET category_id = (
         SELECT id FROM video_categories WHERE name = 'Films' AND parent_category_id IS NULL LIMIT 1
       )
       WHERE title = $1`,
      ["The Rebbe's Coffee"]
    );

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

    // ── Schema: parental_controls table ──────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS parental_controls (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
        user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        pin_hash TEXT NOT NULL,
        parent_email TEXT NOT NULL,
        time_limit_minutes INTEGER NOT NULL,
        time_period TEXT NOT NULL,
        category_ids TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // ── Schema: watch_time_logs table ────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS watch_time_logs (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::varchar,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        video_id VARCHAR,
        seconds_watched INTEGER NOT NULL DEFAULT 0,
        log_date TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // ── Schema: banner expires_at column ───────────────────────────────────
    await pool.query(`
      ALTER TABLE dashboard_banners
      ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP
    `);

    // ── Insert Parental Controls promotional banner ─────────────────────────
    await pool.query(`
      INSERT INTO dashboard_banners (id, title, subtitle, is_active, display_order, expires_at, created_at)
      SELECT
        'promo-parental-controls-2026',
        '🛡️ NEW: Screen Time Controls',
        'Parents — you are in control. Set daily, weekly, or monthly limits so your kids enjoy great content without going overboard. Quick to set up right in your Account Settings.',
        TRUE,
        -1,
        NOW() + INTERVAL '7 days',
        NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM dashboard_banners WHERE id = 'promo-parental-controls-2026'
      )
    `);

    // ── Schema: custom_mood column on videos ────────────────────────────────
    await pool.query(`
      ALTER TABLE videos ADD COLUMN IF NOT EXISTS custom_mood TEXT
    `);

    // ── Seed: admin user (schellereli@gmail.com) — always ensure correct credentials ──
    const adminHash = await bcrypt.hash('dd99617a', 10);
    await pool.query(
      `INSERT INTO users (id, email, password, family_name, role, account_type, subscription_status, has_used_trial, created_at)
       VALUES (gen_random_uuid()::varchar, 'schellereli@gmail.com', $1, 'Rabbi Eli Scheller', 'admin', 'standard', 'active', true, NOW())
       ON CONFLICT (email) DO UPDATE SET
         password = EXCLUDED.password,
         role = 'admin',
         subscription_status = 'active',
         family_name = COALESCE(users.family_name, EXCLUDED.family_name)`,
      [adminHash]
    );
    log('Admin user ensured in production DB', 'migration');

    // ── Schema: needs_password_reset column ─────────────────────────────────
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS needs_password_reset BOOLEAN DEFAULT false
    `);

    // ── Stripe subscriber recovery — recreate missing user accounts ──────────
    try {
      const stripe = await getUncachableStripeClient();
      const tempPasswordHash = await bcrypt.hash('Welcome1!', 10);
      const baseUrl = process.env.PUBLIC_APP_URL || 'https://onetimeonetime.com';

      const processSubscription = async (sub: any) => {
        const customer = sub.customer as any;
        if (!customer || customer.deleted || !customer.email) return;
        const email = customer.email.toLowerCase().trim();
        const existingUser = await pool.query(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [email]);
        const customerName = customer.name || null;
        if (existingUser.rows.length === 0) {
          const subStatus = sub.status === 'trialing' ? 'trial' : 'active';
          const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
          await pool.query(
            `INSERT INTO users (id, email, password, family_name, role, account_type, subscription_status, stripe_customer_id, stripe_subscription_id, trial_ends_at, has_used_trial, needs_password_reset, created_at)
             VALUES (gen_random_uuid()::varchar, $1, $2, $3, 'customer', 'standard', $4, $5, $6, $7, true, true, NOW())
             ON CONFLICT (email) DO NOTHING`,
            [email, tempPasswordHash, customerName, subStatus, customer.id, sub.id, trialEnd]
          );
          return true;
        } else {
          // Always sync subscription status from Stripe (source of truth)
          const subStatus = sub.status === 'trialing' ? 'trial'
            : sub.status === 'active' ? 'active'
            : sub.status === 'past_due' ? 'past_due'
            : 'cancelled';
          const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
          await pool.query(
            `UPDATE users SET 
             stripe_customer_id = COALESCE(stripe_customer_id, $1),
             stripe_subscription_id = $2,
             subscription_status = $3,
             trial_ends_at = CASE WHEN $4::text IS NOT NULL THEN $4::timestamp ELSE trial_ends_at END,
             family_name = CASE WHEN family_name IS NULL AND $6::text IS NOT NULL THEN $6 ELSE family_name END
             WHERE email = $5`,
            [customer.id, sub.id, subStatus, trialEnd, email, customerName]
          );
          return false;
        }
      };

      // All subscription statuses — recover everyone who ever had an account
      const statuses = ['active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete'];
      let recovered = 0;

      for (const status of statuses) {
        let hasMore = true;
        let startingAfter: string | undefined;
        while (hasMore) {
          const subs: any = await stripe.subscriptions.list({
            status: status as any, limit: 100, expand: ['data.customer'],
            ...(startingAfter ? { starting_after: startingAfter } : {}),
          });
          for (const sub of subs.data) {
            if (await processSubscription(sub)) recovered++;
          }
          hasMore = subs.has_more;
          if (hasMore && subs.data.length > 0) startingAfter = subs.data[subs.data.length - 1].id;
        }
      }

      // Also check all Stripe customers directly (catches customers without subscriptions)
      let custHasMore = true;
      let custStartingAfter: string | undefined;
      while (custHasMore) {
        const customers: any = await stripe.customers.list({
          limit: 100,
          ...(custStartingAfter ? { starting_after: custStartingAfter } : {}),
        });
        for (const customer of customers.data) {
          if (!customer.email || customer.deleted) continue;
          const email = customer.email.toLowerCase().trim();
          const customerName = customer.name || null;
          const existingUser = await pool.query(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [email]);
          if (existingUser.rows.length === 0) {
            await pool.query(
              `INSERT INTO users (id, email, password, family_name, role, account_type, subscription_status, stripe_customer_id, has_used_trial, needs_password_reset, created_at)
               VALUES (gen_random_uuid()::varchar, $1, $2, $3, 'customer', 'standard', 'cancelled', $4, true, true, NOW())
               ON CONFLICT (email) DO NOTHING`,
              [email, tempPasswordHash, customerName, customer.id]
            );
            recovered++;
          } else {
            // Fill in name if missing
            if (customerName) {
              await pool.query(
                `UPDATE users SET family_name = $1 WHERE email = $2 AND family_name IS NULL`,
                [customerName, email]
              );
            }
          }
        }
        custHasMore = customers.has_more;
        if (custHasMore && customers.data.length > 0) custStartingAfter = customers.data[customers.data.length - 1].id;
      }

      if (recovered > 0) {
        log(`Stripe recovery: recreated ${recovered} subscriber account(s)`, 'migration');
      }

      // ── Clear any pending password reset flags (no longer auto-sending) ─────
      await pool.query(`UPDATE users SET needs_password_reset = false WHERE needs_password_reset = true`);

      // ── Always restore admin account after Stripe recovery (Stripe may overwrite it) ──
      await pool.query(
        `UPDATE users SET role = 'admin', subscription_status = 'active', password = $1 WHERE email = 'schellereli@gmail.com'`,
        [adminHash]
      );
    } catch (stripeErr: any) {
      log(`Stripe recovery skipped: ${stripeErr.message}`, 'migration');
    }

    // ── Seed video categories ─────────────────────────────────────────────────
    await pool.query(`
      INSERT INTO video_categories (id, name, parent_category_id, sort_order, created_at) VALUES
        ('d770cece-eacb-4269-86ad-e4e2963d301c', 'Gemara',              NULL,                                   0, NOW()),
        ('ec6b73e4-491e-4f63-8249-cd0f0e2e23b2', 'Navi',               NULL,                                   0, NOW()),
        ('8393d928-cdd2-4fcd-abe8-a2f0de2ff66c', 'Series / Ongoing',   NULL,                                   0, NOW()),
        ('8375fb3b-3def-4a30-9b43-fa1b662a81bb', 'Stories',            NULL,                                   0, NOW()),
        ('aebbeae8-bf78-4f51-8e2b-2f27b98faf61', 'OneDafOneDaf',       NULL,                                   1, NOW()),
        ('284ef232-4099-4ffd-9c05-85ebce55079a', 'Shorts',             NULL,                                   2, NOW()),
        ('3956a6c1-82e9-4e7f-bedb-3d3c122dbb54', 'Music Videos',       NULL,                                   3, NOW()),
        ('69fa0d1a-9ed7-4324-9712-3f01ffa41b63', 'Films',              NULL,                                   4, NOW()),
        ('f74c98ce-8e18-4084-bf17-9ada2ce44efe', 'Mishnayos',          NULL,                                   5, NOW()),
        ('8abaa8dd-a9c5-4dbe-b085-19d9496885e1', 'Pirkei Avos',        NULL,                                   6, NOW()),
        ('e76a9cac-713c-44f8-a380-fa502c384b0a', 'Interviews',         NULL,                                   7, NOW()),
        ('347c9bc0-ca78-482b-99d5-99cb726a9731', 'Vloging with Reb Eli', NULL,                                 8, NOW()),
        ('bdfad49d-10c4-431a-86f8-c0641398de42', 'Just Kidding Podcast', NULL,                                 9, NOW()),
        ('11b066a7-dcb4-4b91-b3f7-c2726895191b', 'Shabbos Stories',   '8375fb3b-3def-4a30-9b43-fa1b662a81bb', 1, NOW()),
        ('175cdc2d-7b66-4660-ba91-e2abd25bf24c', 'Yom Tov Stories',   '8375fb3b-3def-4a30-9b43-fa1b662a81bb', 2, NOW()),
        ('224c5392-7225-46c3-966e-b903831db594', 'Emunah Stories',     '8375fb3b-3def-4a30-9b43-fa1b662a81bb', 3, NOW()),
        ('bf1bef4e-27d7-4d39-81ae-ed67cef75a90', 'Middos & Character', '8375fb3b-3def-4a30-9b43-fa1b662a81bb', 4, NOW()),
        ('7affc281-c9e1-4608-a1cf-9185915b8b1b', 'Tzaddikim Stories',  '8375fb3b-3def-4a30-9b43-fa1b662a81bb', 5, NOW()),
        ('b85ac7b4-5f88-40d6-80fb-beacfb12c53b', 'Everyday Life',      '8375fb3b-3def-4a30-9b43-fa1b662a81bb', 6, NOW()),
        ('4874ea86-60fe-403c-acf3-09181e916233', 'History & Miracles', '8375fb3b-3def-4a30-9b43-fa1b662a81bb', 7, NOW()),
        ('aa2135a2-a04d-423d-841d-c1c0ead21f35', 'Eiruvin',            'f74c98ce-8e18-4084-bf17-9ada2ce44efe', 0, NOW()),
        ('369b2c7d-4fc5-4b06-a0c4-0a1405adc860', 'Pesachim',           'f74c98ce-8e18-4084-bf17-9ada2ce44efe', 0, NOW()),
        ('beb8f486-c657-4d27-8ac4-573140a875fd', 'Shabbos',            'f74c98ce-8e18-4084-bf17-9ada2ce44efe', 0, NOW()),
        ('7c6379a1-8368-421b-8fab-3c282e185c88', 'Shekalim',           'f74c98ce-8e18-4084-bf17-9ada2ce44efe', 0, NOW()),
        ('a08449d5-deef-449a-8c28-510efdc40226', 'Taanis',             'f74c98ce-8e18-4084-bf17-9ada2ce44efe', 0, NOW())
      ON CONFLICT (id) DO NOTHING
    `);

    // ── Restore whitelisted emails ────────────────────────────────────────────
    const whitelistEmails = [
      'shlomoaron@gmail.com','jbaer1981@gmail.com','budikdavid@gmail.com','rhazan613@gmail.com',
      'aryehdeutch1@gmail.com','yzeprice@gmail.com','ye1000ye@gmail.com','raepstein9@gmail.com',
      'danielfalik@gmail.com','yonatan.frankel@gmail.com','friedlander.arik@gmail.com','eligelernter@gmail.com',
      'tzvimail@gmail.com','nesanelgoode@gmail.com','arigreenis@gmail.com','adami191@yahoo.com',
      'mordykatz@gmail.com','ekreinberg@gmail.com','ykushner@yandllandscaping.com','sammyleibowitz@gmail.com',
      'ydleibowitz@gmail.com','nissan.lifschitz@gmail.com','hloebmann@gmail.com','boruchlubling@gmail.com',
      'a029995171@gmail.com','shabsiem@gmail.com','jneuhof@gmail.com','yoavpreiss@gmail.com',
      'rabinowitz.ari@gmail.com','gershirap@gmail.com','ylrubelow@gmail.com','ceo4rx@gmail.com',
      'schellereli@gmail.com','evmisc90@gmail.com','mandssch@gmail.com','elischwartz@gmail.com',
      'meircshimborsky@gmail.com','ycshwekey@gmail.com','yonatansklar@gmail.com','yonahs@gmail.com',
      'swsamweber@gmail.com','vahashayvosa@gmail.com','ejzwick@gmail.com','ilanzb@gmail.com',
    ];
    const wlValues = whitelistEmails.map(e => `(gen_random_uuid()::varchar, '${e}', NOW())`).join(',');
    await pool.query(`INSERT INTO whitelisted_emails (id, email, created_at) VALUES ${wlValues} ON CONFLICT (email) DO NOTHING`);

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
