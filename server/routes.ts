import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { registerSchema, loginSchema, phoneNumberSchema, forgotPasswordSchema, resetPasswordSchema, users } from "@shared/schema";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { getUncachableResendClient } from "./resendClient";
import crypto from "crypto";
import { sql } from "drizzle-orm";
import { db } from "./db";
import { pool } from "./db";

// Extend express-session
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

// Multer setup for file uploads
const uploadDir = path.join(process.cwd(), "uploads", "audio");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["audio/mpeg", "audio/wav", "audio/mp3", "audio/ogg", "audio/x-wav", "audio/x-m4a"];
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(mp3|wav|ogg|m4a)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Video upload multer setup
const videoUploadDir = path.join(process.cwd(), "uploads", "videos");
if (!fs.existsSync(videoUploadDir)) {
  fs.mkdirSync(videoUploadDir, { recursive: true });
}

const videoUpload = multer({
  storage: multer.diskStorage({
    destination: videoUploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(mp4|webm|mov|avi)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"));
    }
  },
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
});

// Image upload multer setup (for thumbnails)
const thumbnailUploadDir = path.join(process.cwd(), "uploads", "thumbnails");
if (!fs.existsSync(thumbnailUploadDir)) {
  fs.mkdirSync(thumbnailUploadDir, { recursive: true });
}

