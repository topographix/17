import { pgTable, text, serial, integer, boolean, timestamp, foreignKey, jsonb, date, check } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations, sql } from "drizzle-orm";

// Interaction tracking for heatmap visualization
export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  companionId: integer("companion_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  messageCount: integer("message_count").default(1),
  date: date("date").notNull(),
  hour: integer("hour").notNull(),
  // Engagement metrics
  responseTimeMs: integer("response_time_ms"),
  emotionType: text("emotion_type"),
  emotionIntensity: text("emotion_intensity"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email").notNull(), // Make email required
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  isPremium: boolean("is_premium").default(false),
  premiumStartDate: timestamp("premium_start_date"), // When premium subscription started
  premiumExpiryDate: timestamp("premium_expiry_date"), // When premium subscription expires
  subscriptionPlan: text("subscription_plan"), // 'monthly', 'yearly', etc.
  isVerified: boolean("is_verified").default(false), // New field for email verification
  verificationToken: text("verification_token"), // Token for email verification
  verificationExpires: timestamp("verification_expires"), // Expiration time for the token
  resetPasswordToken: text("reset_password_token"), // Token for password reset
  resetPasswordExpires: timestamp("reset_password_expires"), // Expiration time for password reset
  hasReceivedRegistrationBonus: boolean("has_received_registration_bonus").default(false), // Track registration bonus
  memberSince: timestamp("member_since").defaultNow(),
  lastLogin: timestamp("last_login").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  googleId: text("google_id").unique(),
});

// Device tracking to prevent diamond farming across platforms
export const deviceSessions = pgTable("device_sessions", {
  id: serial("id").primaryKey(),
  deviceFingerprint: text("device_fingerprint").notNull().unique(), // Unique device identifier
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  platform: text("platform"), // 'web', 'android', 'ios'
  hasReceivedWelcomeDiamonds: boolean("has_received_welcome_diamonds").default(false),
  messageDiamonds: integer("message_diamonds").default(0),
  preferredGender: text("preferred_gender").default('both'),
  accessibleCompanionIds: jsonb("accessible_companion_ids").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  lastActivity: timestamp("last_activity").defaultNow(),
});

