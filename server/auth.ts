import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, users } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { pool, db } from "./db";
import { eq } from "drizzle-orm";
import { sendVerificationEmail } from "./services/emailService";

const PostgresSessionStore = connectPg(session);

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Generate a verification token
function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

// Generate expiration time (24 hours from now)
function generateExpirationTime(): Date {
  const expiresIn = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  return new Date(Date.now() + expiresIn);
}

// Email verification endpoint
async function verifyEmail(token: string): Promise<{ success: boolean, message: string, username?: string }> {
  try {
    // Find user with matching token that hasn't expired
    const user = await storage.getUserByVerificationToken(token);
    
    if (!user) {
      return { success: false, message: "Invalid or expired verification token" };
    }
    
    if (user.isVerified) {
      return { success: true, message: "Email already verified", username: user.username };
    }
    
    // Check if token is expired
    const now = new Date();
    if (user.verificationExpires && user.verificationExpires < now) {
      return { success: false, message: "Verification token has expired" };
    }
    
    // Update user to mark email as verified
    await storage.updateUser(user.id, {
      isVerified: true,
      verificationToken: null,
      verificationExpires: null
    });
    
    return { success: true, message: "Email verified successfully", username: user.username };
  } catch (error) {
    console.error("Email verification error:", error);
    return { success: false, message: "An error occurred during verification" };
  }
}

