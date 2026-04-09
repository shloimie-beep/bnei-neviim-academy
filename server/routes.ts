import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import cors from "cors";
import bcrypt from "bcryptjs";
import multer from "multer";
import os from "os";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import { storage } from "./storage";
import { registerSchema, loginSchema, phoneNumberSchema, forgotPasswordSchema, resetPasswordSchema, users } from "@shared/schema";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { getUncachableResendClient } from "./resendClient";
import { FROM_EMAIL, getPasswordResetEmail, getBulkEmail } from "./emailTemplates";
import crypto from "crypto";
import { sql } from "drizzle-orm";
import { db } from "./db";
import { pool } from "./db";
import { ObjectStorageService, objectStorageClient } from "./replit_integrations/object_storage";
import { generateThumbnailFromLocalVideo } from "./thumbnailGenerator";
import { vimeoService } from "./vimeoService";
import { voitexService } from "./voitexService";
import { WebhookHandlers } from "./webhookHandlers";
import { getOrCreateVimeoMp3, getCachedMp3Path } from "./mp3Converter";
import { generateMobileToken, verifyMobileToken, requireMobileAuth, requireMobileOrSessionAuth } from "./mobileAuth";
import { convertToMp3 } from "./audioConverter";

const execAsync = promisify(exec);

// Initialize object storage service early (used throughout the file)
const objectStorageService = new ObjectStorageService();

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
    const allowedVideoTypes = [
      "video/mp4", "video/webm", "video/quicktime", "video/x-msvideo",
      "video/x-m4v", "video/x-matroska", "video/3gpp", "video/3gpp2",
      "video/mpeg", "video/ogg", "video/x-flv", "video/x-ms-wmv"
    ];
    const allowedAudioTypes = [
      "audio/mpeg", "audio/wav", "audio/mp3", "audio/ogg", "audio/x-wav", 
      "audio/x-m4a", "audio/mp4", "audio/aac", "audio/flac"
    ];
    const isVideo = allowedVideoTypes.includes(file.mimetype) || file.originalname.match(/\.(mp4|webm|mov|avi|m4v|mkv|3gp|3g2|mpeg|mpg|ogv|flv|wmv|hevc)$/i);
    const isAudio = allowedAudioTypes.includes(file.mimetype) || file.originalname.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i);
    if (isVideo || isAudio) {
      cb(null, true);
    } else {
      cb(new Error("Only video or audio files are allowed"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 * 1024 }, // 10GB limit
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

// Combined upload for video/audio + thumbnail
const videoWithThumbnailUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === "file") {
        cb(null, videoUploadDir);
      } else if (file.fieldname === "thumbnail") {
        cb(null, thumbnailUploadDir);
      } else {
        cb(null, videoUploadDir);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "file") {
      const allowedVideoTypes = [
        "video/mp4", "video/webm", "video/quicktime", "video/x-msvideo",
        "video/x-m4v", "video/x-matroska", "video/3gpp", "video/3gpp2",
        "video/mpeg", "video/ogg", "video/x-flv", "video/x-ms-wmv"
      ];
      const allowedAudioTypes = [
        "audio/mpeg", "audio/wav", "audio/mp3", "audio/ogg", "audio/x-wav", 
        "audio/x-m4a", "audio/mp4", "audio/aac", "audio/flac"
      ];
      const isVideo = allowedVideoTypes.includes(file.mimetype) || file.originalname.match(/\.(mp4|webm|mov|avi|m4v|mkv|3gp|3g2|mpeg|mpg|ogv|flv|wmv|hevc)$/i);
      const isAudio = allowedAudioTypes.includes(file.mimetype) || file.originalname.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i);
      if (isVideo || isAudio) {
        cb(null, true);
      } else {
        cb(new Error("Only video or audio files are allowed"));
      }
    } else if (file.fieldname === "thumbnail") {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed for thumbnail"));
      }
    } else {
      cb(null, false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 * 1024 }, // 10GB limit (for video)
});

// PDF document upload multer setup
const documentUploadDir = path.join(process.cwd(), "uploads", "documents");
if (!fs.existsSync(documentUploadDir)) {
  fs.mkdirSync(documentUploadDir, { recursive: true });
}

