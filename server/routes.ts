import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcryptjs";
import multer from "multer";
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
import * as bunnyStream from "./bunnyStream";
import * as bunnyStorage from "./bunnyStorage";
import { generateThumbnailFromBunny, generateThumbnailFromLocalVideo } from "./thumbnailGenerator";
import { voitexService } from "./voitexService";
import { WebhookHandlers } from "./webhookHandlers";
import { getOrCreateMp3, getCachedMp3Path, preGenerateMp3 } from "./mp3Converter";
import { generateMobileToken, verifyMobileToken, requireMobileAuth, requireMobileOrSessionAuth } from "./mobileAuth";

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

// Auth middleware - supports both session (web) and Bearer token (mobile)
function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Check for Bearer token (mobile app)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const payload = verifyMobileToken(token);
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
  
  // Initialize Bunny Stream service (caches CDN hostname)
  await bunnyStream.initializeBunnyStream();
  
  // Initialize Bunny Storage service (for audio files)
  bunnyStorage.initializeBunnyStorage();
  
  // Initialize Voitex service for contact sync
  voitexService.initialize();
  
  // Sync stuck video statuses from Bunny on startup
  (async () => {
    try {
      const allVideos = await storage.getAllVideos();
      const stuckVideos = allVideos.filter(v => 
        v.bunnyGuid && 
        (v.status === "processing" || v.status === "uploading")
      );
      
      if (stuckVideos.length > 0) {
        console.log(`[Bunny Sync] Found ${stuckVideos.length} videos with pending status, checking Bunny...`);
        
        for (const video of stuckVideos) {
          try {
            const bunnyVideo = await bunnyStream.getVideo(video.bunnyGuid!);
            
            // Status: 0=created, 1=uploaded, 2=processing, 3=transcoding, 4=finished, 5=error
            if (bunnyVideo.status === 4) {
              await storage.updateVideo(video.id, { 
                status: "ready",
                duration: bunnyVideo.length,
              });
              console.log(`[Bunny Sync] Updated video ${video.id} to ready`);
              
              // Pre-generate MP3 for download
              if (video.bunnyGuid) {
                preGenerateMp3(video.id, video.bunnyGuid, video.title, true).catch(err => {
                  console.error(`[MP3] Background pre-generation failed for ${video.id}:`, err);
                });
              }
            } else if (bunnyVideo.status === 5) {
              await storage.updateVideo(video.id, { status: "failed" });
              console.log(`[Bunny Sync] Updated video ${video.id} to failed`);
            } else {
              console.log(`[Bunny Sync] Video ${video.id} still processing on Bunny (status: ${bunnyVideo.status})`);
            }
          } catch (err) {
            console.error(`[Bunny Sync] Failed to check video ${video.id}:`, err);
          }
        }
        
        console.log(`[Bunny Sync] Sync complete`);
      }
    } catch (err) {
      console.error("[Bunny Sync] Startup sync failed:", err);
    }
  })();
  
  // Trust proxy for Replit (uses reverse proxy in both dev and prod)
  app.set("trust proxy", 1);

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

      // Combine country code with phone number
      const fullPhoneNumber = countryCode + phoneNumber.replace(/^0+/, '');

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
          trial_period_days: 14, // 2-week free trial
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
      const videosWithThumbnails = await Promise.all(
        videos.map(async (video) => {
          if (video.bunnyGuid && !video.thumbnailPath) {
            return {
              ...video,
              bunnyThumbnailUrl: await bunnyStream.getThumbnailUrl(video.bunnyGuid),
            };
          }
          return video;
        })
      );
      res.json(videosWithThumbnails);
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
      
      // For audio files: save locally, only convert WAV to MP3
      // For video files: use existing conversion logic
      if (isAudio) {
        // Audio files are saved locally (not to Bunny)
        if (isWavFile) {
          // WAV files need conversion to MP3
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

          // Convert WAV to MP3 in background
          (async () => {
            try {
              const ffmpegCommand = `ffmpeg -i "${originalPath}" -c:a libmp3lame -b:a 192k -y "${convertedPath}"`;
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

              console.log(`Audio ${video.id} converted from WAV to MP3 successfully`);
            } catch (conversionError) {
              console.error(`Audio conversion failed for ${video.id}:`, conversionError);
              await storage.updateVideo(video.id, { status: "failed" });
              
              if (fs.existsSync(convertedPath)) {
                fs.unlinkSync(convertedPath);
              }
            }
          })();
        } else {
          // MP3 and other audio files: upload to Bunny Storage if configured, otherwise save locally
          if (bunnyStorage.isBunnyStorageConfigured()) {
            try {
              const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(mediaFile.originalname)}`;
              const { cdnUrl, storagePath } = await bunnyStorage.uploadAudioToBunny(originalPath, uniqueFilename);
              
              const video = await storage.createVideo({
                title,
                description: description || null,
                filename: mediaFile.originalname,
                filepath: storagePath,
                fileSize: mediaFile.size,
                status: "ready",
                mediaType,
                categoryId: categoryId || null,
                uploadedBy: req.session.userId!,
                thumbnailPath: thumbnailFile?.path || null,
                storageType: "bunny_storage",
                bunnyStorageUrl: cdnUrl,
              });

              // Delete local temp file after upload
              if (fs.existsSync(originalPath)) {
                fs.unlinkSync(originalPath);
              }

              console.log(`Audio ${video.id} uploaded to Bunny Storage: ${cdnUrl}`);
              res.json(video);
            } catch (uploadError) {
              console.error("Bunny Storage upload failed, falling back to local:", uploadError);
              // Fallback to local storage
              const video = await storage.createVideo({
                title,
                description: description || null,
                filename: mediaFile.originalname,
                filepath: originalPath,
                fileSize: mediaFile.size,
                status: "ready",
                mediaType,
                categoryId: categoryId || null,
                uploadedBy: req.session.userId!,
                thumbnailPath: thumbnailFile?.path || null,
                storageType: "local",
              });
              console.log(`Audio ${video.id} saved locally (Bunny fallback)`);
              res.json(video);
            }
          } else {
            // Local storage fallback
            const video = await storage.createVideo({
              title,
              description: description || null,
              filename: mediaFile.originalname,
              filepath: originalPath,
              fileSize: mediaFile.size,
              status: "ready",
              mediaType,
              categoryId: categoryId || null,
              uploadedBy: req.session.userId!,
              thumbnailPath: thumbnailFile?.path || null,
              storageType: "local",
            });

            console.log(`Audio ${video.id} saved locally without conversion`);
            res.json(video);
          }
        }
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
      if (video.thumbnailPath) {
        // Delete from cloud storage if it's a cloud path
        if (video.thumbnailPath.startsWith("/objects/")) {
          try {
            const oldObjectFile = await objectStorageService.getObjectEntityFile(video.thumbnailPath);
            await oldObjectFile.delete();
            console.log(`Deleted old thumbnail from cloud storage for video ${video.id}`);
          } catch (err) {
            console.error(`Failed to delete old thumbnail from cloud storage:`, err);
          }
        } else if (fs.existsSync(video.thumbnailPath)) {
          fs.unlinkSync(video.thumbnailPath);
        }
      }

      // Upload thumbnail to cloud storage
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const thumbnailPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
      
      console.log(`[Thumbnail Upload] uploadURL: ${uploadURL.substring(0, 100)}...`);
      console.log(`[Thumbnail Upload] normalized thumbnailPath: ${thumbnailPath}`);
      
      // Parse the URL to get bucket and object name for direct upload
      const url = new URL(uploadURL);
      const pathParts = url.pathname.slice(1).split("/");
      const bucketName = pathParts[0];
      const objectName = pathParts.slice(1).join("/");
      
      const bucket = objectStorageClient.bucket(bucketName);
      const thumbnailFile = bucket.file(objectName);
      
      // Read the temp file and upload to cloud
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
      
      // Delete the temp file from local storage
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      console.log(`Thumbnail uploaded to cloud: ${thumbnailPath}`);

      const updatedVideo = await storage.updateVideo(video.id, { thumbnailPath });
      res.json(updatedVideo);
    } catch (error) {
      console.error("Thumbnail upload error:", error);
      // Clean up temp file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
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

      // Check if thumbnail is stored in cloud storage
      if (video.thumbnailPath.startsWith("/objects/")) {
        try {
          const objectFile = await objectStorageService.getObjectEntityFile(video.thumbnailPath);
          const [metadata] = await objectFile.getMetadata();
          
          res.set({
            "Content-Type": metadata.contentType || "image/jpeg",
            "Content-Length": metadata.size,
            "Cache-Control": "public, max-age=3600",
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

      // Delete video file from cloud storage, local filesystem, or Bunny Stream
      if (video.bunnyGuid) {
        try {
          await bunnyStream.deleteVideo(video.bunnyGuid);
          console.log(`Deleted video ${req.params.id} from Bunny Stream`);
        } catch (err) {
          console.error(`Failed to delete video ${req.params.id} from Bunny Stream:`, err);
        }
      } else if (video.filepath?.startsWith("/objects/") || video.filepath?.startsWith("https://storage.googleapis.com/")) {
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

  // ============ BUNNY STREAM VIDEO UPLOAD ============
  // Admin: Create a video on Bunny Stream and get upload URL
  app.post("/api/admin/videos/bunny/create", requireAdmin, async (req, res) => {
    try {
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }

      const bunnyVideo = await bunnyStream.createVideo(title);
      const uploadUrl = bunnyStream.getUploadUrl(bunnyVideo.guid);
      
      console.log(`[Bunny Stream] Created video "${title}" with guid: ${bunnyVideo.guid}`);
      
      res.json({
        bunnyGuid: bunnyVideo.guid,
        uploadUrl,
        apiKey: process.env.BUNNY_API_KEY,
      });
    } catch (error: any) {
      console.error("Bunny create video error:", error);
      res.status(500).json({ message: error.message || "Failed to create video on Bunny Stream" });
    }
  });

  // Admin: Finalize Bunny Stream video (create local record after upload)
  app.post("/api/admin/videos/bunny/finalize", requireAdmin, async (req, res) => {
    try {
      const { title, description, categoryId, bunnyGuid, filename, fileSize } = req.body;

      if (!title || !bunnyGuid) {
        return res.status(400).json({ message: "Title and bunnyGuid are required" });
      }

      console.log(`[Bunny Stream] Finalizing video "${title}" with guid: ${bunnyGuid}`);

      const video = await storage.createVideo({
        title,
        description: description || null,
        filename: filename || null,
        filepath: null,
        fileSize: fileSize || null,
        status: "processing",
        categoryId: categoryId || null,
        uploadedBy: req.session.userId!,
        thumbnailPath: null,
        bunnyGuid,
        bunnyVideoId: bunnyGuid,
        storageType: "bunny",
      });

      console.log(`[Bunny Stream] Created video record ${video.id}`);

      // Poll Bunny for processing status
      (async () => {
        let attempts = 0;
        const maxAttempts = 60; // 10 minutes max
        
        while (attempts < maxAttempts) {
          try {
            await new Promise(r => setTimeout(r, 10000)); // Check every 10 seconds
            const bunnyVideo = await bunnyStream.getVideo(bunnyGuid);
            
            // Status: 0=created, 1=uploaded, 2=processing, 3=transcoding, 4=finished, 5=error
            if (bunnyVideo.status === 4) {
              await storage.updateVideo(video.id, { 
                status: "ready",
                duration: bunnyVideo.length,
              });
              console.log(`[Bunny Stream] Video ${video.id} is ready`);
              
              // Auto-generate thumbnail if none exists
              const currentVideo = await storage.getVideo(video.id);
              if (currentVideo && !currentVideo.thumbnailPath) {
                console.log(`[Bunny Stream] Generating thumbnail for ${video.id}...`);
                const thumbnailPath = await generateThumbnailFromBunny(video.id, bunnyGuid, 10);
                if (thumbnailPath) {
                  await storage.updateVideo(video.id, { thumbnailPath });
                  console.log(`[Bunny Stream] Thumbnail generated for ${video.id}`);
                }
              }
              
              // Pre-generate MP3 for download
              preGenerateMp3(video.id, bunnyGuid, title, true).catch(err => {
                console.error(`[MP3] Background pre-generation failed for ${video.id}:`, err);
              });
              break;
            } else if (bunnyVideo.status === 5) {
              await storage.updateVideo(video.id, { status: "failed" });
              console.log(`[Bunny Stream] Video ${video.id} failed processing`);
              break;
            }
            
            attempts++;
          } catch (err) {
            console.error(`[Bunny Stream] Error checking status for ${video.id}:`, err);
            attempts++;
          }
        }
      })();

      res.json(video);
    } catch (error: any) {
      console.error("Bunny finalize video error:", error);
      res.status(500).json({ message: error.message || "Failed to finalize video" });
    }
  });

  // Admin: Get Bunny embed URL for a video
  app.get("/api/admin/videos/:id/bunny-embed", requireAdmin, async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      if (!video.bunnyGuid) {
        return res.status(400).json({ message: "Video is not hosted on Bunny Stream" });
      }
      
      res.json({
        embedUrl: bunnyStream.getEmbedUrl(video.bunnyGuid),
        thumbnailUrl: await bunnyStream.getThumbnailUrl(video.bunnyGuid),
      });
    } catch (error) {
      console.error("Get Bunny embed error:", error);
      res.status(500).json({ message: "Failed to get embed URL" });
    }
  });

  // Public: Get Bunny embed URL for subscribers
  app.get("/api/videos/:id/bunny-embed", requireAuth, async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      if (!video.bunnyGuid) {
        return res.status(400).json({ message: "Video is not hosted on Bunny Stream" });
      }

      // Increment view count
      await storage.incrementVideoViewCount(req.params.id);
      
      res.json({
        embedUrl: bunnyStream.getEmbedUrl(video.bunnyGuid),
        thumbnailUrl: await bunnyStream.getThumbnailUrl(video.bunnyGuid),
      });
    } catch (error) {
      console.error("Get Bunny embed error:", error);
      res.status(500).json({ message: "Failed to get embed URL" });
    }
  });

  // Admin: Generate/regenerate thumbnail for a video
  app.post("/api/admin/videos/:id/generate-thumbnail", requireAdmin, async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      let thumbnailPath: string | null = null;

      if (video.bunnyGuid) {
        // Generate from Bunny Stream
        thumbnailPath = await generateThumbnailFromBunny(video.id, video.bunnyGuid, 5);
      } else if (video.filepath) {
        // Generate from local/cloud video file
        thumbnailPath = await generateThumbnailFromLocalVideo(video.id, video.filepath, 5);
      }

      if (!thumbnailPath) {
        return res.status(500).json({ message: "Failed to generate thumbnail" });
      }

      // Delete old thumbnail if exists
      if (video.thumbnailPath) {
        if (video.thumbnailPath.startsWith("/objects/")) {
          try {
            const oldFile = await objectStorageService.getObjectEntityFile(video.thumbnailPath);
            await oldFile.delete();
          } catch (err) {
            console.error("Failed to delete old thumbnail:", err);
          }
        } else if (fs.existsSync(video.thumbnailPath)) {
          fs.unlinkSync(video.thumbnailPath);
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
            
            if (video.bunnyGuid) {
              thumbnailPath = await generateThumbnailFromBunny(video.id, video.bunnyGuid, 5);
            } else if (video.filepath) {
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

  // Admin: Refresh a single video's status from Bunny
  app.post("/api/admin/videos/:id/refresh-status", requireAdmin, async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      if (!video.bunnyGuid) {
        return res.status(400).json({ message: "Video is not hosted on Bunny Stream" });
      }

      const bunnyVideo = await bunnyStream.getVideo(video.bunnyGuid);
      
      let newStatus = video.status;
      // Status: 0=created, 1=uploaded, 2=processing, 3=transcoding, 4=finished, 5=error
      if (bunnyVideo.status === 4) {
        newStatus = "ready";
      } else if (bunnyVideo.status === 5) {
        newStatus = "failed";
      } else if (bunnyVideo.status >= 1 && bunnyVideo.status <= 3) {
        newStatus = "processing";
      }

      const updatedVideo = await storage.updateVideo(video.id, { 
        status: newStatus,
        duration: bunnyVideo.length || video.duration,
      });

      console.log(`[Bunny Refresh] Video ${video.id} status: ${video.status} -> ${newStatus}`);

      if (newStatus === "ready" && video.status !== "ready" && video.bunnyGuid) {
        preGenerateMp3(video.id, video.bunnyGuid, video.title, true).catch(err => {
          console.error(`[MP3] Background pre-generation failed for ${video.id}:`, err);
        });
      }

      res.json(updatedVideo);
    } catch (error: any) {
      console.error("Refresh video status error:", error);
      res.status(500).json({ message: error.message || "Failed to refresh video status" });
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
        
        if (video.bunnyStorageUrl) {
          // Bunny storage audio - proxy the download
          const response = await fetch(video.bunnyStorageUrl);
          if (!response.ok) {
            throw new Error(`Failed to download from Bunny storage: ${response.status}`);
          }
          const buffer = await response.arrayBuffer();
          return res.send(Buffer.from(buffer));
        } else if (video.filepath) {
          // Local audio file
          const localPath = path.join(process.cwd(), "uploads", "videos", path.basename(video.filepath));
          if (fs.existsSync(localPath)) {
            return fs.createReadStream(localPath).pipe(res);
          }
          // Try alternative path
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
      if (!video.bunnyGuid) {
        return res.status(400).json({ message: "Only Bunny-hosted videos can be converted to MP3" });
      }

      const mp3Path = await getOrCreateMp3(video.id, video.bunnyGuid, video.title);
      
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.mp3"`);
      
      const fileStream = fs.createReadStream(mp3Path);
      fileStream.pipe(res);
    } catch (error: any) {
      console.error("MP3 download error:", error);
      res.status(500).json({ message: error.message || "Failed to generate MP3" });
    }
  });

  // Admin: Check if MP3 is cached for a video
  app.get("/api/admin/videos/:id/mp3-status", requireAdmin, async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      const cached = video.bunnyGuid ? getCachedMp3Path(video.id) : null;
      res.json({ 
        available: video.bunnyGuid && video.status === "ready",
        cached: !!cached 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin: Refresh all stuck video statuses from Bunny
  app.post("/api/admin/videos/refresh-all-statuses", requireAdmin, async (req, res) => {
    try {
      const allVideos = await storage.getAllVideos();
      const stuckVideos = allVideos.filter(v => 
        v.bunnyGuid && 
        (v.status === "processing" || v.status === "uploading")
      );

      if (stuckVideos.length === 0) {
        return res.json({ message: "No videos with pending status", updated: 0 });
      }

      let updatedCount = 0;
      
      for (const video of stuckVideos) {
        try {
          const bunnyVideo = await bunnyStream.getVideo(video.bunnyGuid!);
          
          if (bunnyVideo.status === 4) {
            await storage.updateVideo(video.id, { 
              status: "ready",
              duration: bunnyVideo.length,
            });
            updatedCount++;
            console.log(`[Bunny Refresh] Updated video ${video.id} to ready`);
            
            if (video.bunnyGuid) {
              preGenerateMp3(video.id, video.bunnyGuid, video.title, true).catch(err => {
                console.error(`[MP3] Background pre-generation failed for ${video.id}:`, err);
              });
            }
          } else if (bunnyVideo.status === 5) {
            await storage.updateVideo(video.id, { status: "failed" });
            updatedCount++;
            console.log(`[Bunny Refresh] Updated video ${video.id} to failed`);
          }
        } catch (err) {
          console.error(`[Bunny Refresh] Failed to check video ${video.id}:`, err);
        }
      }

      res.json({ 
        message: `Checked ${stuckVideos.length} videos, updated ${updatedCount}`,
        checked: stuckVideos.length,
        updated: updatedCount
      });
    } catch (error) {
      console.error("Refresh all statuses error:", error);
      res.status(500).json({ message: "Failed to refresh video statuses" });
    }
  });

  // Admin: Sync videos from Bunny library to database
  app.post("/api/admin/videos/sync-from-bunny", requireAdmin, async (req, res) => {
    try {
      // Get all videos from Bunny library
      let allBunnyVideos: any[] = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const result = await bunnyStream.listVideos(page, 100);
        allBunnyVideos = allBunnyVideos.concat(result.items);
        hasMore = allBunnyVideos.length < result.totalItems;
        page++;
      }
      
      console.log(`[Bunny Sync] Found ${allBunnyVideos.length} videos in Bunny library`);

      // Get all videos from database
      const dbVideos = await storage.getAllVideos();
      const existingGuids = new Set(dbVideos.filter(v => v.bunnyGuid).map(v => v.bunnyGuid));

      // Find videos in Bunny that don't exist in database
      const missingVideos = allBunnyVideos.filter(bv => !existingGuids.has(bv.guid));
      
      console.log(`[Bunny Sync] ${missingVideos.length} videos need to be imported`);

      let importedCount = 0;
      let deletedFromBunnyCount = 0;
      
      for (const bunnyVideo of missingVideos) {
        try {
          // Delete failed videos from Bunny instead of importing them
          // Bunny status: 5 = failed processing, 6 = upload failed
          if (bunnyVideo.status === 5 || bunnyVideo.status === 6) {
            console.log(`[Bunny Sync] Deleting failed video from Bunny: ${bunnyVideo.title} (${bunnyVideo.guid}) status=${bunnyVideo.status}`);
            await bunnyStream.deleteVideo(bunnyVideo.guid);
            deletedFromBunnyCount++;
            continue;
          }
          
          // Only import videos that are finished processing (status 4) or still processing
          const status = bunnyVideo.status === 4 ? "ready" : "processing";
          const videoTitle = bunnyVideo.title || `Video ${bunnyVideo.guid}`;
          
          const newVideo = await storage.createVideo({
            title: videoTitle,
            description: null,
            filename: `${videoTitle}.mp4`,
            filepath: null,
            fileSize: bunnyVideo.storageSize || 0,
            duration: bunnyVideo.length || 0,
            status,
            mediaType: "video",
            storageType: "bunny",
            bunnyGuid: bunnyVideo.guid,
            bunnyVideoId: bunnyVideo.guid,
            categoryId: null,
            thumbnailPath: null,
          });
          
          importedCount++;
          console.log(`[Bunny Sync] Imported video: ${videoTitle} (${bunnyVideo.guid})`);
          
          // Pre-generate MP3 if video is already ready
          if (status === "ready") {
            preGenerateMp3(newVideo.id, bunnyVideo.guid, videoTitle, true).catch(err => {
              console.error(`[MP3] Background pre-generation failed for ${newVideo.id}:`, err);
            });
          }
        } catch (err) {
          console.error(`[Bunny Sync] Failed to import video ${bunnyVideo.guid}:`, err);
        }
      }

      // Also refresh status of any existing videos that are stuck in processing
      const allDbVideos = await storage.getAllVideos();
      const stuckVideos = allDbVideos.filter(v => 
        v.bunnyGuid && 
        (v.status === "processing" || v.status === "uploading" || v.status === "failed")
      );
      
      let updatedCount = 0;
      let deletedFromDbCount = 0;
      
      for (const video of stuckVideos) {
        try {
          const bunnyVideo = await bunnyStream.getVideo(video.bunnyGuid!);
          console.log(`[Bunny Sync] Video ${video.title} (${video.bunnyGuid}) has Bunny status: ${bunnyVideo.status}, encodeProgress: ${bunnyVideo.encodeProgress}`);
          
          // Bunny status: 4 = ready, 5 = failed processing, 6 = upload failed, 3 = transcoding, 1 = queued, 0 = created
          if (bunnyVideo.status === 4 || bunnyVideo.encodeProgress === 100) {
            await storage.updateVideo(video.id, { 
              status: "ready",
              duration: bunnyVideo.length,
              fileSize: bunnyVideo.storageSize || video.fileSize,
            });
            updatedCount++;
            console.log(`[Bunny Sync] Updated video ${video.id} to ready`);
            
            if (video.bunnyGuid) {
              preGenerateMp3(video.id, video.bunnyGuid, video.title, true).catch(err => {
                console.error(`[MP3] Background pre-generation failed for ${video.id}:`, err);
              });
            }
          } else if (bunnyVideo.status === 5 || bunnyVideo.status === 6) {
            // Delete failed videos from both Bunny and database
            console.log(`[Bunny Sync] Deleting failed video: ${video.title} (${video.bunnyGuid}) status=${bunnyVideo.status}`);
            await bunnyStream.deleteVideo(video.bunnyGuid!);
            await storage.deleteVideo(video.id);
            deletedFromDbCount++;
            deletedFromBunnyCount++;
          }
        } catch (err) {
          console.error(`[Bunny Sync] Failed to check video ${video.id}:`, err);
        }
      }

      res.json({ 
        message: `Found ${allBunnyVideos.length} videos in Bunny, imported ${importedCount} new, updated ${updatedCount} statuses, deleted ${deletedFromBunnyCount} failed`,
        totalInBunny: allBunnyVideos.length,
        alreadyImported: dbVideos.length,
        newlyImported: importedCount,
        statusesUpdated: updatedCount,
        deletedFromBunny: deletedFromBunnyCount,
        deletedFromDb: deletedFromDbCount
      });
    } catch (error: any) {
      console.error("Bunny sync error:", error);
      res.status(500).json({ message: error.message || "Failed to sync videos from Bunny" });
    }
  });

  // Admin: Delete custom thumbnail and optionally regenerate from video
  app.delete("/api/admin/videos/:id/thumbnail", requireAdmin, async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      // Delete existing thumbnail
      if (video.thumbnailPath) {
        if (video.thumbnailPath.startsWith("/objects/")) {
          try {
            const thumbnailFile = await objectStorageService.getObjectEntityFile(video.thumbnailPath);
            await thumbnailFile.delete();
            console.log(`[Thumbnail] Deleted custom thumbnail for video ${video.id}`);
          } catch (err) {
            console.error("Failed to delete thumbnail from cloud storage:", err);
          }
        } else if (fs.existsSync(video.thumbnailPath)) {
          fs.unlinkSync(video.thumbnailPath);
        }
      }

      // Check if user wants to regenerate
      const regenerate = req.query.regenerate === "true";
      let newThumbnailPath: string | null = null;

      if (regenerate && video.status === "ready") {
        // Try to regenerate thumbnail from video source
        if (video.bunnyGuid) {
          newThumbnailPath = await generateThumbnailFromBunny(video.id, video.bunnyGuid, 5);
        } else if (video.filepath) {
          newThumbnailPath = await generateThumbnailFromLocalVideo(video.id, video.filepath, 5);
        }
      }

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

  // Admin: Delete Bunny Stream video
  app.delete("/api/admin/videos/:id/bunny", requireAdmin, async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      if (video.bunnyGuid) {
        try {
          await bunnyStream.deleteVideo(video.bunnyGuid);
          console.log(`[Bunny Stream] Deleted video ${video.bunnyGuid} from Bunny`);
        } catch (err) {
          console.error(`[Bunny Stream] Failed to delete from Bunny:`, err);
        }
      }
      
      // Delete custom thumbnail if exists (cloud or local)
      if (video.thumbnailPath) {
        if (video.thumbnailPath.startsWith("/objects/")) {
          try {
            const thumbnailFile = await objectStorageService.getObjectEntityFile(video.thumbnailPath);
            await thumbnailFile.delete();
            console.log(`Deleted custom thumbnail for Bunny video ${req.params.id} from cloud storage`);
          } catch (err) {
            console.error(`Failed to delete thumbnail from cloud storage:`, err);
          }
        } else if (fs.existsSync(video.thumbnailPath)) {
          fs.unlinkSync(video.thumbnailPath);
          console.log(`Deleted custom thumbnail for Bunny video ${req.params.id} from local filesystem`);
        }
      }
      
      await storage.deleteVideo(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete Bunny video error:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  // Admin: Get Bunny library settings (domain restrictions)
  app.get("/api/admin/bunny/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await bunnyStream.getLibrarySettings();
      res.json({
        allowedReferrers: settings.AllowedReferrers || [],
        blockedReferrers: settings.BlockedReferrers || [],
      });
    } catch (error: any) {
      console.error("Get Bunny settings error:", error);
      res.status(500).json({ message: error.message || "Failed to get Bunny settings" });
    }
  });

  // Admin: Set allowed domains for video playback
  app.post("/api/admin/bunny/allowed-domains", requireAdmin, async (req, res) => {
    try {
      const { domains } = req.body;
      if (!Array.isArray(domains)) {
        return res.status(400).json({ message: "Domains must be an array of strings" });
      }
      
      await bunnyStream.setAllowedReferrers(domains);
      console.log(`[Bunny Stream] Updated allowed domains:`, domains);
      res.json({ success: true, domains });
    } catch (error: any) {
      console.error("Set Bunny allowed domains error:", error);
      res.status(500).json({ message: error.message || "Failed to set allowed domains" });
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
      
      // Add Bunny thumbnail URLs for videos with bunnyGuid
      const videosWithThumbnails = await Promise.all(videos.map(async (video) => {
        if (video.bunnyGuid && !video.thumbnailPath) {
          return {
            ...video,
            bunnyThumbnailUrl: await bunnyStream.getThumbnailUrl(video.bunnyGuid),
          };
        }
        return video;
      }));
      
      res.json(videosWithThumbnails);
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

  // Subscriber: Stream a video (requires active subscription)
  app.get("/api/videos/:id/stream", requireAuth, async (req, res) => {
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

      // If video is on Bunny Stream, redirect to embed endpoint
      if (video.bunnyGuid) {
        await storage.incrementVideoViewCount(video.id);
        return res.json({ 
          bunny: true, 
          embedUrl: bunnyStream.getEmbedUrl(video.bunnyGuid) 
        });
      }

      // If audio is on Bunny Storage, return the CDN URL directly
      if (video.bunnyStorageUrl && video.storageType === "bunny_storage") {
        await storage.incrementVideoViewCount(video.id);
        return res.json({ 
          bunnyStorage: true, 
          cdnUrl: video.bunnyStorageUrl,
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
          
          // Increment view count only on initial request
          if (!range || range === "bytes=0-") {
            await storage.incrementVideoViewCount(video.id);
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

        // Increment view count only on initial request (not range requests from seeking)
        if (!range || range === "bytes=0-") {
          await storage.incrementVideoViewCount(video.id);
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
      const { email, label } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if already whitelisted
      const existing = await storage.getWhitelistedEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already whitelisted" });
      }

      const entry = await storage.createWhitelistedEmail({
        email: email.toLowerCase().trim(),
        label: label || null,
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

      // Create document record with processing status
      const doc = await storage.createDocument({
        title,
        description: description || null,
        filename: req.file.originalname,
        filepath: objectPath,
        fileSize: req.file.size,
        status: "processing",
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

  return httpServer;
}
