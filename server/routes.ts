import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { registerSchema, loginSchema, phoneNumberSchema } from "@shared/schema";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { sql } from "drizzle-orm";
import { db } from "./db";

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
  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "kids-hotline-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );

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
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;
      res.json({ user: { ...user, password: undefined } });
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

      const { name, type } = req.body;
      if (!name || !type) {
        return res.status(400).json({ message: "Name and type are required" });
      }

      const audioFile = await storage.createAudioFile({
        name,
        filename: req.file.originalname,
        filepath: req.file.path,
        type,
        uploadedBy: req.session.userId!,
      });

      res.json(audioFile);
    } catch (error) {
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

  // ============ PLIVO WEBHOOKS ============
  
  // Answer webhook - called when someone calls the hotline
  app.post("/api/plivo/answer", async (req, res) => {
    try {
      const { From, CallUUID } = req.body;
      
      // Check if caller is a subscriber
      const isSubscriber = await storage.isSubscribedPhoneNumber(From);

      // Log the call
      await storage.createCallLog({
        callUuid: CallUUID,
        fromNumber: From,
        toNumber: req.body.To || "",
        isSubscriber,
      });

      // Get greeting and non-subscriber audio
      const greetingFiles = await storage.getAudioFilesByType("greeting");
      const nonSubFiles = await storage.getAudioFilesByType("non_subscriber");
      const menuOptions = await storage.getAllMenuOptions();

      let xml = '<?xml version="1.0" encoding="UTF-8"?><Response>';

      if (!isSubscriber) {
        // Play non-subscriber message
        if (nonSubFiles.length > 0) {
          xml += `<Play>${process.env.BASE_URL || ""}/uploads/audio/${path.basename(nonSubFiles[0].filepath)}</Play>`;
        } else {
          xml += '<Speak>Thank you for calling Kids Hotline. To access our stories and live calls, please subscribe at our website.</Speak>';
        }
        xml += '<Hangup/>';
      } else {
        // Play greeting
        if (greetingFiles.length > 0) {
          xml += `<Play>${process.env.BASE_URL || ""}/uploads/audio/${path.basename(greetingFiles[0].filepath)}</Play>`;
        } else {
          xml += '<Speak>Welcome to Kids Hotline!</Speak>';
        }

        // Build IVR menu
        xml += '<GetInput action="/api/plivo/menu" method="POST" inputType="dtmf" digitEndTimeout="3" timeout="10">';
        
        let menuText = "Please press ";
        const activeOptions = menuOptions.filter(o => o.isActive);
        activeOptions.forEach((option, index) => {
          menuText += `${option.optionNumber} for ${option.label}`;
          if (index < activeOptions.length - 1) menuText += ", ";
        });
        
        xml += `<Speak>${menuText}</Speak>`;
        xml += '</GetInput>';
      }

      xml += '</Response>';
      res.type('application/xml').send(xml);
    } catch (error) {
      console.error("Plivo answer error:", error);
      res.type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response><Speak>Sorry, an error occurred.</Speak></Response>');
    }
  });

  // Menu selection webhook
  app.post("/api/plivo/menu", async (req, res) => {
    try {
      const { Digits, CallUUID, From } = req.body;
      const digit = parseInt(Digits);

      const menuOption = await storage.getMenuOptionByNumber(digit);

      let xml = '<?xml version="1.0" encoding="UTF-8"?><Response>';

      if (!menuOption || !menuOption.isActive) {
        xml += '<Speak>Invalid option. Please try again.</Speak>';
        xml += '<Redirect method="POST">/api/plivo/answer</Redirect>';
      } else if (menuOption.type === "conference") {
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
          callUuid: CallUUID,
          phoneNumber: From,
          isMuted: true,
        });

        xml += '<Speak>You are now joining the group call. You are muted. Press 9 to request to speak.</Speak>';
        xml += `<Conference callbackUrl="/api/plivo/conference-callback" callbackMethod="POST" 
                  digitsMatch="9" digitsMatchBLeg="/api/plivo/unmute-request"
                  muted="true" enterSound="beep:1" exitSound="beep:2">KidsHotline</Conference>`;
      } else if (menuOption.type === "story" && menuOption.audioFileId) {
        // Play story with controls
        const audioFile = await storage.getAudioFile(menuOption.audioFileId);
        if (audioFile) {
          xml += `<GetInput action="/api/plivo/playback-control" method="POST" inputType="dtmf" digitEndTimeout="1" timeout="999">`;
          xml += `<Play>${process.env.BASE_URL || ""}/uploads/audio/${path.basename(audioFile.filepath)}</Play>`;
          xml += '</GetInput>';
        } else {
          xml += '<Speak>Sorry, this story is not available.</Speak>';
          xml += '<Redirect method="POST">/api/plivo/answer</Redirect>';
        }
      } else {
        xml += '<Speak>This option is not available.</Speak>';
        xml += '<Redirect method="POST">/api/plivo/answer</Redirect>';
      }

      xml += '</Response>';
      res.type('application/xml').send(xml);
    } catch (error) {
      console.error("Plivo menu error:", error);
      res.type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response><Speak>Sorry, an error occurred.</Speak></Response>');
    }
  });

  // Playback control webhook
  app.post("/api/plivo/playback-control", async (req, res) => {
    const { Digits } = req.body;
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?><Response>';

    switch (Digits) {
      case "0":
        // Return to menu
        xml += '<Redirect method="POST">/api/plivo/answer</Redirect>';
        break;
      case "1":
        // Rewind - not directly supported, would need offset tracking
        xml += '<Speak>Rewinding is not available in this version.</Speak>';
        break;
      case "2":
        // Pause/Play - would need state tracking
        xml += '<Speak>Pause and play controls are not available in this version.</Speak>';
        break;
      case "3":
        // Fast forward - not directly supported
        xml += '<Speak>Fast forward is not available in this version.</Speak>';
        break;
      default:
        xml += '<Speak>Invalid option.</Speak>';
    }

    xml += '</Response>';
    res.type('application/xml').send(xml);
  });

  // Unmute request webhook
  app.post("/api/plivo/unmute-request", async (req, res) => {
    try {
      const { CallUUID, From } = req.body;

      const participant = await storage.getParticipantByCallUuid(CallUUID);
      if (participant && participant.sessionId) {
        await storage.createUnmuteRequest({
          participantId: participant.id,
          sessionId: participant.sessionId,
          phoneNumber: From,
          status: "pending",
        });
      }

      res.type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response><Speak>Your request to speak has been sent to the moderator.</Speak></Response>');
    } catch (error) {
      console.error("Unmute request error:", error);
      res.type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    }
  });

  // Conference callback webhook
  app.post("/api/plivo/conference-callback", async (req, res) => {
    try {
      const { CallUUID, ConferenceAction, ConferenceMemberID } = req.body;

      const participant = await storage.getParticipantByCallUuid(CallUUID);
      
      if (participant) {
        if (ConferenceAction === "enter") {
          await storage.updateParticipant(participant.id, { memberId: ConferenceMemberID });
        } else if (ConferenceAction === "exit") {
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

  return httpServer;
}