const imageUpload = multer({
  storage: multer.diskStorage({
    destination: thumbnailUploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Auth middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const isProduction = process.env.NODE_ENV === "production";
  
  // Trust proxy for production (Replit uses reverse proxy)
  if (isProduction) {
    app.set("trust proxy", 1);
  }

  // PostgreSQL session store for persistence
  const PgSession = connectPgSimple(session);
  
  // Session middleware
  app.use(
    session({
      store: new PgSession({
        pool: pool,
        tableName: "user_sessions",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "kids-hotline-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction,
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );

  // ============ PHONE LIST ENDPOINT (for phone carrier API) ============
  // Protected by a simple token in query string - share the full URL with phone carrier
  // URL format: /api/phonelist/x7k9m2p4v8?token=PHONE_LIST_TOKEN
  app.get("/api/phonelist/x7k9m2p4v8", async (req, res) => {
    try {
      // Simple token protection - token must be set in environment variables
      const expectedToken = process.env.PHONE_LIST_TOKEN;
      const providedToken = req.query.token as string;
      
      if (!expectedToken) {
        console.error("PHONE_LIST_TOKEN environment variable not set");
        return res.status(503).send("Service not configured");
      }
      
      if (providedToken !== expectedToken) {
        return res.status(401).send("Unauthorized");
      }

      const subscribers = await storage.getSubscriberList();
      
      // Filter for active subscribers or those in valid trial period
      const activeSubscribers = subscribers.filter(sub => {
        if (sub.subscriptionStatus === "active") return true;
        if (sub.subscriptionStatus === "trial") {
          if (sub.trialEndsAt) {
            return new Date(sub.trialEndsAt) >= new Date();
          }
          return true;
        }
        if (sub.trialEndsAt && new Date(sub.trialEndsAt) >= new Date()) {
          return true;
        }
        return false;
      });

      // Collect all phone numbers from active subscribers
      const phoneNumbers: string[] = [];
      for (const sub of activeSubscribers) {
        if (sub.phoneNumbers && sub.phoneNumbers.length > 0) {
          for (const phone of sub.phoneNumbers) {
            const cleaned = phone.phoneNumber.replace(/\D/g, "");
            if (cleaned.length >= 10) {
              phoneNumbers.push(cleaned);
            }
          }
        }
      }

      // Return as plain text CSV (comma-separated)
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.send(phoneNumbers.join(","));
    } catch (error: any) {
      console.error("Phone list error:", error);
      res.status(500).send("Error");
    }
  });

  // ============ DEBUG/SETUP ROUTES (temporary) ============
  app.get("/api/debug/db-status", async (req, res) => {
    try {
      // Check all users in the database
      const allUsers = await db.select({ id: users.id, email: users.email, role: users.role }).from(users);
      res.json({
        nodeEnv: process.env.NODE_ENV,
        dbConfigured: !!process.env.DATABASE_URL,
        userCount: allUsers.length,
        users: allUsers.map(u => ({ email: u.email, role: u.role })),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/debug/check-user/:email", async (req, res) => {
    try {
      const email = req.params.email;
      const user = await storage.getUserByEmail(email);
      res.json({
        exists: !!user,
        email: email,
        dbUrl: process.env.DATABASE_URL ? "configured" : "missing",
        nodeEnv: process.env.NODE_ENV,
        userCount: user ? 1 : 0,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Setup endpoint to create admin user in production
  app.post("/api/setup/create-admin", async (req, res) => {
    try {
      const { email, password, setupKey } = req.body;
      
      if (setupKey !== "onetimeonetime2026") {
        return res.status(403).json({ message: "Invalid setup key" });
      }

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        role: "admin",
        subscriptionStatus: "active",
        trialEndsAt: null,
      });

      res.json({ success: true, message: "Admin user created", userId: user.id });
    } catch (error: any) {
      console.error("Setup error:", error);
      res.status(500).json({ message: "Setup failed", error: error.message });
    }
  });

  // Debug login - test password verification
  app.post("/api/debug/test-login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.json({ 
          step: "user_lookup", 
          success: false, 
          message: "User not found",
          emailSearched: email 
        });
      }

      const hasPassword = !!user.password;
      const passwordLength = user.password ? user.password.length : 0;
      
      let passwordValid = false;
      try {
        passwordValid = await bcrypt.compare(password, user.password);
      } catch (err: any) {
        return res.json({
          step: "password_compare",
          success: false,
          message: "bcrypt.compare failed",
          error: err.message,
          hasPassword,
          passwordLength
        });
      }

      res.json({
        step: "complete",
        userFound: true,
        hasPassword,
        passwordLength,
        passwordValid,
        userId: user.id
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ AUTH ROUTES ============
  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = registerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }

      const { email, password, phoneNumber } = result.data;

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Check if phone number is already registered
      const existingPhone = await storage.getPhoneNumberByNumber(phoneNumber);
      if (existingPhone) {
        return res.status(400).json({ message: "Phone number already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user without subscription - they'll need to complete Stripe checkout for trial
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        role: "customer",
        subscriptionStatus: "none",
        trialEndsAt: null,
      });

      // Register phone number
      await storage.createPhoneNumber({
        userId: user.id,
        phoneNumber,
        isActive: true,
      });

      req.session.userId = user.id;
      res.json({ user: { ...user, password: undefined } });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }

      const { email, password } = result.data;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log("Login failed: user not found for email:", email);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        console.log("Login failed: invalid password for email:", email);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;
      
      // Explicitly save session before responding
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        console.log("Login successful for:", email, "Session ID:", req.sessionID);
        res.json({ user: { ...user, password: undefined } });
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // Forgot password - request reset link
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const parsed = forgotPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Please provide a valid email address" });
      }

      const user = await storage.getUserByEmail(parsed.data.email);
      
      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({ success: true, message: "If an account exists with that email, a reset link has been sent." });
      }

      // Generate reset token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      await storage.createPasswordResetToken({
        userId: user.id,
        token,
        expiresAt,
      });

      // Send email with reset link
      const baseUrl = process.env.BASE_URL || `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.replit.app`;
      const resetLink = `${baseUrl}/reset-password?token=${token}`;

      try {
        const { client, fromEmail } = await getUncachableResendClient();
        await client.emails.send({
          from: fromEmail,
          to: user.email,
          subject: "Reset Your Password - Kids Hotline",
          html: `
            <h2>Reset Your Password</h2>
            <p>You requested to reset your password. Click the link below to set a new password:</p>
            <p><a href="${resetLink}">Reset Password</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
          `,
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
        // Don't expose email errors to user
      }

      res.json({ success: true, message: "If an account exists with that email, a reset link has been sent." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "An error occurred. Please try again." });
    }
  });

  // Reset password with token
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const parsed = resetPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request" });
      }

      const tokenRecord = await storage.getPasswordResetToken(parsed.data.token);
      
      if (!tokenRecord) {
        return res.status(400).json({ message: "Invalid or expired reset link" });
      }

      if (tokenRecord.usedAt) {
        return res.status(400).json({ message: "This reset link has already been used" });
      }

      if (new Date() > tokenRecord.expiresAt) {
        return res.status(400).json({ message: "This reset link has expired" });
      }

      // Update password
      const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
      await storage.updateUser(tokenRecord.userId, { password: hashedPassword });

      // Mark token as used
      await storage.markPasswordResetTokenUsed(tokenRecord.id);

      res.json({ success: true, message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "An error occurred. Please try again." });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: "User not found" });
    }

    res.json({ user: { ...user, password: undefined } });
  });

  // ============ PHONE NUMBERS ============
  
  app.get("/api/phone-numbers", requireAuth, async (req, res) => {
    try {
      const phones = await storage.getPhoneNumbersByUser(req.session.userId!);
      res.json(phones);
    } catch (error) {
      res.status(500).json({ message: "Failed to get phone numbers" });
    }
  });

  app.post("/api/phone-numbers", requireAuth, async (req, res) => {
    try {
      const result = phoneNumberSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }

      const { phoneNumber } = result.data;

      // Check if user is a subscriber (not admin) and limit to 1 phone
      const user = await storage.getUser(req.session.userId!);
      if (user?.role === "customer") {
        const existingPhones = await storage.getPhoneNumbersByUser(req.session.userId!);
        if (existingPhones.length >= 1) {
          return res.status(400).json({ message: "Subscribers can only have one phone number" });
        }
      }

      // Check if already registered
      const existing = await storage.getPhoneNumberByNumber(phoneNumber);
      if (existing) {
        return res.status(400).json({ message: "Phone number already registered" });
      }

      const phone = await storage.createPhoneNumber({
        userId: req.session.userId!,
        phoneNumber,
        isActive: true,
      });

      res.json(phone);
    } catch (error) {
      res.status(500).json({ message: "Failed to add phone number" });
    }
  });

  app.delete("/api/phone-numbers/:id", requireAuth, async (req, res) => {
    try {
      const phones = await storage.getPhoneNumbersByUser(req.session.userId!);
      const phone = phones.find((p) => p.id === req.params.id);
      
      if (!phone) {
        return res.status(404).json({ message: "Phone number not found" });
      }

      await storage.deletePhoneNumber(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete phone number" });
    }
  });

  // ============ SUBSCRIPTION ============
  
  app.get("/api/subscription", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      res.json({
        status: user?.subscriptionStatus,
        trialEndsAt: user?.trialEndsAt,
        stripeSubscriptionId: user?.stripeSubscriptionId,
        stripeCustomerId: user?.stripeCustomerId,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get subscription" });
    }
  });

  // Get Stripe publishable key for frontend
  app.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      res.status(500).json({ message: "Failed to get Stripe key" });
    }
  });

  // Get subscription price from Stripe
  async function getSubscriptionPriceId(): Promise<string | null> {
    try {
      // Query the price from the synced stripe.prices table
      const result = await db.execute(sql`
        SELECT p.id as price_id 
        FROM stripe.prices p
        JOIN stripe.products prod ON p.product = prod.id
        WHERE prod.name = 'Kids'' Hotline Monthly' 
        AND p.active = true
        LIMIT 1
      `);
      
      if (result.rows.length > 0) {
        return (result.rows[0] as any).price_id;
      }
      return null;
    } catch (error) {
      console.error("Error getting price ID:", error);
      return null;
    }
  }

  app.post("/api/create-checkout", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const stripe = await getUncachableStripeClient();
      
      // Get the subscription price ID
      let priceId = await getSubscriptionPriceId();
      
      // If no price found, create product and price on the fly
      if (!priceId) {
        console.log("No price found, creating product and price...");
        
        // Search for existing product
        const existingProducts = await stripe.products.search({
          query: "name:'Kids\\' Hotline Monthly'",
        });
        
        let productId: string;
        if (existingProducts.data.length > 0) {
          productId = existingProducts.data[0].id;
        } else {
          const product = await stripe.products.create({
            name: "Kids' Hotline Monthly",
            description: "Unlimited access to stories and moderated group calls. Includes 2-week free trial.",
          });
          productId = product.id;
        }
        
        // Check for existing price
        const existingPrices = await stripe.prices.list({
          product: productId,
          active: true,
        });
        
        if (existingPrices.data.length > 0) {
          priceId = existingPrices.data[0].id;
        } else {
          const price = await stripe.prices.create({
            product: productId,
            unit_amount: 999, // $9.99
            currency: 'usd',
            recurring: { interval: 'month' },
          });
          priceId = price.id;
        }
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: user.id },
        });
        await storage.updateUser(user.id, { stripeCustomerId: customer.id });
        customerId = customer.id;
      }

      // Get the base URL for redirects
      const domains = process.env.REPLIT_DOMAINS?.split(',') || [];
      const baseUrl = domains.length > 0 ? `https://${domains[0]}` : 'http://localhost:5000';

      // Create checkout session with trial
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        payment_method_collection: 'always', // Always collect payment method
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        subscription_data: {
          trial_period_days: 14, // 2-week free trial
          trial_settings: {
            end_behavior: {
              missing_payment_method: 'cancel', // Cancel if no payment method
            },
          },
        },
        success_url: `${baseUrl}/dashboard?checkout=success`,
        cancel_url: `${baseUrl}/dashboard?checkout=cancelled`,
        metadata: { userId: user.id },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Checkout error:", error);
      res.status(500).json({ message: error.message || "Failed to create checkout" });
    }
  });

  app.post("/api/create-portal", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.stripeCustomerId) {
        return res.status(404).json({ message: "No billing account found" });
      }

      const stripe = await getUncachableStripeClient();
      
      // Get the base URL for redirects
      const domains = process.env.REPLIT_DOMAINS?.split(',') || [];
      const baseUrl = domains.length > 0 ? `https://${domains[0]}` : 'http://localhost:5000';

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${baseUrl}/dashboard`,
      });

      res.json({ url: portalSession.url });
    } catch (error) {
      res.status(500).json({ message: "Failed to access billing portal" });
    }
  });

  // ============ ADMIN ROUTES ============
  
  // Admin Stats
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getStats();
      const conference = await storage.getActiveConference();
      let activeParticipants = 0;
      
      if (conference) {
        const participants = await storage.getConferenceParticipants(conference.id);
        activeParticipants = participants.length;
      }

      res.json({
        ...stats,
        conferenceActive: !!conference,
        activeParticipants,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  // Audio Files
  app.get("/api/admin/audio-files", requireAdmin, async (req, res) => {
    try {
      const files = await storage.getAllAudioFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to get audio files" });
    }
  });

  app.post("/api/admin/audio-files", requireAdmin, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { name, type, voitexAlbum, voitexSort, syncToVoitex } = req.body;
      if (!name || !type) {
        return res.status(400).json({ message: "Name and type are required" });
      }

      let voitexRecordingId: string | null = null;

      // Optionally sync to Voitex
      if (syncToVoitex === "true" && voitexAlbum) {
        try {
          const { getVoitexClient } = await import("./voitexClient");
          const client = getVoitexClient();
          const albumNumber = parseInt(voitexAlbum);
          const sortNumber = parseInt(voitexSort) || 1;
          
          if (isNaN(albumNumber)) {
            console.error("Invalid album number for Voitex sync");
          } else {
            const result = await client.uploadRecording({
              filePath: req.file.path,
              albumNumber,
              sortNumber,
              displayName: req.file.originalname
            });
            if (result.status === "success" && result.data) {
              voitexRecordingId = result.data;
            }
          }
        } catch (voitexError) {
          console.error("Voitex sync failed:", voitexError);
        }
      }

      const audioFile = await storage.createAudioFile({
        name,
        filename: req.file.originalname,
        filepath: req.file.path,
        type,
        uploadedBy: req.session.userId!,
        voitexAlbum: voitexAlbum || null,
        voitexSort: voitexSort ? String(parseInt(voitexSort)) : null,
        voitexRecordingId,
      });

      res.json(audioFile);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload audio file" });
    }
  });

  app.delete("/api/admin/audio-files/:id", requireAdmin, async (req, res) => {
    try {
      const file = await storage.getAudioFile(req.params.id);
      if (!file) {
        return res.status(404).json({ message: "Audio file not found" });
      }

      // Delete the file from disk
      if (fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
      }

      await storage.deleteAudioFile(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete audio file" });
    }
  });

  app.get("/api/admin/audio-files/:id/stream", requireAdmin, async (req, res) => {
    try {
      const file = await storage.getAudioFile(req.params.id);
      if (!file) {
        return res.status(404).json({ message: "Audio file not found" });
      }

      if (!fs.existsSync(file.filepath)) {
        return res.status(404).json({ message: "Audio file not found on disk" });
      }

      const stat = fs.statSync(file.filepath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const fileStream = fs.createReadStream(file.filepath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'audio/mpeg',
        };
        res.writeHead(206, head);
        fileStream.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'audio/mpeg',
        };
        res.writeHead(200, head);
        fs.createReadStream(file.filepath).pipe(res);
      }
    } catch (error) {
      console.error("Stream error:", error);
      res.status(500).json({ message: "Failed to stream audio file" });
    }
  });

  app.post("/api/admin/audio-files/upload-and-assign", requireAdmin, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { name, type = "story", replaceAudioId } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }

      // Create new audio file first
      const audioFile = await storage.createAudioFile({
        name,
        filename: req.file.originalname,
        filepath: req.file.path,
        type,
        uploadedBy: req.session.userId!,
        voitexAlbum: null,
        voitexSort: null,
        voitexRecordingId: null,
      });

      // Return the new file - old file will be cleaned up separately
      res.json({ ...audioFile, oldAudioIdToDelete: replaceAudioId || null });
    } catch (error) {
      console.error("Upload and assign error:", error);
      res.status(500).json({ message: "Failed to upload audio file" });
    }
  });

  // Delete orphaned audio file after menu option is updated
  app.post("/api/admin/audio-files/cleanup", requireAdmin, async (req, res) => {
    try {
      const { audioFileId } = req.body;
      if (!audioFileId) {
        return res.json({ success: true });
      }

      const file = await storage.getAudioFile(audioFileId);
      if (file) {
        // Delete from disk
        if (fs.existsSync(file.filepath)) {
          fs.unlinkSync(file.filepath);
        }
        // Delete from database
        await storage.deleteAudioFile(audioFileId);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Cleanup error:", error);
      // Don't fail - this is cleanup
      res.json({ success: false });
    }
  });

  // ============ VIDEO MANAGEMENT ============
  // Admin: Get all videos
  app.get("/api/admin/videos", requireAdmin, async (req, res) => {
    try {
      const videos = await storage.getAllVideos();
      res.json(videos);
    } catch (error) {
      console.error("Get videos error:", error);
      res.status(500).json({ message: "Failed to get videos" });
    }
  });

  // Admin: Upload a video
  app.post("/api/admin/videos", requireAdmin, videoUpload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No video file provided" });
      }

      const { title, description, categoryId } = req.body;
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }

      const video = await storage.createVideo({
        title,
        description: description || null,
        filename: req.file.originalname,
        filepath: req.file.path,
        fileSize: req.file.size,
        status: "ready",
        categoryId: categoryId || null,
        uploadedBy: req.session.userId!,
      });

      res.json(video);
    } catch (error) {
      console.error("Video upload error:", error);
      res.status(500).json({ message: "Failed to upload video" });
    }
  });

  // Admin: Update video details
  app.patch("/api/admin/videos/:id", requireAdmin, async (req, res) => {
    try {
      const { title, description, status, categoryId } = req.body;
      const video = await storage.updateVideo(req.params.id, { title, description, status, categoryId });
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      console.error("Update video error:", error);
      res.status(500).json({ message: "Failed to update video" });
    }
  });

  // Admin: Upload video thumbnail
  app.post("/api/admin/videos/:id/thumbnail", requireAdmin, imageUpload.single("thumbnail"), async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No thumbnail file provided" });
      }

      // Delete old thumbnail if exists
      if (video.thumbnailPath && fs.existsSync(video.thumbnailPath)) {
        fs.unlinkSync(video.thumbnailPath);
      }

      // Use the file path from multer (already in thumbnails directory)
      const thumbnailPath = req.file.path;

      const updatedVideo = await storage.updateVideo(video.id, { thumbnailPath });
      res.json(updatedVideo);
    } catch (error) {
      console.error("Thumbnail upload error:", error);
      res.status(500).json({ message: "Failed to upload thumbnail" });
    }
  });

  // Serve video thumbnails
  app.get("/api/videos/:id/thumbnail", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video || !video.thumbnailPath) {
        return res.status(404).json({ message: "Thumbnail not found" });
      }

      if (!fs.existsSync(video.thumbnailPath)) {
        return res.status(404).json({ message: "Thumbnail file not found" });
      }

      res.sendFile(path.resolve(video.thumbnailPath));
    } catch (error) {
      console.error("Serve thumbnail error:", error);
      res.status(500).json({ message: "Failed to serve thumbnail" });
    }
  });

  // Admin: Delete a video
  app.delete("/api/admin/videos/:id", requireAdmin, async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      // Delete the video file from disk
      if (fs.existsSync(video.filepath)) {
        fs.unlinkSync(video.filepath);
      }

      // Delete thumbnail if exists
      if (video.thumbnailPath && fs.existsSync(video.thumbnailPath)) {
        fs.unlinkSync(video.thumbnailPath);
      }

      await storage.deleteVideo(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete video error:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  // ============ VIDEO CATEGORIES ============
  // Admin: Get all video categories
  app.get("/api/admin/video-categories", requireAdmin, async (req, res) => {
    try {
      const categories = await storage.getAllVideoCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get video categories error:", error);
      res.status(500).json({ message: "Failed to get video categories" });
    }
  });

  // Admin: Create video category
  app.post("/api/admin/video-categories", requireAdmin, async (req, res) => {
    try {
      const { name, sortOrder } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Category name is required" });
      }

      const existing = await storage.getVideoCategoryByName(name);
      if (existing) {
        return res.status(400).json({ message: "Category already exists" });
      }

      const category = await storage.createVideoCategory({ name, sortOrder: sortOrder || 0 });
      res.json(category);
    } catch (error) {
      console.error("Create video category error:", error);
      res.status(500).json({ message: "Failed to create video category" });
    }
  });

  // Admin: Update video category
  app.patch("/api/admin/video-categories/:id", requireAdmin, async (req, res) => {
    try {
      const { name, sortOrder } = req.body;
      const category = await storage.updateVideoCategory(req.params.id, { name, sortOrder });
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Update video category error:", error);
      res.status(500).json({ message: "Failed to update video category" });
    }
  });

  // Admin: Delete video category
  app.delete("/api/admin/video-categories/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteVideoCategory(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete video category error:", error);
      res.status(500).json({ message: "Failed to delete video category" });
    }
  });

  // Public: Get video categories (for subscriber display)
  app.get("/api/video-categories", async (req, res) => {
    try {
      const categories = await storage.getAllVideoCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get video categories error:", error);
      res.status(500).json({ message: "Failed to get video categories" });
    }
  });

  // Subscriber: Get published videos (requires active subscription)
  app.get("/api/videos", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Check subscription status
      const isActive = user.subscriptionStatus === "active" || 
        (user.subscriptionStatus === "trial" && user.trialEndsAt && new Date(user.trialEndsAt) > new Date());
      
      if (!isActive) {
        return res.status(403).json({ message: "Active subscription required to access videos" });
      }

      const videos = await storage.getPublishedVideos();
      res.json(videos);
    } catch (error) {
      console.error("Get subscriber videos error:", error);
      res.status(500).json({ message: "Failed to get videos" });
    }
  });

  // Subscriber: Stream a video (requires active subscription)
  app.get("/api/videos/:id/stream", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Check subscription status
      const isActive = user.subscriptionStatus === "active" || 
        (user.subscriptionStatus === "trial" && user.trialEndsAt && new Date(user.trialEndsAt) > new Date());
      
      if (!isActive) {
        return res.status(403).json({ message: "Active subscription required to watch videos" });
      }

      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      if (video.status !== "ready") {
        return res.status(400).json({ message: "Video is not ready for playback" });
      }

      // Stream video with range support for seeking
      const stat = fs.statSync(video.filepath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const file = fs.createReadStream(video.filepath, { start, end });
        
        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "video/mp4",
        });
        file.pipe(res);
      } else {
        res.writeHead(200, {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4",
        });
        fs.createReadStream(video.filepath).pipe(res);
      }
    } catch (error) {
      console.error("Video stream error:", error);
      res.status(500).json({ message: "Failed to stream video" });
    }
  });

  // System Settings (Greeting)
  app.get("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getAllSystemSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get settings" });
    }
  });

  app.post("/api/admin/settings/greeting", requireAdmin, async (req, res) => {
    try {
      const { audioFileId } = req.body;
      
      // Validate audio file exists if provided
      if (audioFileId) {
        const audioFile = await storage.getAudioFile(audioFileId);
        if (!audioFile) {
          return res.status(400).json({ message: "Audio file not found" });
        }
      }

      const setting = await storage.setSystemSetting("main_greeting", undefined, audioFileId || undefined);
      res.json({ success: true, setting });
    } catch (error) {
      res.status(500).json({ message: "Failed to save greeting setting" });
    }
  });

  app.post("/api/admin/settings/non-subscriber-greeting", requireAdmin, async (req, res) => {
    try {
      const { audioFileId } = req.body;
      
      if (audioFileId) {
        const audioFile = await storage.getAudioFile(audioFileId);
        if (!audioFile) {
          return res.status(400).json({ message: "Audio file not found" });
        }
      }

      const setting = await storage.setSystemSetting("non_subscriber_greeting", undefined, audioFileId || undefined);
      res.json({ success: true, setting });
    } catch (error) {
      res.status(500).json({ message: "Failed to save greeting setting" });
    }
  });

  // Menu Options
  app.get("/api/admin/menu-options", requireAdmin, async (req, res) => {
    try {
      const parentMenuId = req.query.parentMenuId as string | undefined;
      if (parentMenuId === "null" || parentMenuId === undefined) {
        const options = await storage.getMenuOptionsByParent(null);
        res.json(options);
      } else {
        const options = await storage.getMenuOptionsByParent(parentMenuId);
        res.json(options);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get menu options" });
    }
  });

  app.get("/api/admin/menu-options/all", requireAdmin, async (req, res) => {
    try {
      const options = await storage.getAllMenuOptions();
      res.json(options);
    } catch (error) {
      res.status(500).json({ message: "Failed to get all menu options" });
    }
  });

  app.post("/api/admin/menu-options/upsert", requireAdmin, async (req, res) => {
    try {
      const { optionNumber, parentMenuId, functionType, audioFileId, transferNumber, transferTimeout } = req.body;
      
      if (!optionNumber || !functionType) {
        return res.status(400).json({ message: "Required fields missing" });
      }

      const option = await storage.upsertMenuOption(
        optionNumber,
        parentMenuId || null,
        {
          functionType,
          audioFileId: audioFileId || null,
          transferNumber: transferNumber || null,
          transferTimeout: transferTimeout || null,
        }
      );

      res.json(option);
    } catch (error) {
      console.error("Upsert menu option error:", error);
      res.status(500).json({ message: "Failed to save menu option" });
    }
  });

  app.post("/api/admin/menu-options", requireAdmin, async (req, res) => {
    try {
      const { optionNumber, parentMenuId, functionType, audioFileId, transferNumber, transferTimeout, isActive } = req.body;
      
      if (!optionNumber || !functionType) {
        return res.status(400).json({ message: "Required fields missing" });
      }

      const option = await storage.createMenuOption({
        optionNumber,
        parentMenuId: parentMenuId || null,
        functionType,
        audioFileId: audioFileId || null,
        transferNumber: transferNumber || null,
        transferTimeout: transferTimeout || null,
        isActive: isActive ?? true,
      });

      res.json(option);
    } catch (error) {
      res.status(500).json({ message: "Failed to create menu option" });
    }
  });

  app.patch("/api/admin/menu-options/:id", requireAdmin, async (req, res) => {
    try {
      const existing = await storage.getMenuOption(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: "Menu option not found" });
      }

      const { optionNumber, functionType, audioFileId, transferNumber, transferTimeout, isActive } = req.body;

      const option = await storage.updateMenuOption(req.params.id, {
        optionNumber: optionNumber ?? existing.optionNumber,
        functionType: functionType ?? existing.functionType,
        audioFileId: audioFileId !== undefined ? audioFileId : existing.audioFileId,
        transferNumber: transferNumber !== undefined ? transferNumber : existing.transferNumber,
        transferTimeout: transferTimeout !== undefined ? transferTimeout : existing.transferTimeout,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      });

      res.json(option);
    } catch (error) {
      res.status(500).json({ message: "Failed to update menu option" });
    }
  });

  app.delete("/api/admin/menu-options/:id", requireAdmin, async (req, res) => {
    try {
      const existing = await storage.getMenuOption(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: "Menu option not found" });
      }

      await storage.deleteMenuOption(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete menu option" });
    }
  });

  // System Settings
  app.get("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getAllSystemSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get settings" });
    }
  });

  app.post("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const { key, value, audioFileId } = req.body;
      if (!key) {
        return res.status(400).json({ message: "Key is required" });
      }
      await storage.setSystemSetting(key, value || null, audioFileId || null);
      res.json({ success: true });
    } catch (error) {
      console.error("Set setting error:", error);
      res.status(500).json({ message: "Failed to save setting" });
    }
  });

  // Whitelisted Numbers (free access)
  app.get("/api/admin/whitelisted-numbers", requireAdmin, async (req, res) => {
    try {
      const numbers = await storage.getAllWhitelistedNumbers();
      res.json(numbers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get whitelisted numbers" });
    }
  });

  app.post("/api/admin/whitelisted-numbers", requireAdmin, async (req, res) => {
    try {
      const { phoneNumber, label } = req.body;
      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      // Check if already whitelisted
      const existing = await storage.getWhitelistedNumber(phoneNumber);
      if (existing) {
        return res.status(400).json({ message: "Phone number already whitelisted" });
      }

      const num = await storage.createWhitelistedNumber({
        phoneNumber,
        label: label || null,
        createdBy: req.session.userId,
      });
      res.json(num);
    } catch (error) {
      res.status(500).json({ message: "Failed to add whitelisted number" });
    }
  });

  app.delete("/api/admin/whitelisted-numbers/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteWhitelistedNumber(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete whitelisted number" });
    }
  });

  // Subscribers list with call stats
  app.get("/api/admin/subscribers", requireAdmin, async (req, res) => {
    try {
      const subscribers = await storage.getSubscriberList();
      res.json(subscribers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get subscribers" });
    }
  });

  // Monthly call stats
  app.get("/api/admin/call-stats", requireAdmin, async (req, res) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1);
      
      const stats = await storage.getMonthlyCallStats(year, month);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get call stats" });
    }
  });

  // Refund endpoint
  app.post("/api/admin/refund", requireAdmin, async (req, res) => {
    try {
      const { userId, amount, reason } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.stripeCustomerId) {
        return res.status(400).json({ message: "User has no Stripe customer record" });
      }

      // Get the latest payment intent for this customer
      const stripe = await getUncachableStripeClient();
      const paymentIntents = await stripe.paymentIntents.list({
        customer: user.stripeCustomerId,
        limit: 1,
      });

      if (paymentIntents.data.length === 0) {
        return res.status(400).json({ message: "No payments found for this user" });
      }

      const paymentIntentId = paymentIntents.data[0].id;
      const refundAmount = amount ? Math.round(amount * 100) : undefined; // Convert to cents

      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: refundAmount, // If undefined, refunds the full amount
        reason: "requested_by_customer",
      });

      res.json({ success: true, refundId: refund.id, amount: refund.amount / 100 });
    } catch (error: any) {
      console.error("Refund error:", error);
      res.status(500).json({ message: error.message || "Failed to process refund" });
    }
  });

  // Admin cancel subscription at period end
  app.post("/api/admin/subscribers/:id/cancel", requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.stripeSubscriptionId) {
        return res.status(400).json({ message: "User has no active subscription" });
      }

      const stripe = await getUncachableStripeClient();
      
      // Cancel at period end (user keeps access until end of billing period)
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      // Keep status as-is since they still have access until period end
      // Status will be updated when webhook fires at period end

      res.json({ success: true, message: "Subscription will be cancelled at end of billing period" });
    } catch (error: any) {
      console.error("Cancel subscription error:", error);
      res.status(500).json({ message: error.message || "Failed to cancel subscription" });
    }
  });

  // Admin cancel subscription immediately
  app.post("/api/admin/subscribers/:id/cancel-immediately", requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.stripeSubscriptionId) {
        return res.status(400).json({ message: "User has no active subscription" });
      }

      const stripe = await getUncachableStripeClient();
      
      // Cancel immediately
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);

      // Update local status
      await storage.updateUser(req.params.id, { 
        subscriptionStatus: "cancelled",
        stripeSubscriptionId: null,
      });

      res.json({ success: true, message: "Subscription cancelled immediately" });
    } catch (error: any) {
      console.error("Cancel subscription error:", error);
      res.status(500).json({ message: error.message || "Failed to cancel subscription" });
    }
  });

  // Admin extend trial
  app.post("/api/admin/subscribers/:id/extend-trial", requireAdmin, async (req, res) => {
    try {
      const { days } = req.body;
      if (!days || days < 1 || days > 90) {
        return res.status(400).json({ message: "Days must be between 1 and 90" });
      }

      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const newTrialEnd = new Date();
      newTrialEnd.setDate(newTrialEnd.getDate() + days);

      await storage.updateUser(req.params.id, { 
        subscriptionStatus: "trial",
        trialEndsAt: newTrialEnd,
      });

      res.json({ success: true, trialEndsAt: newTrialEnd });
    } catch (error: any) {
      console.error("Extend trial error:", error);
      res.status(500).json({ message: error.message || "Failed to extend trial" });
    }
  });

  // Export active subscriber phone numbers (text format for pasting)
  app.get("/api/admin/subscribers/export-phones", requireAdmin, async (req, res) => {
    try {
      const subscribers = await storage.getSubscriberList();
      
      // Filter for active subscribers or those in valid trial period
      const activeSubscribers = subscribers.filter(sub => {
        // Active paid subscription
        if (sub.subscriptionStatus === "active") {
          // Check if in trial period (has trialEndsAt and it's in the future)
          // or paid (no trialEndsAt or it's passed)
          return true;
        }
        // Trial status
        if (sub.subscriptionStatus === "trial") {
          if (sub.trialEndsAt) {
            return new Date(sub.trialEndsAt) >= new Date();
          }
          return true;
        }
        // Also include any user with active trialEndsAt in the future (regardless of status)
        if (sub.trialEndsAt && new Date(sub.trialEndsAt) >= new Date()) {
          return true;
        }
        return false;
      });

      // Collect all phone numbers from active subscribers
      const phoneNumbers: string[] = [];
      for (const sub of activeSubscribers) {
        if (sub.phoneNumbers && sub.phoneNumbers.length > 0) {
          for (const phone of sub.phoneNumbers) {
            // Format as E.164 without the + for carrier compatibility
            const cleaned = phone.phoneNumber.replace(/\D/g, "");
            if (cleaned.length >= 10) {
              phoneNumbers.push(cleaned);
            }
          }
        }
      }

      // Return as plain text, one number per line
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Content-Disposition", "attachment; filename=active-subscriber-phones.txt");
      res.send(phoneNumbers.join("\n"));
    } catch (error: any) {
      console.error("Export phones error:", error);
      res.status(500).json({ message: error.message || "Failed to export phone numbers" });
    }
  });

  // Conference Management
  app.get("/api/admin/conference", requireAdmin, async (req, res) => {
    try {
      const session = await storage.getActiveConference();
      
      if (!session) {
        return res.json({
          isActive: false,
          sessionId: null,
          conferenceName: null,
          startedAt: null,
          participantCount: 0,
          participants: [],
          unmuteRequests: [],
        });
      }

      const participants = await storage.getConferenceParticipants(session.id);
      const unmuteRequests = await storage.getUnmuteRequests(session.id);

      res.json({
        isActive: true,
        sessionId: session.id,
        conferenceName: session.conferenceName,
        startedAt: session.startedAt,
        participantCount: participants.length,
        participants,
        unmuteRequests,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get conference status" });
    }
  });

  app.post("/api/admin/conference/participants/:id/mute", requireAdmin, async (req, res) => {
    try {
      const { mute } = req.body;
      const participant = await storage.updateParticipant(req.params.id, { isMuted: mute });
      
      if (!participant) {
        return res.status(404).json({ message: "Participant not found" });
      }

      // TODO: Call Plivo API to actually mute/unmute

      res.json(participant);
    } catch (error) {
      res.status(500).json({ message: "Failed to update mute status" });
    }
  });

  app.post("/api/admin/conference/mute-all", requireAdmin, async (req, res) => {
    try {
      const session = await storage.getActiveConference();
      if (!session) {
        return res.status(404).json({ message: "No active conference" });
      }

      const participants = await storage.getConferenceParticipants(session.id);
      
      for (const participant of participants) {
        await storage.updateParticipant(participant.id, { isMuted: true });
      }

      // TODO: Call Plivo API to mute all

      res.json({ success: true, mutedCount: participants.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to mute all" });
    }
  });

  app.post("/api/admin/conference/unmute-requests/:id", requireAdmin, async (req, res) => {
    try {
      const { approve } = req.body;
      const status = approve ? "approved" : "denied";
      
      const request = await storage.resolveUnmuteRequest(req.params.id, status);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      if (approve && request.participantId) {
        await storage.updateParticipant(request.participantId, { isMuted: false });
        // TODO: Call Plivo API to unmute
      }

      res.json(request);
    } catch (error) {
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  // ============ TELNYX TeXML WEBHOOKS ============
  
  // Answer webhook - called when someone calls the hotline
  app.post("/api/telnyx/answer", async (req, res) => {
    try {
      const { From, CallSid, To } = req.body;
      const baseUrl = process.env.BASE_URL || "";
      
      // Normalize phone number (strip non-digits for comparison)
      const normalizedFrom = From?.replace(/\D/g, "") || "";
      
      // Check if caller is a subscriber or whitelisted
      const isSubscriber = await storage.isSubscribedPhoneNumber(normalizedFrom);
      const isWhitelisted = await storage.isWhitelistedPhoneNumber(normalizedFrom);
      const hasAccess = isSubscriber || isWhitelisted;

      // Log the call
      await storage.createCallLog({
        callUuid: CallSid,
        fromNumber: From,
        toNumber: To || "",
        isSubscriber: hasAccess,
      });

      // Get greeting settings from system settings
      const mainGreetingSetting = await storage.getSystemSetting("main_greeting");
      const nonSubGreetingSetting = await storage.getSystemSetting("non_subscriber_greeting");
      const menuOptions = await storage.getAllMenuOptions();

      let xml = '<?xml version="1.0" encoding="UTF-8"?><Response>';

      if (!hasAccess) {
        // Play non-subscriber message
        if (nonSubGreetingSetting?.audioFileId) {
          const audioFile = await storage.getAudioFile(nonSubGreetingSetting.audioFileId);
          if (audioFile) {
            xml += `<Play>${baseUrl}/uploads/audio/${path.basename(audioFile.filepath)}</Play>`;
          } else {
            xml += '<Say voice="alice">Thank you for calling Kids Hotline. To access our stories and live calls, please subscribe at our website.</Say>';
          }
        } else {
          xml += '<Say voice="alice">Thank you for calling Kids Hotline. To access our stories and live calls, please subscribe at our website.</Say>';
        }
        xml += '<Hangup/>';
      } else {
        // Build IVR menu with Gather - greeting plays inside Gather for barge-in support
        xml += `<Gather numDigits="1" action="${baseUrl}/api/telnyx/menu" method="POST" timeout="10">`;
        
        // Play greeting inside Gather so user can interrupt with key press
        if (mainGreetingSetting?.audioFileId) {
          const audioFile = await storage.getAudioFile(mainGreetingSetting.audioFileId);
          if (audioFile) {
            xml += `<Play>${baseUrl}/uploads/audio/${path.basename(audioFile.filepath)}</Play>`;
          } else {
            xml += '<Say voice="alice">Welcome to Kids Hotline!</Say>';
          }
        } else {
          xml += '<Say voice="alice">Welcome to Kids Hotline!</Say>';
        }
        
        // Add menu options text
        let menuText = "Please press ";
        const activeOptions = menuOptions.filter(o => o.isActive && !o.parentMenuId);
        activeOptions.forEach((option, index) => {
          menuText += `${option.optionNumber} for option ${option.optionNumber}`;
          if (index < activeOptions.length - 1) menuText += ", ";
        });
        
        xml += `<Say voice="alice">${menuText}</Say>`;
        xml += '</Gather>';
        xml += '<Say voice="alice">We did not receive any input. Goodbye.</Say><Hangup/>';
      }

      xml += '</Response>';
      res.type('text/xml').send(xml);
    } catch (error) {
      console.error("Telnyx answer error:", error);
      res.type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice">Sorry, an error occurred.</Say><Hangup/></Response>');
    }
  });

  // Menu selection webhook
  app.post("/api/telnyx/menu", async (req, res) => {
    try {
      const { Digits, CallSid, From } = req.body;
      const digit = parseInt(Digits);
      const baseUrl = process.env.BASE_URL || "";

      const menuOption = await storage.getMenuOptionByNumberAndParent(digit, null);

      let xml = '<?xml version="1.0" encoding="UTF-8"?><Response>';

      if (!menuOption || !menuOption.isActive) {
        xml += '<Say voice="alice">Invalid option. Please try again.</Say>';
        xml += `<Redirect>${baseUrl}/api/telnyx/answer</Redirect>`;
      } else if (menuOption.functionType === "conference") {
        // Join conference
        let session = await storage.getActiveConference();
        if (!session) {
          session = await storage.createConferenceSession({
            conferenceName: "KidsHotline",
            isActive: true,
          });
        }

        // Add participant
        await storage.addParticipant({
          sessionId: session.id,
          callUuid: CallSid,
          phoneNumber: From,
          isMuted: true,
        });

        xml += '<Say voice="alice">You are now joining the group call. You are muted. Press 9 to request to speak.</Say>';
        xml += `<Dial><Conference beep="true" startConferenceOnEnter="true" endConferenceOnExit="false" muted="true" statusCallback="${baseUrl}/api/telnyx/conference-callback" statusCallbackEvent="join leave">KidsHotline</Conference></Dial>`;
      } else if (menuOption.functionType === "play_mp3" && menuOption.audioFileId) {
        // Play audio file
        const audioFile = await storage.getAudioFile(menuOption.audioFileId);
        if (audioFile) {
          xml += `<Gather numDigits="1" action="${baseUrl}/api/telnyx/playback-control" method="POST" timeout="300">`;
          xml += `<Play>${baseUrl}/uploads/audio/${path.basename(audioFile.filepath)}</Play>`;
          xml += '</Gather>';
          xml += `<Redirect>${baseUrl}/api/telnyx/answer</Redirect>`;
        } else {
          xml += '<Say voice="alice">Sorry, this audio is not available.</Say>';
          xml += `<Redirect>${baseUrl}/api/telnyx/answer</Redirect>`;
        }
      } else if (menuOption.functionType === "transfer" && menuOption.transferNumber) {
        // Transfer call
        xml += '<Say voice="alice">Transferring your call now.</Say>';
        xml += `<Dial timeout="${menuOption.transferTimeout || 30}"><Number>${menuOption.transferNumber}</Number></Dial>`;
        xml += '<Say voice="alice">The call could not be completed. Goodbye.</Say><Hangup/>';
      } else if (menuOption.functionType === "submenu") {
        // Handle submenu - get submenu options
        const submenuOptions = await storage.getMenuOptionsByParent(menuOption.id);
        if (submenuOptions.length > 0) {
          xml += `<Gather numDigits="1" action="${baseUrl}/api/telnyx/submenu?parentId=${menuOption.id}" method="POST" timeout="10">`;
          xml += '<Say voice="alice">Please press ';
          submenuOptions.filter(o => o.isActive).forEach((opt, idx, arr) => {
            xml += `${opt.optionNumber} for option ${opt.optionNumber}`;
            if (idx < arr.length - 1) xml += ', ';
          });
          xml += '. Press star to return to the main menu.</Say>';
          xml += '</Gather>';
        } else {
          xml += '<Say voice="alice">This submenu has no options.</Say>';
          xml += `<Redirect>${baseUrl}/api/telnyx/answer</Redirect>`;
        }
      } else {
        xml += '<Say voice="alice">This option is not available.</Say>';
        xml += `<Redirect>${baseUrl}/api/telnyx/answer</Redirect>`;
      }

      xml += '</Response>';
      res.type('text/xml').send(xml);
    } catch (error) {
      console.error("Telnyx menu error:", error);
      res.type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice">Sorry, an error occurred.</Say><Hangup/></Response>');
    }
  });

  // Submenu selection webhook
  app.post("/api/telnyx/submenu", async (req, res) => {
    try {
      const { Digits, CallSid, From } = req.body;
      const parentId = req.query.parentId as string;
      const baseUrl = process.env.BASE_URL || "";

      // Check for star key to return to main menu
      if (Digits === "*") {
        res.type('text/xml').send(`<?xml version="1.0" encoding="UTF-8"?><Response><Redirect>${baseUrl}/api/telnyx/answer</Redirect></Response>`);
        return;
      }

      const digit = parseInt(Digits);
      const menuOption = await storage.getMenuOptionByNumberAndParent(digit, parentId);

      let xml = '<?xml version="1.0" encoding="UTF-8"?><Response>';

      if (!menuOption || !menuOption.isActive) {
        xml += '<Say voice="alice">Invalid option. Returning to main menu.</Say>';
        xml += `<Redirect>${baseUrl}/api/telnyx/answer</Redirect>`;
      } else if (menuOption.functionType === "play_mp3" && menuOption.audioFileId) {
        const audioFile = await storage.getAudioFile(menuOption.audioFileId);
        if (audioFile) {
          xml += `<Gather numDigits="1" action="${baseUrl}/api/telnyx/playback-control" method="POST" timeout="300">`;
          xml += `<Play>${baseUrl}/uploads/audio/${path.basename(audioFile.filepath)}</Play>`;
          xml += '</Gather>';
          xml += `<Redirect>${baseUrl}/api/telnyx/answer</Redirect>`;
        } else {
          xml += '<Say voice="alice">Sorry, this audio is not available.</Say>';
          xml += `<Redirect>${baseUrl}/api/telnyx/answer</Redirect>`;
        }
      } else if (menuOption.functionType === "transfer" && menuOption.transferNumber) {
        xml += '<Say voice="alice">Transferring your call now.</Say>';
        xml += `<Dial timeout="${menuOption.transferTimeout || 30}"><Number>${menuOption.transferNumber}</Number></Dial>`;
        xml += '<Say voice="alice">The call could not be completed. Goodbye.</Say><Hangup/>';
      } else {
        xml += '<Say voice="alice">This option is not available.</Say>';
        xml += `<Redirect>${baseUrl}/api/telnyx/answer</Redirect>`;
      }

      xml += '</Response>';
      res.type('text/xml').send(xml);
    } catch (error) {
      console.error("Telnyx submenu error:", error);
      res.type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice">Sorry, an error occurred.</Say><Hangup/></Response>');
    }
  });

  // Playback control webhook
  app.post("/api/telnyx/playback-control", async (req, res) => {
    const { Digits } = req.body;
    const baseUrl = process.env.BASE_URL || "";
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?><Response>';

    switch (Digits) {
      case "*":
        // Return to menu
        xml += `<Redirect>${baseUrl}/api/telnyx/answer</Redirect>`;
        break;
      default:
        // Any other key returns to main menu
        xml += `<Redirect>${baseUrl}/api/telnyx/answer</Redirect>`;
    }

    xml += '</Response>';
    res.type('text/xml').send(xml);
  });

  // Unmute request webhook
  app.post("/api/telnyx/unmute-request", async (req, res) => {
    try {
      const { CallSid, From } = req.body;

      const participant = await storage.getParticipantByCallUuid(CallSid);
      if (participant && participant.sessionId) {
        await storage.createUnmuteRequest({
          participantId: participant.id,
          sessionId: participant.sessionId,
          phoneNumber: From,
          status: "pending",
        });
      }

      res.type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice">Your request to speak has been sent to the moderator.</Say></Response>');
    } catch (error) {
      console.error("Unmute request error:", error);
      res.type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    }
  });

  // Conference callback webhook
  app.post("/api/telnyx/conference-callback", async (req, res) => {
    try {
      const { CallSid, StatusCallbackEvent, ConferenceSid } = req.body;

      const participant = await storage.getParticipantByCallUuid(CallSid);
      
      if (participant) {
        if (StatusCallbackEvent === "participant-join") {
          await storage.updateParticipant(participant.id, { memberId: ConferenceSid });
        } else if (StatusCallbackEvent === "participant-leave") {
          await storage.removeParticipant(participant.id);
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Conference callback error:", error);
      res.json({ success: false });
    }
  });

  // Serve uploaded audio files
  app.use("/uploads/audio", (req, res, next) => {
    const filePath = path.join(uploadDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send("File not found");
    }
  });

  // ============ VOITEX WEBHOOK ROUTES ============
  
  // Import and register Voitex webhook handler
  const { handleVoitexWebhook } = await import("./voitexWebhook");
  
  // Main Voitex API Branch webhook - receives calls from Voitex IVR
  app.post("/api/voitex/webhook", handleVoitexWebhook);

  return httpServer;
}