export function setupAuth(app: Express) {
  const sessionStore = new PostgresSessionStore({ 
    pool, 
    createTableIfMissing: true 
  });
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "redvelvet-session-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days for better persistence
      httpOnly: true,
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          // Create a timestamp for the login
          const lastLoginDate = new Date();
          
          try {
            // Update the last login time
            await storage.updateUser(user.id, { 
              lastLogin: lastLoginDate 
            } as any);
          } catch (updateError) {
            console.warn("Failed to update last login time:", updateError);
            // Continue with login even if updating last login fails
          }
          
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Validate that email is required
      const { username, password, email, fullName, preferredGender } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already in use" });
      }

      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      // Generate verification token and expiration
      const verificationToken = generateVerificationToken();
      const verificationExpires = generateExpirationTime();

      // Create the user with validated data
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email: email,
        fullName: fullName || null,
        isPremium: false,
        isVerified: false,
        verificationToken,
        verificationExpires,
        googleId: null
      });

      // Create default user preferences with proper error handling
      try {
        await storage.createUserPreferences({
          userId: user.id,
          preferredGender: preferredGender || 'both',
          messageDiamonds: 30  // Changed from 100 to 30 for registered users
        });
      } catch (prefsError) {
        console.error("Failed to create user preferences:", prefsError);
        // Continue with verification process even if preferences creation fails
      }

      // Send verification email
      try {
        const emailResult = await sendVerificationEmail(email, verificationToken, username);
        console.log("Verification email sent to:", email);
        
        // Don't log the user in automatically - require email verification first
        return res.status(201).json({
          success: true,
          message: "Registration successful! Please check your email to verify your account.",
          previewUrl: emailResult.previewUrl || null,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            isPremium: user.isPremium,
            isVerified: false
          }
        });
        
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        // Still return success but with a warning
        return res.status(201).json({
          success: true,
          warning: "Registration successful, but we couldn't send the verification email. Please contact support.",
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            isPremium: user.isPremium,
            isVerified: false
          }
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register user", details: error.message });
    }
  });
  
  // Google authentication endpoint
  app.post("/api/auth/google", async (req, res, next) => {
    try {
      const { googleId, email, displayName, photoURL } = req.body;
      
      if (!googleId || !email) {
        return res.status(400).json({ error: "Invalid Google authentication data" });
      }
      
      // Check if user with this Google ID already exists
      let user;
      const userByGoogleId = await db.select().from(users).where(eq(users.googleId, googleId));
      
      if (userByGoogleId.length > 0) {
        // User exists with this Google ID
        user = userByGoogleId[0];
      } else {
        // Check if user exists with this email
        const userByEmail = await storage.getUserByEmail(email);
        
        if (userByEmail) {
          // Link Google ID to existing account
          user = await storage.updateUser(userByEmail.id, { googleId });
        } else {
          // Create new user with Google info
          // Generate username from email (remove @domain.com)
          let username = email.split('@')[0];
          let counter = 1;
          
          // Ensure username is unique
          while (await storage.getUserByUsername(username)) {
            username = `${email.split('@')[0]}${counter}`;
            counter++;
          }
          
          // Create random secure password
          const randomPassword = await hashPassword(randomBytes(16).toString('hex'));
          
          // Create new user
          user = await storage.createUser({
            username,
            password: randomPassword,
            email,
            fullName: displayName || null,
            isPremium: false,
            googleId,
            avatarUrl: photoURL || null
          });
          
          // Create default preferences
          try {
            await storage.createUserPreferences({
              userId: user.id,
              preferredGender: 'both',
              messageDiamonds: 100
            });
          } catch (error) {
            console.error("Failed to create preferences for Google user:", error);
            // Continue anyway
          }
        }
      }
      
      // Log the user in
      req.login(user, (err) => {
        if (err) {
          console.error("Login error after Google auth:", err);
          return next(err);
        }
        
        // Don't send password back to client
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Google authentication error:", error);
      res.status(500).json({ error: "Failed to authenticate with Google", details: error.message });
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ error: "Invalid credentials" });
      
      // We'll let unverified users log in, but flag their account as unverified
      // so the frontend can show appropriate messaging
      
      req.login(user, (err: Error | null) => {
        if (err) return next(err);
        // Don't send password back to client
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  
  // Resend verification email endpoint
  app.post("/api/resend-verification", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: "User with this email not found" });
      }
      
      if (user.isVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }
      
      // Generate a new verification token
      const verificationToken = generateVerificationToken();
      const verificationExpires = generateExpirationTime();
      
      // Update the user's verification token
      await storage.updateUser(user.id, {
        verificationToken,
        verificationExpires
      });
      
      // Send the verification email
      await sendVerificationEmail(email, verificationToken, user.username);
      
      res.status(200).json({ message: "Verification email sent successfully" });
    } catch (error) {
      console.error("Error resending verification email:", error);
      res.status(500).json({ message: "Failed to resend verification email" });
    }
  });
  
  // Google Sign-In endpoint
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { firebaseToken, user: firebaseUser } = req.body;
      
      if (!firebaseUser || !firebaseUser.email) {
        return res.status(400).json({ error: "Invalid Firebase user data" });
      }

      // Check if user exists by email
      let user = await storage.getUserByEmail(firebaseUser.email);
      
      if (!user) {
        // Create new user with Google data
        const newUserData = {
          username: firebaseUser.email.split('@')[0], // Use email prefix as username
          email: firebaseUser.email,
          fullName: firebaseUser.displayName || null,
          avatarUrl: firebaseUser.photoURL || null,
          password: await hashPassword(Math.random().toString(36)), // Generate random password
          isVerified: true, // Google users are pre-verified
          isPremium: false,
          googleId: firebaseUser.uid
        };
        
        user = await storage.createUser(newUserData);
        
        // Create user preferences with welcome bonus
        await storage.createUserPreferences({
          userId: user.id,
          messageDiamonds: 25,
          preferredGender: 'both',
          defaultLanguage: 'english',
          theme: 'light',
          notificationsEnabled: true,
          conversationHistory: true
        });
      } else if (!user.googleId) {
        // Update existing user with Google ID
        await storage.updateUser(user.id, { 
          googleId: firebaseUser.uid,
          avatarUrl: firebaseUser.photoURL || user.avatarUrl,
          fullName: firebaseUser.displayName || user.fullName
        });
      }

      // Log the user in
      req.login(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ error: "Login failed" });
        }
        res.json(user);
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      res.status(500).json({ error: "Google sign-in failed" });
    }
  });

  // Email verification endpoint
  app.get("/api/verify-email", async (req, res) => {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid verification token" });
    }
    
    const result = await verifyEmail(token);
    
    if (result.success) {
      // Redirect to login page with success message
      return res.redirect(`/?verified=true&username=${encodeURIComponent(result.username || '')}`);
    } else {
      // Redirect with error message
      return res.redirect(`/?verification-error=${encodeURIComponent(result.message)}`);
    }
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
    // Don't send password back to client
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}