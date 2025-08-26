import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCompanionSettingsSchema, insertUserPreferencesSchema } from "@shared/schema";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { companionService, ChatRequest } from "./services/companionService";
import { memoryService } from "./services/memoryService";
import { guestService } from "./services/guestService";
import { deviceDiamondService } from "./services/deviceDiamondService";
import guestRoutes from "./guestRoutes";
import mobileDiamondRoutes from "./mobileDiamondRoutes";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { imageService } from "./services/imageService";
import { characterImageService } from "./services/characterImageService";

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads/companions'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'companion-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error("Error: File upload only supports the following filetypes - " + filetypes));
  },
});

// Make sure Express.User is properly typed
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      password: string;
      email?: string | null;
      fullName?: string | null;
      bio?: string | null;
      avatarUrl?: string | null;
      isPremium?: boolean;
      createdAt: Date;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Register guest routes
  app.use('/api/guest', guestRoutes);
  app.use('/api/mobile', mobileDiamondRoutes);
  
  // REMOVED: Duplicate endpoint - handled by mobileDiamondRoutes
  
  // Initialize companion IDs for guest service once companions are loaded
  (async () => {
    try {
      const allCompanions = await storage.getAllCompanions();
      
      // Manual companion separation for guest access (since we may not have proper gender data)
      // Assuming we have at least 8 companions from the logs, allocate them:
      // First 5 companions (or half if less) will be female
      // Remaining companions (up to 3) will be male
      const totalCompanionCount = allCompanions.length;
      const midPoint = Math.min(5, Math.ceil(totalCompanionCount / 2));
      
      // Get IDs for female companions (first half of the list)
      const femaleCompanions = allCompanions.slice(0, midPoint).map(c => c.id);
      
      // Get IDs for male companions (second half of the list, limited to 3)
      const maleCompanions = allCompanions.slice(midPoint, midPoint + 3).map(c => c.id);
      
      // Set the available companion IDs for guest users (5 female, 3 male)
      guestService.setAvailableCompanions(femaleCompanions, maleCompanions);
      console.log(`Initialized guest service with ${femaleCompanions.length} female and ${maleCompanions.length} male companions`);
    } catch (error) {
      console.error('Failed to initialize guest service with companion IDs:', error);
    }
  })();
  
  // Admin route to view all users (for development purposes)
  app.get("/api/admin/users", async (req, res) => {
    try {
      // Execute direct SQL query to get all users
      const users = await db.execute(sql`SELECT * FROM users`);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  
  // Admin route to view user preferences (for development purposes)
  app.get("/api/admin/preferences", async (req, res) => {
    try {
      // Execute direct SQL query to get all user preferences
      const preferences = await db.execute(sql`SELECT * FROM user_preferences`);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ error: "Failed to fetch preferences" });
    }
  });
  
  // Serve uploaded files statically
  app.use('/uploads', (req, res, next) => {
    // Allow anyone to access uploads
    // In a production environment, add more security checks here
    next();
  }, express.static(path.join(process.cwd(), 'uploads')));

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };
  
  // Premium subscription endpoints
  app.post("/api/premium/upgrade", requireAuth, async (req, res) => {
    try {
      const { plan, durationMonths = 1 } = req.body;
      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const user = await storage.setUserPremiumStatus(
        req.user.id, 
        true, 
        plan || 'monthly', 
        durationMonths
      );
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ 
        success: true, 
        user,
        subscription: {
          plan: user.subscriptionPlan,
          startDate: user.premiumStartDate,
          expiryDate: user.premiumExpiryDate
        }
      });
    } catch (error) {
      console.error("Error upgrading to premium:", error);
      res.status(500).json({ error: "Failed to upgrade to premium" });
    }
  });
  
  app.get("/api/premium/status", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const status = await storage.checkPremiumExpiry(req.user.id);
      res.json(status);
    } catch (error) {
      console.error("Error checking premium status:", error);
      res.status(500).json({ error: "Failed to check premium status" });
    }
  });
  
  app.post("/api/premium/renew", requireAuth, async (req, res) => {
    try {
      const { durationMonths = 1 } = req.body;
      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const user = await storage.renewPremiumSubscription(req.user.id, durationMonths);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ 
        success: true, 
        user,
        subscription: {
          plan: user.subscriptionPlan,
          startDate: user.premiumStartDate,
          expiryDate: user.premiumExpiryDate
        }
      });
    } catch (error) {
      console.error("Error renewing premium subscription:", error);
      res.status(500).json({ error: "Failed to renew premium subscription" });
    }
  });

  // API routes for companions
  app.get("/api/companions", async (_req, res) => {
    try {
      // Use in-memory storage instead of direct SQL due to database connection issues
      const companions = await storage.getAllCompanions();
      res.json(companions);
    } catch (error) {
      console.error("Error fetching companions:", error);
      res.status(500).json({ message: "Failed to fetch companions" });
    }
  });

  // Admin endpoint to create companion with image upload support
  app.post("/api/companions", upload.single("image"), async (req, res) => {
    try {
      // Get companion data from request body
      const companionData = JSON.parse(req.body.data || "{}");
      
      // If an image was uploaded, get the path
      if (req.file) {
        // URL that will be accessible from the client
        const imageUrl = `/uploads/companions/${path.basename(req.file.path)}`;
        companionData.imageUrl = imageUrl;
        
        // Initialize or update albumUrls array
        if (!companionData.albumUrls) {
          companionData.albumUrls = [imageUrl];
        } else if (Array.isArray(companionData.albumUrls)) {
          companionData.albumUrls.push(imageUrl);
        } else {
          companionData.albumUrls = [imageUrl];
        }
      }
      
      // Ensure traits and features are arrays if present
      if (companionData.traits && !Array.isArray(companionData.traits)) {
        companionData.traits = companionData.traits.split(',').map((t: string) => t.trim());
      }
      
      if (companionData.features && !Array.isArray(companionData.features)) {
        companionData.features = companionData.features.split(',').map((f: string) => f.trim());
      }
      
      console.log("Creating companion with data:", JSON.stringify(companionData));
      
      // Create companion
      const companion = await storage.createCompanion(companionData);
      res.status(200).json(companion);
    } catch (error) {
      console.error("Error creating companion:", error);
      res.status(500).json({ message: "Failed to create companion" });
    }
  });

  app.get("/api/companions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Use in-memory storage instead of database due to connection issues
      const companion = await storage.getCompanion(id);
      
      if (!companion) {
        return res.status(404).json({ message: "Companion not found" });
      }
      
      res.json(companion);
    } catch (error) {
      console.error("Error fetching companion:", error);
      res.status(500).json({ message: "Failed to fetch companion" });
    }
  });

  // Admin endpoint to upload multiple images to companion album
  app.post("/api/companions/:id/album", upload.array("images", 5), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid companion ID" });
      }
      
      // Check if companion exists
      const existingCompanion = await storage.getCompanion(id);
      if (!existingCompanion) {
        return res.status(404).json({ message: "Companion not found" });
      }
      
      // Process uploaded images
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No images uploaded" });
      }
      
      // Get uploaded image URLs
      const newImageUrls = req.files.map(file => `/uploads/companions/${path.basename(file.path)}`);
      
      // Update album URLs - merge with existing ones
      const currentAlbumUrls = existingCompanion.albumUrls || [];
      const updatedAlbumUrls = [...currentAlbumUrls, ...newImageUrls];
      
      // Limit to maximum 5 images in album
      const limitedAlbumUrls = updatedAlbumUrls.slice(-5);
      
      // Update companion with new album URLs
      const updatedCompanion = await storage.updateCompanion(id, {
        albumUrls: limitedAlbumUrls
      });
      
      if (!updatedCompanion) {
        return res.status(404).json({ message: "Failed to update companion album" });
      }
      
      res.json({
        success: true,
        message: `${newImageUrls.length} images added to album`,
        albumUrls: limitedAlbumUrls,
        companion: updatedCompanion
      });
    } catch (error) {
      console.error("Error uploading album images:", error);
      res.status(500).json({ message: "Failed to upload album images" });
    }
  });

  // Admin endpoint to update companion
  app.patch("/api/companions/:id", upload.single("image"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid companion ID" });
      }
      
      // Check if companion exists
      const existingCompanion = await storage.getCompanion(id);
      if (!existingCompanion) {
        return res.status(404).json({ message: "Companion not found" });
      }
      
      // Get update data from request body
      let updateData: any = {};
      
      // Handle both JSON and FormData requests
      if (req.body.data) {
        // FormData request (with image upload)
        updateData = JSON.parse(req.body.data);
      } else {
        // Regular JSON request
        updateData = req.body;
      }
      
      // If an image was uploaded, update the image URL
      if (req.file) {
        const imageUrl = `/uploads/companions/${path.basename(req.file.path)}`;
        updateData.imageUrl = imageUrl;
        
        // Update album URLs if they exist
        if (existingCompanion.albumUrls && Array.isArray(existingCompanion.albumUrls)) {
          updateData.albumUrls = [...existingCompanion.albumUrls, imageUrl];
        } else {
          updateData.albumUrls = [imageUrl];
        }
      }
      
      // Ensure traits and features are arrays if present
      if (updateData.traits && !Array.isArray(updateData.traits)) {
        updateData.traits = updateData.traits.split(',').map((t: string) => t.trim());
      }
      
      if (updateData.features && !Array.isArray(updateData.features)) {
        updateData.features = updateData.features.split(',').map((f: string) => f.trim());
      }
      
      console.log(`Updating companion ${id} with data:`, JSON.stringify(updateData));
      
      // Update companion
      const updatedCompanion = await storage.updateCompanion(id, updateData);
      
      if (!updatedCompanion) {
        return res.status(404).json({ message: "Companion not found" });
      }
      
      res.json(updatedCompanion);
    } catch (error) {
      console.error("Error updating companion:", error);
      res.status(500).json({ message: "Failed to update companion" });
    }
  });
  
  // Interaction routes for heatmap visualization
  app.post("/api/interactions", async (req, res) => {
    try {
      const { companionId, userId, emotionType, emotionIntensity, responseTimeMs } = req.body;
      
      if (!companionId) {
        return res.status(400).json({ message: "Companion ID is required" });
      }
      
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const interaction = await storage.recordInteraction({
        companionId,
        userId: userId || null,
        date: dateStr,
        hour: now.getHours(),
        messageCount: req.body.messageCount || 1,
        emotionType: emotionType || null,
        emotionIntensity: emotionIntensity || null,
        responseTimeMs: responseTimeMs || null
      });
      
      res.status(201).json(interaction);
    } catch (error) {
      console.error("Error recording interaction:", error);
      res.status(500).json({ message: "Failed to record interaction" });
    }
  });
  
  app.get("/api/companions/:id/interactions/heatmap", async (req, res) => {
    try {
      const companionId = parseInt(req.params.id);
      const startDateStr = req.query.startDate as string || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDateStr = req.query.endDate as string || new Date().toISOString().split('T')[0];
      
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      if (isNaN(companionId)) {
        return res.status(400).json({ message: "Invalid companion ID" });
      }
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const heatmap = await storage.getInteractionHeatmap(companionId, startDate, endDate);
      res.json(heatmap);
    } catch (error) {
      console.error("Error fetching interaction heatmap:", error);
      res.status(500).json({ message: "Failed to fetch interaction heatmap" });
    }
  });

  // User preferences routes - works for both authenticated users and guests
  app.get("/api/user/preferences", async (req, res) => {
    try {
      // For authenticated users
      if (req.isAuthenticated() && req.user) {
        const userId = req.user.id;
        
        // Get user preferences or return default if none exist
        const preferences = await storage.getUserPreferences(userId);
        
        if (preferences) {
          return res.json(preferences);
        } else {
          // If no preferences exist, create default ones
          const defaultPreferences = {
            userId,
            preferredGender: 'both',
            defaultLanguage: 'english',
            theme: 'light',
            notificationsEnabled: true,
            conversationHistory: true,
            messageDiamonds: 30 // Changed from 100 to 30 for registered users
          };
          
          const newPreferences = await storage.createUserPreferences(defaultPreferences);
          return res.json(newPreferences);
        }
      }
      
      // For guest users
      const sessionId = req.sessionID;
      if (sessionId) {
        // Get or create a guest session with 10 diamonds
        const guestSession = guestService.getOrCreateGuestSession(sessionId);
        
        // Return guest preferences in the same format as user preferences
        return res.json({
          userId: -1, // Use -1 to indicate a guest user
          preferredGender: guestSession.preferredGender,
          messageDiamonds: guestSession.messageDiamonds,
          defaultLanguage: 'english',
          theme: 'light',
          notificationsEnabled: true,
          conversationHistory: false, // No conversation history for guests
          isGuest: true,
          accessibleCompanionIds: guestSession.accessibleCompanionIds
        });
      }
      
      // No session ID available (should not happen)
      return res.status(400).json({ message: "No session available" });
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });
  
  app.patch("/api/user/preferences", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.id;
      
      // Get existing preferences
      let preferences = await storage.getUserPreferences(userId);
      
      // If no preferences exist, create default ones first
      if (!preferences) {
        const defaultPreferences = {
          userId,
          preferredGender: 'both',
          defaultLanguage: 'english',
          theme: 'light',
          notificationsEnabled: true,
          conversationHistory: true,
          messageDiamonds: 100
        };
        
        preferences = await storage.createUserPreferences(defaultPreferences);
      }
      
      // Validate request body
      const result = insertUserPreferencesSchema.safeParse({
        userId,
        ...req.body
      });
      
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid data",
          errors: result.error.format()
        });
      }
      
      // Update preferences
      const updatedPreferences = await storage.updateUserPreferences(userId, req.body);
      res.json(updatedPreferences);
      
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });
  
  // User management routes
  app.get("/api/user/profile", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Send safe user data (exclude password)
      const { password, ...safeUserData } = req.user;
      res.json(safeUserData);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });
  
  app.patch("/api/user/profile", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.id;
      
      // Don't allow password change through this endpoint
      const { password, ...updates } = req.body;
      
      // Update user
      const updatedUser = await storage.updateUser(userId, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return safe user data (exclude password)
      const { password: _, ...safeUserData } = updatedUser;
      res.json(safeUserData);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });
  
  // API routes for companion settings
  app.get("/api/companions/:companionId/settings", async (req, res) => {
    try {
      let userId = 1; // Default admin user ID
      
      // If user is authenticated, use their ID
      if (req.isAuthenticated() && req.user) {
        userId = req.user.id;
      }
      
      const companionId = parseInt(req.params.companionId);
      
      // First check if the companion exists
      const companion = await storage.getCompanion(companionId);
      if (!companion) {
        return res.status(404).json({ message: "Companion not found" });
      }
      
      // Get settings or return default if none exist
      const settings = await storage.getCompanionSettings(userId, companionId);
      
      if (settings) {
        res.json(settings);
      } else {
        // If no settings exist, return default values
        res.json({
          userId,
          companionId,
          personalityTraits: {},
          relationshipType: 'dating',
          scenario: null,
          interestTopics: [],
          appearancePreferences: {},
          conversationStyle: 'balanced',
          emotionalResponseLevel: 50,
          voiceSettings: {},
          memoryRetention: 10
        });
      }
    } catch (error) {
      console.error("Error fetching companion settings:", error);
      res.status(500).json({ message: "Failed to fetch companion settings" });
    }
  });

  app.post("/api/companions/:companionId/settings", async (req, res) => {
    try {
      let userId = 1; // Default admin user ID
      
      // If user is authenticated, use their ID
      if (req.isAuthenticated() && req.user) {
        userId = req.user.id;
      }
      
      const companionId = parseInt(req.params.companionId);
      
      // First check if the companion exists
      const companion = await storage.getCompanion(companionId);
      if (!companion) {
        return res.status(404).json({ message: "Companion not found" });
      }
      
      // NOTE: Premium restriction has been removed for now
      // All users can customize companion settings regardless of premium status
      
      // Check if settings already exist
      const existingSettings = await storage.getCompanionSettings(userId, companionId);
      
      // Validate request body
      const settingsData = {
        userId,
        companionId,
        ...req.body
      };
      
      const result = insertCompanionSettingsSchema.safeParse(settingsData);
      
      if (!result.success) {
        return res.status(400).json({
          message: "Invalid data",
          errors: result.error.format()
        });
      }
      
      let settings;
      if (existingSettings) {
        // Update existing settings
        settings = await storage.updateCompanionSettings(userId, companionId, settingsData);
      } else {
        // Create new settings
        settings = await storage.createCompanionSettings(settingsData);
      }
      
      res.status(200).json(settings);
    } catch (error) {
      console.error("Error saving companion settings:", error);
      res.status(500).json({ message: "Failed to save companion settings" });
    }
  });

  app.patch("/api/companions/:companionId/settings", async (req, res) => {
    try {
      const companionId = parseInt(req.params.companionId);
      let userId = 1; // Default admin user ID
      
      // If user is authenticated, use their ID
      if (req.isAuthenticated() && req.user) {
        userId = req.user.id;
      }
      
      console.log(`PATCH settings for user ${userId} and companion ${companionId}`);
      console.log("Request body:", JSON.stringify(req.body));
      
      // Verify companion exists
      const companion = await storage.getCompanion(companionId);
      if (!companion) {
        console.log("Companion not found");
        return res.status(404).json({ message: "Companion not found" });
      }
      
      // Check if settings exist
      const existingSettings = await storage.getCompanionSettings(userId, companionId);
      console.log("Existing settings:", existingSettings ? "Found" : "Not found");
      
      let updatedSettings;
      if (!existingSettings) {
        // If settings don't exist, create them
        console.log("Creating new settings");
        const settingsData = {
          userId,
          companionId,
          personalityTraits: req.body.personalityTraits || {},
          relationshipType: req.body.relationshipType || "dating",
          scenario: req.body.scenario || null,
          interestTopics: req.body.interestTopics || [],
          appearancePreferences: req.body.appearancePreferences || {},
          conversationStyle: req.body.conversationStyle || "balanced",
          emotionalResponseLevel: req.body.emotionalResponseLevel || 50,
          voiceSettings: req.body.voiceSettings || {},
          memoryRetention: req.body.memoryRetention || 10
        };
        
        console.log("Settings data to create:", JSON.stringify(settingsData));
        updatedSettings = await storage.createCompanionSettings(settingsData);
        console.log("Created settings:", updatedSettings ? "Success" : "Failed");
      } else {
        // Update existing settings
        console.log("Updating existing settings");
        updatedSettings = await storage.updateCompanionSettings(userId, companionId, req.body);
        console.log("Updated settings:", updatedSettings ? "Success" : "Failed");
      }
      
      if (!updatedSettings) {
        console.log("Failed to update/create settings");
        return res.status(500).json({ message: "Failed to save settings" });
      }
      
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating companion settings:", error);
      res.status(500).json({ message: "Failed to update companion settings" });
    }
  });

  // Update companion with image upload support
  app.patch("/api/companions/:id", upload.single("image"), async (req, res) => {
    try {
      // Get companion ID from URL parameters
      const companionId = parseInt(req.params.id);
      
      // Get companion data from request body
      const fullData = JSON.parse(req.body.data || "{}");
      
      // Filter out fields that don't exist in the database
      const allowedFields = [
        'name', 'description', 'tagline', 'imageUrl', 'traits',
        'available', 'isPremium', 'tier', 'features', 'personality',
        'voiceType', 'gender', 'albumUrls'
      ];
      
      // Create a filtered companion data object with only allowed fields
      const companionData: Record<string, any> = {};
      for (const field of allowedFields) {
        if (field in fullData) {
          // Special handling for array fields to ensure they are correctly formatted
          if ((field === 'albumUrls' || field === 'traits' || field === 'features') && !Array.isArray(fullData[field])) {
            // Convert to array if it's not already one
            companionData[field] = typeof fullData[field] === 'string' ? 
              [fullData[field]] : [];
          } else {
            companionData[field] = fullData[field];
          }
        }
      }
      
      // If an image was uploaded, get the path
      if (req.file) {
        // URL that will be accessible from the client
        const imageUrl = `/uploads/companions/${path.basename(req.file.path)}`;
        companionData.imageUrl = imageUrl;
        
        // Add to album URLs if not already present
        if (!companionData.albumUrls) {
          companionData.albumUrls = [imageUrl];
        } else if (Array.isArray(companionData.albumUrls)) {
          companionData.albumUrls.push(imageUrl);
        } else {
          companionData.albumUrls = [imageUrl];
        }
        
        console.log("New image uploaded:", imageUrl);
      }
      
      console.log("Updating companion with filtered data:", companionData);
      
      // Update companion
      const companion = await storage.updateCompanion(companionId, companionData);
      
      if (!companion) {
        return res.status(404).json({ message: "Companion not found" });
      }
      
      // Store appearance data in companion settings if needed
      if (fullData.appearancePreferences) {
        try {
          // Check if admin user is authenticated
          if (req.isAuthenticated() && req.user) {
            const userId = req.user.id;
            
            // Get existing settings or create new ones
            let settings = await storage.getCompanionSettings(userId, companionId);
            
            // If appearance preferences already exist in fullData, use them directly
            let appearancePreferences = fullData.appearancePreferences || {};
            
            // We're only using the appearance preferences directly from the UI now
            
            if (settings) {
              // Update existing settings
              await storage.updateCompanionSettings(userId, companionId, {
                appearancePreferences
              });
            } else {
              // Create new settings
              await storage.createCompanionSettings({
                userId,
                companionId,
                appearancePreferences,
                relationshipType: 'dating',
                personalityTraits: {}
              });
            }
          }
        } catch (settingsError) {
          console.error("Error updating companion settings:", settingsError);
          // Don't fail the whole request if settings update fails
        }
      }
      
      res.status(200).json(companion);
    } catch (error) {
      console.error("Error updating companion:", error);
      res.status(500).json({ message: "Failed to update companion" });
    }
  });

  // Chat API endpoint for companion messages
  app.post("/api/companions/:id/chat", async (req, res) => {
    try {
      const companionId = parseInt(req.params.id);
      const { message, emotion, sessionId, deviceId } = req.body;
      const deviceFingerprint = req.headers['x-device-fingerprint'] as string;

      if (!companionId || !message) {
        return res.status(400).json({ message: "Companion ID and message are required" });
      }

      // Check if this is a registered user or guest user
      let userId = 0;
      let isGuest = false;

      // For registered users
      if (req.isAuthenticated() && req.user) {
        userId = req.user.id;
        
        // Check if user has enough diamonds
        const userPreferences = await storage.getUserPreferences(userId);
        const currentDiamonds = userPreferences?.messageDiamonds || 0;
        
        if (!userPreferences || currentDiamonds < 1) {
          return res.status(402).json({ 
            message: "Not enough diamonds to send a message",
            diamonds: currentDiamonds
          });
        }
        
        // Deduct one diamond for the message
        await storage.updateUserPreferences(userId, {
          messageDiamonds: currentDiamonds - 1
        });
      } 
      // For guest users - UNIFIED diamond system
      else if (deviceFingerprint || sessionId) {
        isGuest = true;
        
        // Priority 1: Use device-based diamond deduction if device fingerprint available
        if (deviceFingerprint) {
          const deductionResult = await deviceDiamondService.deductDiamonds(deviceFingerprint, 1);
          if (!deductionResult.success) {
            return res.status(402).json({ 
              message: "Not enough diamonds to send a message",
              diamonds: deductionResult.remainingDiamonds,
              requiresPurchase: true
            });
          }
          
          console.log(`Device diamond deducted for ${deviceFingerprint.substring(0, 8)}... - Remaining: ${deductionResult.remainingDiamonds}`);
        }
        // Priority 2: Fallback to session-based for web users
        else if (sessionId) {
          // Check if guest has access to this companion
          const canAccess = guestService.canAccessCompanion(sessionId, companionId);
          if (!canAccess) {
            return res.status(403).json({ 
              message: "This companion is not available for guest users",
              requiresRegistration: true
            });
          }
          
          // Check if guest has enough diamonds
          const diamondResult = guestService.useDiamonds(sessionId, 1);
          if (!diamondResult.success) {
            return res.status(402).json({ 
              message: diamondResult.error || "Not enough diamonds to send a message",
              diamonds: diamondResult.remainingDiamonds || 0
            });
          }
          
          console.log(`Session diamond deducted for ${sessionId.substring(0, 8)}... - Remaining: ${diamondResult.remainingDiamonds}`);
        }
      }
      // No authentication or session ID
      else {
        return res.status(401).json({ message: "Unauthorized. Please log in or use a valid session" });
      }

      // Process the message
      const chatRequest: ChatRequest = {
        message,
        companionId,
        userId,
        sessionId,
        emotion
      };

      // Get response from the companion
      const response = await companionService.processMessage(chatRequest);
      
      // Save chat message to device-based storage if device fingerprint is available
      if (deviceFingerprint) {
        try {
          await deviceDiamondService.saveChatMessage(
            deviceFingerprint,
            companionId,
            message,
            'user'
          );
          
          if (response.message) {
            await deviceDiamondService.saveChatMessage(
              deviceFingerprint,
              companionId,
              response.message,
              'companion'
            );
          }
        } catch (error) {
          console.error('Error saving chat message to device storage:', error);
        }
      }
      
      // For guest users, add additional info about being a guest user
      if (isGuest) {
        response.guestUser = {
          userId: -1,
          username: 'Guest'
        };
        
        // Include remaining diamonds for guest users
        if (deviceFingerprint) {
          // Get device-based diamond count
          const deviceDiamonds = await deviceDiamondService.getDiamondCount(deviceFingerprint);
          response.diamondsRemaining = deviceDiamonds;
        } else if (sessionId) {
          // Get session-based diamond count
          response.diamondsRemaining = guestService.getDiamondsCount(sessionId);
        }
      }
      
      res.json(response);
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // API endpoint to get all memories for a user-companion pair
  app.get("/api/companions/:companionId/memories", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user.id;
      const companionId = parseInt(req.params.companionId);

      if (isNaN(companionId)) {
        return res.status(400).json({ message: "Invalid companion ID" });
      }

      const memories = await companionService.getMemories(userId, companionId);
      res.json(memories);
    } catch (error) {
      console.error("Error fetching memories:", error);
      res.status(500).json({ message: "Failed to fetch memories" });
    }
  });

  // API endpoint to clear all memories for a user-companion pair
  app.delete("/api/companions/:companionId/memories", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user.id;
      const companionId = parseInt(req.params.companionId);

      if (isNaN(companionId)) {
        return res.status(400).json({ message: "Invalid companion ID" });
      }

      const success = await companionService.clearMemories(userId, companionId);
      
      if (success) {
        res.json({ message: "Memories cleared successfully" });
      } else {
        res.status(500).json({ message: "Failed to clear memories" });
      }
    } catch (error) {
      console.error("Error clearing memories:", error);
      res.status(500).json({ message: "Failed to clear memories" });
    }
  });

  // PayPal payment routes
  app.get("/paypal/setup", async (req, res) => {
    try {
      await loadPaypalDefault(req, res);
    } catch (error) {
      console.error("PayPal setup error:", error);
      res.status(503).json({ error: "PayPal service temporarily unavailable - credentials may need updating" });
    }
  });

  app.post("/paypal/order", async (req, res) => {
    try {
      await createPaypalOrder(req, res);
    } catch (error) {
      console.error("PayPal order creation error:", error);
      res.status(503).json({ error: "PayPal service temporarily unavailable - credentials may need updating" });
    }
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    try {
      await capturePaypalOrder(req, res);
    } catch (error) {
      console.error("PayPal order capture error:", error);
      res.status(503).json({ error: "PayPal service temporarily unavailable - credentials may need updating" });
    }
  });

  // Diamond purchase endpoint for registered users
  app.post("/api/purchase-diamonds", requireAuth, async (req, res) => {
    try {
      const { paymentId, packageType, amount } = req.body;
      const userId = (req.user as any).id;

      if (!paymentId || !packageType || !amount) {
        return res.status(400).json({ error: "Missing required payment information" });
      }

      // Define diamond packages
      const diamondPackages = {
        small: { price: 5.99, diamonds: 1000 },
        large: { price: 14.99, diamonds: 5000 }
      };

      const selectedPackage = diamondPackages[packageType as keyof typeof diamondPackages];
      if (!selectedPackage) {
        return res.status(400).json({ error: "Invalid package type" });
      }

      if (parseFloat(amount) !== selectedPackage.price) {
        return res.status(400).json({ error: "Amount mismatch for selected package" });
      }

      // Add diamonds to user account
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get current diamond count from user preferences
      const userPrefs = await storage.getUserPreferences(userId);
      const currentDiamonds = userPrefs?.messageDiamonds || 0;
      const newDiamondCount = currentDiamonds + selectedPackage.diamonds;
      await storage.updateUserDiamonds(userId, newDiamondCount);

      // Log the purchase
      console.log(`User ${userId} purchased ${selectedPackage.diamonds} diamonds for $${selectedPackage.price}`);

      res.json({ 
        success: true, 
        diamonds: newDiamondCount,
        purchased: selectedPackage.diamonds,
        package: packageType
      });
    } catch (error) {
      console.error("Error processing diamond purchase:", error);
      res.status(500).json({ error: "Failed to process diamond purchase" });
    }
  });

  // Guest diamond purchase endpoint
  app.post("/api/guest/purchase-diamonds", async (req, res) => {
    try {
      const { paymentId, packageType, amount, sessionId } = req.body;

      if (!paymentId || !packageType || !amount || !sessionId) {
        return res.status(400).json({ error: "Missing required payment information" });
      }

      // Define diamond packages
      const diamondPackages = {
        small: { price: 5.99, diamonds: 1000 },
        large: { price: 14.99, diamonds: 5000 }
      };

      const selectedPackage = diamondPackages[packageType as keyof typeof diamondPackages];
      if (!selectedPackage) {
        return res.status(400).json({ error: "Invalid package type" });
      }

      if (parseFloat(amount) !== selectedPackage.price) {
        return res.status(400).json({ error: "Amount mismatch for selected package" });
      }

      // Add diamonds to guest session
      const session = guestService.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const currentDiamonds = guestService.getDiamondsCount(sessionId);
      const newDiamondCount = currentDiamonds + selectedPackage.diamonds;
      
      // Update guest session diamonds
      guestService.addDiamonds(sessionId, selectedPackage.diamonds);

      // Log the purchase
      console.log(`Guest ${sessionId} purchased ${selectedPackage.diamonds} diamonds for $${selectedPackage.price}`);

      res.json({ 
        success: true, 
        diamonds: newDiamondCount,
        purchased: selectedPackage.diamonds,
        package: packageType
      });
    } catch (error) {
      console.error("Error processing guest diamond purchase:", error);
      res.status(500).json({ error: "Failed to process diamond purchase" });
    }
  });

  // Premium subscription upgrade endpoint
  app.post("/api/upgrade-to-premium", requireAuth, async (req, res) => {
    try {
      const { paymentId, plan, amount } = req.body;
      const userId = (req.user as any).id;

      if (!paymentId || !plan || !amount) {
        return res.status(400).json({ error: "Missing required payment information" });
      }

      // Update user to premium status
      const updatedUser = await storage.setUserPremiumStatus(userId, true, plan, 1); // 1 month subscription
      
      if (updatedUser) {
        res.json({
          message: "Premium subscription activated successfully",
          user: updatedUser,
          paymentId: paymentId
        });
      } else {
        res.status(500).json({ error: "Failed to update user premium status" });
      }
    } catch (error) {
      console.error("Error upgrading to premium:", error);
      res.status(500).json({ error: "Failed to process premium upgrade" });
    }
  });

  // Image generation endpoint for premium users
  app.post("/api/generate-image", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user?.isPremium) {
        return res.status(403).json({ message: "Premium subscription required for image generation" });
      }

      const { prompt, companionId } = req.body;
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      // Check if user has enough diamonds (5 diamonds for image generation)
      const preferences = await storage.getUserPreferences(userId);
      if (!preferences || (preferences.messageDiamonds ?? 0) < 5) {
        return res.status(400).json({ message: "Insufficient diamonds. Need 5 diamonds for image generation." });
      }

      // Get companion if specified
      let companion;
      if (companionId) {
        companion = await storage.getCompanion(companionId);
      }

      // Generate image
      const result = await imageService.generateImage(prompt, companion);

      // Deduct diamonds
      const currentDiamonds = preferences.messageDiamonds ?? 0;
      await storage.updateUserPreferences(userId, {
        messageDiamonds: currentDiamonds - result.cost
      });

      res.json({
        imageUrl: result.imageUrl,
        cost: result.cost,
        remainingDiamonds: currentDiamonds - result.cost
      });
    } catch (error) {
      console.error("Image generation error:", error);
      res.status(500).json({ message: "Failed to generate image" });
    }
  });

  // Guest image generation endpoint
  app.post("/api/guest/generate-image", async (req, res) => {
    try {
      const { sessionId, prompt, companionId } = req.body;
      
      if (!sessionId || !prompt) {
        return res.status(400).json({ message: "Session ID and prompt are required" });
      }

      // Check guest session diamonds
      const sessionData = guestService.getSession(sessionId);
      if (!sessionData || sessionData.messageDiamonds < 5) {
        return res.status(400).json({ message: "Insufficient diamonds. Need 5 diamonds for image generation." });
      }

      // Get companion if specified
      let companion;
      if (companionId) {
        companion = await storage.getCompanion(companionId);
      }

      // Generate image
      const result = await imageService.generateImage(prompt, companion);

      // Deduct diamonds from guest session
      guestService.useSessionDiamonds(sessionId, result.cost);

      res.json({
        imageUrl: result.imageUrl,
        cost: result.cost,
        remainingDiamonds: sessionData.messageDiamonds - result.cost
      });
    } catch (error) {
      console.error("Guest image generation error:", error);
      res.status(500).json({ message: "Failed to generate image" });
    }
  });

  // Character image generation for companions
  app.post("/api/admin/generate-companion-images", async (req, res) => {
    try {
      const { adminPassword } = req.body;
      
      // Simple admin authentication
      if (adminPassword !== "redvelvet-admin") {
        return res.status(401).json({ message: "Invalid admin password" });
      }

      console.log("Starting character image generation for all companions...");
      await characterImageService.generateAllCompanionImages();
      
      res.json({ 
        message: "Successfully generated character images for all companions",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to generate companion images:", error);
      res.status(500).json({ message: "Failed to generate companion images" });
    }
  });

  // Generate image for a specific companion
  app.post("/api/admin/generate-companion-image/:id", async (req, res) => {
    try {
      const { adminPassword } = req.body;
      const companionId = parseInt(req.params.id);
      
      // Simple admin authentication
      if (adminPassword !== "redvelvet-admin") {
        return res.status(401).json({ message: "Invalid admin password" });
      }

      const imageUrl = await characterImageService.generateImageForCompanion(companionId);
      
      res.json({ 
        message: `Successfully generated character image for companion ${companionId}`,
        imageUrl,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Failed to generate image for companion ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to generate companion image" });
    }
  });

  // Admin endpoint to update companion properties (availability, tier, premium status)
  app.patch("/api/companions/:id", async (req, res) => {
    try {
      const companionId = parseInt(req.params.id);
      
      if (isNaN(companionId)) {
        return res.status(400).json({ message: "Invalid companion ID" });
      }
      
      // Verify companion exists
      const existingCompanion = await storage.getCompanion(companionId);
      if (!existingCompanion) {
        return res.status(404).json({ message: "Companion not found" });
      }
      
      // Extract only allowed fields for update
      const allowedUpdates = {
        available: req.body.available,
        isPremium: req.body.isPremium,
        tier: req.body.tier,
        name: req.body.name,
        tagline: req.body.tagline,
        description: req.body.description,
        traits: req.body.traits,
        gender: req.body.gender
      };
      
      // Remove undefined fields
      const updates = Object.fromEntries(
        Object.entries(allowedUpdates).filter(([_, value]) => value !== undefined)
      );
      
      console.log(`Updating companion ${companionId} with:`, updates);
      
      // Update companion
      const updatedCompanion = await storage.updateCompanion(companionId, updates);
      
      if (!updatedCompanion) {
        return res.status(500).json({ message: "Failed to update companion" });
      }
      
      res.json(updatedCompanion);
      
    } catch (error) {
      console.error("Error updating companion:", error);
      res.status(500).json({ message: "Failed to update companion" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