// Guest sessions linked to devices
export const guestSessions = pgTable("guest_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  deviceFingerprintId: integer("device_fingerprint_id").references(() => deviceSessions.id),
  createdAt: timestamp("created_at").defaultNow(),
  lastActivity: timestamp("last_activity").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  deviceFingerprintId: integer("device_fingerprint_id").references(() => deviceSessions.id),
  companionId: integer("companion_id").notNull(),
  messageContent: text("message_content").notNull(),
  sender: text("sender").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  emotionType: text("emotion_type"),
  emotionIntensity: text("emotion_intensity"),
  imageUrl: text("image_url"),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  preferredGender: text("preferred_gender").default('both'),
  defaultLanguage: text("default_language").default('english'),
  theme: text("theme").default('light'),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  preferredCompanionTypes: text("preferred_companion_types").array(),
  favoriteCompanionIds: integer("favorite_companion_ids").array(),
  conversationHistory: boolean("conversation_history").default(true),
  messageDiamonds: integer("message_diamonds").default(100),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const companions = pgTable("companions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  tagline: text("tagline").notNull(),
  imageUrl: text("image_url").notNull(),
  traits: text("traits").array().notNull(),
  available: boolean("available").default(true),
  isPremium: boolean("is_premium").default(false),
  tier: text("tier").default('free'),
  features: text("features").array(),
  personality: text("personality").default('friendly'),
  voiceType: text("voice_type"),
  gender: text("gender").default('female'),
  albumUrls: text("album_urls").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const companionSettings = pgTable("companion_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  companionId: integer("companion_id").notNull().references(() => companions.id),
  personalityTraits: jsonb("personality_traits"),
  relationshipType: text("relationship_type").default('dating'),
  scenario: text("scenario"),
  interestTopics: text("interest_topics").array(),
  appearancePreferences: jsonb("appearance_preferences"),
  conversationStyle: text("conversation_style").default('balanced'),
  emotionalResponseLevel: integer("emotional_response_level").default(50),
  voiceSettings: jsonb("voice_settings"),
  memoryRetention: integer("memory_retention").default(10),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userPersonalInfo = pgTable("user_personal_info", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  category: text("category").notNull(), // 'personal', 'preferences', 'location', 'work', 'relationships'
  key: text("key").notNull(), // 'birthday', 'occupation', 'city', 'sexual_preference', etc.
  value: text("value").notNull(),
  confidence: integer("confidence").default(100), // 0-100, how confident we are in this info
  lastMentioned: timestamp("last_mentioned").defaultNow(),
  extractedFrom: text("extracted_from"), // which conversation this was extracted from
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many, one }) => ({
  companionSettings: many(companionSettings),
  personalInfo: many(userPersonalInfo),
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const companionsRelations = relations(companions, ({ many }) => ({
  companionSettings: many(companionSettings),
}));

export const companionSettingsRelations = relations(companionSettings, ({ one }) => ({
  user: one(users, {
    fields: [companionSettings.userId],
    references: [users.id],
  }),
  companion: one(companions, {
    fields: [companionSettings.companionId],
    references: [companions.id],
  }),
}));

export const userPersonalInfoRelations = relations(userPersonalInfo, ({ one }) => ({
  user: one(users, {
    fields: [userPersonalInfo.userId],
    references: [users.id],
  }),
}));

export const interactionRelations = relations(interactions, ({ one }) => ({
  user: one(users, {
    fields: [interactions.userId],
    references: [users.id],
  }),
  companion: one(companions, {
    fields: [interactions.companionId],
    references: [companions.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  bio: true,
  avatarUrl: true,
  isPremium: true,
  premiumStartDate: true,
  premiumExpiryDate: true,
  subscriptionPlan: true,
  isVerified: true,
  verificationToken: true, 
  verificationExpires: true,
  resetPasswordToken: true,
  resetPasswordExpires: true,
  googleId: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).pick({
  userId: true,
  preferredGender: true,
  defaultLanguage: true,
  theme: true,
  notificationsEnabled: true,
  preferredCompanionTypes: true,
  favoriteCompanionIds: true,
  conversationHistory: true,
  messageDiamonds: true,
});

export const insertCompanionSchema = createInsertSchema(companions).pick({
  name: true,
  description: true,
  tagline: true,
  imageUrl: true,
  traits: true,
  available: true,
  isPremium: true,
  tier: true,
  features: true,
  personality: true,
  voiceType: true,
  gender: true,
  albumUrls: true,
});

export const insertCompanionSettingsSchema = createInsertSchema(companionSettings).pick({
  userId: true,
  companionId: true,
  personalityTraits: true,
  relationshipType: true,
  scenario: true,
  interestTopics: true,
  appearancePreferences: true,
  conversationStyle: true,
  emotionalResponseLevel: true,
  voiceSettings: true,
  memoryRetention: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;

export type InsertCompanion = z.infer<typeof insertCompanionSchema>;
export type Companion = typeof companions.$inferSelect;

export const insertInteractionSchema = createInsertSchema(interactions).pick({
  userId: true,
  companionId: true,
  messageCount: true,
  date: true,
  hour: true,
  responseTimeMs: true,
  emotionType: true,
  emotionIntensity: true,
});

export type InsertCompanionSettings = z.infer<typeof insertCompanionSettingsSchema>;
export type CompanionSettings = typeof companionSettings.$inferSelect;

export type InsertInteraction = z.infer<typeof insertInteractionSchema>;
export type Interaction = typeof interactions.$inferSelect;

export const insertUserPersonalInfoSchema = createInsertSchema(userPersonalInfo).pick({
  userId: true,
  category: true,
  key: true,
  value: true,
  confidence: true,
  extractedFrom: true,
});

export type InsertUserPersonalInfo = z.infer<typeof insertUserPersonalInfoSchema>;
export type UserPersonalInfo = typeof userPersonalInfo.$inferSelect;

export const insertDeviceSessionSchema = createInsertSchema(deviceSessions).pick({
  deviceFingerprint: true,
  ipAddress: true,
  userAgent: true,
  platform: true,
  hasReceivedWelcomeDiamonds: true,
  messageDiamonds: true,
  preferredGender: true,
  accessibleCompanionIds: true,
});

export const insertGuestSessionSchema = createInsertSchema(guestSessions).pick({
  sessionId: true,
  deviceFingerprintId: true,
});

export type InsertDeviceSession = z.infer<typeof insertDeviceSessionSchema>;
export type DeviceSession = typeof deviceSessions.$inferSelect;

export type InsertGuestSession = z.infer<typeof insertGuestSessionSchema>;
export type GuestSession = typeof guestSessions.$inferSelect;

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  deviceFingerprintId: true,
  companionId: true,
  messageContent: true,
  sender: true,
  emotionType: true,
  emotionIntensity: true,
  imageUrl: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