const documentUpload = multer({
  storage: multer.diskStorage({
    destination: documentUploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.originalname.match(/\.pdf$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for PDFs
});

// Helper to get authenticated user ID from either session or mobile token
function getAuthUserId(req: Request): string | null {
  if (req.mobileUser?.userId) {
    return req.mobileUser.userId;
  }
  return req.session?.userId || null;
}

// Auth middleware - supports session (web), Bearer token (mobile), and query token (media elements)
function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Check for Bearer token (mobile app / web API calls)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const payload = verifyMobileToken(token);
    if (payload) {
      req.mobileUser = payload;
      return next();
    }
  }

  // Check for token in query parameter (for <audio>/<video> elements that can't send headers)
  const queryToken = req.query.token as string | undefined;
  if (queryToken) {
    const payload = verifyMobileToken(queryToken);
    if (payload) {
      req.mobileUser = payload;
      return next();
    }
  }
  
  // Fall back to session auth (web app)
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Check for Bearer token (mobile app)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const payload = verifyMobileToken(token);
    if (payload) {
      if (payload.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      req.mobileUser = payload;
      return next();
    }
  }
  
  // Fall back to session auth
  const userId = getAuthUserId(req);
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await storage.getUser(userId);
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
  
  // Initialize Voitex service for contact sync
  voitexService.initialize();
  
  // Trust proxy for Replit (uses reverse proxy in both dev and prod)
  app.set("trust proxy", 1);

  // CORS middleware for cookie support
  app.use(cors({
    origin: true, // Allow all origins
    credentials: true, // Allow cookies
  }));

  // PostgreSQL session store for persistence
  const PgSession = connectPgSimple(session);
  
  // Detect if running on Replit (HTTPS even in dev)
  const isReplit = !!process.env.REPL_ID;
  
  // Session middleware
  app.use(
    session({
      store: new PgSession({
        pool: pool,
        tableName: "user_sessions",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction || isReplit, // Replit preview uses HTTPS
        httpOnly: true,
        sameSite: (isProduction || isReplit) ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );

  // Debug middleware to log session state
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/admin')) {
      console.log(`[Session Debug] ${req.method} ${req.path}`);
      console.log(`[Session Debug] Cookie header:`, req.headers.cookie ? 'present' : 'missing');
      console.log(`[Session Debug] Session ID:`, req.sessionID);
      console.log(`[Session Debug] Session userId:`, req.session?.userId);
    }
    next();
  });

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
      const phoneNumbers: Set<string> = new Set();
      for (const sub of activeSubscribers) {
        if (sub.phoneNumbers && sub.phoneNumbers.length > 0) {
          for (const phone of sub.phoneNumbers) {
            const cleaned = phone.phoneNumber.replace(/\D/g, "");
            if (cleaned.length >= 10) {
              phoneNumbers.add(cleaned);
            }
          }
        }
      }

      // Also include whitelisted phone numbers
      const whitelistedNumbers = await storage.getAllWhitelistedNumbers();
      for (const wn of whitelistedNumbers) {
        const cleaned = wn.phoneNumber.replace(/\D/g, "");
        if (cleaned.length >= 10) {
          phoneNumbers.add(cleaned);
        }
      }

      // Return as plain text CSV (comma-separated) with + prefix
      res.type("text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.end(Array.from(phoneNumbers).map(num => `+${num}`).join(","));
    } catch (error: any) {
      console.error("Phone list error:", error);
      res.status(500).send("Error");
    }
  });

  // ============ PHONE LIST JSON ENDPOINT (active phone numbers as JSON array) ============
  // Protected by a simple token in query string
  // URL format: /api/phonelist-json/j8n5k2m9p3?token=PHONE_LIST_TOKEN
  app.get("/api/phonelist-json/j8n5k2m9p3", async (req, res) => {
    try {
      // Simple token protection - reuses the same PHONE_LIST_TOKEN
      const expectedToken = process.env.PHONE_LIST_TOKEN;
      const providedToken = req.query.token as string;
      
      if (!expectedToken) {
        console.error("PHONE_LIST_TOKEN environment variable not set");
        return res.status(503).json({ error: "Service not configured" });
      }
      
      if (providedToken !== expectedToken) {
        return res.status(401).json({ error: "Unauthorized" });
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
      const phoneNumbers: Set<string> = new Set();
      for (const sub of activeSubscribers) {
        if (sub.phoneNumbers && sub.phoneNumbers.length > 0) {
          for (const phone of sub.phoneNumbers) {
            const cleaned = phone.phoneNumber.replace(/\D/g, "");
            if (cleaned.length >= 10) {
              phoneNumbers.add(`+${cleaned}`);
            }
          }
        }
      }

      // Also include whitelisted phone numbers
      const whitelistedNumbers = await storage.getAllWhitelistedNumbers();
      for (const wn of whitelistedNumbers) {
        const cleaned = wn.phoneNumber.replace(/\D/g, "");
        if (cleaned.length >= 10) {
          phoneNumbers.add(`+${cleaned}`);
        }
      }

      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.json(Array.from(phoneNumbers));
    } catch (error: any) {
      console.error("Phone list JSON error:", error);
      res.status(500).json({ error: "Failed to get phone list" });
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
  app.post("/api/sys-config/init-admin-x7k9", async (req, res) => {
    try {
      const { email, password, setupKey } = req.body;
      
      if (setupKey !== "Kh$9mNpQ2xVwL4jR") {
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

      const { email, password, phoneNumber, countryCode, familyName, location } = result.data;

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Combine country code with phone number, strip all non-digit chars except leading +
      const rawFull = countryCode + phoneNumber.replace(/^0+/, '');
      const fullPhoneNumber = '+' + rawFull.replace(/\D/g, '');

      // Check if phone number is already registered
      const existingPhone = await storage.getPhoneNumberByNumber(fullPhoneNumber);
      if (existingPhone) {
        return res.status(400).json({ message: "Phone number already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user without subscription - they'll need to complete Stripe checkout for trial
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        familyName,
        location,
        role: "customer",
        subscriptionStatus: "none",
        trialEndsAt: null,
      });

      // Register phone number with country code
      await storage.createPhoneNumber({
        userId: user.id,
        phoneNumber: fullPhoneNumber,
        isActive: true,
      });

      req.session.userId = user.id;
      
      // Generate a token for localStorage-based auth (works when cookies are blocked)
      const token = generateMobileToken({ id: user.id, email: user.email, role: user.role });
      
      res.json({ user: { ...user, password: undefined }, token });
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
        // Auto-send a password reset email so the subscriber can regain access
        try {
          const token = crypto.randomBytes(32).toString("hex");
          const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
          await storage.createPasswordResetToken({ id: crypto.randomUUID(), token, userId: user.id, expiresAt });
          const baseUrl = process.env.PUBLIC_APP_URL || 'https://onetimeonetime.com';
          const resetLink = `${baseUrl}/reset-password?token=${token}`;
          const { client } = await getUncachableResendClient();
          await client.emails.send({
            from: FROM_EMAIL,
            to: user.email,
            subject: "Reset Your Password - OneTimeOneTime",
            html: getPasswordResetEmail(resetLink),
          });
        } catch (_) {}
        return res.status(401).json({ message: "Wrong password — we've emailed you a reset link. Please check your inbox.", resetSent: true });
      }

      req.session.userId = user.id;
      
      // Generate a token for localStorage-based auth (works when cookies are blocked)
      const token = generateMobileToken({ id: user.id, email: user.email, role: user.role });
      
      // Check if user's email is whitelisted for free access
      const whitelistedEmail = user.email ? await storage.getWhitelistedEmail(user.email) : null;
      const isWhitelistedEmail = !!whitelistedEmail;
      
      // Explicitly save session before responding
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        console.log("Login successful for:", email, "Session ID:", req.sessionID);
        res.json({ user: { ...user, password: undefined, isWhitelistedEmail }, token });
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

  // Mobile API info endpoint - provides documentation for mobile app
  app.get("/api/mobile/info", (req, res) => {
    res.json({
      version: "1.0.0",
      name: "OneTimeOneTime Mobile API",
      endpoints: {
        auth: {
          login: { method: "POST", path: "/api/mobile/login", body: { email: "string", password: "string" } },
          me: { method: "GET", path: "/api/mobile/me", headers: { Authorization: "Bearer <token>" } },
          refreshToken: { method: "POST", path: "/api/mobile/refresh-token", headers: { Authorization: "Bearer <token>" } },
          subscription: { method: "GET", path: "/api/mobile/subscription", headers: { Authorization: "Bearer <token>" }, response: { active: "boolean", subscriptionStatus: "string", trialDaysRemaining: "number|null", isWhitelisted: "boolean" } },
        },
        content: {
          videos: { method: "GET", path: "/api/videos", headers: { Authorization: "Bearer <token>" } },
          videoCategories: { method: "GET", path: "/api/video-categories" },
          audio: { method: "GET", path: "/api/audio", headers: { Authorization: "Bearer <token>" } },
          documents: { method: "GET", path: "/api/documents", headers: { Authorization: "Bearer <token>" } },
        },
        streaming: {
          videoStream: { method: "GET", path: "/api/videos/:id/stream", headers: { Authorization: "Bearer <token>" } },
          audioStream: { method: "GET", path: "/api/audio/:id/stream", headers: { Authorization: "Bearer <token>" } },
        },
      },
      notes: [
        "All authenticated endpoints require Bearer token in Authorization header",
        "Token expires in 30 days, use refresh-token endpoint to get a new one",
        "Subscription status is returned in login/me responses",
      ],
    });
  });

  // Mobile app login - returns JWT token
  app.post("/api/mobile/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: result.error.errors[0].message });
      }

      const { email, password } = result.data;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token for mobile app
      const token = generateMobileToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          subscriptionStatus: user.subscriptionStatus,
          trialEndsAt: user.trialEndsAt,
          hasUsedTrial: user.hasUsedTrial,
        },
      });
    } catch (error: any) {
      console.error("Mobile login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Mobile app - verify token and get user info
  app.get("/api/mobile/me", requireMobileAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.mobileUser!.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          subscriptionStatus: user.subscriptionStatus,
          trialEndsAt: user.trialEndsAt,
          hasUsedTrial: user.hasUsedTrial,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user info" });
    }
  });

  // Mobile app - refresh token
  app.post("/api/mobile/refresh-token", requireMobileAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.mobileUser!.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const token = generateMobileToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: "Failed to refresh token" });
    }
  });

  // Mobile app - check subscription status
  app.get("/api/mobile/subscription", requireMobileAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.mobileUser!.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user's email is whitelisted for free access
      const whitelistedEmail = user.email ? await storage.getWhitelistedEmail(user.email) : null;
      const isWhitelisted = !!whitelistedEmail;

      // Calculate trial days remaining if applicable
      let trialDaysRemaining = 0;
      if (user.subscriptionStatus === "trial" && user.trialEndsAt) {
        trialDaysRemaining = Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      }

      // User has active access if: whitelisted, active subscription, or valid trial
      const active = isWhitelisted || 
        user.subscriptionStatus === "active" || 
        (user.subscriptionStatus === "trial" && trialDaysRemaining > 0);

      res.json({ 
        active,
        subscriptionStatus: user.subscriptionStatus,
        trialDaysRemaining: user.subscriptionStatus === "trial" ? trialDaysRemaining : null,
        isWhitelisted
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check subscription status" });
    }
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
        const { client } = await getUncachableResendClient();
        await client.emails.send({
          from: FROM_EMAIL,
          to: user.email,
          subject: "Reset Your Password - OneTimeOneTime",
          html: getPasswordResetEmail(resetLink),
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

  // User change own password (requires current password)
  app.post("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
      }

      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash and update new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(userId, { password: hashedPassword });

      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Get all admin users
  app.get("/api/admin/admins", requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const admins = allUsers
        .filter(u => u.role === "admin")
        .map(u => ({
          id: u.id,
          email: u.email,
          createdAt: u.createdAt,
        }));
      res.json(admins);
    } catch (error) {
      console.error("Error fetching admins:", error);
      res.status(500).json({ message: "Failed to fetch admin users" });
    }
  });

  // Delete an admin user
  app.delete("/api/admin/admins/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Prevent deleting yourself
      const currentUserId = getAuthUserId(req);
      if (id === currentUserId) {
        return res.status(400).json({ message: "You cannot delete your own account" });
      }
      
      const userToDelete = await storage.getUser(id);
      if (!userToDelete) {
        return res.status(404).json({ message: "Admin user not found" });
      }
      
      if (userToDelete.role !== "admin") {
        return res.status(400).json({ message: "This user is not an admin" });
      }
      
      await storage.deleteUser(id);
      res.json({ success: true, message: "Admin deleted successfully" });
    } catch (error) {
      console.error("Error deleting admin:", error);
      res.status(500).json({ message: "Failed to delete admin user" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    // Check for Bearer token (web app localStorage-based auth)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = verifyMobileToken(token);
      if (payload) {
        req.mobileUser = payload;
      }
    }
    
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      if (req.session) {
        req.session.destroy(() => {});
      }
      return res.status(401).json({ message: "User not found" });
    }

    // Check if user's email is whitelisted for free access
    const whitelistedEmail = user.email ? await storage.getWhitelistedEmail(user.email) : null;
    const isWhitelistedEmail = !!whitelistedEmail;

    res.json({ user: { ...user, password: undefined, isWhitelistedEmail } });
  });

  // ============ PHONE NUMBERS ============
  
  app.get("/api/phone-numbers", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const phones = await storage.getPhoneNumbersByUser(userId);
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

      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user is a subscriber (not admin) and limit to 1 phone
      const user = await storage.getUser(userId);
      if (user?.role === "customer") {
        const existingPhones = await storage.getPhoneNumbersByUser(userId);
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
        userId: userId,
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
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const phones = await storage.getPhoneNumbersByUser(userId);
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

  app.put("/api/phone-numbers/:id", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const phones = await storage.getPhoneNumbersByUser(userId);
      const phone = phones.find((p) => p.id === req.params.id);
      
      if (!phone) {
        return res.status(404).json({ message: "Phone number not found" });
      }

      const { phoneNumber } = req.body;
      if (!phoneNumber || typeof phoneNumber !== "string") {
        return res.status(400).json({ message: "Phone number is required" });
      }

      const existingPhone = await storage.getPhoneNumberByNumber(phoneNumber);
      if (existingPhone && existingPhone.id !== req.params.id) {
        return res.status(400).json({ message: "Phone number already registered" });
      }

      const updated = await storage.updatePhoneNumber(req.params.id, phoneNumber);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update phone number" });
    }
  });

  // ============ SUBSCRIPTION ============
  
  app.get("/api/subscription", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = await storage.getUser(userId);
      res.json({
        status: user?.subscriptionStatus,
        trialEndsAt: user?.trialEndsAt,
        stripeSubscriptionId: user?.stripeSubscriptionId,
        stripeCustomerId: user?.stripeCustomerId,
        hasUsedTrial: user?.hasUsedTrial,
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
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user's phone number has been used in a trial before
      const userPhones = await storage.getPhoneNumbersByUser(user.id);
      for (const phone of userPhones) {
        const isUsedInTrial = await storage.isPhoneUsedInTrial(phone.phoneNumber);
        if (isUsedInTrial) {
          return res.status(400).json({ 
            message: "This phone number has already been used for a free trial. Please contact support if you need assistance." 
          });
        }
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

      // Get the base URL for redirects - prefer PUBLIC_APP_URL for custom domain
      const baseUrl = process.env.PUBLIC_APP_URL || 'https://onetimeonetime.com';

      // Check if user has already used their trial
      const canUseTrial = !user.hasUsedTrial;

      // Create checkout session - with trial only if user hasn't used one before
      const sessionConfig: any = {
        customer: customerId,
        payment_method_types: ['card'],
        payment_method_collection: 'always', // Always collect payment method
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${baseUrl}/dashboard?checkout=success`,
        cancel_url: `${baseUrl}/dashboard?checkout=cancelled`,
        metadata: { userId: user.id },
      };

      // Only add trial for users who haven't used one
      if (canUseTrial) {
        sessionConfig.subscription_data = {
          trial_period_days: 7, // 1-week free trial
          trial_settings: {
            end_behavior: {
              missing_payment_method: 'cancel', // Cancel if no payment method
            },
          },
        };
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Checkout error:", error);
      res.status(500).json({ message: error.message || "Failed to create checkout" });
    }
  });

  // Get or create Plus subscription price ($29.99/month)
  async function getPlusPriceId(): Promise<string | null> {
    try {
      const result = await db.execute(sql`
        SELECT p.id as price_id
        FROM stripe.prices p
        JOIN stripe.products prod ON p.product = prod.id
        WHERE prod.name = 'Kids'' Hotline Plus Monthly'
        AND p.active = true
        LIMIT 1
      `);
      if (result.rows.length > 0) return (result.rows[0] as any).price_id;
      return null;
    } catch {
      return null;
    }
  }

  app.post("/api/create-plus-checkout", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ message: "Authentication required" });
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const stripe = await getUncachableStripeClient();

      // Get or create the Plus price
      let priceId = await getPlusPriceId();
      if (!priceId) {
        const existingProducts = await stripe.products.search({ query: "name:'Kids\\' Hotline Plus Monthly'" });
        let productId: string;
        if (existingProducts.data.length > 0) {
          productId = existingProducts.data[0].id;
        } else {
          const product = await stripe.products.create({
            name: "Kids' Hotline Plus Monthly",
            description: "Plus membership with live Google Meet access and exclusive updates.",
          });
          productId = product.id;
        }
        const existingPrices = await stripe.prices.list({ product: productId, active: true });
        if (existingPrices.data.length > 0) {
          priceId = existingPrices.data[0].id;
        } else {
          const price = await stripe.prices.create({
            product: productId,
            unit_amount: 2999, // $29.99
            currency: 'usd',
            recurring: { interval: 'month' },
          });
          priceId = price.id;
        }
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({ email: user.email, metadata: { userId: user.id } });
        await storage.updateUser(user.id, { stripeCustomerId: customer.id });
        customerId = customer.id;
      }

      const baseUrl = process.env.PUBLIC_APP_URL || 'https://onetimeonetime.com';

      // If user already has an active subscription, create a subscription update via portal
      // otherwise create a new checkout session
      const sessionConfig: any = {
        customer: customerId,
        payment_method_types: ['card'],
        payment_method_collection: 'always',
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${baseUrl}/dashboard?checkout=success&plan=plus`,
        cancel_url: `${baseUrl}/dashboard`,
        metadata: { userId: user.id, planType: 'plus' },
        subscription_data: { metadata: { planType: 'plus' } },
        // No trial for Plus accounts
      };

      const session = await stripe.checkout.sessions.create(sessionConfig);
      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Plus checkout error:", error);
      res.status(500).json({ message: error.message || "Failed to create Plus checkout" });
    }
  });

  // Public: get live meeting for Plus users
  app.get("/api/live-meeting", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!user || user.accountType !== 'plus') {
        return res.status(403).json({ message: "Plus membership required" });
      }
      const meeting = await storage.getLiveMeeting();
      res.json(meeting ?? { meetingUrl: "", isActive: false, updatesText: "" });
    } catch {
      res.status(500).json({ message: "Failed to get meeting" });
    }
  });

  // Admin: get live meeting settings
  app.get("/api/admin/live-meeting", requireAdmin, async (req, res) => {
    try {
      const meeting = await storage.getLiveMeeting();
      res.json(meeting ?? { meetingUrl: "", isActive: false, updatesText: "" });
    } catch {
      res.status(500).json({ message: "Failed to get meeting" });
    }
  });

  // Admin: update live meeting settings
  app.post("/api/admin/live-meeting", requireAdmin, async (req, res) => {
    try {
      const { meetingUrl = "", isActive = false, updatesText = "" } = req.body;
      await storage.setLiveMeeting(String(meetingUrl), Boolean(isActive), String(updatesText));
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Failed to save meeting" });
    }
  });

  // ─── Direct Messages (Plus-only) ───────────────────────────────────────

  // Member: get own messages
  app.get("/api/direct-messages", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!user || user.accountType !== 'plus') {
        return res.status(403).json({ message: "Plus membership required" });
      }
      const msgs = await storage.getDirectMessages(userId);
      // Mark admin messages as read when member fetches
      await storage.markMessagesRead(userId, true);
      res.json(msgs);
    } catch {
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  // Member: send a message
  app.post("/api/direct-messages", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!user || user.accountType !== 'plus') {
        return res.status(403).json({ message: "Plus membership required" });
      }
      const { text } = req.body;
      if (!text || String(text).trim().length === 0) {
        return res.status(400).json({ message: "Message text is required" });
      }
      const msg = await storage.sendDirectMessage({ userId, text: String(text).trim(), fromAdmin: false });
      res.json(msg);
    } catch {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Admin: get all conversations
  app.get("/api/admin/direct-messages", requireAdmin, async (req, res) => {
    try {
      const convos = await storage.getAllConversations();
      res.json(convos);
    } catch {
      res.status(500).json({ message: "Failed to get conversations" });
    }
  });

  // Admin: get messages for a specific user
  app.get("/api/admin/direct-messages/:userId", requireAdmin, async (req, res) => {
    try {
      const msgs = await storage.getDirectMessages(req.params.userId);
      // Mark user messages as read when admin views them
      await storage.markMessagesRead(req.params.userId, false);
      res.json(msgs);
    } catch {
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  // Admin: reply to a user
  app.post("/api/admin/direct-messages/:userId/reply", requireAdmin, async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || String(text).trim().length === 0) {
        return res.status(400).json({ message: "Reply text is required" });
      }
      const msg = await storage.sendDirectMessage({ userId: req.params.userId, text: String(text).trim(), fromAdmin: true });
      res.json(msg);
    } catch {
      res.status(500).json({ message: "Failed to send reply" });
    }
  });

  app.post("/api/create-portal", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = await storage.getUser(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(404).json({ message: "No billing account found" });
      }

      const stripe = await getUncachableStripeClient();
      
      // Get the base URL for redirects - prefer PUBLIC_APP_URL for custom domain
      const baseUrl = process.env.PUBLIC_APP_URL || 'https://onetimeonetime.com';

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

  // Public: get featured videos for homepage
  app.get("/api/featured-videos", async (req, res) => {
    try {
      const videos = await storage.getFeaturedVideos();
      res.json(videos);
    } catch {
      res.json([]);
    }
  });

  // Admin: add featured video
  app.post("/api/admin/featured-videos", requireAdmin, async (req, res) => {
    try {
      const { title, description = "", vimeoEmbedUrl } = req.body;
      if (!title || !vimeoEmbedUrl) return res.status(400).json({ message: "title and vimeoEmbedUrl are required" });
      const result = await storage.addFeaturedVideo(String(title), String(description), String(vimeoEmbedUrl));
      res.json({ success: true, id: result.id });
    } catch {
      res.status(500).json({ message: "Failed to add featured video" });
    }
  });

  // Admin: update featured video
  app.put("/api/admin/featured-videos/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { title, description = "", vimeoEmbedUrl } = req.body;
      if (!title || !vimeoEmbedUrl) return res.status(400).json({ message: "title and vimeoEmbedUrl are required" });
      await storage.updateFeaturedVideo(id, String(title), String(description), String(vimeoEmbedUrl));
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Failed to update featured video" });
    }
  });

  // Admin: delete featured video
  app.delete("/api/admin/featured-videos/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFeaturedVideo(id);
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Failed to delete featured video" });
    }
  });

  // Admin: reorder featured videos
  app.post("/api/admin/featured-videos/reorder", requireAdmin, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) return res.status(400).json({ message: "ids must be an array" });
      await storage.reorderFeaturedVideos(ids.map(Number));
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Failed to reorder" });
    }
  });

  // Public: get current announcement (for dashboard banner)
  app.get("/api/announcement", async (req, res) => {
    try {
      const ann = await storage.getAnnouncement();
      if (!ann || !ann.isActive || (!ann.text.trim() && !ann.imageUrl)) {
        return res.json({ text: "", isActive: false, imageUrl: null });
      }
      res.json({ text: ann.text, isActive: ann.isActive, imageUrl: ann.imageUrl ?? null });
    } catch {
      res.json({ text: "", isActive: false, imageUrl: null });
    }
  });

  // Admin: get full announcement settings (includes webhook secret)
  app.get("/api/admin/announcement", requireAdmin, async (req, res) => {
    try {
      const ann = await storage.getAnnouncement();
      res.json(ann ?? { text: "", isActive: true, imageUrl: null, webhookSecret: "" });
    } catch {
      res.status(500).json({ message: "Failed to get announcement" });
    }
  });

  // Admin: update announcement
  app.post("/api/admin/announcement", requireAdmin, async (req, res) => {
    try {
      const { text = "", isActive = true } = req.body;
      await storage.setAnnouncement(String(text), Boolean(isActive));
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Failed to save announcement" });
    }
  });

  // Admin: upload announcement image
  app.post("/api/admin/announcement/image", requireAdmin, imageUpload.single("image"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No image file provided" });

      const ann = await storage.getAnnouncement();

      // Delete old image if exists
      if (ann?.imageUrl && ann.imageUrl.startsWith("/objects/")) {
        try {
          const oldFile = await objectStorageService.getObjectEntityFile(ann.imageUrl);
          await oldFile.delete();
        } catch (err) {
          console.error("Failed to delete old announcement image:", err);
        }
      }

      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

      const url = new URL(uploadURL);
      const pathParts = url.pathname.slice(1).split("/");
      const bucketName = pathParts[0];
      const objectName = pathParts.slice(1).join("/");

      const bucket = objectStorageClient.bucket(bucketName);
      const objectFile = bucket.file(objectName);

      await new Promise<void>((resolve, reject) => {
        const readStream = fs.createReadStream(req.file!.path);
        const writeStream = objectFile.createWriteStream({ resumable: false, contentType: req.file!.mimetype });
        readStream.on("error", reject);
        writeStream.on("error", reject);
        writeStream.on("finish", resolve);
        readStream.pipe(writeStream);
      });

      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

      await storage.setAnnouncement(ann?.text ?? "", ann?.isActive ?? true, objectPath);
      res.json({ success: true, imageUrl: objectPath });
    } catch (err) {
      console.error("Announcement image upload error:", err);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Admin: delete announcement image
  app.delete("/api/admin/announcement/image", requireAdmin, async (req, res) => {
    try {
      const ann = await storage.getAnnouncement();
      if (ann?.imageUrl && ann.imageUrl.startsWith("/objects/")) {
        try {
          const oldFile = await objectStorageService.getObjectEntityFile(ann.imageUrl);
          await oldFile.delete();
        } catch (err) {
          console.error("Failed to delete announcement image:", err);
        }
      }
      await storage.setAnnouncement(ann?.text ?? "", ann?.isActive ?? true, null);
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Failed to delete image" });
    }
  });

  // Public: serve announcement image
  app.get("/api/announcement/image", async (req, res) => {
    try {
      const ann = await storage.getAnnouncement();
      if (!ann?.imageUrl || !ann.imageUrl.startsWith("/objects/")) {
        return res.status(404).json({ message: "No image" });
      }
      const objectFile = await objectStorageService.getObjectEntityFile(ann.imageUrl);
      const [metadata] = await objectFile.getMetadata();
      res.setHeader("Content-Type", metadata.contentType || "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=3600");
      objectFile.createReadStream().pipe(res);
    } catch {
      res.status(404).json({ message: "Image not found" });
    }
  });

  // Webhook: external services can update the announcement using the secret
  app.post("/api/webhook/announcement", async (req, res) => {
    try {
      const secret = req.headers["x-webhook-secret"] as string;
      if (!secret) return res.status(401).json({ message: "Missing x-webhook-secret header" });

      const ann = await storage.getAnnouncement();
      const validSecret = ann?.webhookSecret;
      if (!validSecret || secret !== validSecret) {
        return res.status(403).json({ message: "Invalid webhook secret" });
      }

      const { text, isActive } = req.body;
      await storage.setAnnouncement(
        text !== undefined ? String(text) : (ann?.text ?? ""),
        isActive !== undefined ? Boolean(isActive) : (ann?.isActive ?? true),
      );
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Failed to process webhook" });
    }
  });

  // Record a dashboard session (called when user opens their dashboard)
  app.post("/api/session-ping", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      await storage.recordDashboardSession(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to record session" });
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

      const tempId = crypto.randomUUID();
      const objectPath = `/objects/.private/audio/${tempId}.mp3`;
      const fileBuffer = fs.readFileSync(req.file.path);
      await objectStorageService.uploadBuffer(objectPath, fileBuffer, "audio/mpeg");
      console.log(`Audio file uploaded to Object Storage: ${objectPath}`);

      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      const audioFile = await storage.createAudioFile({
        name,
        filename: req.file.originalname,
        filepath: objectPath,
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

      if (file.filepath.startsWith("/objects/")) {
        try {
          const objectFile = await objectStorageService.getObjectEntityFile(file.filepath);
          await objectFile.delete();
          console.log(`Deleted audio file from Object Storage: ${file.filepath}`);
        } catch (err) {
          console.error("Failed to delete audio from Object Storage:", err);
        }
      } else if (fs.existsSync(file.filepath)) {
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

      if (file.filepath.startsWith("/objects/")) {
        try {
          const objectFile = await objectStorageService.getObjectEntityFile(file.filepath);
          const [metadata] = await objectFile.getMetadata();
          const fileSize = parseInt(metadata.size as string, 10);
          const range = req.headers.range;

          res.setHeader("Accept-Ranges", "bytes");
          res.setHeader("Content-Type", "audio/mpeg");

          if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Content-Length': chunksize,
            });
            const stream = objectFile.createReadStream({ start, end });
            stream.pipe(res);
          } else {
            res.setHeader("Content-Length", fileSize);
            objectFile.createReadStream().pipe(res);
          }
          return;
        } catch (err) {
          console.error("Object Storage audio stream error:", err);
          return res.status(404).json({ message: "Audio file not found in storage" });
        }
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

      const tempId = crypto.randomUUID();
      const objectPath = `/objects/.private/audio/${tempId}.mp3`;
      const fileBuffer = fs.readFileSync(req.file.path);
      await objectStorageService.uploadBuffer(objectPath, fileBuffer, "audio/mpeg");
      console.log(`Audio file (upload-and-assign) uploaded to Object Storage: ${objectPath}`);

      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      const audioFile = await storage.createAudioFile({
        name,
        filename: req.file.originalname,
        filepath: objectPath,
        type,
        uploadedBy: req.session.userId!,
        voitexAlbum: null,
        voitexSort: null,
        voitexRecordingId: null,
      });

      res.json({ ...audioFile, oldAudioIdToDelete: replaceAudioId || null });
    } catch (error) {
      console.error("Upload and assign error:", error);
      res.status(500).json({ message: "Failed to upload audio file" });
    }
  });

  app.post("/api/admin/audio-files/cleanup", requireAdmin, async (req, res) => {
    try {
      const { audioFileId } = req.body;
      if (!audioFileId) {
        return res.json({ success: true });
      }

      const file = await storage.getAudioFile(audioFileId);
      if (file) {
        if (file.filepath.startsWith("/objects/")) {
          try {
            const objectFile = await objectStorageService.getObjectEntityFile(file.filepath);
            await objectFile.delete();
          } catch (err) {
            console.error("Failed to delete orphaned audio from Object Storage:", err);
          }
        } else if (fs.existsSync(file.filepath)) {
          fs.unlinkSync(file.filepath);
        }
        await storage.deleteAudioFile(audioFileId);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Cleanup error:", error);
      res.json({ success: false });
    }
  });

  // ============ VIDEO MANAGEMENT ============
  // Admin: Get all videos
  app.get("/api/admin/videos", requireAdmin, async (req, res) => {
    try {
      const videos = await storage.getAllVideos();
      // Return videos directly - thumbnails are already stored in thumbnailPath
      // No need to call Vimeo/Bunny APIs for each video (causes rate limiting)
      res.json(videos);
    } catch (error) {
      console.error("Get videos error:", error);
      res.status(500).json({ message: "Failed to get videos" });
    }
  });

  // Admin: Upload a video or audio file
  app.post("/api/admin/videos", requireAdmin, videoWithThumbnailUpload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const mediaFile = files?.file?.[0];
      const thumbnailFile = files?.thumbnail?.[0];

      if (!mediaFile) {
        return res.status(400).json({ message: "No media file provided" });
      }

      const { title, description, categoryId } = req.body;
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }

      // Detect media type based on mimetype or extension
      const audioExtensions = /\.(mp3|wav|ogg|m4a|aac|flac)$/i;
      const audioMimetypes = ["audio/mpeg", "audio/wav", "audio/mp3", "audio/ogg", "audio/x-wav", "audio/x-m4a", "audio/mp4", "audio/aac", "audio/flac"];
      const isAudio = audioMimetypes.includes(mediaFile.mimetype) || audioExtensions.test(mediaFile.originalname);
      const mediaType = isAudio ? "audio" : "video";

      const originalPath = mediaFile.path;
      
      // Check if this is a WAV file that needs conversion
      const isWavFile = mediaFile.mimetype === "audio/wav" || 
                        mediaFile.mimetype === "audio/x-wav" || 
                        mediaFile.originalname.toLowerCase().endsWith(".wav");
      const isMp3File = mediaFile.mimetype === "audio/mpeg" || 
                        mediaFile.mimetype === "audio/mp3" || 
                        mediaFile.originalname.toLowerCase().endsWith(".mp3");
      
      // For audio files: convert ALL to MP3 128kbps to save space, delete originals
      // For video files: use existing conversion logic
      if (isAudio) {
        // All audio files are converted to MP3 128kbps
        const convertedFilename = `${Date.now()}-converted.mp3`;
        const convertedPath = path.join(videoUploadDir, convertedFilename);
        
        const video = await storage.createVideo({
          title,
          description: description || null,
          filename: mediaFile.originalname,
          filepath: originalPath,
          fileSize: mediaFile.size,
          status: "processing",
          mediaType,
          categoryId: categoryId || null,
          uploadedBy: req.session.userId!,
          thumbnailPath: thumbnailFile?.path || null,
          storageType: "local",
        });

        res.json(video);

        // Convert to MP3 128kbps and upload to Object Storage in background
        (async () => {
          try {
            // Convert any audio format to MP3 128kbps
            const ffmpegCommand = `ffmpeg -i "${originalPath}" -c:a libmp3lame -b:a 128k -y "${convertedPath}"`;
            await execAsync(ffmpegCommand, { timeout: 1800000 });

            const stats = fs.statSync(convertedPath);
            const mp3Buffer = fs.readFileSync(convertedPath);
            
            // Upload to Object Storage for permanent storage
            const objectStoragePath = `/objects/.private/audio/${video.id}.mp3`;
            await objectStorageService.uploadBuffer(objectStoragePath, mp3Buffer, "audio/mpeg");
            console.log(`Audio ${video.id} uploaded to Object Storage: ${objectStoragePath}`);

            await storage.updateVideo(video.id, {
              filepath: objectStoragePath,
              filename: `${video.id}.mp3`,
              fileSize: stats.size,
              status: "ready",
            });

            // Delete local files to save space
            if (fs.existsSync(originalPath)) {
              fs.unlinkSync(originalPath);
            }
            if (fs.existsSync(convertedPath)) {
              fs.unlinkSync(convertedPath);
            }

            const savedPercent = Math.round((1 - stats.size / mediaFile.size) * 100);
            console.log(`Audio ${video.id} converted to MP3 128kbps and stored in Object Storage (${Math.round(mediaFile.size/1024)}KB -> ${Math.round(stats.size/1024)}KB, saved ${savedPercent}%)`);
          } catch (conversionError) {
            console.error(`Audio conversion failed for ${video.id}:`, conversionError);
            await storage.updateVideo(video.id, { status: "failed" });
            
            // Clean up on failure
            if (fs.existsSync(convertedPath)) {
              fs.unlinkSync(convertedPath);
            }
            if (fs.existsSync(originalPath)) {
              fs.unlinkSync(originalPath);
            }
          }
        })();
      } else {
        // Video files: use existing conversion logic
        const convertedFilename = `${Date.now()}-converted.mp4`;
        const convertedPath = path.join(videoUploadDir, convertedFilename);

        const video = await storage.createVideo({
          title,
          description: description || null,
          filename: mediaFile.originalname,
          filepath: originalPath,
          fileSize: mediaFile.size,
          status: "processing",
          mediaType,
          categoryId: categoryId || null,
          uploadedBy: req.session.userId!,
          thumbnailPath: thumbnailFile?.path || null,
        });

        res.json(video);

        (async () => {
          try {
            const ffmpegCommand = `ffmpeg -i "${originalPath}" -vf "scale=-2:720" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k -movflags +faststart -y "${convertedPath}"`;
            
            await execAsync(ffmpegCommand, { timeout: 1800000 });

            const stats = fs.statSync(convertedPath);

            await storage.updateVideo(video.id, {
              filepath: convertedPath,
              filename: convertedFilename,
              fileSize: stats.size,
              status: "ready",
            });

            if (fs.existsSync(originalPath)) {
              fs.unlinkSync(originalPath);
            }

            console.log(`Video ${video.id} converted successfully`);
            
            // Auto-generate thumbnail if none was provided
            if (!thumbnailFile) {
              try {
                const thumbnailPath = await generateThumbnailFromLocalVideo(video.id, convertedPath);
                if (thumbnailPath) {
                  await storage.updateVideo(video.id, { thumbnailPath });
                  console.log(`Auto-generated thumbnail for video ${video.id}`);
                }
              } catch (thumbError) {
                console.error(`Failed to auto-generate thumbnail for ${video.id}:`, thumbError);
              }
            }
          } catch (conversionError) {
            console.error(`Video conversion failed for ${video.id}:`, conversionError);
            await storage.updateVideo(video.id, { status: "failed" });
            
            if (fs.existsSync(convertedPath)) {
              fs.unlinkSync(convertedPath);
            }
          }
        })();
      }
    } catch (error) {
      console.error("Media upload error:", error);
      res.status(500).json({ message: "Failed to upload media" });
    }
  });

  // Admin: Update video details
  app.patch("/api/admin/videos/:id", requireAdmin, async (req, res) => {
    try {
      const { title, description, status, categoryId, excludeFromRecent, customMood } = req.body;
      
      // Get current video to check if it's a Vimeo video
      const currentVideo = await storage.getVideo(req.params.id);
      if (!currentVideo) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Update on Vimeo if it's a Vimeo video and title or description changed
      if (currentVideo.vimeoVideoId && (title || description !== undefined)) {
        const vimeoMetadata: { name?: string; description?: string } = {};
        if (title) vimeoMetadata.name = title;
        if (description !== undefined) vimeoMetadata.description = description || "";
        
        const success = await vimeoService.updateVideoMetadata(currentVideo.vimeoVideoId, vimeoMetadata);
        if (success) {
          console.log(`Updated Vimeo metadata for video ${req.params.id}`);
        } else {
          console.log(`Failed to update Vimeo metadata for video ${req.params.id} (non-fatal)`);
        }
      }
      
      const video = await storage.updateVideo(req.params.id, { title, description, status, categoryId, excludeFromRecent, customMood: customMood === "auto" ? null : customMood });
      res.json(video);
    } catch (error) {
      console.error("Update video error:", error);
      res.status(500).json({ message: "Failed to update video" });
    }
  });

  // Admin: Upload video thumbnail
  // For videos (with vimeoVideoId): Upload directly to Vimeo, store Vimeo URL
  // For audio files: Upload to object storage
  app.post("/api/admin/videos/:id/thumbnail", requireAdmin, imageUpload.single("thumbnail"), async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No thumbnail file provided" });
      }

      let thumbnailPath: string;

      // For Vimeo videos - upload directly to Vimeo (no fallback)
      if (video.vimeoVideoId && video.mediaType === "video") {
        try {
          const imageBuffer = fs.readFileSync(req.file.path);
          const contentType = req.file.mimetype || "image/jpeg";
          
          console.log(`[Thumbnail] Uploading to Vimeo for video ${video.id} (vimeoId: ${video.vimeoVideoId})`);
          const success = await vimeoService.uploadThumbnail(video.vimeoVideoId, imageBuffer, contentType);
          
          if (!success) {
            throw new Error("Vimeo thumbnail upload failed");
          }
          
          // Poll Vimeo until the thumbnail URL changes (custom thumbnail replaces the old one)
          const oldThumbnailUrl = video.thumbnailPath;
          let vimeoThumbnailUrl: string | null = null;
          const pollIntervals = [3000, 5000, 5000, 7000, 10000]; // up to ~30s total
          for (const delay of pollIntervals) {
            await new Promise(r => setTimeout(r, delay));
            const fetchedUrl = await vimeoService.getThumbnailUrl(video.vimeoVideoId);
            if (fetchedUrl && fetchedUrl !== oldThumbnailUrl) {
              vimeoThumbnailUrl = fetchedUrl;
              console.log(`[Thumbnail] Got new Vimeo thumbnail URL after polling`);
              break;
            }
            console.log(`[Thumbnail] Thumbnail not updated yet, polling again...`);
          }
          // If URL didn't change after all polls, use the latest URL we got
          if (!vimeoThumbnailUrl) {
            vimeoThumbnailUrl = await vimeoService.getThumbnailUrl(video.vimeoVideoId);
          }
          if (!vimeoThumbnailUrl) {
            throw new Error("Failed to get thumbnail URL from Vimeo after upload");
          }
          
          thumbnailPath = vimeoThumbnailUrl;
          console.log(`[Thumbnail] Uploaded to Vimeo for video ${video.id}: ${thumbnailPath}`);
        } finally {
          // Clean up temp file
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        }
      } else {
        // For audio files - upload to object storage
        // Delete old thumbnail from object storage if exists
        if (video.thumbnailPath?.startsWith("/objects/")) {
          try {
            const oldObjectFile = await objectStorageService.getObjectEntityFile(video.thumbnailPath);
            await oldObjectFile.delete();
            console.log(`Deleted old thumbnail from cloud storage for video ${video.id}`);
          } catch (err) {
            console.error(`Failed to delete old thumbnail from cloud storage:`, err);
          }
        }

        // Upload thumbnail to object storage
        const uploadURL = await objectStorageService.getObjectEntityUploadURL();
        thumbnailPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
        
        const url = new URL(uploadURL);
        const pathParts = url.pathname.slice(1).split("/");
        const bucketName = pathParts[0];
        const objectName = pathParts.slice(1).join("/");
        
        const bucket = objectStorageClient.bucket(bucketName);
        const thumbnailFile = bucket.file(objectName);
        
        await new Promise<void>((resolve, reject) => {
          const readStream = fs.createReadStream(req.file!.path);
          const writeStream = thumbnailFile.createWriteStream({
            resumable: false,
            contentType: req.file!.mimetype,
          });
          readStream.on("error", reject);
          writeStream.on("error", reject);
          writeStream.on("finish", resolve);
          readStream.pipe(writeStream);
        });
        
        // Delete the temp file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
        console.log(`[Thumbnail] Uploaded to object storage for ${video.mediaType} ${video.id}: ${thumbnailPath}`);
      }

      if (!thumbnailPath) {
        throw new Error("Failed to upload thumbnail - no path generated");
      }

      const updatedVideo = await storage.updateVideo(video.id, { thumbnailPath });
      res.json(updatedVideo);
    } catch (error) {
      console.error("Thumbnail upload error:", error);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      const errorMessage = error instanceof Error ? error.message : "Failed to upload thumbnail";
      res.status(500).json({ message: errorMessage });
    }
  });

  // Serve video thumbnails
  app.get("/api/videos/:id/thumbnail", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video || !video.thumbnailPath) {
        return res.status(404).json({ message: "Thumbnail not found" });
      }

      // Redirect to Vimeo CDN URL directly
      if (video.thumbnailPath.startsWith("https://")) {
        return res.redirect(video.thumbnailPath);
      }

      // Check if thumbnail is stored in cloud storage
      if (video.thumbnailPath.startsWith("/objects/")) {
        try {
          const objectFile = await objectStorageService.getObjectEntityFile(video.thumbnailPath);
          const [metadata] = await objectFile.getMetadata();
          
          res.set({
            "Content-Type": metadata.contentType || "image/jpeg",
            "Content-Length": metadata.size,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
          });
          
          const stream = objectFile.createReadStream();
          stream.on("error", (err) => {
            console.error("Thumbnail stream error:", err);
            if (!res.headersSent) {
              res.status(500).json({ message: "Error streaming thumbnail" });
            }
          });
          stream.pipe(res);
        } catch (cloudError) {
          console.error("Cloud thumbnail error:", cloudError);
          return res.status(404).json({ message: "Thumbnail not found in cloud storage" });
        }
      } else {
        // Serve from local filesystem (for backwards compatibility)
        if (!fs.existsSync(video.thumbnailPath)) {
          return res.status(404).json({ message: "Thumbnail file not found" });
        }
        res.set({
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        });
        res.sendFile(path.resolve(video.thumbnailPath));
      }
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

      // Delete video file from Vimeo or cloud storage
      if (video.vimeoVideoId) {
        try {
          await vimeoService.deleteVideo(video.vimeoVideoId);
          console.log(`Deleted video ${req.params.id} from Vimeo`);
        } catch (err) {
          console.error(`Failed to delete video ${req.params.id} from Vimeo:`, err);
        }
      }
      
      if (video.filepath?.startsWith("/objects/") || video.filepath?.startsWith("https://storage.googleapis.com/")) {
        try {
          const normalizedPath = objectStorageService.normalizeObjectEntityPath(video.filepath);
          if (normalizedPath.startsWith("/objects/")) {
            const objectFile = await objectStorageService.getObjectEntityFile(normalizedPath);
            await objectFile.delete();
            console.log(`Deleted video ${req.params.id} from cloud storage`);
          }
        } catch (err) {
          console.error(`Failed to delete video ${req.params.id} from cloud storage:`, err);
        }
      } else if (video.filepath && fs.existsSync(video.filepath)) {
        fs.unlinkSync(video.filepath);
        console.log(`Deleted video ${req.params.id} from local filesystem`);
      }

      // Delete thumbnail if exists (cloud or local)
      if (video.thumbnailPath) {
        if (video.thumbnailPath.startsWith("/objects/")) {
          try {
            const thumbnailFile = await objectStorageService.getObjectEntityFile(video.thumbnailPath);
            await thumbnailFile.delete();
            console.log(`Deleted thumbnail for video ${req.params.id} from cloud storage`);
          } catch (err) {
            console.error(`Failed to delete thumbnail from cloud storage:`, err);
          }
        } else if (fs.existsSync(video.thumbnailPath)) {
          fs.unlinkSync(video.thumbnailPath);
          console.log(`Deleted thumbnail for video ${req.params.id} from local filesystem`);
        }
      }

      await storage.deleteVideo(req.params.id);
      console.log(`Video ${req.params.id} fully deleted from database and storage`);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete video error:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  // Admin: Check and update Vimeo video transcoding status
  app.post("/api/admin/videos/:id/check-vimeo-status", requireAdmin, async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      if (!video.vimeoVideoId) {
        return res.status(400).json({ message: "Not a Vimeo video" });
      }

      // Get video status from Vimeo
      const vimeoVideo = await vimeoService.getVideo(video.vimeoVideoId);
      if (!vimeoVideo) {
        return res.status(404).json({ message: "Video not found on Vimeo" });
      }

      console.log(`[Vimeo Status Check] Video ${video.id}: Vimeo status = ${vimeoVideo.status}`);

      // Vimeo status values: "available", "transcoding", "uploading", "quota_exceeded", etc.
      let newStatus = video.status;
      let updates: any = {};

      if (vimeoVideo.status === "available" && video.status === "processing") {
        newStatus = "ready";
        updates.status = "ready";
        
        // Always get the embed URL to ensure we have the correct hash
        const embedUrl = await vimeoService.getSecureEmbedUrl(video.vimeoVideoId);
        if (embedUrl) {
          updates.vimeoEmbedUrl = embedUrl;
          console.log(`[Vimeo Status Check] Embed URL: ${embedUrl}`);
        }

        // Get thumbnail if we don't have one
        if (!video.thumbnailPath) {
          const thumbnailUrl = await vimeoService.getThumbnailUrl(video.vimeoVideoId);
          if (thumbnailUrl) {
            updates.thumbnailPath = thumbnailUrl;
          }
        }

        // Get duration if we don't have it
        if (!video.duration && vimeoVideo.duration) {
          updates.duration = vimeoVideo.duration;
        }

        await storage.updateVideo(video.id, updates);
        console.log(`[Vimeo Status Check] Video ${video.id} updated to ready with embedUrl: ${embedUrl}`);
      }

      res.json({ 
        vimeoStatus: vimeoVideo.status, 
        localStatus: newStatus,
        updated: Object.keys(updates).length > 0 
      });
    } catch (error) {
      console.error("Check Vimeo status error:", error);
      res.status(500).json({ message: "Failed to check video status" });
    }
  });

  // Admin: Batch check Vimeo status for all processing videos
  app.post("/api/admin/videos/check-processing", requireAdmin, async (req, res) => {
    try {
      const allVideos = await storage.getAllVideos();
      const processingVideos = allVideos.filter(v => v.status === "processing" && v.vimeoVideoId);
      
      console.log(`[Vimeo Check] Checking ${processingVideos.length} processing videos...`);
      
      const results = [];
      for (const video of processingVideos) {
        try {
          const vimeoVideo = await vimeoService.getVideo(video.vimeoVideoId!);
          console.log(`[Vimeo Check] Video ${video.id} (${video.vimeoVideoId}): Vimeo status = ${vimeoVideo?.status}`);
          
          if (vimeoVideo && vimeoVideo.status === "available") {
            const updates: any = { status: "ready" };
            
            // Always get the embed URL to ensure we have the hash
            const embedUrl = await vimeoService.getSecureEmbedUrl(video.vimeoVideoId!);
            if (embedUrl) {
              updates.vimeoEmbedUrl = embedUrl;
              console.log(`[Vimeo Check] Video ${video.id} embed URL: ${embedUrl}`);
            }
            
            // Get thumbnail if we don't have one
            if (!video.thumbnailPath) {
              const thumbnailUrl = await vimeoService.getThumbnailUrl(video.vimeoVideoId!);
              if (thumbnailUrl) updates.thumbnailPath = thumbnailUrl;
            }
            
            // Get duration if we don't have it
            if (!video.duration && vimeoVideo.duration) {
              updates.duration = vimeoVideo.duration;
            }
            
            await storage.updateVideo(video.id, updates);
            console.log(`[Vimeo Check] Video ${video.id} updated to ready`);
            results.push({ id: video.id, updated: true, status: "ready" });
          } else {
            results.push({ id: video.id, updated: false, status: vimeoVideo?.status || "unknown" });
          }
        } catch (err) {
          console.error(`[Vimeo Check] Error checking video ${video.id}:`, err);
          results.push({ id: video.id, updated: false, error: true });
        }
      }
      
      console.log(`[Vimeo Check] Complete. Results: ${JSON.stringify(results)}`);
      res.json({ checked: processingVideos.length, results });
    } catch (error) {
      console.error("Check processing videos error:", error);
      res.status(500).json({ message: "Failed to check processing videos" });
    }
  });

  // Admin: Reorder videos
  app.post("/api/admin/videos/reorder", requireAdmin, async (req, res) => {
    try {
      const { videoIds } = req.body;
      
      if (!Array.isArray(videoIds)) {
        return res.status(400).json({ message: "videoIds must be an array" });
      }

      // Update sortOrder for each video based on position
      for (let i = 0; i < videoIds.length; i++) {
        await storage.updateVideo(videoIds[i], { sortOrder: i + 1 });
      }

      res.json({ success: true, count: videoIds.length });
    } catch (error) {
      console.error("Reorder videos error:", error);
      res.status(500).json({ message: "Failed to reorder videos" });
    }
  });

  // ============ CLOUD VIDEO UPLOAD ============
  // objectStorageService is initialized at the top of the file

  // Admin: Request presigned URL for video upload
  app.post("/api/admin/videos/request-upload-url", requireAdmin, async (req, res) => {
    try {
      const { name, size, contentType } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Filename is required" });
      }

      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
      
      console.log(`[Cloud Upload] Generated upload URL for ${name}, normalized path: ${objectPath}`);

      res.json({
        uploadURL,
        objectPath,
        metadata: { name, size, contentType },
      });
    } catch (error) {
      console.error("Request upload URL error:", error);
      res.status(500).json({ message: "Failed to generate upload URL" });
    }
  });

  // Admin: Finalize video upload (create record after successful cloud upload)
  app.post("/api/admin/videos/finalize", requireAdmin, async (req, res) => {
    try {
      const { title, description, categoryId, objectPath, filename, fileSize } = req.body;

      if (!title || !objectPath) {
        return res.status(400).json({ message: "Title and objectPath are required" });
      }

      console.log(`[Cloud Upload] Finalizing video "${title}" with objectPath: ${objectPath}`);

      const video = await storage.createVideo({
        title,
        description: description || null,
        filename: filename || "uploaded-video.mp4",
        filepath: objectPath,
        fileSize: fileSize || null,
        status: "processing",
        categoryId: categoryId || null,
        uploadedBy: req.session.userId!,
        thumbnailPath: null,
      });

      console.log(`[Cloud Upload] Created video record ${video.id} with filepath: ${video.filepath}`);

      res.json(video);

      // Start background video conversion
      (async () => {
        try {
          console.log(`Starting video conversion for ${video.id}...`);
          
          // Download video from cloud storage to temp file
          const tempDir = path.join(process.cwd(), "uploads", "temp");
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          
          const tempOriginalPath = path.join(tempDir, `${video.id}-original`);
          const tempConvertedPath = path.join(tempDir, `${video.id}-converted.mp4`);
          
          // Get the file from object storage
          const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
          
          // Download to local temp file
          await new Promise<void>((resolve, reject) => {
            const stream = objectFile.createReadStream();
            const writeStream = fs.createWriteStream(tempOriginalPath);
            stream.on("error", reject);
            writeStream.on("error", reject);
            writeStream.on("finish", resolve);
            stream.pipe(writeStream);
          });
          
          console.log(`Downloaded ${video.id} for conversion`);
          
          // Check if video needs conversion by probing format and resolution
          let needsConversion = true;
          let videoHeight = 1080; // Default assumption
          let videoCodec = "";
          let audioCodec = "";
          
          try {
            const probeCommand = `ffprobe -v quiet -print_format json -show_streams "${tempOriginalPath}"`;
            const { stdout: probeOutput } = await execAsync(probeCommand, { timeout: 30000 });
            const probeData = JSON.parse(probeOutput);
            
            const videoStream = probeData.streams?.find((s: any) => s.codec_type === "video");
            const audioStream = probeData.streams?.find((s: any) => s.codec_type === "audio");
            
            if (videoStream) {
              videoHeight = videoStream.height || 1080;
              videoCodec = videoStream.codec_name || "";
            }
            if (audioStream) {
              audioCodec = audioStream.codec_name || "";
            }
            
            // Skip conversion if already H.264/AAC MP4 and resolution is ≤720p
            const isH264 = videoCodec === "h264";
            const isAac = audioCodec === "aac";
            const isSmallEnough = videoHeight <= 720;
            const isMp4 = filename?.toLowerCase().endsWith(".mp4");
            
            if (isH264 && isAac && isSmallEnough && isMp4) {
              needsConversion = false;
              console.log(`Video ${video.id} is already optimized (H.264/AAC, ${videoHeight}p) - skipping conversion`);
            } else {
              console.log(`Video ${video.id} needs conversion: codec=${videoCodec}/${audioCodec}, height=${videoHeight}p`);
            }
          } catch (probeError) {
            console.log(`Could not probe video ${video.id}, will convert:`, probeError);
          }
          
          if (needsConversion) {
            // Build FFmpeg command with optimizations:
            // - Use "veryfast" preset for ~50% faster encoding (slight quality trade-off)
            // - Only scale if video is larger than 720p
            // - Use multiple threads
            const scaleFilter = videoHeight > 720 ? '-vf "scale=-2:720"' : '';
            const ffmpegCommand = `ffmpeg -i "${tempOriginalPath}" ${scaleFilter} -c:v libx264 -preset veryfast -crf 23 -threads 0 -c:a aac -b:a 128k -movflags +faststart -y "${tempConvertedPath}"`;
            
            console.log(`Running FFmpeg for ${video.id}: ${ffmpegCommand}`);
            await execAsync(ffmpegCommand, { timeout: 1800000 });
            console.log(`FFmpeg conversion completed for ${video.id}`);
          } else {
            // Just copy the file as-is (rename to .mp4 if needed)
            fs.copyFileSync(tempOriginalPath, tempConvertedPath);
            console.log(`Copied original file for ${video.id} (no conversion needed)`);
          }
          
          // Generate default thumbnail from video (extract frame at 1 second)
          // Only if no custom thumbnail has been uploaded
          const tempThumbnailPath = path.join(tempDir, `${video.id}-thumbnail.jpg`);
          try {
            // Re-fetch video to check if custom thumbnail was uploaded during processing
            const currentVideo = await storage.getVideo(video.id);
            if (currentVideo && !currentVideo.thumbnailPath) {
              const thumbnailCommand = `ffmpeg -i "${tempConvertedPath}" -ss 00:00:01 -vframes 1 -vf "scale=640:-2" -y "${tempThumbnailPath}"`;
              console.log(`Generating default thumbnail for ${video.id}`);
              await execAsync(thumbnailCommand, { timeout: 60000 });
              
              if (fs.existsSync(tempThumbnailPath)) {
                // Double-check thumbnail wasn't set in the meantime
                const videoBeforeUpload = await storage.getVideo(video.id);
                if (videoBeforeUpload && !videoBeforeUpload.thumbnailPath) {
                  // Upload thumbnail to cloud storage
                  const thumbnailUploadURL = await objectStorageService.getObjectEntityUploadURL();
                  const thumbnailObjectPath = objectStorageService.normalizeObjectEntityPath(thumbnailUploadURL);
                  
                  const thumbUrl = new URL(thumbnailUploadURL);
                  const thumbPathParts = thumbUrl.pathname.slice(1).split("/");
                  const thumbBucketName = thumbPathParts[0];
                  const thumbObjectName = thumbPathParts.slice(1).join("/");
                  
                  const thumbBucket = objectStorageClient.bucket(thumbBucketName);
                  const thumbFile = thumbBucket.file(thumbObjectName);
                  
                  await new Promise<void>((resolve, reject) => {
                    const thumbReadStream = fs.createReadStream(tempThumbnailPath);
                    const thumbWriteStream = thumbFile.createWriteStream({
                      resumable: false,
                      contentType: "image/jpeg",
                    });
                    thumbReadStream.on("error", reject);
                    thumbWriteStream.on("error", reject);
                    thumbWriteStream.on("finish", resolve);
                    thumbReadStream.pipe(thumbWriteStream);
                  });
                  
                  // Update video with thumbnail path
                  await storage.updateVideo(video.id, { thumbnailPath: thumbnailObjectPath });
                  console.log(`Default thumbnail generated and uploaded for ${video.id}`);
                } else {
                  console.log(`Custom thumbnail was uploaded during processing for ${video.id}, skipping default`);
                }
                
                // Clean up temp thumbnail
                fs.unlinkSync(tempThumbnailPath);
              }
            } else {
              console.log(`Video ${video.id} already has custom thumbnail, skipping default generation`);
            }
          } catch (thumbnailError) {
            console.error(`Failed to generate thumbnail for ${video.id}:`, thumbnailError);
            // Clean up temp thumbnail on error
            if (fs.existsSync(tempThumbnailPath)) {
              fs.unlinkSync(tempThumbnailPath);
            }
            // Continue without thumbnail - not a critical failure
          }
          
          // Upload converted file back to cloud storage
          const convertedUploadURL = await objectStorageService.getObjectEntityUploadURL();
          const convertedObjectPath = objectStorageService.normalizeObjectEntityPath(convertedUploadURL);
          
          // Parse the URL to get bucket and object name for direct upload
          const url = new URL(convertedUploadURL);
          const pathParts = url.pathname.slice(1).split("/");
          const bucketName = pathParts[0];
          const objectName = pathParts.slice(1).join("/");
          
          const bucket = objectStorageClient.bucket(bucketName);
          const newFile = bucket.file(objectName);
          
          await new Promise<void>((resolve, reject) => {
            const readStream = fs.createReadStream(tempConvertedPath);
            const writeStream = newFile.createWriteStream({
              resumable: false,
              contentType: "video/mp4",
            });
            readStream.on("error", reject);
            writeStream.on("error", reject);
            writeStream.on("finish", resolve);
            readStream.pipe(writeStream);
          });
          
          console.log(`Uploaded converted video for ${video.id}`);
          
          const stats = fs.statSync(tempConvertedPath);
          
          // Update video record with new path
          await storage.updateVideo(video.id, {
            filepath: convertedObjectPath,
            filename: `${video.id}-converted.mp4`,
            fileSize: stats.size,
            status: "ready",
          });
          
          // Clean up temp files from local server
          if (fs.existsSync(tempOriginalPath)) {
            fs.unlinkSync(tempOriginalPath);
            console.log(`Deleted temp original file for ${video.id}`);
          }
          if (fs.existsSync(tempConvertedPath)) {
            fs.unlinkSync(tempConvertedPath);
            console.log(`Deleted temp converted file for ${video.id}`);
          }
          
          // Delete original uploaded file from cloud storage
          try {
            await objectFile.delete();
            console.log(`Deleted original cloud file for ${video.id} from cloud storage`);
          } catch (err) {
            console.error(`Failed to delete original cloud file for ${video.id}:`, err);
          }
          
          console.log(`Video ${video.id} converted and uploaded successfully - original deleted`);
        } catch (conversionError) {
          console.error(`Video conversion failed for ${video.id}:`, conversionError);
          await storage.updateVideo(video.id, { status: "failed" });
          
          // Clean up any temp files
          const tempDir = path.join(process.cwd(), "uploads", "temp");
          const tempOriginalPath = path.join(tempDir, `${video.id}-original`);
          const tempConvertedPath = path.join(tempDir, `${video.id}-converted.mp4`);
          const tempThumbnailPath = path.join(tempDir, `${video.id}-thumbnail.jpg`);
          if (fs.existsSync(tempOriginalPath)) fs.unlinkSync(tempOriginalPath);
          if (fs.existsSync(tempConvertedPath)) fs.unlinkSync(tempConvertedPath);
          if (fs.existsSync(tempThumbnailPath)) fs.unlinkSync(tempThumbnailPath);
        }
      })();
    } catch (error) {
      console.error("Finalize video error:", error);
      res.status(500).json({ message: "Failed to finalize video upload" });
    }
  });

  // Admin: Cancel video upload and clean up partial file
  app.post("/api/admin/videos/cancel-upload", requireAdmin, async (req, res) => {
    try {
      const { objectPath } = req.body;

      if (!objectPath) {
        return res.status(400).json({ message: "objectPath is required" });
      }

      console.log(`[Cancel Upload] Cleaning up cancelled upload at: ${objectPath}`);

      try {
        const file = await objectStorageService.getObjectEntityFile(objectPath);
        await file.delete();
        console.log(`[Cancel Upload] Successfully deleted: ${objectPath}`);
      } catch (deleteError: any) {
        // File might not exist yet if upload was cancelled early
        if (deleteError.code === 404) {
          console.log(`[Cancel Upload] File not found (may not have been uploaded yet): ${objectPath}`);
        } else {
          throw deleteError;
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Cancel upload cleanup error:", error);
      res.status(500).json({ message: "Failed to cleanup cancelled upload" });
    }
  });

  // ============ VIMEO VIDEO UPLOAD ============
  // Admin: Create a video on Vimeo and get upload URL (TUS protocol)
  app.post("/api/admin/videos/vimeo/create", requireAdmin, async (req, res) => {
    try {
      const { title, fileSize } = req.body;
      if (!title || !fileSize) {
        return res.status(400).json({ message: "Title and fileSize are required" });
      }

      const vimeoVideo = await vimeoService.createVideo(title, fileSize);
      const vimeoVideoId = vimeoService.extractVideoId(vimeoVideo.uri);
      
      console.log(`[Vimeo] Created video "${title}" with id: ${vimeoVideoId}`);
      
      res.json({
        vimeoVideoId,
        uploadUrl: vimeoVideo.upload.upload_link,
        vimeoUri: vimeoVideo.uri,
      });
    } catch (error: any) {
      console.error("Vimeo create video error:", error);
      res.status(500).json({ message: error.message || "Failed to create video on Vimeo" });
    }
  });

  // Admin: Finalize Vimeo video (create local record after upload)
  app.post("/api/admin/videos/vimeo/finalize", requireAdmin, async (req, res) => {
    try {
      const { title, description, categoryId, vimeoVideoId, filename, fileSize } = req.body;

      if (!title || !vimeoVideoId) {
        return res.status(400).json({ message: "Title and vimeoVideoId are required" });
      }

      console.log(`[Vimeo] Finalizing video "${title}" with id: ${vimeoVideoId}`);

      // Try to get the embed URL immediately - Vimeo often provides it right after upload
      let initialEmbedUrl: string | null = null;
      let initialThumbnail: string | null = null;
      let initialDuration: number | null = null;
      let initialStatus = "processing";
      
      try {
        const vimeoVideo = await vimeoService.getVideo(vimeoVideoId);
        if (vimeoVideo) {
          console.log(`[Vimeo] Initial check - status: ${vimeoVideo.status}, link: ${vimeoVideo.link}`);
          
          // Get embed URL immediately if available
          initialEmbedUrl = await vimeoService.getSecureEmbedUrl(vimeoVideoId);
          console.log(`[Vimeo] Initial embed URL: ${initialEmbedUrl}`);
          
          // If video is already available (transcoded), set it as ready
          if (vimeoVideo.status === "available") {
            initialStatus = "ready";
            initialDuration = vimeoVideo.duration || null;
            initialThumbnail = await vimeoService.getThumbnailUrl(vimeoVideoId);
          }
        }
      } catch (err) {
        console.log(`[Vimeo] Could not get initial video info (may still be processing): ${err}`);
      }

      const video = await storage.createVideo({
        title,
        description: description || null,
        filename: filename || null,
        filepath: null,
        fileSize: fileSize || null,
        status: initialStatus,
        categoryId: categoryId || null,
        uploadedBy: req.session.userId!,
        thumbnailPath: initialThumbnail,
        bunnyGuid: null,
        bunnyVideoId: null,
        storageType: "vimeo",
        vimeoVideoId,
        vimeoEmbedUrl: initialEmbedUrl,
        duration: initialDuration,
      });

      console.log(`[Vimeo] Created video record ${video.id} with embedUrl: ${initialEmbedUrl}`);

      // Only poll if video is still processing
      if (initialStatus === "processing") {
        // Poll Vimeo for processing status
        (async () => {
          let attempts = 0;
          const maxAttempts = 120; // 20 minutes max
          
          while (attempts < maxAttempts) {
          try {
            await new Promise(r => setTimeout(r, 10000)); // Check every 10 seconds
            const vimeoVideo = await vimeoService.getVideo(vimeoVideoId);
            
            if (!vimeoVideo) {
              attempts++;
              continue;
            }
            
            // Vimeo status: "available" means ready
            if (vimeoVideo.status === "available") {
              // Fetch thumbnail from Vimeo
              let thumbnailPath: string | null = null;
              try {
                thumbnailPath = await vimeoService.getThumbnailUrl(vimeoVideoId);
                if (thumbnailPath) {
                  console.log(`[Vimeo] Got thumbnail URL for video ${video.id}: ${thumbnailPath}`);
                }
              } catch (thumbErr) {
                console.error(`[Vimeo] Failed to get thumbnail for ${video.id}:`, thumbErr);
              }
              
              // Get the secure embed URL with hash for unlisted videos
              let vimeoEmbedUrl: string | null = null;
              try {
                vimeoEmbedUrl = await vimeoService.getSecureEmbedUrl(vimeoVideoId);
                if (vimeoEmbedUrl) {
                  console.log(`[Vimeo] Got embed URL for video ${video.id}: ${vimeoEmbedUrl}`);
                } else {
                  console.warn(`[Vimeo] No embed URL returned for video ${video.id}`);
                }
              } catch (embedErr) {
                console.error(`[Vimeo] Failed to get embed URL for ${video.id}:`, embedErr);
              }
              
              await storage.updateVideo(video.id, { 
                status: "ready",
                duration: vimeoVideo.duration || 0,
                thumbnailPath,
                vimeoEmbedUrl,
              });
              console.log(`[Vimeo] Video ${video.id} is ready with embedUrl: ${vimeoEmbedUrl}`);
              break;
            } else if (vimeoVideo.status === "uploading_error" || vimeoVideo.status === "transcode_error") {
              await storage.updateVideo(video.id, { status: "failed" });
              console.log(`[Vimeo] Video ${video.id} failed processing: ${vimeoVideo.status}`);
              break;
            }
            
            attempts++;
          } catch (err) {
            console.error(`[Vimeo] Error checking status for ${video.id}:`, err);
            attempts++;
          }
        }
        })();
      }

      res.json(video);
    } catch (error: any) {
      console.error("Vimeo finalize video error:", error);
      res.status(500).json({ message: error.message || "Failed to finalize video" });
    }
  });

  // Admin: Get Vimeo embed URL for a video
  app.get("/api/admin/videos/:id/vimeo-embed", requireAdmin, async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      if (!video.vimeoVideoId) {
        return res.status(400).json({ message: "Video is not hosted on Vimeo" });
      }
      
      // Get secure embed URL with hash for private videos
      const embedUrl = await vimeoService.getSecureEmbedUrl(video.vimeoVideoId);
      if (!embedUrl) {
        return res.status(500).json({ message: "Failed to get video embed" });
      }
      
      res.json({ embedUrl });
    } catch (error) {
      console.error("Get Vimeo embed error:", error);
      res.status(500).json({ message: "Failed to get embed URL" });
    }
  });

  // Public: Get Vimeo playback URL for subscribers (requires active subscription)
  // Returns HLS, progressive, or embed URL depending on video privacy and API permissions
  app.get("/api/videos/:id/vimeo-embed", requireMobileOrSessionAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Check if user is whitelisted or has active subscription
      const isWhitelisted = user.role === "admin" || await storage.isWhitelistedEmailAddress(user.email);
      const isActive = isWhitelisted || user.subscriptionStatus === "active" || 
        (user.subscriptionStatus === "trial" && user.trialEndsAt && new Date(user.trialEndsAt) > new Date());
      
      if (!isActive) {
        return res.status(403).json({ message: "Active subscription required to watch videos" });
      }

      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      if (!video.vimeoVideoId) {
        return res.status(400).json({ message: "Video is not hosted on Vimeo" });
      }

      // Increment view count (deduplicated per user)
      const newVimeoView = await storage.markVideoAsViewed(userId, video.id);
      if (newVimeoView) await storage.incrementVideoViewCount(video.id);
      
      // Get authenticated playback URL with proper hash for private videos
      const playback = await vimeoService.getAuthenticatedPlaybackUrl(video.vimeoVideoId);
      if (!playback) {
        return res.status(500).json({ message: "Failed to get video playback" });
      }
      
      // Return playback info - frontend handles different types
      res.json({ 
        embedUrl: playback.url,
        playbackType: playback.type,
        videoUrl: playback.url
      });
    } catch (error) {
      console.error("Get Vimeo playback error:", error);
      res.status(500).json({ message: "Failed to get video playback" });
    }
  });

  // Admin: Fix Vimeo privacy settings and fetch embed URLs for all videos (with SSE progress)
  app.get("/api/admin/videos/vimeo/fix-privacy-stream", requireAdmin, async (req, res) => {
    // Set up Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendEvent = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      const allVideos = await storage.getAllVideos();
      const vimeoVideos = allVideos.filter((v: any) => v.vimeoVideoId && v.mediaType === 'video');
      
      if (vimeoVideos.length === 0) {
        sendEvent({ type: 'complete', message: "No Vimeo videos found", fixed: 0, failed: 0, total: 0 });
        res.end();
        return;
      }

      sendEvent({ type: 'start', total: vimeoVideos.length });

      let fixed = 0;
      let failed = 0;

      for (let i = 0; i < vimeoVideos.length; i++) {
        const video = vimeoVideos[i];
        if (!video.vimeoVideoId) continue;
        
        sendEvent({ 
          type: 'progress', 
          current: i + 1, 
          total: vimeoVideos.length,
          videoTitle: video.title,
          status: 'processing'
        });

        try {
          const embedUrl = await vimeoService.getSecureEmbedUrl(video.vimeoVideoId);
          if (embedUrl) {
            await storage.updateVideo(video.id, { vimeoEmbedUrl: embedUrl } as any);
            fixed++;
            sendEvent({ 
              type: 'progress', 
              current: i + 1, 
              total: vimeoVideos.length,
              videoTitle: video.title,
              status: 'success'
            });
          } else {
            failed++;
            sendEvent({ 
              type: 'progress', 
              current: i + 1, 
              total: vimeoVideos.length,
              videoTitle: video.title,
              status: 'failed',
              error: 'Could not get embed URL'
            });
          }
          // Wait 600ms between updates to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 600));
        } catch (error) {
          failed++;
          sendEvent({ 
            type: 'progress', 
            current: i + 1, 
            total: vimeoVideos.length,
            videoTitle: video.title,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      sendEvent({ 
        type: 'complete', 
        message: `Fixed ${fixed} of ${vimeoVideos.length} videos`, 
        fixed, 
        failed,
        total: vimeoVideos.length
      });
      res.end();
    } catch (error) {
      console.error("Fix Vimeo privacy error:", error);
      sendEvent({ type: 'error', message: "Failed to fix Vimeo privacy settings" });
      res.end();
    }
  });

  // Admin: Fix Vimeo privacy settings (non-streaming fallback)
  app.post("/api/admin/videos/vimeo/fix-privacy", requireAdmin, async (req, res) => {
    try {
      // Get all videos with Vimeo IDs
      const allVideos = await storage.getAllVideos();
      const vimeoVideos = allVideos.filter((v: any) => v.vimeoVideoId && v.mediaType === 'video');
      
      if (vimeoVideos.length === 0) {
        return res.json({ message: "No Vimeo videos found", fixed: 0, failed: 0 });
      }

      let fixed = 0;
      let failed = 0;
      const errors: string[] = [];

      // Process videos one at a time with delay to avoid rate limiting
      for (const video of vimeoVideos) {
        try {
          if (!video.vimeoVideoId) continue;
          // Get the secure embed URL (which includes hash for private/unlisted videos)
          const embedUrl = await vimeoService.getSecureEmbedUrl(video.vimeoVideoId);
          if (embedUrl) {
            await storage.updateVideo(video.id, { vimeoEmbedUrl: embedUrl } as any);
            console.log(`[Admin] Stored embed URL for ${video.title}: ${embedUrl}`);
            fixed++;
            console.log(`[Admin] Fixed video ${video.title} (${video.vimeoVideoId})`);
          } else {
            failed++;
            errors.push(`${video.title}: Could not get embed URL`);
          }
          // Wait 600ms between updates to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 600));
        } catch (error) {
          failed++;
          errors.push(`${video.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      res.json({ 
        message: `Fixed ${fixed} of ${vimeoVideos.length} videos`, 
        fixed, 
        failed,
        total: vimeoVideos.length,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error("Fix Vimeo privacy error:", error);
      res.status(500).json({ message: "Failed to fix Vimeo privacy settings" });
    }
  });

  // Admin: Import Vimeo embed URLs from SQL or JSON
  app.post("/api/admin/videos/vimeo/import-embed-urls", requireAdmin, async (req, res) => {
    try {
      const { updates } = req.body;
      
      if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({ message: "Invalid data format. Expected { updates: [{vimeoVideoId, embedUrl}] }" });
      }
      
      let updated = 0;
      let failed = 0;
      
      for (const item of updates) {
        try {
          if (!item.vimeoVideoId || !item.embedUrl) continue;
          
          // Find video by vimeoVideoId and update its embed URL
          const allVideos = await storage.getAllVideos();
          const video = allVideos.find((v: any) => v.vimeoVideoId === item.vimeoVideoId);
          
          if (video) {
            await storage.updateVideo(video.id, { vimeoEmbedUrl: item.embedUrl } as any);
            updated++;
            console.log(`[Import] Updated embed URL for ${video.title}`);
          } else {
            failed++;
          }
        } catch (e) {
          failed++;
        }
      }
      
      res.json({ 
        message: `Updated ${updated} videos`, 
        updated, 
        failed, 
        total: updates.length 
      });
    } catch (error) {
      console.error("Import embed URLs error:", error);
      res.status(500).json({ message: "Failed to import embed URLs" });
    }
  });

  // Admin: Export Vimeo embed URLs as JSON file for production import
  app.get("/api/admin/videos/vimeo/export-embed-urls", requireAdmin, async (req, res) => {
    try {
      const allVideos = await storage.getAllVideos();
      const vimeoVideos = allVideos.filter((v: any) => 
        v.vimeoVideoId && 
        v.vimeoEmbedUrl
      );
      
      if (vimeoVideos.length === 0) {
        return res.status(404).json({ message: "No videos with embed URLs found" });
      }
      
      // Generate JSON format for easy import
      const updates = vimeoVideos.map((v: any) => ({
        vimeoVideoId: v.vimeoVideoId,
        embedUrl: v.vimeoEmbedUrl,
        title: v.title
      }));
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="vimeo_embed_urls_export.json"');
      res.send(JSON.stringify({ updates, exportedAt: new Date().toISOString(), total: updates.length }, null, 2));
    } catch (error) {
      console.error("Export embed URLs error:", error);
      res.status(500).json({ message: "Failed to export embed URLs" });
    }
  });

  // Admin: Fetch and store Vimeo embed URLs with hash codes (streaming progress)
  app.post("/api/admin/videos/vimeo/fix-embed-urls-stream", requireAdmin, async (req, res) => {
    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    
    const sendEvent = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };
    
    try {
      console.log("[Admin] Starting embed URL fix (streaming)...");
      
      // Get all videos with Vimeo IDs that don't have embed URLs yet
      const allVideos = await storage.getAllVideos();
      const vimeoVideos = allVideos.filter((v: any) => 
        v.vimeoVideoId && 
        v.mediaType === 'video' && 
        !v.vimeoEmbedUrl
      );
      
      console.log(`[Admin] Found ${vimeoVideos.length} videos without embed URLs`);
      
      sendEvent({ type: 'start', total: vimeoVideos.length });
      
      if (vimeoVideos.length === 0) {
        sendEvent({ type: 'complete', fixed: 0, failed: 0, total: 0 });
        res.end();
        return;
      }

      let fixed = 0;
      let failed = 0;

      // Process videos one at a time
      for (let i = 0; i < vimeoVideos.length; i++) {
        const video = vimeoVideos[i];
        try {
          if (!video.vimeoVideoId) continue;
          
          // Get the secure embed URL (which includes hash for private/unlisted videos)
          const embedUrl = await vimeoService.getSecureEmbedUrl(video.vimeoVideoId);
          
          if (embedUrl) {
            await storage.updateVideo(video.id, { vimeoEmbedUrl: embedUrl } as any);
            console.log(`[Admin] Stored embed URL for ${video.title}: ${embedUrl}`);
            fixed++;
            sendEvent({ 
              type: 'progress', 
              current: i + 1, 
              total: vimeoVideos.length,
              videoTitle: video.title,
              status: 'success'
            });
          } else {
            console.log(`[Admin] No embed URL found for ${video.title}`);
            failed++;
            sendEvent({ 
              type: 'progress', 
              current: i + 1, 
              total: vimeoVideos.length,
              videoTitle: video.title,
              status: 'failed',
              error: 'No embed URL found'
            });
          }
          
          // Wait 400ms between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 400));
        } catch (error) {
          console.error(`[Admin] Error processing ${video.title}:`, error);
          failed++;
          sendEvent({ 
            type: 'progress', 
            current: i + 1, 
            total: vimeoVideos.length,
            videoTitle: video.title,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      console.log(`[Admin] Embed URL fix complete: ${fixed} fixed, ${failed} failed`);
      sendEvent({ type: 'complete', fixed, failed, total: vimeoVideos.length });
      res.end();
    } catch (error) {
      console.error("Fix embed URLs error:", error);
      sendEvent({ type: 'error', message: "Failed to fix embed URLs" });
      res.end();
    }
  });

  // Admin: Fetch and store Vimeo embed URLs with hash codes (simple endpoint)
  app.post("/api/admin/videos/vimeo/fix-embed-urls", requireAdmin, async (req, res) => {
    try {
      console.log("[Admin] Starting embed URL fix...");
      
      // Get all videos with Vimeo IDs that don't have embed URLs yet
      const allVideos = await storage.getAllVideos();
      const vimeoVideos = allVideos.filter((v: any) => 
        v.vimeoVideoId && 
        v.mediaType === 'video' && 
        !v.vimeoEmbedUrl
      );
      
      console.log(`[Admin] Found ${vimeoVideos.length} videos without embed URLs`);
      
      if (vimeoVideos.length === 0) {
        return res.json({ message: "All videos already have embed URLs", fixed: 0, failed: 0, total: 0 });
      }

      let fixed = 0;
      let failed = 0;

      // Process videos one at a time with delay to avoid rate limiting
      for (const video of vimeoVideos) {
        try {
          if (!video.vimeoVideoId) continue;
          
          console.log(`[Admin] Fetching embed URL for: ${video.title} (${video.vimeoVideoId})`);
          
          // Get the secure embed URL (which includes hash for private/unlisted videos)
          const embedUrl = await vimeoService.getSecureEmbedUrl(video.vimeoVideoId);
          
          if (embedUrl) {
            await storage.updateVideo(video.id, { vimeoEmbedUrl: embedUrl } as any);
            console.log(`[Admin] Stored embed URL for ${video.title}: ${embedUrl}`);
            fixed++;
          } else {
            console.log(`[Admin] No embed URL found for ${video.title}`);
            failed++;
          }
          
          // Wait 500ms between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`[Admin] Error processing ${video.title}:`, error);
          failed++;
        }
      }

      console.log(`[Admin] Embed URL fix complete: ${fixed} fixed, ${failed} failed`);
      
      res.json({ 
        message: `Fixed ${fixed} of ${vimeoVideos.length} videos`, 
        fixed, 
        failed,
        total: vimeoVideos.length
      });
    } catch (error) {
      console.error("Fix embed URLs error:", error);
      res.status(500).json({ message: "Failed to fix embed URLs" });
    }
  });

  // Admin: Generate/regenerate thumbnail for a video
  // For Vimeo videos: Fetch thumbnail from Vimeo API
  // For local/audio files: Generate from video file (if available)
  app.post("/api/admin/videos/:id/generate-thumbnail", requireAdmin, async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      let thumbnailPath: string | null = null;

      // For Vimeo videos - get thumbnail from Vimeo
      if (video.vimeoVideoId && video.mediaType === "video") {
        thumbnailPath = await vimeoService.getThumbnailUrl(video.vimeoVideoId);
        if (thumbnailPath) {
          console.log(`[Thumbnail] Fetched Vimeo thumbnail for video ${video.id}: ${thumbnailPath}`);
        }
      } else if (video.filepath) {
        // Generate from local/cloud video file (for audio files with video cover art, etc.)
        thumbnailPath = await generateThumbnailFromLocalVideo(video.id, video.filepath, 5);
      }

      if (!thumbnailPath) {
        return res.status(500).json({ message: "Failed to generate thumbnail" });
      }

      // Delete old thumbnail from object storage if exists (only for non-Vimeo paths)
      if (video.thumbnailPath?.startsWith("/objects/")) {
        try {
          const oldFile = await objectStorageService.getObjectEntityFile(video.thumbnailPath);
          await oldFile.delete();
        } catch (err) {
          console.error("Failed to delete old thumbnail:", err);
        }
      }

      const updatedVideo = await storage.updateVideo(video.id, { thumbnailPath });
      res.json(updatedVideo);
    } catch (error) {
      console.error("Generate thumbnail error:", error);
      res.status(500).json({ message: "Failed to generate thumbnail" });
    }
  });

  // Admin: Generate thumbnails for all videos without thumbnails
  // Uses Vimeo API for Vimeo videos, local generation for others
  app.post("/api/admin/videos/generate-all-thumbnails", requireAdmin, async (req, res) => {
    try {
      const videos = await storage.getAllVideos();
      const videosWithoutThumbnails = videos.filter(v => !v.thumbnailPath && v.status === "ready");
      
      res.json({ 
        message: `Starting thumbnail generation for ${videosWithoutThumbnails.length} videos`,
        count: videosWithoutThumbnails.length
      });

      // Generate thumbnails in background
      (async () => {
        for (const video of videosWithoutThumbnails) {
          try {
            let thumbnailPath: string | null = null;
            
            // For Vimeo videos - fetch from Vimeo
            if (video.vimeoVideoId && video.mediaType === "video") {
              thumbnailPath = await vimeoService.getThumbnailUrl(video.vimeoVideoId);
            } else if (video.filepath) {
              // Generate from local file for audio files
              thumbnailPath = await generateThumbnailFromLocalVideo(video.id, video.filepath, 5);
            }

            if (thumbnailPath) {
              await storage.updateVideo(video.id, { thumbnailPath });
              console.log(`[Thumbnail] Generated thumbnail for video ${video.id}`);
            }
          } catch (err) {
            console.error(`[Thumbnail] Failed to generate thumbnail for ${video.id}:`, err);
          }
        }
        console.log(`[Thumbnail] Finished generating thumbnails for all videos`);
      })();
    } catch (error) {
      console.error("Generate all thumbnails error:", error);
      res.status(500).json({ message: "Failed to start thumbnail generation" });
    }
  });

  // Admin: Sync ALL videos from Vimeo - imports new videos AND refreshes titles/thumbnails
  // Runs in background, responds immediately with a status message
  app.post("/api/admin/videos/sync-from-vimeo", requireAdmin, async (req, res) => {
    try {
      // Fetch all videos from Vimeo library
      let allVimeoVideos: any[] = [];
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        const result = await vimeoService.listVideos(page, 100);
        allVimeoVideos = allVimeoVideos.concat(result.items);
        hasMore = allVimeoVideos.length < result.totalItems;
        page++;
      }

      const dbVideos = await storage.getAllVideos();
      const dbByVimeoId: Record<string, any> = {};
      for (const v of dbVideos) { if (v.vimeoVideoId) dbByVimeoId[v.vimeoVideoId] = v; }

      const missing = allVimeoVideos.filter(vv => {
        const id = vv.uri?.replace("/videos/", "");
        return id && !dbByVimeoId[id] && vv.status === "available";
      });

      res.json({ 
        message: `Syncing ${allVimeoVideos.length} Vimeo videos (${missing.length} new to import). Refresh in a moment.`,
        totalInVimeo: allVimeoVideos.length,
        toImport: missing.length
      });

      // Run the full sync in background
      (async () => {
        const cleanTitle = (name: string) => name.replace(/\.(mp4|mov|avi|mkv|webm|MP4|MOV)(\.mp4)?$/, '').trim();
        let imported = 0, updated = 0, failed = 0;

        // 1. Import missing videos
        for (const vv of missing) {
          try {
            const videoId = vv.uri.replace("/videos/", "");
            let thumbnailPath = vv.pictures?.base_link || null;
            if (thumbnailPath && !thumbnailPath.includes('_')) {
              thumbnailPath = thumbnailPath.replace(/\?.*$/, '') + '_640x360';
            }
            let embedUrl: string | null = null;
            if (vv.player_embed_url) {
              const url = new URL(vv.player_embed_url);
              url.searchParams.set('dnt', '1');
              url.searchParams.set('title', '0');
              url.searchParams.set('byline', '0');
              url.searchParams.set('portrait', '0');
              embedUrl = url.toString();
            }
            await storage.createVideo({
              title: cleanTitle(vv.name || `Video ${videoId}`),
              description: null, filename: `${videoId}.mp4`, filepath: null,
              fileSize: 0, duration: vv.duration || 0, status: "ready",
              mediaType: "video", storageType: "vimeo", vimeoVideoId: videoId,
              categoryId: null, thumbnailPath, vimeoEmbedUrl: embedUrl,
            });
            imported++;
          } catch (err) {
            console.error(`[VimeoSync] Import error:`, err);
            failed++;
          }
          await new Promise(r => setTimeout(r, 100));
        }

        // 2. Refresh titles + thumbnails for existing Vimeo videos
        for (const vv of allVimeoVideos) {
          const videoId = vv.uri?.replace("/videos/", "");
          const dbVideo = dbByVimeoId[videoId];
          if (!dbVideo || dbVideo.mediaType !== "video") continue;
          try {
            const updates: Record<string, any> = {};
            // Only update title if Vimeo has a cleaner version (user-set via admin)
            const vimeoClean = cleanTitle(vv.name || "");
            if (vimeoClean && vimeoClean !== dbVideo.title && !vv.name?.match(/\.(mp4|mov|avi|mkv|webm)$/i)) {
              updates.title = vimeoClean;
            }
            // Always refresh thumbnail URL
            let thumbUrl = vv.pictures?.base_link || null;
            if (thumbUrl && !thumbUrl.includes('_')) thumbUrl = thumbUrl.replace(/\?.*$/, '') + '_640x360';
            if (thumbUrl && thumbUrl !== dbVideo.thumbnailPath) updates.thumbnailPath = thumbUrl;
            // Fix missing embed URL (critical for video playback - private videos need hash)
            if (!dbVideo.vimeoEmbedUrl && vv.player_embed_url) {
              const eu = new URL(vv.player_embed_url);
              eu.searchParams.set('dnt', '1');
              eu.searchParams.set('title', '0');
              eu.searchParams.set('byline', '0');
              eu.searchParams.set('portrait', '0');
              updates.vimeoEmbedUrl = eu.toString();
            }
            if (Object.keys(updates).length > 0) {
              await storage.updateVideo(dbVideo.id, updates);
              updated++;
            }
          } catch (err) {
            console.error(`[VimeoSync] Update error for ${videoId}:`, err);
            failed++;
          }
          await new Promise(r => setTimeout(r, 80));
        }
        console.log(`[VimeoSync] Done. Imported: ${imported}, Updated: ${updated}, Failed: ${failed}`);
      })();
    } catch (error: any) {
      console.error("Vimeo sync error:", error);
      res.status(500).json({ message: error.message || "Failed to sync from Vimeo" });
    }
  });

  // Admin: Download media as MP3 (or direct download for audio files)
  app.get("/api/admin/videos/:id/download-mp3", requireAdmin, async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Media not found" });
      }

      if (video.status !== "ready") {
        return res.status(400).json({ message: "Media must be fully processed before download" });
      }

      const safeTitle = video.title.replace(/[^a-zA-Z0-9\s_-]/g, "").substring(0, 50) || "audio";

      // For audio files, download directly from source without conversion
      if (video.mediaType === "audio") {
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.mp3"`);
        
        if (video.filepath) {
          if (video.filepath.startsWith("/objects/")) {
            try {
              const objectFile = await objectStorageService.getObjectEntityFile(video.filepath);
              return objectFile.createReadStream().pipe(res);
            } catch (err) {
              console.error("Object storage download error:", err);
              throw new Error("Audio file not found in storage");
            }
          }
          const localPath = path.join(process.cwd(), "uploads", "videos", path.basename(video.filepath));
          if (fs.existsSync(localPath)) {
            return fs.createReadStream(localPath).pipe(res);
          }
          const altPath = video.filepath.startsWith("/") ? video.filepath : path.join(process.cwd(), video.filepath);
          if (fs.existsSync(altPath)) {
            return fs.createReadStream(altPath).pipe(res);
          }
          throw new Error("Audio file not found on disk");
        } else {
          return res.status(400).json({ message: "Audio file source not found" });
        }
      }

      // For videos, convert to MP3
      if (!video.vimeoVideoId) {
        return res.status(400).json({ message: "Video does not have a streamable source (Vimeo)" });
      }
      
      const mp3Path = await getOrCreateVimeoMp3(video.id, video.vimeoVideoId, video.title);
      
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.mp3"`);
      
      const fileStream = fs.createReadStream(mp3Path);
      fileStream.pipe(res);
    } catch (error: any) {
      console.error("MP3 download error:", error);
      res.status(500).json({ message: error.message || "Failed to generate MP3" });
    }
  });

  // Admin: Convert video to MP3 and upload directly to hotline (RSS feed)
  app.post("/api/admin/videos/:id/upload-to-hotline", requireAdmin, async (req, res) => {
    let tempMp3Path: string | null = null;
    
    try {
      const { folderId } = req.body;
      
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Media not found" });
      }

      if (video.status !== "ready") {
        return res.status(400).json({ message: "Media must be fully processed before upload" });
      }

      if (video.mediaType === "audio" && (!video.filepath || !video.filepath.startsWith("/objects/"))) {
        return res.status(400).json({ message: "Audio file not available in storage. Please re-upload the audio." });
      }

      if (!video.vimeoVideoId && video.mediaType !== "audio") {
        return res.status(400).json({ message: "Media does not have a streamable source" });
      }
      
      // Validate folder if provided
      if (folderId) {
        const folder = await storage.getRssFolder(folderId);
        if (!folder) {
          return res.status(404).json({ message: "Selected folder not found" });
        }
      }

      let mp3Buffer: Buffer;
      let duration = 0;
      const safeTitle = video.title.replace(/[^a-zA-Z0-9\s_-]/g, "").substring(0, 50) || "audio";
      const outputFilename = `${Date.now()}_${safeTitle}.mp3`;

      if (video.mediaType === "audio" && video.filepath) {
        console.log(`[Hotline Upload] Processing audio file ${video.id} for hotline...`);
        
        const audioFile = await objectStorageService.getObjectEntityFile(video.filepath);
        const [audioData] = await audioFile.download();

        const tempInputPath = path.join(os.tmpdir(), `hotline-input-${video.id}-${Date.now()}.mp3`);
        const tempOutputPath = path.join(os.tmpdir(), `hotline-output-${video.id}-${Date.now()}.mp3`);
        tempMp3Path = tempOutputPath;

        try {
          fs.writeFileSync(tempInputPath, audioData);
          const { execSync } = require("child_process");
          execSync(
            `ffmpeg -i "${tempInputPath}" -ac 1 -ab 64k -ar 22050 -y "${tempOutputPath}"`,
            { timeout: 120000 }
          );
          mp3Buffer = fs.readFileSync(tempOutputPath);

          try {
            const durationOutput = execSync(
              `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${tempOutputPath}"`,
              { encoding: "utf-8" }
            );
            duration = Math.round(parseFloat(durationOutput.trim()) || 0);
          } catch (e) {
            console.warn("[Hotline Upload] Could not determine audio duration");
          }
        } finally {
          try { fs.unlinkSync(tempInputPath); } catch {}
        }
      } else {
        console.log(`[Hotline Upload] Converting video ${video.id} to MP3 for hotline...`);
        
        const mp3Path = await getOrCreateVimeoMp3(video.id, video.vimeoVideoId!, video.title);
        tempMp3Path = mp3Path;
        mp3Buffer = fs.readFileSync(mp3Path);

        try {
          const { execSync } = require("child_process");
          const durationOutput = execSync(
            `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${mp3Path}"`,
            { encoding: "utf-8" }
          );
          duration = Math.round(parseFloat(durationOutput.trim()) || 0);
        } catch (e) {
          console.warn("[Hotline Upload] Could not determine audio duration");
        }
      }
      
      // Upload to Object Storage for RSS feed
      const objectStoragePath = `/objects/.private/rss-audio/${outputFilename}`;
      await objectStorageService.uploadBuffer(objectStoragePath, mp3Buffer, "audio/mpeg");

      // Create RSS audio item in database
      const rssAudioItem = await storage.createRssAudioItem({
        title: video.title,
        description: video.description || "",
        filename: outputFilename,
        filepath: objectStoragePath,
        duration,
        fileSize: mp3Buffer.length,
        folderId: folderId || null,
        sortOrder: 0,
      });
      
      console.log(`[Hotline Upload] Successfully uploaded "${video.title}" to hotline`);

      res.json({ 
        success: true, 
        message: "Audio uploaded to hotline successfully",
        rssAudioItem 
      });
    } catch (error: any) {
      console.error("Hotline upload error:", error);
      res.status(500).json({ message: error.message || "Failed to upload to hotline" });
    }
  });

  // Admin: Check if MP3 is cached for a video
  app.get("/api/admin/videos/:id/mp3-status", requireAdmin, async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      const cached = video.vimeoVideoId ? getCachedMp3Path(video.id) : null;
      res.json({ 
        available: video.vimeoVideoId && video.status === "ready",
        cached: !!cached 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Sync videos from Vimeo library to database
  app.post("/api/admin/videos/sync-from-vimeo", requireAdmin, async (req, res) => {
    try {
      // Get all videos from Vimeo library
      let allVimeoVideos: any[] = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const result = await vimeoService.listVideos(page, 100);
        allVimeoVideos = allVimeoVideos.concat(result.items);
        hasMore = allVimeoVideos.length < result.totalItems;
        page++;
      }
      
      console.log(`[Vimeo Sync] Found ${allVimeoVideos.length} videos in Vimeo library`);

      // Get all videos from database
      const dbVideos = await storage.getAllVideos();
      const existingVimeoIds = new Set(dbVideos.filter(v => v.vimeoVideoId).map(v => v.vimeoVideoId));

      // Find videos in Vimeo that don't exist in database
      const missingVideos = allVimeoVideos.filter(vv => {
        const videoId = vv.uri?.replace("/videos/", "");
        return videoId && !existingVimeoIds.has(videoId);
      });
      
      console.log(`[Vimeo Sync] ${missingVideos.length} videos need to be imported`);

      let importedCount = 0;
      
      for (const vimeoVideo of missingVideos) {
        try {
          const videoId = vimeoVideo.uri?.replace("/videos/", "");
          if (!videoId) continue;
          
          // Only import videos that are available
          const status = vimeoVideo.status === "available" ? "ready" : "processing";
          const videoTitle = vimeoVideo.name || `Video ${videoId}`;
          
          // Extract thumbnail URL from Vimeo response
          let thumbnailUrl: string | null = null;
          if (vimeoVideo.pictures?.sizes && Array.isArray(vimeoVideo.pictures.sizes)) {
            const size640 = vimeoVideo.pictures.sizes.find((s: any) => s.width === 640);
            thumbnailUrl = size640?.link || vimeoVideo.pictures.sizes[vimeoVideo.pictures.sizes.length - 1]?.link || null;
          } else if (vimeoVideo.pictures?.base_link) {
            thumbnailUrl = vimeoVideo.pictures.base_link;
          }
          
          // Try to extract embed URL with hash from Vimeo data
          let embedUrl: string | null = null;
          if (vimeoVideo.player_embed_url) {
            const url = new URL(vimeoVideo.player_embed_url);
            url.searchParams.set('dnt', '1');
            url.searchParams.set('title', '0');
            url.searchParams.set('byline', '0');
            url.searchParams.set('portrait', '0');
            embedUrl = url.toString();
          } else if (vimeoVideo.link) {
            // Extract hash from link (format: vimeo.com/videoId/hash)
            const linkMatch = vimeoVideo.link.match(/vimeo\.com\/\d+\/([a-zA-Z0-9]+)/);
            if (linkMatch && linkMatch[1]) {
              embedUrl = `https://player.vimeo.com/video/${videoId}?h=${linkMatch[1]}&dnt=1&title=0&byline=0&portrait=0`;
            }
          }
          
          // If no embed URL found from list data, try to get it via API call
          if (!embedUrl) {
            try {
              embedUrl = await vimeoService.getSecureEmbedUrl(videoId);
            } catch (err) {
              console.log(`[Vimeo Sync] Could not get embed URL for ${videoId}:`, err);
            }
          }
          
          await storage.createVideo({
            title: videoTitle,
            description: null,
            filename: `${videoTitle}.mp4`,
            filepath: null,
            fileSize: 0,
            duration: vimeoVideo.duration || 0,
            status,
            mediaType: "video",
            storageType: "vimeo",
            vimeoVideoId: videoId,
            categoryId: null,
            thumbnailPath: thumbnailUrl,
            vimeoEmbedUrl: embedUrl,
          });
          
          importedCount++;
          console.log(`[Vimeo Sync] Imported video: ${videoTitle} (${videoId}) embedUrl: ${embedUrl}`);
        } catch (err) {
          console.error(`[Vimeo Sync] Failed to import video:`, err);
        }
      }

      // Update status of existing videos that are processing
      const processingVideos = dbVideos.filter(v => 
        v.vimeoVideoId && v.status === "processing"
      );
      
      let updatedCount = 0;
      
      for (const video of processingVideos) {
        try {
          const vimeoVideo = await vimeoService.getVideo(video.vimeoVideoId!);
          if (vimeoVideo && vimeoVideo.status === "available") {
            await storage.updateVideo(video.id, { 
              status: "ready",
              duration: vimeoVideo.duration || video.duration,
            });
            updatedCount++;
            console.log(`[Vimeo Sync] Updated video ${video.id} to ready`);
          }
        } catch (err) {
          console.error(`[Vimeo Sync] Failed to check video ${video.id}:`, err);
        }
      }

      // Find videos in database that no longer exist in Vimeo and delete them
      const vimeoVideoIds = new Set(allVimeoVideos.map(vv => vv.uri?.replace("/videos/", "")));
      const videosToDelete = dbVideos.filter(v => 
        v.vimeoVideoId && !vimeoVideoIds.has(v.vimeoVideoId)
      );
      
      let deletedCount = 0;
      
      for (const video of videosToDelete) {
        try {
          await storage.deleteVideo(video.id);
          deletedCount++;
          console.log(`[Vimeo Sync] Deleted video ${video.title} (${video.vimeoVideoId}) - no longer in Vimeo`);
        } catch (err) {
          console.error(`[Vimeo Sync] Failed to delete video ${video.id}:`, err);
        }
      }

      res.json({ 
        message: `Found ${allVimeoVideos.length} videos in Vimeo, imported ${importedCount} new, updated ${updatedCount} statuses, deleted ${deletedCount} removed from Vimeo`,
        totalInVimeo: allVimeoVideos.length,
        alreadyImported: existingVimeoIds.size,
        newlyImported: importedCount,
        statusesUpdated: updatedCount,
        deleted: deletedCount,
      });
    } catch (error: any) {
      console.error("Vimeo sync error:", error);
      res.status(500).json({ message: error.message || "Failed to sync videos from Vimeo" });
    }
  });

  // Admin: Fix all Vimeo videos - update privacy settings and sync thumbnails
  app.post("/api/admin/videos/fix-vimeo", requireAdmin, async (req, res) => {
    try {
      const videos = await storage.getAllVideos();
      const vimeoVideos = videos.filter(v => v.vimeoVideoId);
      
      console.log(`[Vimeo Fix] Processing ${vimeoVideos.length} Vimeo videos`);
      
      let privacyUpdated = 0;
      let thumbnailsUpdated = 0;
      let errors = 0;

      for (const video of vimeoVideos) {
        try {
          // Update privacy settings (unlisted + public embed)
          const privacyResult = await vimeoService.updateVideoPrivacy(video.vimeoVideoId!);
          if (privacyResult) {
            privacyUpdated++;
          }

          // Get thumbnail URL from Vimeo - use sizes array for reliability
          const vimeoData = await vimeoService.getVideo(video.vimeoVideoId!);
          if (vimeoData?.pictures?.sizes && Array.isArray(vimeoData.pictures.sizes)) {
            // Find 640px size or largest available
            const size640 = vimeoData.pictures.sizes.find((s: any) => s.width === 640);
            const thumbnailUrl = size640?.link || vimeoData.pictures.sizes[vimeoData.pictures.sizes.length - 1]?.link;
            
            if (thumbnailUrl) {
              await storage.updateVideo(video.id, { 
                thumbnailPath: thumbnailUrl
              });
              thumbnailsUpdated++;
              console.log(`[Vimeo Fix] Updated thumbnail for ${video.title}: ${thumbnailUrl}`);
            }
          } else if (vimeoData?.pictures?.base_link) {
            // Fallback to base_link
            let thumbnailUrl = vimeoData.pictures.base_link;
            if (!thumbnailUrl.includes('_')) {
              thumbnailUrl = thumbnailUrl.replace(/\?.*$/, '') + '_640x360';
            }
            await storage.updateVideo(video.id, { 
              thumbnailPath: thumbnailUrl
            });
            thumbnailsUpdated++;
            console.log(`[Vimeo Fix] Updated thumbnail for ${video.title}: ${thumbnailUrl}`);
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (err) {
          console.error(`[Vimeo Fix] Error processing video ${video.id}:`, err);
          errors++;
        }
      }

      res.json({
        message: `Processed ${vimeoVideos.length} videos: ${privacyUpdated} privacy updated, ${thumbnailsUpdated} thumbnails synced, ${errors} errors`,
        total: vimeoVideos.length,
        privacyUpdated,
        thumbnailsUpdated,
        errors,
      });
    } catch (error: any) {
      console.error("Vimeo fix error:", error);
      res.status(500).json({ message: error.message || "Failed to fix Vimeo videos" });
    }
  });

  // Admin: Check Vimeo privacy settings for a specific video
  app.get("/api/admin/videos/check-vimeo/:vimeoId", requireAdmin, async (req, res) => {
    try {
      const { vimeoId } = req.params;
      const videoInfo = await vimeoService.getVideo(vimeoId);
      
      if (!videoInfo) {
        return res.status(404).json({ message: "Video not found on Vimeo" });
      }
      
      res.json({
        vimeoId,
        name: videoInfo.name,
        privacy: videoInfo.privacy,
        embedHtml: videoInfo.embed?.html,
        link: videoInfo.link,
      });
    } catch (error: any) {
      console.error("Vimeo check error:", error);
      res.status(500).json({ message: error.message || "Failed to check Vimeo video" });
    }
  });

  // Admin: Migrate RSS audio files from local filesystem to object storage
  app.post("/api/admin/migrate-rss-audio", requireAdmin, async (req, res) => {
    try {
      const allRssAudio = await storage.getAllRssAudioItems();
      
      // Filter to only local files (not already in object storage)
      const localFiles = allRssAudio.filter(item => 
        item.filepath && !item.filepath.startsWith("/objects/")
      );
      
      if (localFiles.length === 0) {
        return res.json({ message: "No local RSS audio files to migrate", migrated: 0, errors: 0 });
      }

      let migrated = 0;
      let errors = 0;

      for (const item of localFiles) {
        try {
          if (!item.filepath || !fs.existsSync(item.filepath)) {
            console.log(`RSS audio ${item.id} file not found on disk: ${item.filepath}`);
            errors++;
            continue;
          }

          // Upload to object storage
          const objectPath = `/objects/.private/rss-audio/${item.filename}`;
          const fileBuffer = fs.readFileSync(item.filepath);
          await objectStorageService.uploadBuffer(objectPath, fileBuffer, "audio/mpeg");
          
          // Update database record
          await storage.updateRssAudioItem(item.id, { filepath: objectPath } as any);
          
          // Optionally delete local file after successful migration
          fs.unlinkSync(item.filepath);
          
          migrated++;
          console.log(`Migrated RSS audio ${item.id} to object storage: ${objectPath}`);
        } catch (error) {
          console.error(`Failed to migrate RSS audio ${item.id}:`, error);
          errors++;
        }
      }

      res.json({
        message: `Migration complete: ${migrated} RSS audio files migrated to object storage, ${errors} errors`,
        migrated,
        errors,
        total: localFiles.length,
      });
    } catch (error: any) {
      console.error("RSS audio migration error:", error);
      res.status(500).json({ message: error.message || "Failed to migrate RSS audio files" });
    }
  });

  // Admin: Migrate Media Library audio files from local filesystem to object storage
  app.post("/api/admin/migrate-audio-to-object-storage", requireAdmin, async (req, res) => {
    try {
      const allVideos = await storage.getAllVideos();
      
      // Filter to only local audio files (not already in object storage)
      const localAudioFiles = allVideos.filter(v => 
        v.mediaType === "audio" && 
        v.filepath && 
        !v.filepath.startsWith("/objects/") &&
        fs.existsSync(v.filepath)
      );
      
      if (localAudioFiles.length === 0) {
        return res.json({ message: "No local audio files to migrate", migrated: 0, errors: 0 });
      }

      let migrated = 0;
      let errors = 0;

      for (const audio of localAudioFiles) {
        try {
          if (!audio.filepath) {
            errors++;
            continue;
          }

          // Upload to object storage
          const objectPath = `/objects/.private/audio/${audio.id}.mp3`;
          const fileBuffer = fs.readFileSync(audio.filepath);
          await objectStorageService.uploadBuffer(objectPath, fileBuffer, "audio/mpeg");
          
          // Update database record
          await storage.updateVideo(audio.id, { 
            filepath: objectPath,
            filename: `${audio.id}.mp3`
          });
          
          // Delete local file after successful migration
          fs.unlinkSync(audio.filepath);
          
          migrated++;
          console.log(`Migrated audio ${audio.id} (${audio.title}) to object storage: ${objectPath}`);
        } catch (error) {
          console.error(`Failed to migrate audio ${audio.id}:`, error);
          errors++;
        }
      }

      res.json({
        message: `Migration complete: ${migrated} audio files migrated to Object Storage, ${errors} errors`,
        migrated,
        errors,
        total: localAudioFiles.length,
      });
    } catch (error: any) {
      console.error("Audio migration error:", error);
      res.status(500).json({ message: error.message || "Failed to migrate audio files" });
    }
  });

  // Admin: Export category assignments as JSON for syncing between environments
  app.get("/api/admin/videos/export-categories", requireAdmin, async (req, res) => {
    try {
      const videos = await storage.getAllVideos();
      const categories = await storage.getAllVideoCategories();
      
      // Create mapping of vimeoVideoId to category info
      const categoryAssignments = videos
        .filter(v => v.vimeoVideoId && v.categoryId)
        .map(v => ({
          vimeoVideoId: v.vimeoVideoId,
          categoryName: categories.find(c => c.id === v.categoryId)?.name || null,
        }))
        .filter(v => v.categoryName);

      res.json({
        exportDate: new Date().toISOString(),
        totalAssignments: categoryAssignments.length,
        categories: categories.map(c => ({ name: c.name, sortOrder: c.sortOrder })),
        assignments: categoryAssignments,
      });
    } catch (error: any) {
      console.error("Category export error:", error);
      res.status(500).json({ message: error.message || "Failed to export categories" });
    }
  });

  // Admin: Apply category assignments from export data
  app.post("/api/admin/videos/apply-categories", requireAdmin, async (req, res) => {
    try {
      const { categories: categoryData, assignments } = req.body;
      
      if (!assignments || !Array.isArray(assignments)) {
        return res.status(400).json({ message: "Invalid category data format" });
      }

      // Get existing categories
      let existingCategories = await storage.getAllVideoCategories();
      
      // Create any missing categories
      if (categoryData && Array.isArray(categoryData)) {
        for (const cat of categoryData) {
          if (!existingCategories.find(c => c.name === cat.name)) {
            const newCat = await storage.createVideoCategory({
              name: cat.name,
              sortOrder: cat.sortOrder || 0,
            });
            existingCategories.push(newCat);
            console.log(`[Categories] Created category: ${cat.name}`);
          }
        }
      }

      // Build category name to ID map
      const categoryMap = new Map(existingCategories.map(c => [c.name, c.id]));
      
      // Get all videos
      const videos = await storage.getAllVideos();
      const videoByVimeoId = new Map(videos.filter(v => v.vimeoVideoId).map(v => [v.vimeoVideoId, v]));
      
      let updated = 0;
      let notFound = 0;
      
      for (const assignment of assignments) {
        const video = videoByVimeoId.get(assignment.vimeoVideoId);
        const categoryId = categoryMap.get(assignment.categoryName);
        
        if (video && categoryId) {
          await storage.updateVideo(video.id, { categoryId });
          updated++;
        } else {
          notFound++;
        }
      }

      res.json({
        message: `Applied ${updated} category assignments (${notFound} videos not found in this environment)`,
        updated,
        notFound,
      });
    } catch (error: any) {
      console.error("Category apply error:", error);
      res.status(500).json({ message: error.message || "Failed to apply categories" });
    }
  });

  // Admin: Delete custom thumbnail and reset to Vimeo default (for videos) or clear (for audio)
  // For Vimeo videos: Reset to Vimeo's auto-generated thumbnail from video frame
  // For audio files: Clear the thumbnail (no auto-generation)
  app.delete("/api/admin/videos/:id/thumbnail", requireAdmin, async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      // Delete existing thumbnail from object storage if it's stored there (audio files only)
      if (video.thumbnailPath?.startsWith("/objects/")) {
        try {
          const thumbnailFile = await objectStorageService.getObjectEntityFile(video.thumbnailPath);
          await thumbnailFile.delete();
          console.log(`[Thumbnail] Deleted custom thumbnail from object storage for ${video.id}`);
        } catch (err) {
          console.error("Failed to delete thumbnail from cloud storage:", err);
        }
      }

      const regenerate = req.query.regenerate === "true";
      let newThumbnailPath: string | null = null;

      // For Vimeo videos - reset to Vimeo's default thumbnail (auto-generated from video frame)
      if (video.vimeoVideoId && video.mediaType === "video" && regenerate) {
        const vimeoThumbnailUrl = await vimeoService.resetToDefaultThumbnail(video.vimeoVideoId, 1);
        if (vimeoThumbnailUrl) {
          newThumbnailPath = vimeoThumbnailUrl;
          console.log(`[Thumbnail] Reset to Vimeo default for video ${video.id}: ${newThumbnailPath}`);
        } else {
          // Fallback: just get the current Vimeo thumbnail
          newThumbnailPath = await vimeoService.getThumbnailUrl(video.vimeoVideoId);
          console.log(`[Thumbnail] Using existing Vimeo thumbnail for video ${video.id}: ${newThumbnailPath}`);
        }
      }
      // For audio files - no auto-generation, just clear the thumbnail

      const updatedVideo = await storage.updateVideo(video.id, { thumbnailPath: newThumbnailPath });
      
      res.json({
        success: true,
        regenerated: !!newThumbnailPath,
        video: updatedVideo
      });
    } catch (error) {
      console.error("Delete thumbnail error:", error);
      res.status(500).json({ message: "Failed to delete thumbnail" });
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
      const { name, sortOrder, parentCategoryId } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Category name is required" });
      }

      const existing = await storage.getVideoCategoryByName(name);
      if (existing) {
        return res.status(400).json({ message: "Category already exists" });
      }

      // Validate parent category exists if provided
      if (parentCategoryId) {
        const parentCat = await storage.getVideoCategory(parentCategoryId);
        if (!parentCat) {
          return res.status(400).json({ message: "Parent category not found" });
        }
        // Only allow one level of nesting (parent cannot have a parent)
        if (parentCat.parentCategoryId) {
          return res.status(400).json({ message: "Cannot create subcategory of a subcategory" });
        }
      }

      const category = await storage.createVideoCategory({ 
        name, 
        sortOrder: sortOrder || 0,
        parentCategoryId: parentCategoryId || null 
      });
      res.json(category);
    } catch (error) {
      console.error("Create video category error:", error);
      res.status(500).json({ message: "Failed to create video category" });
    }
  });

  // Admin: Update video category
  app.patch("/api/admin/video-categories/:id", requireAdmin, async (req, res) => {
    try {
      const { name, sortOrder, parentCategoryId } = req.body;
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
      
      // Validate parentCategoryId if provided
      if (parentCategoryId !== undefined) {
        if (parentCategoryId === req.params.id) {
          return res.status(400).json({ message: "Category cannot be its own parent" });
        }
        if (parentCategoryId) {
          const parentCat = await storage.getVideoCategory(parentCategoryId);
          if (!parentCat) {
            return res.status(400).json({ message: "Parent category not found" });
          }
          // Only allow one level of nesting
          if (parentCat.parentCategoryId) {
            return res.status(400).json({ message: "Cannot set parent to a subcategory" });
          }
        }
        updateData.parentCategoryId = parentCategoryId;
      }
      
      const category = await storage.updateVideoCategory(req.params.id, updateData);
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

  // Admin: Reorder video categories (batch update sort orders)
  app.post("/api/admin/video-categories/reorder", requireAdmin, async (req, res) => {
    try {
      const { categoryIds } = req.body;
      if (!Array.isArray(categoryIds)) {
        return res.status(400).json({ message: "categoryIds array is required" });
      }

      // Update each category with its new sort order
      await Promise.all(
        categoryIds.map((id, index) => 
          storage.updateVideoCategory(id, { sortOrder: index })
        )
      );

      const categories = await storage.getAllVideoCategories();
      res.json(categories);
    } catch (error) {
      console.error("Reorder video categories error:", error);
      res.status(500).json({ message: "Failed to reorder video categories" });
    }
  });

  // ============================================
  // RSS FEED MANAGEMENT ENDPOINTS
  // ============================================

  // Admin: Get all RSS folders
  app.get("/api/admin/rss-folders", requireAdmin, async (req, res) => {
    try {
      const folders = await storage.getAllRssFolders();
      res.json(folders);
    } catch (error) {
      console.error("Get RSS folders error:", error);
      res.status(500).json({ message: "Failed to get RSS folders" });
    }
  });

  // Admin: Create RSS folder
  app.post("/api/admin/rss-folders", requireAdmin, async (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Folder name is required" });
      }
      const folder = await storage.createRssFolder({ name, description, sortOrder: 0 });
      res.json(folder);
    } catch (error) {
      console.error("Create RSS folder error:", error);
      res.status(500).json({ message: "Failed to create RSS folder" });
    }
  });

  // Admin: Update RSS folder
  app.patch("/api/admin/rss-folders/:id", requireAdmin, async (req, res) => {
    try {
      const { name, description, sortOrder } = req.body;
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
      
      const folder = await storage.updateRssFolder(req.params.id, updateData);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      res.json(folder);
    } catch (error) {
      console.error("Update RSS folder error:", error);
      res.status(500).json({ message: "Failed to update RSS folder" });
    }
  });

  // Admin: Delete RSS folder (also deletes all audio files in the folder)
  app.delete("/api/admin/rss-folders/:id", requireAdmin, async (req, res) => {
    try {
      const audioItems = await storage.getRssAudioItemsByFolderForDeletion(req.params.id);
      for (const item of audioItems) {
        if (item.filepath && fs.existsSync(item.filepath)) {
          fs.unlinkSync(item.filepath);
          console.log("[RSS Audio] Deleted file:", item.filepath);
        }
      }
      await storage.deleteRssFolder(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete RSS folder error:", error);
      res.status(500).json({ message: "Failed to delete RSS folder" });
    }
  });

  // Admin: Get RSS audio items (all or by folder)
  app.get("/api/admin/rss-audio", requireAdmin, async (req, res) => {
    try {
      const { folderId } = req.query;
      let items;
      if (folderId === "null" || folderId === "") {
        items = await storage.getRssAudioItemsByFolder(null);
      } else if (folderId) {
        items = await storage.getRssAudioItemsByFolder(folderId as string);
      } else {
        items = await storage.getAllRssAudioItems();
      }
      res.json(items);
    } catch (error) {
      console.error("Get RSS audio items error:", error);
      res.status(500).json({ message: "Failed to get RSS audio items" });
    }
  });

  // Admin: Upload RSS audio (converts to MP3 64kbps, stores in object storage)
  const rssTempDir = path.join(process.cwd(), "uploads", "rss-temp");
  if (!fs.existsSync(rssTempDir)) {
    fs.mkdirSync(rssTempDir, { recursive: true });
  }
  const rssUpload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, rssTempDir),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "temp-" + uniqueSuffix + path.extname(file.originalname));
      },
    }),
  });

  app.post("/api/admin/rss-audio", requireAdmin, rssUpload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Audio file is required" });
      }

      const { title, description, folderId } = req.body;
      if (!title) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Title is required" });
      }

      const outputFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.mp3`;
      const conversionResult = await convertToMp3(req.file.path, rssTempDir, outputFilename);

      if (!conversionResult.success) {
        return res.status(500).json({ message: "Audio conversion failed: " + conversionResult.error });
      }

      // Upload converted file to object storage
      const objectStoragePath = `/objects/.private/rss-audio/${outputFilename}`;
      const fileBuffer = fs.readFileSync(conversionResult.outputPath!);
      await objectStorageService.uploadBuffer(objectStoragePath, fileBuffer, "audio/mpeg");
      
      // Clean up local temp files
      if (fs.existsSync(conversionResult.outputPath!)) {
        fs.unlinkSync(conversionResult.outputPath!);
      }

      const item = await storage.createRssAudioItem({
        folderId: folderId === "null" || !folderId ? null : folderId,
        title,
        description: description || null,
        filename: outputFilename,
        filepath: objectStoragePath,
        originalFilename: req.file.originalname,
        duration: conversionResult.duration || null,
        fileSize: conversionResult.fileSize || null,
        sortOrder: 0,
      });

      res.json(item);
    } catch (error) {
      console.error("Upload RSS audio error:", error);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: "Failed to upload RSS audio" });
    }
  });

  // Admin: Update RSS audio item
  app.patch("/api/admin/rss-audio/:id", requireAdmin, async (req, res) => {
    try {
      const { title, description, folderId, sortOrder } = req.body;
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (folderId !== undefined) updateData.folderId = folderId === "null" ? null : folderId;
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
      
      const item = await storage.updateRssAudioItem(req.params.id, updateData);
      if (!item) {
        return res.status(404).json({ message: "Audio item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Update RSS audio item error:", error);
      res.status(500).json({ message: "Failed to update RSS audio item" });
    }
  });

  // Admin: Reorder RSS audio items
  app.post("/api/admin/rss-audio/reorder", requireAdmin, async (req, res) => {
    try {
      const { itemIds } = req.body;
      if (!Array.isArray(itemIds)) {
        return res.status(400).json({ message: "itemIds array is required" });
      }

      await Promise.all(
        itemIds.map((id, index) => 
          storage.updateRssAudioItem(id, { sortOrder: index })
        )
      );

      const items = await storage.getAllRssAudioItems();
      res.json(items);
    } catch (error) {
      console.error("Reorder RSS audio items error:", error);
      res.status(500).json({ message: "Failed to reorder RSS audio items" });
    }
  });

  // Admin: Delete RSS audio item
  app.delete("/api/admin/rss-audio/:id", requireAdmin, async (req, res) => {
    try {
      const item = await storage.getRssAudioItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Audio item not found" });
      }

      if (item.filepath && fs.existsSync(item.filepath)) {
        fs.unlinkSync(item.filepath);
        console.log("[RSS Audio] Deleted file:", item.filepath);
      }

      await storage.deleteRssAudioItem(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete RSS audio item error:", error);
      res.status(500).json({ message: "Failed to delete RSS audio item" });
    }
  });

  // ===== Hotline Greeting Audio =====
  const GREETING_OBJECT_PATH = "/objects/.private/rss-audio/greeting.mp3";

  app.get("/api/admin/rss-greeting", requireAdmin, async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(GREETING_OBJECT_PATH);
      const [metadata] = await objectFile.getMetadata();
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      res.json({
        exists: true,
        url: `${baseUrl}/api/rss-greeting.mp3`,
        fileSize: parseInt(metadata.size as string, 10),
      });
    } catch {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      res.json({
        exists: false,
        url: `${baseUrl}/api/rss-greeting.mp3`,
        fileSize: 0,
      });
    }
  });

  app.post("/api/admin/rss-greeting", requireAdmin, rssUpload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Audio file is required" });
      }

      const outputFilename = `greeting-temp-${Date.now()}.mp3`;
      const conversionResult = await convertToMp3(req.file.path, rssTempDir, outputFilename);

      if (!conversionResult.success) {
        return res.status(500).json({ message: "Audio conversion failed: " + conversionResult.error });
      }

      const fileBuffer = fs.readFileSync(conversionResult.outputPath!);
      await objectStorageService.uploadBuffer(GREETING_OBJECT_PATH, fileBuffer, "audio/mpeg");

      if (fs.existsSync(conversionResult.outputPath!)) {
        fs.unlinkSync(conversionResult.outputPath!);
      }

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      res.json({
        success: true,
        url: `${baseUrl}/api/rss-greeting.mp3`,
        fileSize: conversionResult.fileSize,
        duration: conversionResult.duration,
      });
    } catch (error) {
      console.error("Upload greeting error:", error);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: "Failed to upload greeting" });
    }
  });

  app.get("/api/rss-greeting.mp3", async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(GREETING_OBJECT_PATH);
      const [metadata] = await objectFile.getMetadata();
      const fileSize = parseInt(metadata.size as string, 10);

      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Length", fileSize);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Cache-Control", "no-cache");

      const stream = await objectFile.createReadStream();
      stream.pipe(res);
    } catch {
      res.status(404).json({ message: "Greeting audio not found" });
    }
  });

  // Public: Stream RSS audio file (from object storage or legacy local)
  app.get("/api/rss-audio/:id/stream", async (req, res) => {
    try {
      const item = await storage.getRssAudioItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Audio not found" });
      }

      if (!item.filepath) {
        return res.status(404).json({ message: "Audio file path not set" });
      }

      // Handle object storage files
      if (item.filepath.startsWith("/objects/")) {
        try {
          const objectFile = await objectStorageService.getObjectEntityFile(item.filepath);
          const [metadata] = await objectFile.getMetadata();
          const fileSize = parseInt(metadata.size as string, 10);
          
          res.setHeader("Content-Type", "audio/mpeg");
          res.setHeader("Content-Length", fileSize);
          res.setHeader("Accept-Ranges", "bytes");
          res.setHeader("Cache-Control", "public, max-age=31536000");
          
          const stream = await objectFile.createReadStream();
          stream.pipe(res);
          return;
        } catch (err) {
          console.error("Object storage stream error:", err);
          return res.status(404).json({ message: "Audio file not found in storage" });
        }
      }

      // Legacy: local filesystem
      if (!fs.existsSync(item.filepath)) {
        return res.status(404).json({ message: "Audio file not found on disk" });
      }

      const stat = fs.statSync(item.filepath);
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Length", stat.size);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Cache-Control", "public, max-age=31536000");

      fs.createReadStream(item.filepath).pipe(res);
    } catch (error) {
      console.error("Stream RSS audio error:", error);
      res.status(500).json({ message: "Failed to stream audio" });
    }
  });

  // Get RSS feed secret token (generate one if not set)
  const getRssFeedSecret = (): string => {
    if (process.env.RSS_FEED_SECRET) {
      return process.env.RSS_FEED_SECRET;
    }
    // Generate a random 32-character hex token
    const token = crypto.randomBytes(16).toString("hex");
    console.log(`[RSS] Generated new feed secret: ${token}`);
    console.log(`[RSS] Set RSS_FEED_SECRET environment variable to persist this token`);
    return token;
  };
  
  const RSS_FEED_SECRET = getRssFeedSecret();
  
  // Admin endpoint to get RSS feed URLs per folder
  app.get("/api/admin/rss-feed-urls", requireAdmin, async (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const folders = await storage.getAllRssFolders();
    const folderUrls = folders.map(folder => ({
      folderId: folder.id,
      folderName: folder.name,
      url: `${baseUrl}/rss/feed/${RSS_FEED_SECRET}/${folder.id}.xml`,
    }));
    res.json({ folders: folderUrls });
  });

  // Public: RSS Feed XML per folder (requires secret token in URL, uses folder ID so URL never changes)
  app.get("/rss/feed/:token/:folderId.xml", async (req, res) => {
    try {
      const { token, folderId } = req.params;
      
      if (token !== RSS_FEED_SECRET) {
        return res.status(404).send("Not Found");
      }

      const folder = await storage.getRssFolder(folderId);
      if (!folder) {
        return res.status(404).send("Feed not found");
      }
      
      const items = await storage.getRssAudioItemsByFolder(folderId);
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title><![CDATA[${folder.name}]]></title>
    <link>${baseUrl}</link>
    <description><![CDATA[${folder.description || folder.name}]]></description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
`;

      for (const item of items) {
        const audioUrl = `${baseUrl}/api/rss-audio/${item.id}/stream`;
        const pubDate = item.createdAt ? new Date(item.createdAt).toUTCString() : new Date().toUTCString();
        
        xml += `    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.description || ""}]]></description>
      <enclosure url="${audioUrl}" length="${item.fileSize || 0}" type="audio/mpeg"/>
      <guid isPermaLink="false">${item.id}</guid>
      <pubDate>${pubDate}</pubDate>
    </item>
`;
      }

      xml += `  </channel>
</rss>`;

      res.setHeader("Content-Type", "application/rss+xml");
      res.setHeader("Cache-Control", "public, max-age=300");
      res.send(xml);
    } catch (error) {
      console.error("Generate RSS feed error:", error);
      res.status(500).json({ message: "Failed to generate RSS feed" });
    }
  });

  // Helper function for duration formatting
  function formatDuration(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

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
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Check if user is whitelisted or has active subscription
      const isWhitelisted = user.role === "admin" || await storage.isWhitelistedEmailAddress(user.email);
      
      const isActive = isWhitelisted || user.subscriptionStatus === "active" || 
        (user.subscriptionStatus === "trial" && user.trialEndsAt && new Date(user.trialEndsAt) > new Date());
      
      if (!isActive) {
        return res.status(403).json({ message: "Active subscription required to access videos" });
      }

      const videos = await storage.getPublishedVideos();
      
      // Filter to only show Vimeo videos (for video content) or audio files
      // Bunny-only videos are no longer supported
      const filteredVideos = videos.filter(video => {
        if (video.mediaType === "audio") return true; // Keep audio files
        return !!video.vimeoVideoId; // Only keep videos with Vimeo
      });
      
      // Return videos directly - thumbnails are already stored in thumbnailPath
      // No need to call Vimeo API for each video (causes rate limiting)
      res.json(filteredVideos);
    } catch (error) {
      console.error("Get subscriber videos error:", error);
      res.status(500).json({ message: "Failed to get videos" });
    }
  });

  // Get user's viewed video IDs (for "New" badge logic)
  app.get("/api/videos/viewed", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const viewedVideoIds = await storage.getUserViewedVideoIds(userId);
      res.json({ viewedVideoIds });
    } catch (error) {
      console.error("Get viewed videos error:", error);
      res.status(500).json({ message: "Failed to get viewed videos" });
    }
  });

  // Get trending videos (most views in past 48 hours)
  app.get("/api/videos/trending", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const trendingVideos = await storage.getTrendingVideos(10);
      res.json(trendingVideos);
    } catch (error) {
      console.error("Get trending videos error:", error);
      res.status(500).json({ message: "Failed to get trending videos" });
    }
  });

  // Mark a video as viewed by the current user
  app.post("/api/videos/:id/viewed", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const videoId = req.params.id;
      await storage.markVideoAsViewed(userId, videoId);
      res.json({ success: true });
    } catch (error) {
      console.error("Mark video as viewed error:", error);
      res.status(500).json({ message: "Failed to mark video as viewed" });
    }
  });

  // Subscriber: Increment view count (for embed videos that don't call stream endpoint)
  // Deduplicated per user — only counts once per user per video
  app.post("/api/videos/:id/view", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      // Only increment view_count the FIRST time this user watches this video
      const newView = await storage.markVideoAsViewed(userId, video.id);
      if (newView) {
        await storage.incrementVideoViewCount(video.id);
      }
      return res.json({ success: true });
    } catch (error) {
      console.error("Error incrementing view count:", error);
      return res.status(500).json({ message: "Failed to increment view count" });
    }
  });

  // Subscriber: Stream a video (requires active subscription)
  app.get("/api/videos/:id/stream", requireAuth, async (req, res) => {
    // Prevent caching of embed URLs - they should always be fetched fresh
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    });
    
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Check if user is whitelisted or has active subscription
      const isWhitelisted = user.role === "admin" || await storage.isWhitelistedEmailAddress(user.email);
      
      const isActive = isWhitelisted || user.subscriptionStatus === "active" || 
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

      // If video is on Vimeo (only for video content, not audio)
      if (video.vimeoVideoId && video.mediaType === "video") {
        const newStreamView = await storage.markVideoAsViewed(userId, video.id);
        if (newStreamView) await storage.incrementVideoViewCount(video.id);
        
        // First, try to use stored embed URL with hash (most reliable for unlisted videos)
        if (video.vimeoEmbedUrl) {
          console.log(`[Stream] Using stored embed URL for video ${video.id}: ${video.vimeoEmbedUrl}`);
          return res.json({ 
            vimeo: true, 
            embedUrl: video.vimeoEmbedUrl,
            videoUrl: video.vimeoEmbedUrl,
            playbackType: 'embed'
          });
        }
        
        // Fallback: Get authenticated playback URL from Vimeo API
        console.log(`[Stream] No stored embed URL for video ${video.id}, fetching from Vimeo API`);
        const playback = await vimeoService.getAuthenticatedPlaybackUrl(video.vimeoVideoId);
        if (!playback) {
          return res.status(500).json({ message: "Failed to get video playback" });
        }
        
        // If we got a good embed URL with hash, store it for next time
        if (playback.type === 'embed' && playback.url.includes('?h=')) {
          console.log(`[Stream] Storing embed URL for video ${video.id}: ${playback.url}`);
          await storage.updateVideo(video.id, { vimeoEmbedUrl: playback.url });
        }
        
        return res.json({ 
          vimeo: true, 
          embedUrl: playback.url,
          videoUrl: playback.url,
          playbackType: playback.type
        });
      }

      if (video.mediaType === "audio" && video.filepath) {
        await storage.incrementVideoViewCount(video.id);
        return res.json({ 
          localAudio: true, 
          streamUrl: `/api/audio/${video.id}/stream`,
          mediaType: video.mediaType,
        });
      }

      // Check if video is stored in cloud storage
      if (!video.filepath) {
        return res.status(404).json({ message: "Video file not found" });
      }
      
      const isCloudStorage = video.filepath.startsWith("/objects/");
      
      if (isCloudStorage) {
        // Stream from cloud storage
        try {
          const objectFile = await objectStorageService.getObjectEntityFile(video.filepath);
          const [metadata] = await objectFile.getMetadata();
          const fileSize = parseInt(metadata.size as string, 10);
          const range = req.headers.range;
          
          // Increment view count only on initial request (deduplicated per user)
          if (!range || range === "bytes=0-") {
            const newObjView = await storage.markVideoAsViewed(userId, video.id);
            if (newObjView) await storage.incrementVideoViewCount(video.id);
          }

          if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = end - start + 1;
            
            res.writeHead(206, {
              "Content-Range": `bytes ${start}-${end}/${fileSize}`,
              "Accept-Ranges": "bytes",
              "Content-Length": chunksize,
              "Content-Type": "video/mp4",
            });
            
            const stream = objectFile.createReadStream({ start, end });
            stream.pipe(res);
          } else {
            res.writeHead(200, {
              "Content-Length": fileSize,
              "Content-Type": "video/mp4",
            });
            objectFile.createReadStream().pipe(res);
          }
        } catch (cloudError) {
          console.error("Cloud video stream error:", cloudError);
          return res.status(500).json({ message: "Failed to stream video from cloud" });
        }
      } else {
        // Stream from local filesystem
        const stat = await fs.promises.stat(video.filepath);
        const fileSize = stat.size;
        const range = req.headers.range;

        // Determine content type based on file extension
        const ext = path.extname(video.filepath).toLowerCase();
        const mimeTypes: { [key: string]: string } = {
          ".mp4": "video/mp4",
          ".webm": "video/webm",
          ".mov": "video/quicktime",
          ".m4v": "video/x-m4v",
          ".avi": "video/x-msvideo",
          ".mkv": "video/x-matroska",
          ".3gp": "video/3gpp",
          ".mpeg": "video/mpeg",
          ".mpg": "video/mpeg",
          ".ogv": "video/ogg",
          ".flv": "video/x-flv",
          ".wmv": "video/x-ms-wmv",
          ".mp3": "audio/mpeg",
          ".wav": "audio/wav",
          ".ogg": "audio/ogg",
          ".m4a": "audio/mp4",
          ".aac": "audio/aac",
          ".flac": "audio/flac",
        };
        const contentType = mimeTypes[ext] || (video.mediaType === "audio" ? "audio/mpeg" : "video/mp4");

        // Increment view count only on initial request (deduplicated per user)
        if (!range || range === "bytes=0-") {
          const newLocalView = await storage.markVideoAsViewed(userId, video.id);
          if (newLocalView) await storage.incrementVideoViewCount(video.id);
        }

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
            "Content-Type": contentType,
          });
          file.pipe(res);
        } else {
          res.writeHead(200, {
            "Content-Length": fileSize,
            "Content-Type": contentType,
          });
          fs.createReadStream(video.filepath).pipe(res);
        }
      }
    } catch (error) {
      console.error("Video stream error:", error);
      res.status(500).json({ message: "Failed to stream video" });
    }
  });

  // Customer: Stream audio file (from object storage or local)
  app.get("/api/audio/:id/stream", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Check subscription access
      const isWhitelisted = user.role === "admin" || await storage.isWhitelistedEmailAddress(user.email);
      const isActive = isWhitelisted || user.subscriptionStatus === "active" || 
        (user.subscriptionStatus === "trial" && user.trialEndsAt && new Date(user.trialEndsAt) > new Date());
      
      if (!isActive) {
        return res.status(403).json({ message: "Active subscription required" });
      }

      const video = await storage.getVideo(req.params.id);
      if (!video || video.mediaType !== "audio") {
        return res.status(404).json({ message: "Audio file not found" });
      }

      if (!video.filepath) {
        return res.status(404).json({ message: "Audio file path not set" });
      }

      // Handle object storage files
      if (video.filepath.startsWith("/objects/")) {
        try {
          const objectFile = await objectStorageService.getObjectEntityFile(video.filepath);
          const [metadata] = await objectFile.getMetadata();
          const fileSize = parseInt(metadata.size as string, 10);
          const range = req.headers.range;

          // Derive content type
          const ext = path.extname(video.filepath).toLowerCase();
          const contentTypes: Record<string, string> = {
            ".mp3": "audio/mpeg",
            ".wav": "audio/wav",
            ".ogg": "audio/ogg",
            ".m4a": "audio/mp4",
            ".aac": "audio/aac",
            ".flac": "audio/flac",
          };
          const contentType = contentTypes[ext] || "audio/mpeg";

          res.setHeader("Accept-Ranges", "bytes");
          res.setHeader("Content-Type", contentType);

          if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            
            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Content-Length': chunksize,
            });
            
            const stream = objectFile.createReadStream({ start, end });
            stream.pipe(res);
          } else {
            res.setHeader("Content-Length", fileSize);
            objectFile.createReadStream().pipe(res);
          }
          return;
        } catch (err) {
          console.error("Object storage audio stream error:", err);
          return res.status(404).json({ message: "Audio file not found in storage" });
        }
      }

      // Handle local files
      if (!fs.existsSync(video.filepath)) {
        return res.status(404).json({ message: "Audio file not found on disk" });
      }

      const stat = fs.statSync(video.filepath);
      const fileSize = stat.size;
      const range = req.headers.range;

      // Derive content type from file extension
      const ext = path.extname(video.filepath).toLowerCase();
      const contentTypes: Record<string, string> = {
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".ogg": "audio/ogg",
        ".m4a": "audio/mp4",
        ".aac": "audio/aac",
        ".flac": "audio/flac",
      };
      const contentType = contentTypes[ext] || "audio/mpeg";

      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Type", contentType);

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const fileStream = fs.createReadStream(video.filepath, { start, end });
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Content-Length': chunksize,
        });
        fileStream.pipe(res);
      } else {
        res.setHeader("Content-Length", fileSize);
        fs.createReadStream(video.filepath).pipe(res);
      }
    } catch (error) {
      console.error("Audio stream error:", error);
      res.status(500).json({ message: "Failed to stream audio" });
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

  app.post("/api/admin/settings/no-conference-audio", requireAdmin, async (req, res) => {
    try {
      const { audioFileId } = req.body;
      
      if (audioFileId) {
        const audioFile = await storage.getAudioFile(audioFileId);
        if (!audioFile) {
          return res.status(400).json({ message: "Audio file not found" });
        }
      }

      const setting = await storage.setSystemSetting("no_conference_audio", undefined, audioFileId || undefined);
      res.json({ success: true, setting });
    } catch (error) {
      res.status(500).json({ message: "Failed to save no-conference audio setting" });
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

  // Admin: Shift all menu options down (clears option 1)
  app.post("/api/admin/menu-options/shift-down", requireAdmin, async (req, res) => {
    try {
      const { parentMenuId } = req.body;
      await storage.shiftMenuOptionsDown(parentMenuId || null);
      res.json({ success: true });
    } catch (error) {
      console.error("Shift menu options error:", error);
      res.status(500).json({ message: "Failed to shift menu options" });
    }
  });

  // Admin: Get highest option number for a menu
  app.get("/api/admin/menu-options/highest", requireAdmin, async (req, res) => {
    try {
      const parentMenuId = req.query.parentMenuId as string | undefined;
      const highest = await storage.getHighestOptionNumber(parentMenuId === "null" ? null : parentMenuId || null);
      res.json({ highest });
    } catch (error) {
      console.error("Get highest option error:", error);
      res.status(500).json({ message: "Failed to get highest option number" });
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
      const { phoneNumber, label, expiresAt } = req.body;
      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      let parsedExpiry: Date | null = null;
      if (expiresAt) {
        const d = new Date(expiresAt);
        if (isNaN(d.getTime())) {
          return res.status(400).json({ message: "Invalid expiration date" });
        }
        d.setHours(23, 59, 59, 999);
        parsedExpiry = d;
      }

      // Check if already whitelisted
      const existing = await storage.getWhitelistedNumber(phoneNumber);
      if (existing) {
        return res.status(400).json({ message: "Phone number already whitelisted" });
      }

      const num = await storage.createWhitelistedNumber({
        phoneNumber,
        label: label || null,
        expiresAt: parsedExpiry,
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

  // Whitelisted Emails (free video access)
  app.get("/api/admin/whitelisted-emails", requireAdmin, async (req, res) => {
    try {
      const emails = await storage.getAllWhitelistedEmails();
      res.json(emails);
    } catch (error) {
      res.status(500).json({ message: "Failed to get whitelisted emails" });
    }
  });

  app.post("/api/admin/whitelisted-emails", requireAdmin, async (req, res) => {
    try {
      const { email, label, expiresAt } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      let parsedExpiry: Date | null = null;
      if (expiresAt) {
        const d = new Date(expiresAt);
        if (isNaN(d.getTime())) {
          return res.status(400).json({ message: "Invalid expiration date" });
        }
        d.setHours(23, 59, 59, 999);
        parsedExpiry = d;
      }

      // Check if already whitelisted
      const existing = await storage.getWhitelistedEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already whitelisted" });
      }

      const entry = await storage.createWhitelistedEmail({
        email: email.toLowerCase().trim(),
        label: label || null,
        expiresAt: parsedExpiry,
        createdBy: req.session.userId,
      });
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to add whitelisted email" });
    }
  });

  app.delete("/api/admin/whitelisted-emails/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteWhitelistedEmail(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete whitelisted email" });
    }
  });

  // Trial Phone Numbers Management
  app.get("/api/admin/trial-phone-numbers", requireAdmin, async (req, res) => {
    try {
      const trialPhones = await storage.getTrialPhoneNumbers();
      res.json(trialPhones);
    } catch (error) {
      res.status(500).json({ message: "Failed to get trial phone numbers" });
    }
  });

  app.post("/api/admin/trial-phone-numbers/:phoneNumber/release", requireAdmin, async (req, res) => {
    try {
      const phoneNumber = decodeURIComponent(req.params.phoneNumber);
      await storage.releaseTrialPhoneNumber(phoneNumber);
      res.json({ success: true, message: "Phone number released for trial reuse" });
    } catch (error) {
      res.status(500).json({ message: "Failed to release trial phone number" });
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

  // Analytics: daily/weekly active users and engagement stats
  app.get("/api/admin/analytics", requireAdmin, async (req, res) => {
    try {
      const [
        dailyActive,
        weeklyActive,
        monthlyActive,
        topVideos,
        topUsers,
        activityByDay,
      ] = await Promise.all([
        // Unique users who watched something in the last 24 hours
        pool.query(`
          SELECT COUNT(DISTINCT uvv.user_id) as count
          FROM user_video_views uvv
          WHERE uvv.first_viewed_at > NOW() - INTERVAL '1 day'
        `),
        // Unique users who watched something in the last 7 days
        pool.query(`
          SELECT COUNT(DISTINCT uvv.user_id) as count
          FROM user_video_views uvv
          WHERE uvv.first_viewed_at > NOW() - INTERVAL '7 days'
        `),
        // Unique users who watched something in the last 30 days
        pool.query(`
          SELECT COUNT(DISTINCT uvv.user_id) as count
          FROM user_video_views uvv
          WHERE uvv.first_viewed_at > NOW() - INTERVAL '30 days'
        `),
        // Top 10 most-watched videos (unique viewers)
        pool.query(`
          SELECT v.title, COUNT(DISTINCT uvv.user_id) as unique_viewers
          FROM videos v
          JOIN user_video_views uvv ON uvv.video_id = v.id
          WHERE uvv.first_viewed_at > NOW() - INTERVAL '30 days'
          GROUP BY v.id, v.title
          ORDER BY unique_viewers DESC
          LIMIT 10
        `),
        // Most active users last 30 days (videos watched)
        pool.query(`
          SELECT u.email, u.family_name, COUNT(uvv.video_id) as videos_watched,
                 MAX(uvv.first_viewed_at) as last_active
          FROM users u
          JOIN user_video_views uvv ON uvv.user_id = u.id
          WHERE uvv.first_viewed_at > NOW() - INTERVAL '30 days'
          GROUP BY u.id, u.email, u.family_name
          ORDER BY videos_watched DESC
          LIMIT 10
        `),
        // Daily unique active users for the last 14 days
        pool.query(`
          SELECT DATE(first_viewed_at) as day,
                 COUNT(DISTINCT user_id) as unique_users,
                 COUNT(*) as total_views
          FROM user_video_views
          WHERE first_viewed_at > NOW() - INTERVAL '14 days'
          GROUP BY DATE(first_viewed_at)
          ORDER BY day DESC
        `),
      ]);

      res.json({
        dailyActiveUsers: parseInt(dailyActive.rows[0].count),
        weeklyActiveUsers: parseInt(weeklyActive.rows[0].count),
        monthlyActiveUsers: parseInt(monthlyActive.rows[0].count),
        topVideos: topVideos.rows,
        topUsers: topUsers.rows,
        activityByDay: activityByDay.rows,
      });
    } catch (error: any) {
      console.error("Analytics error:", error);
      res.status(500).json({ message: "Failed to get analytics" });
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

  // Admin change subscriber password
  app.post("/api/admin/subscribers/:id/change-password", requireAdmin, async (req, res) => {
    try {
      const { newPassword } = req.body;
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(req.params.id, { password: hashedPassword });

      res.json({ success: true, message: "Password updated successfully" });
    } catch (error: any) {
      console.error("Change password error:", error);
      res.status(500).json({ message: error.message || "Failed to change password" });
    }
  });

  // Admin: get Stripe cancellation reason for a subscriber
  app.get("/api/admin/subscribers/:id/cancellation-reason", requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (!user.stripeSubscriptionId) return res.json({ reason: null, comment: null });

      const stripe = await getUncachableStripeClient();
      try {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        const details = (subscription as any).cancellation_details;
        res.json({
          reason: details?.feedback || null,
          comment: details?.comment || null,
          cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toLocaleDateString() : null,
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toLocaleDateString() : null,
        });
      } catch (stripeErr: any) {
        // Subscription may have been deleted from Stripe
        res.json({ reason: null, comment: null });
      }
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get cancellation reason" });
    }
  });

  // Admin change subscriber phone number
  app.post("/api/admin/subscribers/:id/change-phone", requireAdmin, async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber || typeof phoneNumber !== "string") {
        return res.status(400).json({ message: "Phone number is required" });
      }

      // Sanitize: keep only digits and a leading +
      const sanitized = '+' + phoneNumber.replace(/\D/g, '');
      if (sanitized.length < 7) {
        return res.status(400).json({ message: "Phone number is too short" });
      }

      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if number is already used by another user
      const existing = await storage.getPhoneNumberByNumber(sanitized);
      if (existing && existing.userId !== user.id) {
        return res.status(400).json({ message: "Phone number already registered to another user" });
      }

      const phones = await storage.getPhoneNumbersByUser(user.id);
      if (phones.length > 0) {
        await storage.updatePhoneNumber(phones[0].id, sanitized);
      } else {
        await storage.createPhoneNumber({ userId: user.id, phoneNumber: sanitized, isActive: true });
      }

      res.json({ success: true, message: "Phone number updated successfully" });
    } catch (error: any) {
      console.error("Change phone error:", error);
      res.status(500).json({ message: error.message || "Failed to change phone number" });
    }
  });

  // Admin delete subscriber (and cancel Stripe subscription if exists)
  app.delete("/api/admin/subscribers/:id", requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Prevent deleting admin users
      if (user.role === "admin") {
        return res.status(400).json({ message: "Cannot delete admin users" });
      }

      // Cancel Stripe subscription if exists
      if (user.stripeSubscriptionId) {
        try {
          const stripe = await getUncachableStripeClient();
          await stripe.subscriptions.cancel(user.stripeSubscriptionId);
        } catch (stripeError: any) {
          console.error("Stripe cancellation error (continuing with deletion):", stripeError.message);
        }
      }

      // Delete user's phone numbers
      const phoneNumbers = await storage.getPhoneNumbersByUser(user.id);
      for (const phone of phoneNumbers) {
        await storage.deletePhoneNumber(phone.id);
      }

      // Delete the user
      await storage.deleteUser(user.id);

      res.json({ success: true, message: "Subscriber deleted successfully" });
    } catch (error: any) {
      console.error("Delete subscriber error:", error);
      res.status(500).json({ message: error.message || "Failed to delete subscriber" });
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

  // Email all subscribers
  app.post("/api/admin/subscribers/email-all", requireAdmin, async (req, res) => {
    try {
      const { subject, message } = req.body;
      
      if (!subject || !message) {
        return res.status(400).json({ message: "Subject and message are required" });
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

      if (activeSubscribers.length === 0) {
        return res.status(400).json({ message: "No active subscribers to email" });
      }

      const { client } = await getUncachableResendClient();
      const htmlContent = getBulkEmail(subject, message);

      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      // Send emails in batches to avoid rate limits
      for (const subscriber of activeSubscribers) {
        try {
          await client.emails.send({
            from: FROM_EMAIL,
            to: subscriber.email,
            subject: subject,
            html: htmlContent,
          });
          successCount++;
        } catch (error: any) {
          failCount++;
          errors.push(`${subscriber.email}: ${error.message}`);
          console.error(`Failed to email ${subscriber.email}:`, error.message);
        }
      }

      res.json({
        success: true,
        message: `Sent ${successCount} emails successfully${failCount > 0 ? `, ${failCount} failed` : ""}`,
        successCount,
        failCount,
        errors: failCount > 0 ? errors.slice(0, 5) : undefined, // Return first 5 errors
      });
    } catch (error: any) {
      console.error("Email all subscribers error:", error);
      res.status(500).json({ message: error.message || "Failed to send emails" });
    }
  });

  // Fix hasUsedTrial for all cancelled/expired users
  app.post("/api/admin/subscribers/fix-trial-status", requireAdmin, async (req, res) => {
    try {
      const subscribers = await storage.getSubscriberList();
      let fixed = 0;
      
      for (const subscriber of subscribers) {
        // If user has a stripe customer ID (means they went through checkout) but hasUsedTrial is false, fix it
        if (subscriber.stripeCustomerId && !subscriber.hasUsedTrial) {
          await storage.updateUser(subscriber.id, { hasUsedTrial: true });
          fixed++;
          console.log(`[FixTrialStatus] Set hasUsedTrial=true for ${subscriber.email}`);
        }
        // Also fix anyone with cancelled status who hasn't been marked as used trial
        else if ((subscriber.subscriptionStatus === 'cancelled' || subscriber.subscriptionStatus === 'none') && 
                 subscriber.stripeCustomerId && !subscriber.hasUsedTrial) {
          await storage.updateUser(subscriber.id, { hasUsedTrial: true });
          fixed++;
          console.log(`[FixTrialStatus] Set hasUsedTrial=true for cancelled user ${subscriber.email}`);
        }
      }
      
      res.json({
        success: true,
        message: `Fixed ${fixed} users' trial status`,
        fixedCount: fixed,
      });
    } catch (error: any) {
      console.error("Fix trial status error:", error);
      res.status(500).json({ message: error.message || "Failed to fix trial status" });
    }
  });

  // Sync all active subscribers to Voitex
  app.post("/api/admin/subscribers/sync-voitex", requireAdmin, async (req, res) => {
    try {
      if (!voitexService.isConfigured()) {
        return res.status(400).json({ message: "Voitex API key not configured" });
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

      let totalSynced = 0;
      let totalFailed = 0;
      const errors: string[] = [];

      for (const subscriber of activeSubscribers) {
        const result = await WebhookHandlers.syncUserToVoitex(subscriber.id);
        totalSynced += result.synced;
        totalFailed += result.failed;
        
        if (result.errors.length > 0) {
          errors.push(`${subscriber.email}: ${result.errors.join('; ')}`);
        }
      }

      res.json({
        success: totalFailed === 0,
        message: `Synced ${totalSynced} contacts to Voitex${totalFailed > 0 ? `, ${totalFailed} failed` : ""}`,
        successCount: totalSynced,
        failCount: totalFailed,
        totalSubscribers: activeSubscribers.length,
        errors: totalFailed > 0 ? errors.slice(0, 10) : undefined,
      });
    } catch (error: any) {
      console.error("Voitex sync error:", error);
      res.status(500).json({ message: error.message || "Failed to sync to Voitex" });
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

  // ============ DOCUMENT MANAGEMENT ============
  
  // Admin: Get all documents
  app.get("/api/admin/documents", requireAdmin, async (req, res) => {
    try {
      const docs = await storage.getAllDocuments();
      res.json(docs);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ message: "Failed to get documents" });
    }
  });

  // Admin: Upload a document
  app.post("/api/admin/documents", requireAdmin, documentUpload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No PDF file provided" });
      }

      const { title, description, categoryId, allowDownload } = req.body;
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }

      const adminUserId = getAuthUserId(req);
      if (!adminUserId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Upload PDF to object storage for permanent URL
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
      
      console.log(`[Document Upload] Uploading PDF to cloud storage: ${objectPath}`);
      
      const url = new URL(uploadURL);
      const pathParts = url.pathname.slice(1).split("/");
      const bucketName = pathParts[0];
      const objectName = pathParts.slice(1).join("/");
      
      const bucket = objectStorageClient.bucket(bucketName);
      const objectFile = bucket.file(objectName);
      
      // Upload PDF file to cloud storage
      await new Promise<void>((resolve, reject) => {
        const readStream = fs.createReadStream(req.file!.path);
        const writeStream = objectFile.createWriteStream({
          resumable: false,
          contentType: "application/pdf",
        });
        readStream.on("error", reject);
        writeStream.on("error", reject);
        writeStream.on("finish", resolve);
        readStream.pipe(writeStream);
      });
      
      console.log(`[Document Upload] Successfully uploaded PDF to: ${objectPath}`);

      // Create document record - visible immediately while processing happens in background
      const doc = await storage.createDocument({
        title,
        description: description || null,
        filename: req.file.originalname,
        filepath: objectPath,
        fileSize: req.file.size,
        status: "ready",
        allowDownload: allowDownload === "true" || allowDownload === true,
        categoryId: categoryId || null,
        uploadedBy: adminUserId,
      });

      // Return immediately, conversion happens in background
      res.json(doc);

      // Convert PDF pages to images in background
      (async () => {
        try {
          const { convertPdfToImages } = await import("./pdfConverter");
          
          // Create temp directory for page images
          const tempDir = path.join(uploadDir, "temp_pages", doc.id);
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }

          console.log(`[Document Upload] Converting PDF to images for document: ${doc.id}`);
          
          // Convert PDF to images
          const result = await convertPdfToImages(req.file!.path, tempDir, doc.id);
          
          // Upload each page image to object storage
          const pageImagePaths: string[] = [];
          
          for (let i = 0; i < result.imagePaths.length; i++) {
            const imagePath = result.imagePaths[i];
            const pageNum = i + 1;
            
            // Get upload URL for this page image
            const pageUploadURL = await objectStorageService.getObjectEntityUploadURL();
            const pageObjectPath = objectStorageService.normalizeObjectEntityPath(pageUploadURL);
            
            const pageUrl = new URL(pageUploadURL);
            const pagePathParts = pageUrl.pathname.slice(1).split("/");
            const pageBucketName = pagePathParts[0];
            const pageObjectName = pagePathParts.slice(1).join("/");
            
            const pageBucket = objectStorageClient.bucket(pageBucketName);
            const pageObjectFile = pageBucket.file(pageObjectName);
            
            // Upload page image
            await new Promise<void>((resolve, reject) => {
              const readStream = fs.createReadStream(imagePath);
              const writeStream = pageObjectFile.createWriteStream({
                resumable: false,
                contentType: "image/png",
              });
              readStream.on("error", reject);
              writeStream.on("error", reject);
              writeStream.on("finish", resolve);
              readStream.pipe(writeStream);
            });
            
            pageImagePaths.push(pageObjectPath);
            console.log(`[Document Upload] Uploaded page ${pageNum}/${result.pageCount} to: ${pageObjectPath}`);
          }
          
          // Clean up temp files
          for (const imagePath of result.imagePaths) {
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          }
          if (fs.existsSync(tempDir)) {
            fs.rmdirSync(tempDir, { recursive: true });
          }
          if (fs.existsSync(req.file!.path)) {
            fs.unlinkSync(req.file!.path);
          }
          
          // Update document with page images and ready status
          await storage.updateDocument(doc.id, {
            pageCount: result.pageCount,
            pageImages: pageImagePaths,
            status: "ready",
          });
          
          console.log(`[Document Upload] Document ${doc.id} is ready with ${result.pageCount} pages`);
        } catch (error) {
          console.error(`[Document Upload] Failed to convert document ${doc.id}:`, error);
          // Mark document as failed
          await storage.updateDocument(doc.id, { status: "hidden" });
          // Clean up temp file
          if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        }
      })();
    } catch (error) {
      console.error("Document upload error:", error);
      // Clean up temp file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  // Admin: Update document details
  app.patch("/api/admin/documents/:id", requireAdmin, async (req, res) => {
    try {
      const { title, description, status, categoryId, allowDownload } = req.body;
      const doc = await storage.updateDocument(req.params.id, { title, description, status, categoryId, allowDownload });
      if (!doc) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(doc);
    } catch (error) {
      console.error("Update document error:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  // Admin: Delete document
  app.delete("/api/admin/documents/:id", requireAdmin, async (req, res) => {
    try {
      const doc = await storage.getDocument(req.params.id);
      if (!doc) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Delete file from cloud storage or disk
      if (doc.filepath) {
        if (doc.filepath.startsWith("/objects/")) {
          try {
            const objectFile = await objectStorageService.getObjectEntityFile(doc.filepath);
            await objectFile.delete();
            console.log(`[Document Delete] Deleted from cloud storage: ${doc.filepath}`);
          } catch (err) {
            console.error(`[Document Delete] Failed to delete from cloud storage:`, err);
          }
        } else if (fs.existsSync(doc.filepath)) {
          fs.unlinkSync(doc.filepath);
        }
      }

      await storage.deleteDocument(req.params.id);
      res.json({ message: "Document deleted" });
    } catch (error) {
      console.error("Delete document error:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Customer: Get all published documents
  app.get("/api/documents", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Check subscription access
      const hasAccess = user.subscriptionStatus === "active" || 
        (user.subscriptionStatus === "trial" && user.trialEndsAt && new Date(user.trialEndsAt) > new Date()) ||
        await storage.isWhitelistedEmailAddress(user.email);

      if (!hasAccess) {
        return res.status(403).json({ message: "Subscription required" });
      }

      const docs = await storage.getPublishedDocuments();
      res.json(docs);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ message: "Failed to get documents" });
    }
  });

  // Customer: View PDF (stream with no-download headers)
  app.get("/api/documents/:id/view", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Check subscription access
      const hasAccess = user.subscriptionStatus === "active" || 
        (user.subscriptionStatus === "trial" && user.trialEndsAt && new Date(user.trialEndsAt) > new Date()) ||
        await storage.isWhitelistedEmailAddress(user.email);

      if (!hasAccess) {
        return res.status(403).json({ message: "Subscription required" });
      }

      const doc = await storage.getDocument(req.params.id);
      if (!doc || doc.status !== "ready") {
        return res.status(404).json({ message: "Document not found" });
      }

      // Increment view count
      await storage.incrementDocumentViewCount(doc.id);

      // Set headers to prevent download and enable inline viewing
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
      
      // Stream the file from cloud storage or local filesystem
      if (doc.filepath) {
        if (doc.filepath.startsWith("/objects/")) {
          try {
            const objectFile = await objectStorageService.getObjectEntityFile(doc.filepath);
            const [metadata] = await objectFile.getMetadata();
            
            if (metadata.size) {
              res.setHeader("Content-Length", metadata.size);
            }
            
            const stream = objectFile.createReadStream();
            stream.on("error", (err) => {
              console.error("Document stream error:", err);
              if (!res.headersSent) {
                res.status(500).json({ message: "Error streaming document" });
              }
            });
            stream.pipe(res);
          } catch (cloudError) {
            console.error("Cloud storage error:", cloudError);
            res.status(404).json({ message: "Document file not found in cloud storage" });
          }
        } else if (fs.existsSync(doc.filepath)) {
          const fileStream = fs.createReadStream(doc.filepath);
          fileStream.pipe(res);
        } else {
          res.status(404).json({ message: "Document file not found" });
        }
      } else {
        res.status(404).json({ message: "Document file not found" });
      }
    } catch (error) {
      console.error("View document error:", error);
      res.status(500).json({ message: "Failed to view document" });
    }
  });

  // Customer: Get document page images (for image-based viewer)
  app.get("/api/documents/:id/pages", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Check subscription access
      const hasAccess = user.subscriptionStatus === "active" || 
        (user.subscriptionStatus === "trial" && user.trialEndsAt && new Date(user.trialEndsAt) > new Date()) ||
        await storage.isWhitelistedEmailAddress(user.email);

      if (!hasAccess) {
        return res.status(403).json({ message: "Subscription required" });
      }

      const doc = await storage.getDocument(req.params.id);
      if (!doc) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Return processing status if still being converted
      if (doc.status === "processing") {
        return res.status(202).json({
          id: doc.id,
          title: doc.title,
          status: "processing",
          pageCount: 0,
          pageImages: [],
          allowDownload: doc.allowDownload,
        });
      }

      if (doc.status === "hidden") {
        return res.status(404).json({ message: "Document not available" });
      }

      // Increment view count only when ready
      await storage.incrementDocumentViewCount(doc.id);

      // Return page image paths for the viewer
      res.json({
        id: doc.id,
        title: doc.title,
        status: "ready",
        pageCount: doc.pageCount || 0,
        pageImages: doc.pageImages || [],
        allowDownload: doc.allowDownload,
      });
    } catch (error) {
      console.error("Get document pages error:", error);
      res.status(500).json({ message: "Failed to get document pages" });
    }
  });

  // Customer: Stream a specific document page image
  app.get("/api/documents/:id/page/:pageNum", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Check subscription access
      const hasAccess = user.subscriptionStatus === "active" || 
        (user.subscriptionStatus === "trial" && user.trialEndsAt && new Date(user.trialEndsAt) > new Date()) ||
        await storage.isWhitelistedEmailAddress(user.email);

      if (!hasAccess) {
        return res.status(403).json({ message: "Subscription required" });
      }

      const doc = await storage.getDocument(req.params.id);
      if (!doc || doc.status !== "ready") {
        return res.status(404).json({ message: "Document not found" });
      }

      const pageNum = parseInt(req.params.pageNum);
      if (isNaN(pageNum) || pageNum < 1 || !doc.pageImages || pageNum > doc.pageImages.length) {
        return res.status(404).json({ message: "Page not found" });
      }

      const pageImagePath = doc.pageImages[pageNum - 1];
      
      // Set headers for image
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "private, max-age=3600");
      
      if (pageImagePath.startsWith("/objects/")) {
        try {
          const objectFile = await objectStorageService.getObjectEntityFile(pageImagePath);
          const [metadata] = await objectFile.getMetadata();
          
          if (metadata.size) {
            res.setHeader("Content-Length", metadata.size);
          }
          
          const stream = objectFile.createReadStream();
          stream.on("error", (err) => {
            console.error("Page image stream error:", err);
            if (!res.headersSent) {
              res.status(500).json({ message: "Error streaming page image" });
            }
          });
          stream.pipe(res);
        } catch (cloudError) {
          console.error("Cloud storage error:", cloudError);
          res.status(404).json({ message: "Page image not found in cloud storage" });
        }
      } else if (fs.existsSync(pageImagePath)) {
        const fileStream = fs.createReadStream(pageImagePath);
        fileStream.pipe(res);
      } else {
        res.status(404).json({ message: "Page image not found" });
      }
    } catch (error) {
      console.error("Get document page error:", error);
      res.status(500).json({ message: "Failed to get document page" });
    }
  });

  // ============ ALBUMS ============

  // Admin: Get all albums
  app.get("/api/admin/albums", requireAdmin, async (req, res) => {
    try {
      const allAlbums = await storage.getAllAlbums();
      // Include track count for each album
      const albumsWithTracks = await Promise.all(allAlbums.map(async (album) => {
        const tracks = await storage.getAlbumTracks(album.id);
        return { ...album, trackCount: tracks.length };
      }));
      res.json(albumsWithTracks);
    } catch (error) {
      console.error("Get albums error:", error);
      res.status(500).json({ message: "Failed to get albums" });
    }
  });

  // Admin: Create album
  app.post("/api/admin/albums", requireAdmin, async (req, res) => {
    try {
      const adminUserId = getAuthUserId(req);
      const { title, description, categoryId } = req.body;
      
      if (!title) {
        return res.status(400).json({ message: "Album title is required" });
      }

      const album = await storage.createAlbum({
        title,
        description: description || null,
        categoryId: categoryId || null,
        uploadedBy: adminUserId,
        status: "ready",
      });
      
      res.json(album);
    } catch (error) {
      console.error("Create album error:", error);
      res.status(500).json({ message: "Failed to create album" });
    }
  });

  // Admin: Update album
  app.patch("/api/admin/albums/:id", requireAdmin, async (req, res) => {
    try {
      const { title, description, status, categoryId } = req.body;
      const album = await storage.updateAlbum(req.params.id, { title, description, status, categoryId });
      if (!album) {
        return res.status(404).json({ message: "Album not found" });
      }
      res.json(album);
    } catch (error) {
      console.error("Update album error:", error);
      res.status(500).json({ message: "Failed to update album" });
    }
  });

  // Admin: Delete album (tracks are deleted via CASCADE)
  app.delete("/api/admin/albums/:id", requireAdmin, async (req, res) => {
    try {
      const album = await storage.getAlbum(req.params.id);
      if (!album) {
        return res.status(404).json({ message: "Album not found" });
      }

      // Delete thumbnail from storage if exists
      if (album.thumbnailPath) {
        if (album.thumbnailPath.startsWith("/objects/")) {
          try {
            const objectFile = await objectStorageService.getObjectEntityFile(album.thumbnailPath);
            await objectFile.delete();
          } catch (err) {
            console.error("Failed to delete album thumbnail:", err);
          }
        }
      }

      // Delete track files from object storage
      const tracks = await storage.getAlbumTracks(album.id);
      for (const track of tracks) {
        if (track.filepath?.startsWith("/objects/")) {
          try {
            const trackFile = await objectStorageService.getObjectEntityFile(track.filepath);
            await trackFile.delete();
          } catch (err) {
            console.error("Failed to delete track from object storage:", err);
          }
        }
      }

      await storage.deleteAlbum(req.params.id);
      res.json({ message: "Album deleted" });
    } catch (error) {
      console.error("Delete album error:", error);
      res.status(500).json({ message: "Failed to delete album" });
    }
  });

  // Admin: Upload album thumbnail
  app.post("/api/admin/albums/:id/thumbnail", requireAdmin, imageUpload.single("thumbnail"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No thumbnail file provided" });
      }

      const album = await storage.getAlbum(req.params.id);
      if (!album) {
        return res.status(404).json({ message: "Album not found" });
      }

      // Upload to object storage
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
      
      const url = new URL(uploadURL);
      const pathParts = url.pathname.slice(1).split("/");
      const bucketName = pathParts[0];
      const objectName = pathParts.slice(1).join("/");
      
      const bucket = objectStorageClient.bucket(bucketName);
      const objectFile = bucket.file(objectName);
      
      await new Promise<void>((resolve, reject) => {
        const readStream = fs.createReadStream(req.file!.path);
        const writeStream = objectFile.createWriteStream({
          resumable: false,
          contentType: req.file!.mimetype,
        });
        readStream.on("error", reject);
        writeStream.on("error", reject);
        writeStream.on("finish", resolve);
        readStream.pipe(writeStream);
      });

      // Delete old thumbnail if exists
      if (album.thumbnailPath && album.thumbnailPath.startsWith("/objects/")) {
        try {
          const oldFile = await objectStorageService.getObjectEntityFile(album.thumbnailPath);
          await oldFile.delete();
        } catch (err) {
          console.error("Failed to delete old thumbnail:", err);
        }
      }

      // Clean up temp file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      const updatedAlbum = await storage.updateAlbum(album.id, { thumbnailPath: objectPath });
      res.json(updatedAlbum);
    } catch (error) {
      console.error("Upload album thumbnail error:", error);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: "Failed to upload thumbnail" });
    }
  });

  // Admin: Get album tracks
  app.get("/api/admin/albums/:id/tracks", requireAdmin, async (req, res) => {
    try {
      const tracks = await storage.getAlbumTracks(req.params.id);
      res.json(tracks);
    } catch (error) {
      console.error("Get album tracks error:", error);
      res.status(500).json({ message: "Failed to get tracks" });
    }
  });

  // Admin: Add track to album (upload audio to Object Storage with permanent URLs)
  app.post("/api/admin/albums/:id/tracks", requireAdmin, upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      const album = await storage.getAlbum(req.params.id);
      if (!album) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ message: "Album not found" });
      }

      // Use provided title or default to filename without extension
      let { title } = req.body;
      if (!title || !title.trim()) {
        // Extract filename without extension as default title
        const originalName = req.file.originalname;
        title = path.basename(originalName, path.extname(originalName));
      }

      const nextTrackNumber = await storage.getNextTrackNumber(album.id);

      // Upload to Object Storage for permanent URL
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
      
      const url = new URL(uploadURL);
      const pathParts = url.pathname.slice(1).split("/");
      const bucketName = pathParts[0];
      const objectName = pathParts.slice(1).join("/");
      
      const bucket = objectStorageClient.bucket(bucketName);
      const audioFile = bucket.file(objectName);
      
      await new Promise<void>((resolve, reject) => {
        const readStream = fs.createReadStream(req.file!.path);
        const writeStream = audioFile.createWriteStream({
          resumable: false,
          contentType: req.file!.mimetype || "audio/mpeg",
        });
        readStream.on("error", reject);
        writeStream.on("error", reject);
        writeStream.on("finish", resolve);
        readStream.pipe(writeStream);
      });

      // Delete temporary local file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      const track = await storage.createAlbumTrack({
        albumId: album.id,
        title,
        trackNumber: nextTrackNumber,
        filename: req.file.originalname,
        filepath: objectPath,
        fileSize: req.file.size,
      });

      console.log(`Album track ${track.id} uploaded to Object Storage with permanent URL: ${objectPath}`);
      res.json(track);
    } catch (error) {
      console.error("Add album track error:", error);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: "Failed to add track" });
    }
  });

  // Admin: Update track (title, order)
  app.patch("/api/admin/albums/:albumId/tracks/:trackId", requireAdmin, async (req, res) => {
    try {
      const { title, trackNumber } = req.body;
      const track = await storage.updateAlbumTrack(req.params.trackId, { title, trackNumber });
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }
      res.json(track);
    } catch (error) {
      console.error("Update track error:", error);
      res.status(500).json({ message: "Failed to update track" });
    }
  });

  // Admin: Delete track
  app.delete("/api/admin/albums/:albumId/tracks/:trackId", requireAdmin, async (req, res) => {
    try {
      const track = await storage.getAlbumTrack(req.params.trackId);
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }

      // Delete from local storage
      if (track.filepath && fs.existsSync(track.filepath)) {
        try {
          fs.unlinkSync(track.filepath);
          console.log(`Deleted local track file: ${track.filepath}`);
        } catch (err) {
          console.error("Failed to delete local track file:", err);
        }
      }

      await storage.deleteAlbumTrack(req.params.trackId);
      res.json({ message: "Track deleted" });
    } catch (error) {
      console.error("Delete track error:", error);
      res.status(500).json({ message: "Failed to delete track" });
    }
  });

  // Customer: Get all published albums
  app.get("/api/albums", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Check subscription access
      const hasAccess = user.subscriptionStatus === "active" || 
        (user.subscriptionStatus === "trial" && user.trialEndsAt && new Date(user.trialEndsAt) > new Date()) ||
        await storage.isWhitelistedEmailAddress(user.email);

      if (!hasAccess) {
        return res.status(403).json({ message: "Subscription required" });
      }

      const allAlbums = await storage.getPublishedAlbums();
      const albumsWithTracks = await Promise.all(allAlbums.map(async (album) => {
        const tracks = await storage.getAlbumTracks(album.id);
        return { ...album, trackCount: tracks.length };
      }));
      res.json(albumsWithTracks);
    } catch (error) {
      console.error("Get albums error:", error);
      res.status(500).json({ message: "Failed to get albums" });
    }
  });

  // Customer: Get album with tracks
  app.get("/api/albums/:id", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Check subscription access
      const hasAccess = user.subscriptionStatus === "active" || 
        (user.subscriptionStatus === "trial" && user.trialEndsAt && new Date(user.trialEndsAt) > new Date()) ||
        await storage.isWhitelistedEmailAddress(user.email);

      if (!hasAccess) {
        return res.status(403).json({ message: "Subscription required" });
      }

      const album = await storage.getAlbum(req.params.id);
      if (!album || album.status !== "ready") {
        return res.status(404).json({ message: "Album not found" });
      }

      const tracks = await storage.getAlbumTracks(album.id);
      res.json({ ...album, tracks });
    } catch (error) {
      console.error("Get album error:", error);
      res.status(500).json({ message: "Failed to get album" });
    }
  });

  // Customer: Get album thumbnail
  app.get("/api/albums/:id/thumbnail", requireAuth, async (req, res) => {
    try {
      const album = await storage.getAlbum(req.params.id);
      if (!album || !album.thumbnailPath) {
        return res.status(404).json({ message: "Thumbnail not found" });
      }

      if (album.thumbnailPath.startsWith("/objects/")) {
        try {
          const objectFile = await objectStorageService.getObjectEntityFile(album.thumbnailPath);
          const [metadata] = await objectFile.getMetadata();
          
          res.setHeader("Content-Type", metadata.contentType || "image/jpeg");
          res.setHeader("Cache-Control", "public, max-age=86400");
          
          const stream = objectFile.createReadStream();
          stream.pipe(res);
        } catch (err) {
          console.error("Error streaming album thumbnail:", err);
          res.status(404).json({ message: "Thumbnail not found" });
        }
      } else {
        res.status(404).json({ message: "Thumbnail not found" });
      }
    } catch (error) {
      console.error("Get album thumbnail error:", error);
      res.status(500).json({ message: "Failed to get thumbnail" });
    }
  });

  // Customer: Stream album track audio
  app.get("/api/albums/:albumId/tracks/:trackId/stream", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Check subscription access
      const hasAccess = user.subscriptionStatus === "active" || 
        (user.subscriptionStatus === "trial" && user.trialEndsAt && new Date(user.trialEndsAt) > new Date()) ||
        await storage.isWhitelistedEmailAddress(user.email);

      if (!hasAccess) {
        return res.status(403).json({ message: "Subscription required" });
      }

      const track = await storage.getAlbumTrack(req.params.trackId);
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }

      // Serve from Object Storage (permanent URL)
      if (track.filepath?.startsWith("/objects/")) {
        try {
          const objectFile = await objectStorageService.getObjectEntityFile(track.filepath);
          const [metadata] = await objectFile.getMetadata();
          
          res.set({
            "Content-Type": metadata.contentType || "audio/mpeg",
            "Content-Length": metadata.size,
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=31536000",
          });
          
          objectFile.createReadStream().pipe(res);
          return;
        } catch (err) {
          console.error(`Failed to stream track from Object Storage:`, err);
          return res.status(404).json({ message: "Track audio not found in storage" });
        }
      }
      
      // Fallback: Serve from local storage (for legacy tracks)
      if (track.filepath && fs.existsSync(track.filepath)) {
        const stat = fs.statSync(track.filepath);
        const fileSize = stat.size;
        const range = req.headers.range;

        // Derive content type from file extension
        const ext = path.extname(track.filepath).toLowerCase();
        const contentTypes: Record<string, string> = {
          ".mp3": "audio/mpeg",
          ".wav": "audio/wav",
          ".ogg": "audio/ogg",
          ".m4a": "audio/mp4",
          ".aac": "audio/aac",
          ".flac": "audio/flac",
        };
        const contentType = contentTypes[ext] || "audio/mpeg";

        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Content-Type", contentType);

        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunksize = (end - start) + 1;
          const fileStream = fs.createReadStream(track.filepath, { start, end });
          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Content-Length': chunksize,
          });
          return fileStream.pipe(res);
        } else {
          res.setHeader("Content-Length", fileSize);
          return fs.createReadStream(track.filepath).pipe(res);
        }
      }

      res.status(404).json({ message: "Track audio not available" });
    } catch (error) {
      console.error("Stream track error:", error);
      res.status(500).json({ message: "Failed to stream track" });
    }
  });

  // ============ ORPHANED UPLOAD CLEANUP ============
  
  // Function to clean up orphaned files in cloud storage
  async function cleanupOrphanedUploads(): Promise<{ deleted: string[], kept: string[], errors: string[] }> {
    const deleted: string[] = [];
    const kept: string[] = [];
    const errors: string[] = [];
    
    try {
      const privateObjectDir = process.env.PRIVATE_OBJECT_DIR;
      if (!privateObjectDir) {
        console.log("[Cleanup] PRIVATE_OBJECT_DIR not set, skipping cleanup");
        return { deleted, kept, errors };
      }
      
      // Parse bucket and prefix from PRIVATE_OBJECT_DIR
      const parts = privateObjectDir.replace(/^\//, '').split('/');
      const bucketName = parts[0];
      const prefix = parts.slice(1).join('/') + '/uploads/';
      
      console.log(`[Cleanup] Scanning bucket ${bucketName} with prefix ${prefix}`);
      
      const bucket = objectStorageClient.bucket(bucketName);
      const [files] = await bucket.getFiles({ prefix });
      
      // Get all video filepaths from database (including processing videos)
      const allVideos = await storage.getAllVideos();
      const videoFilepaths = new Set(allVideos.map(v => v.filepath));
      
      // Also check for videos currently being processed - don't delete their source files
      const processingVideos = allVideos.filter(v => v.status === "processing");
      const processingFilepaths = new Set(processingVideos.map(v => v.filepath));
      
      const now = Date.now();
      const twentyFourHoursMs = 24 * 60 * 60 * 1000; // 24 hours minimum age before deletion
      
      for (const file of files) {
        try {
          const [metadata] = await file.getMetadata();
          const created = new Date(metadata.timeCreated || 0).getTime();
          const ageMs = now - created;
          
          // Build the normalized path this file would have
          const objectName = file.name;
          const normalizedPath = `/objects/${objectName.replace(/^\.private\//, '')}`;
          
          // Check if this file is referenced by any video or is being processed
          const isReferenced = videoFilepaths.has(normalizedPath);
          const isProcessing = processingFilepaths.has(normalizedPath);
          
          if (isProcessing) {
            kept.push(file.name);
            console.log(`[Cleanup] Kept file being converted: ${file.name}`);
          } else if (!isReferenced && ageMs > twentyFourHoursMs) {
            await file.delete();
            deleted.push(file.name);
            console.log(`[Cleanup] Deleted orphaned file: ${file.name} (age: ${Math.round(ageMs / 3600000)}h)`);
          } else if (!isReferenced) {
            kept.push(file.name);
            console.log(`[Cleanup] Kept recent file: ${file.name} (age: ${Math.round(ageMs / 3600000)}h, may be uploading/converting)`);
          }
        } catch (fileError) {
          const errorMsg = `Failed to process ${file.name}: ${fileError}`;
          errors.push(errorMsg);
          console.error(`[Cleanup] ${errorMsg}`);
        }
      }
      
      console.log(`[Cleanup] Complete: ${deleted.length} deleted, ${kept.length} kept (recent), ${errors.length} errors`);
    } catch (error) {
      console.error("[Cleanup] Error during orphaned upload cleanup:", error);
      errors.push(`General error: ${error}`);
    }
    
    return { deleted, kept, errors };
  }
  
  // Admin endpoint to manually trigger cleanup
  app.post("/api/admin/cleanup-orphaned-uploads", requireAdmin, async (req, res) => {
    try {
      console.log("[Cleanup] Manual cleanup triggered by admin");
      const result = await cleanupOrphanedUploads();
      res.json({
        message: `Cleanup complete: ${result.deleted.length} files deleted`,
        ...result
      });
    } catch (error) {
      console.error("Cleanup error:", error);
      res.status(500).json({ message: "Failed to cleanup orphaned uploads" });
    }
  });
  
  // Schedule automatic cleanup every week (7 days)
  setInterval(async () => {
    console.log("[Cleanup] Running scheduled weekly orphaned upload cleanup...");
    await cleanupOrphanedUploads();
  }, 7 * 24 * 60 * 60 * 1000); // Every week

  // Clear Bunny CDN audio URLs from database (audio is now in object storage)
  app.post("/api/admin/cleanup-bunny-audio", requireAdmin, async (req, res) => {
    try {
      console.log("[Cleanup] Clearing Bunny audio URLs from database...");
      
      // Get all videos with bunnyStorageUrl set
      const allVideos = await storage.getAllVideos();
      const bunnyAudioVideos = allVideos.filter(v => 
        v.mediaType === "audio" && v.bunnyStorageUrl
      );
      
      let cleared = 0;
      for (const video of bunnyAudioVideos) {
        await storage.updateVideo(video.id, { 
          bunnyStorageUrl: null,
          bunnyVideoId: null,
          bunnyGuid: null,
        });
        cleared++;
      }
      
      console.log(`[Cleanup] Cleared Bunny URLs from ${cleared} audio files`);
      res.json({
        message: `Cleared Bunny URLs from ${cleared} audio files`,
        count: cleared,
      });
    } catch (error) {
      console.error("Bunny audio cleanup error:", error);
      res.status(500).json({ message: "Failed to cleanup Bunny audio URLs" });
    }
  });

  // ============ DATABASE EXPORT/IMPORT FOR PRODUCTION SYNC ============
  // Admin: Export all videos and categories for production sync
  app.get("/api/admin/export-data", requireAdmin, async (req, res) => {
    try {
      const videos = await storage.getAllVideos();
      const categories = await storage.getAllVideoCategories();
      
      res.json({
        exportedAt: new Date().toISOString(),
        videos,
        categories,
      });
    } catch (error) {
      console.error("Export data error:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  // Admin: Import videos and categories from exported data
  app.post("/api/admin/import-data", requireAdmin, async (req, res) => {
    try {
      const { videos, categories } = req.body;
      
      if (!videos || !categories) {
        return res.status(400).json({ message: "Missing videos or categories data" });
      }
      
      let importedCategories = 0;
      let importedVideos = 0;
      let skippedVideos = 0;
      
      // First import categories
      for (const category of categories) {
        const existingCategory = await storage.getVideoCategoryByName(category.name);
        if (!existingCategory) {
          await storage.createVideoCategory({
            name: category.name,
            sortOrder: category.sortOrder || 0,
          });
          importedCategories++;
        }
      }
      
      // Build category name to ID mapping for the current database
      const currentCategories = await storage.getAllVideoCategories();
      const categoryNameToId = new Map<string, string>();
      for (const cat of currentCategories) {
        categoryNameToId.set(cat.name, cat.id);
      }
      
      // Build old category ID to name mapping from imported data
      const oldCategoryIdToName = new Map<string, string>();
      for (const cat of categories) {
        oldCategoryIdToName.set(cat.id, cat.name);
      }
      
      // Then import videos
      for (const video of videos) {
        // Check if video already exists by vimeoVideoId
        const existingVideos = await storage.getAllVideos();
        const exists = existingVideos.some(v => 
          (video.vimeoVideoId && v.vimeoVideoId === video.vimeoVideoId)
        );
        
        if (exists) {
          skippedVideos++;
          continue;
        }
        
        // Map old category ID to new category ID
        let newCategoryId = null;
        if (video.categoryId) {
          const categoryName = oldCategoryIdToName.get(video.categoryId);
          if (categoryName) {
            newCategoryId = categoryNameToId.get(categoryName) || null;
          }
        }
        
        await storage.createVideo({
          title: video.title,
          description: video.description || null,
          filepath: video.filepath || null,
          thumbnailPath: video.thumbnailPath || null,
          status: video.status || "ready",
          categoryId: newCategoryId,
          uploadedBy: video.uploadedBy,
          mediaType: video.mediaType || "video",
          duration: video.duration || null,
          fileSize: video.fileSize || null,
          storageType: video.storageType || null,
          vimeoVideoId: video.vimeoVideoId || null,
        });
        importedVideos++;
      }
      
      res.json({
        message: "Import complete",
        importedCategories,
        importedVideos,
        skippedVideos,
      });
    } catch (error) {
      console.error("Import data error:", error);
      res.status(500).json({ message: "Failed to import data" });
    }
  });

  // Video Comments
  app.get("/api/videos/:id/comments", requireMobileOrSessionAuth, async (req, res) => {
    try {
      const comments = await storage.getVideoComments(req.params.id);
      res.json(comments);
    } catch (error) {
      console.error("Get comments error:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/videos/:id/comments", requireMobileOrSessionAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const { text, parentId } = req.body;
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({ message: "Comment text is required" });
      }
      let isAdminReply = false;
      if (parentId) {
        const u = await storage.getUser(userId);
        isAdminReply = u?.role === "admin";
      }
      const comment = await storage.createVideoComment({
        videoId: req.params.id,
        userId,
        text: text.trim(),
        parentId: parentId || null,
        isAdminReply,
      });
      res.status(201).json(comment);
    } catch (error) {
      console.error("Create comment error:", error);
      res.status(500).json({ message: "Failed to post comment" });
    }
  });

  app.delete("/api/comments/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteVideoComment(req.params.id);
      res.json({ message: "Comment deleted" });
    } catch (error) {
      console.error("Delete comment error:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Admin: all comments across all videos
  app.get("/api/admin/comments", requireAdmin, async (_req, res) => {
    try {
      const all = await storage.getAllVideoComments();
      res.json(all);
    } catch (error) {
      console.error("Get all comments error:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // ── Favorites ─────────────────────────────────────────────────────────────
  app.get("/api/user/favorites", requireMobileOrSessionAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const rows = await db.execute(
        sql`SELECT video_id FROM video_favorites WHERE user_id = ${userId} ORDER BY created_at DESC`
      );
      res.json((rows as any).rows.map((r: any) => r.video_id));
    } catch (error) {
      console.error("Get favorites error:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/videos/:id/favorite", requireMobileOrSessionAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const videoId = req.params.id;
      const existing = await db.execute(
        sql`SELECT id FROM video_favorites WHERE user_id = ${userId} AND video_id = ${videoId}`
      );
      if ((existing as any).rows.length > 0) {
        await db.execute(
          sql`DELETE FROM video_favorites WHERE user_id = ${userId} AND video_id = ${videoId}`
        );
        res.json({ favorited: false });
      } else {
        await db.execute(
          sql`INSERT INTO video_favorites (id, user_id, video_id) VALUES (gen_random_uuid()::varchar, ${userId}, ${videoId})`
        );
        res.json({ favorited: true });
      }
    } catch (error) {
      console.error("Toggle favorite error:", error);
      res.status(500).json({ message: "Failed to toggle favorite" });
    }
  });

  // ── Video Likes ───────────────────────────────────────────────────────────
  app.get("/api/user/likes", requireMobileOrSessionAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const rows = await db.execute(
        sql`SELECT video_id FROM video_likes WHERE user_id = ${userId}`
      );
      res.json((rows as any).rows.map((r: any) => r.video_id));
    } catch (error) {
      console.error("Get likes error:", error);
      res.status(500).json({ message: "Failed to fetch likes" });
    }
  });

  app.post("/api/videos/:id/like", requireMobileOrSessionAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const videoId = req.params.id;
      const existing = await db.execute(
        sql`SELECT id FROM video_likes WHERE user_id = ${userId} AND video_id = ${videoId}`
      );
      if ((existing as any).rows.length > 0) {
        await db.execute(
          sql`DELETE FROM video_likes WHERE user_id = ${userId} AND video_id = ${videoId}`
        );
        res.json({ liked: false });
      } else {
        await db.execute(
          sql`INSERT INTO video_likes (id, user_id, video_id) VALUES (gen_random_uuid()::varchar, ${userId}, ${videoId})`
        );
        res.json({ liked: true });
      }
    } catch (error) {
      console.error("Toggle like error:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.get("/api/videos/:id/like-count", requireMobileOrSessionAuth, async (req, res) => {
    try {
      const result = await db.execute(
        sql`SELECT COUNT(*) as count FROM video_likes WHERE video_id = ${req.params.id}`
      );
      res.json({ count: parseInt((result as any).rows[0].count) });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch like count" });
    }
  });

  // ── Video Progress / Continue Watching ────────────────────────────────────
  app.post("/api/videos/:id/progress", requireMobileOrSessionAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const videoId = req.params.id;
      const { positionSeconds, durationSeconds, completed } = req.body;
      await db.execute(sql`
        INSERT INTO video_progress (id, user_id, video_id, position_seconds, duration_seconds, completed, updated_at)
        VALUES (gen_random_uuid()::varchar, ${userId}, ${videoId}, ${positionSeconds || 0}, ${durationSeconds || null}, ${completed || false}, NOW())
        ON CONFLICT (user_id, video_id) DO UPDATE SET
          position_seconds = EXCLUDED.position_seconds,
          duration_seconds = EXCLUDED.duration_seconds,
          completed = EXCLUDED.completed,
          updated_at = NOW()
      `);
      res.json({ success: true });
    } catch (error) {
      console.error("Save progress error:", error);
      res.status(500).json({ message: "Failed to save progress" });
    }
  });

  app.get("/api/user/continue-watching", requireMobileOrSessionAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const rows = await db.execute(sql`
        SELECT vp.video_id, vp.position_seconds, vp.duration_seconds, vp.completed, vp.updated_at,
               v.title, v.thumbnail_path, v.vimeo_video_id, v.bunny_video_id, v.category_id
        FROM video_progress vp
        JOIN videos v ON v.id = vp.video_id
        WHERE vp.user_id = ${userId} AND vp.completed = false AND vp.position_seconds > 10
        ORDER BY vp.updated_at DESC
        LIMIT 12
      `);
      res.json((rows as any).rows);
    } catch (error) {
      console.error("Continue watching error:", error);
      res.status(500).json({ message: "Failed to fetch continue watching" });
    }
  });

  // ── Notifications ─────────────────────────────────────────────────────────
  app.get("/api/notifications", requireMobileOrSessionAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const rows = await db.execute(sql`
        SELECT * FROM notifications WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 30
      `);
      res.json((rows as any).rows);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", requireMobileOrSessionAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      await db.execute(sql`
        UPDATE notifications SET read_at = NOW() WHERE id = ${req.params.id} AND user_id = ${userId}
      `);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark read" });
    }
  });

  app.patch("/api/notifications/read-all", requireMobileOrSessionAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      await db.execute(sql`
        UPDATE notifications SET read_at = NOW() WHERE user_id = ${userId} AND read_at IS NULL
      `);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all read" });
    }
  });

  // ── User Preferences ──────────────────────────────────────────────────────
  app.patch("/api/user/preferences", requireMobileOrSessionAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const { emailNotifications, familyName } = req.body;
      if (emailNotifications !== undefined) {
        if (typeof emailNotifications !== "boolean") {
          return res.status(400).json({ message: "emailNotifications must be boolean" });
        }
        await db.execute(sql`UPDATE users SET email_notifications = ${emailNotifications} WHERE id = ${userId}`);
      }
      if (familyName !== undefined) {
        const trimmed = typeof familyName === "string" ? familyName.trim() : null;
        await db.execute(sql`UPDATE users SET family_name = ${trimmed || null} WHERE id = ${userId}`);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Update preferences error:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // ── Related Videos ────────────────────────────────────────────────────────
  app.get("/api/videos/:id/related", requireMobileOrSessionAuth, async (req, res) => {
    try {
      const rows = await db.execute(sql`
        SELECT v.id, v.title, v.thumbnail_path, v.vimeo_video_id, v.bunny_video_id,
               v.category_id, v.created_at, v.vimeo_embed_url, v.media_type
        FROM videos v
        WHERE v.id != ${req.params.id}
          AND v.status = 'ready'
          AND v.media_type = (SELECT media_type FROM videos WHERE id = ${req.params.id})
        ORDER BY
          CASE WHEN v.category_id = (SELECT category_id FROM videos WHERE id = ${req.params.id}) THEN 0 ELSE 1 END,
          v.created_at DESC
        LIMIT 8
      `);
      res.json((rows as any).rows);
    } catch (error) {
      console.error("Related videos error:", error);
      res.status(500).json({ message: "Failed to fetch related videos" });
    }
  });

  // Dashboard Banners — public read
  app.get("/api/banners", requireMobileOrSessionAuth, async (_req, res) => {
    try {
      const banners = await storage.getBanners(true);
      res.json(banners);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch banners" });
    }
  });

  // Admin banner CRUD
  app.get("/api/admin/banners", requireAdmin, async (_req, res) => {
    try {
      const banners = await storage.getBanners(false);
      res.json(banners);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch banners" });
    }
  });

  app.post("/api/admin/banners", requireAdmin, async (req, res) => {
    try {
      const { title, subtitle, imageUrl, videoId } = req.body;
      if (!title) return res.status(400).json({ message: "Title is required" });
      const existing = await storage.getBanners(false);
      const banner = await storage.createBanner({
        title,
        subtitle: subtitle || null,
        imageUrl: imageUrl || null,
        videoId: videoId || null,
        isActive: true,
        isAutoGenerated: false,
        displayOrder: existing.length,
      });
      res.status(201).json(banner);
    } catch (error) {
      console.error("Create banner error:", error);
      res.status(500).json({ message: "Failed to create banner" });
    }
  });

  app.put("/api/admin/banners/:id", requireAdmin, async (req, res) => {
    try {
      const { title, subtitle, imageUrl, videoId, isActive } = req.body;
      const banner = await storage.updateBanner(req.params.id, {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(videoId !== undefined && { videoId }),
        ...(isActive !== undefined && { isActive }),
      });
      res.json(banner);
    } catch (error) {
      res.status(500).json({ message: "Failed to update banner" });
    }
  });

  app.delete("/api/admin/banners/:id", requireAdmin, async (req, res) => {
    try {
      const banner = await storage.getBannerById(req.params.id);
      if (banner?.imageUrl && banner.imageUrl.startsWith("/objects/")) {
        try {
          const f = await objectStorageService.getObjectEntityFile(banner.imageUrl);
          await f.delete();
        } catch {}
      }
      await storage.deleteBanner(req.params.id);
      res.json({ message: "Deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete banner" });
    }
  });

  app.post("/api/admin/banners/reorder", requireAdmin, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) return res.status(400).json({ message: "ids array required" });
      await storage.reorderBanners(ids);
      res.json({ message: "Reordered" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reorder" });
    }
  });

  // Serve banner image (public)
  app.get("/api/banners/:id/image", async (req, res) => {
    try {
      const banner = await storage.getBannerById(req.params.id);
      if (!banner?.imageUrl) return res.status(404).json({ message: "No image" });
      if (banner.imageUrl.startsWith("/objects/")) {
        const objectFile = await objectStorageService.getObjectEntityFile(banner.imageUrl);
        const [metadata] = await objectFile.getMetadata();
        res.setHeader("Content-Type", metadata.contentType || "image/jpeg");
        res.setHeader("Cache-Control", "public, max-age=3600");
        objectFile.createReadStream().pipe(res);
      } else {
        res.redirect(banner.imageUrl);
      }
    } catch {
      res.status(404).json({ message: "Image not found" });
    }
  });

  app.post("/api/admin/banners/:id/image", requireAdmin, imageUpload.single("image"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No image file" });

      const banner = await storage.getBannerById(req.params.id);
      if (!banner) return res.status(404).json({ message: "Banner not found" });

      if (banner.imageUrl && banner.imageUrl.startsWith("/objects/")) {
        try {
          const old = await objectStorageService.getObjectEntityFile(banner.imageUrl);
          await old.delete();
        } catch {}
      }

      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
      const url = new URL(uploadURL);
      const pathParts = url.pathname.slice(1).split("/");
      const bucketName = pathParts[0];
      const objectName = pathParts.slice(1).join("/");
      const bucket = objectStorageClient.bucket(bucketName);
      const objectFile = bucket.file(objectName);

      await new Promise<void>((resolve, reject) => {
        const readStream = fs.createReadStream(req.file!.path);
        const writeStream = objectFile.createWriteStream({ resumable: false, contentType: req.file!.mimetype });
        readStream.on("error", reject);
        writeStream.on("error", reject);
        writeStream.on("finish", resolve);
        readStream.pipe(writeStream);
      });

      fs.unlink(req.file.path, () => {});
      const updated = await storage.updateBanner(req.params.id, { imageUrl: objectPath });
      res.json({ imageUrl: objectPath, banner: updated });
    } catch (error) {
      console.error("Banner image upload error:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // ── Parental Controls ─────────────────────────────────────────────────────

  // GET current parental controls settings + time used this period
  app.get("/api/parental-controls", requireMobileOrSessionAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      const controls = await storage.getParentalControls(userId);
      if (!controls) return res.json(null);
      const timeUsedSeconds = controls.isEnabled
        ? await storage.getWatchTimeUsed(userId, controls.timePeriod)
        : 0;
      const { pinHash, ...safe } = controls;
      res.json({ ...safe, timeUsedSeconds });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // POST set up or update parental controls
  app.post("/api/parental-controls", requireMobileOrSessionAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      const { pin, currentPin, parentEmail, timeLimitMinutes, timePeriod, categoryIds } = req.body;
      if (!pin || !parentEmail || !timeLimitMinutes || !timePeriod) {
        return res.status(400).json({ message: "pin, parentEmail, timeLimitMinutes and timePeriod are required" });
      }
      const existing = await storage.getParentalControls(userId);
      if (existing) {
        if (!currentPin) return res.status(400).json({ message: "Current PIN required to update settings" });
        const valid = await bcrypt.compare(String(currentPin), existing.pinHash);
        if (!valid) return res.status(401).json({ message: "Incorrect current PIN" });
      }
      const pinHash = await bcrypt.hash(String(pin), 10);
      const controls = await storage.setParentalControls(userId, {
        pinHash, parentEmail, timeLimitMinutes: Number(timeLimitMinutes),
        timePeriod, categoryIds: categoryIds && categoryIds.length > 0 ? categoryIds : null,
        isEnabled: true,
      });
      const { pinHash: _ph, ...safe } = controls;
      res.json(safe);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // POST disable parental controls (requires PIN)
  app.post("/api/parental-controls/disable", requireMobileOrSessionAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      const { pin } = req.body;
      const controls = await storage.getParentalControls(userId);
      if (!controls) return res.status(404).json({ message: "No parental controls set up" });
      const valid = await bcrypt.compare(String(pin), controls.pinHash);
      if (!valid) return res.status(401).json({ message: "Incorrect PIN" });
      await storage.deleteParentalControls(userId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // POST verify PIN (for temporary unlock)
  app.post("/api/parental-controls/verify-pin", requireMobileOrSessionAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      const { pin } = req.body;
      const controls = await storage.getParentalControls(userId);
      if (!controls) return res.json({ valid: false });
      const valid = await bcrypt.compare(String(pin), controls.pinHash);
      res.json({ valid });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // POST log watch time
  app.post("/api/watch-time", requireMobileOrSessionAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const { videoId, seconds, logDate } = req.body;
      await storage.logWatchTime(userId, videoId || null, Number(seconds) || 0, logDate || new Date().toISOString().split('T')[0]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  return httpServer;
}
