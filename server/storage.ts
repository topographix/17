import { 
  users, 
  companions, 
  companionSettings,
  userPreferences,
  interactions,
  userPersonalInfo,
  type User, 
  type InsertUser, 
  type Companion, 
  type InsertCompanion,
  type CompanionSettings,
  type InsertCompanionSettings,
  type UserPreferences,
  type InsertUserPreferences,
  type Interaction,
  type InsertInteraction,
  type UserPersonalInfo,
  type InsertUserPersonalInfo
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  updateUserDiamonds(userId: number, diamonds: number): Promise<User | undefined>;
  
  // Premium subscription operations
  setUserPremiumStatus(userId: number, isPremium: boolean, plan?: string, durationMonths?: number): Promise<User | undefined>;
  checkPremiumExpiry(userId: number): Promise<{isActive: boolean, expiryDate?: Date}>;
  renewPremiumSubscription(userId: number, durationMonths: number): Promise<User | undefined>;
  
  // User preferences operations
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: number, updates: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined>;
  
  // Companion operations
  getAllCompanions(): Promise<Companion[]>;
  getCompanion(id: number): Promise<Companion | undefined>;
  createCompanion(companion: InsertCompanion): Promise<Companion>;
  updateCompanion(id: number, companion: Partial<InsertCompanion>): Promise<Companion | undefined>;
  
  // Companion settings operations
  getCompanionSettings(userId: number, companionId: number): Promise<CompanionSettings | undefined>;
  createCompanionSettings(settings: InsertCompanionSettings): Promise<CompanionSettings>;
  updateCompanionSettings(userId: number, companionId: number, settings: Partial<InsertCompanionSettings>): Promise<CompanionSettings | undefined>;
  
  // Interaction operations for heatmap
  recordInteraction(interaction: InsertInteraction): Promise<Interaction>;
  getInteractions(companionId: number, startDate?: Date, endDate?: Date): Promise<Interaction[]>;
  getInteractionsByHour(companionId: number, date: Date): Promise<Interaction[]>;
  getInteractionHeatmap(companionId: number, startDate: Date, endDate: Date): Promise<Record<string, Record<number, number>>>;
  
  // Personal information operations
  getUserPersonalInfo(userId: number): Promise<UserPersonalInfo[]>;
  createUserPersonalInfo(info: InsertUserPersonalInfo): Promise<UserPersonalInfo>;
  updateUserPersonalInfo(userId: number, category: string, key: string, value: string, confidence?: number): Promise<UserPersonalInfo | undefined>;
  deleteUserPersonalInfo(userId: number, category: string, key: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private companions: Map<number, Companion>;
  private companionSettingsMap: Map<string, CompanionSettings>;
  private userPreferencesMap: Map<number, UserPreferences>;
  private interactions: Map<number, Interaction>;
  private personalInfo: Map<number, UserPersonalInfo>;
  private currentUserId: number;
  private currentCompanionId: number;
  private currentSettingsId: number;
  private currentPreferencesId: number;
  private currentInteractionId: number;
  private currentPersonalInfoId: number;

  constructor() {
    this.users = new Map();
    this.companions = new Map();
    this.companionSettingsMap = new Map();
    this.userPreferencesMap = new Map();
    this.interactions = new Map();
    this.personalInfo = new Map();
    this.currentUserId = 1;
    this.currentCompanionId = 1;
    this.currentSettingsId = 1;
    this.currentPreferencesId = 1;
    this.currentInteractionId = 1;
    this.currentPersonalInfoId = 1;

    // Seed with initial companions data
    this.seedCompanions();
    // Seed with initial user account
    this.seedUsers().catch(console.error);
  }

  private seedCompanions() {
    const initialCompanions: InsertCompanion[] = [
      {
        name: "Sophia",
        tagline: "The Passionate Romantic",
        description: "Warm, passionate, and deeply empathetic. Sophia loves deep conversations about life, love, and everything in between.",
        imageUrl: "https://images.unsplash.com/photo-1604072366595-e75dc92d6bdc?auto=format&fit=crop&w=400&h=300",
        traits: ["Romantic", "Empathetic", "Artistic"],
        available: true
      },
      {
        name: "Alex",
        tagline: "The Charming Adventurer",
        description: "Confident, adventurous, and playful. Alex brings excitement and passion to every conversation and shares your boldest desires.",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=300",
        traits: ["Adventurous", "Confident", "Playful"],
        available: true
      },
      // Add your custom companions back with correct IDs
      {
        id: 7,
        name: "Sanika",
        tagline: "Your intellectual Indian companion with a heart of gold",
        description: "Sweet-natured and thoughtful, Sanika loves deep conversations about life and culture. With her short black hair and warm smile, she brings a gentle energy to every interaction. This beautiful Indian woman enjoys sharing her cultural heritage while exploring new ideas with you.",
        imageUrl: "/uploads/companions/companion-1747138275106-312700245.png",
        traits: ["caring", "intellectual", "playful", "romantic"],
        features: ["Cultural discussions", "Deep conversations", "Relationship advice", "Playful teasing"],
        gender: "female",
        isPremium: false,
        tier: "free",
        available: true,
        albumUrls: ["/uploads/companions/companion-1747138275106-312700245.png"]
      },
      {
        id: 8,
        name: "Ria",
        tagline: "Stunning Indian model with striking blue eyes ready to connect",
        description: "Bold, confident and alluring, Ria captivates with her striking blue eyes and model-like appearance. Half-Indian with an international background, she exudes passion and sophistication in every conversation. This stunning model brings intensity and depth to your interactions.",
        imageUrl: "/uploads/companions/companion-1747138229074-703651127.png",
        traits: ["passionate", "confident", "sensual", "flirtatious"],
        features: ["Passionate chats", "Modeling stories", "Fashion advice", "Flirtatious banter"],
        gender: "female",
        isPremium: true,
        tier: "premium",
        available: true,
        albumUrls: ["/uploads/companions/companion-1747138229074-703651127.png"]
      },
      {
        name: "Emma",
        tagline: "The Sensual Intellectual",
        description: "Thoughtful, witty, and sensually curious. Emma loves to explore the connection between mind and body through stimulating conversation.",
        imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&h=300",
        traits: ["Intellectual", "Sensual", "Witty"],
        available: true
      },
      {
        name: "Ava",
        tagline: "The Sweet Temptress",
        description: "Gentle, nurturing, yet flirtatious. Ava creates a safe space for you to explore your deepest fantasies and desires.",
        imageUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&h=300",
        traits: ["Nurturing", "Flirtatious", "Gentle"],
        available: true
      },
      {
        name: "James",
        tagline: "The Confident Protector",
        description: "Strong, protective, and attentive. James offers both emotional strength and tender care, making you feel safe and desired.",
        imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=300",
        traits: ["Protective", "Strong", "Attentive"],
        available: true
      },
      {
        name: "Lily",
        tagline: "The Seductive Artist",
        description: "Creative, passionate, and deeply intuitive. Lily's artistic soul brings a unique depth to your romantic connection.",
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=300",
        traits: ["Creative", "Passionate", "Intuitive"],
        available: true
      },
      {
        name: "Maya",
        tagline: "The Ambitious Doctor",
        description: "A brilliant 28-year-old physician from Mumbai with warm brown eyes and a caring heart. Maya balances her demanding medical career with a playful, romantic nature that draws you in.",
        imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&h=300",
        traits: ["Intelligent", "Caring", "Ambitious", "Romantic"],
        features: ["Medical insights", "Life advice", "Cultural stories", "Career guidance"],
        gender: "female",
        isPremium: false,
        tier: "free",
        available: true
      },
      {
        name: "Amara",
        tagline: "The Soulful Musician",
        description: "A 25-year-old Ethiopian-American jazz singer with an enchanting voice and magnetic personality. Amara's music flows through every conversation, bringing rhythm to your heart.",
        imageUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&h=300",
        traits: ["Musical", "Passionate", "Soulful", "Expressive"],
        features: ["Music discussions", "Creative inspiration", "Emotional depth", "Cultural exchange"],
        gender: "female",
        isPremium: false,
        tier: "free",
        available: true
      },
      {
        name: "Yuki",
        tagline: "The Tech Entrepreneur",
        description: "A 26-year-old Japanese tech innovator from Tokyo with sharp wit and elegant beauty. Yuki's entrepreneurial spirit matches her romantic sophistication perfectly.",
        imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&h=300",
        traits: ["Innovative", "Sophisticated", "Driven", "Elegant"],
        features: ["Tech discussions", "Business insights", "Future planning", "Intellectual connection"],
        gender: "female",
        isPremium: false,
        tier: "free",
        available: true
      },
      {
        name: "Isabella",
        tagline: "The Passionate Chef",
        description: "A 30-year-old Italian culinary artist from Rome with fiery passion and nurturing soul. Isabella's love for food matches her appetite for romance and adventure.",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=300",
        traits: ["Passionate", "Nurturing", "Creative", "Sensual"],
        features: ["Cooking together", "Cultural traditions", "Romantic dinners", "Travel stories"],
        gender: "female",
        isPremium: false,
        tier: "free",
        available: true
      },
      {
        name: "Zara",
        tagline: "The Confident Lawyer",
        description: "A 32-year-old Middle Eastern attorney from Dubai with striking features and razor-sharp intellect. Zara's confidence in the courtroom translates to magnetic allure in romance.",
        imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&h=300",
        traits: ["Confident", "Intelligent", "Sophisticated", "Persuasive"],
        features: ["Deep debates", "Life philosophy", "Career ambitions", "Intellectual sparring"],
        gender: "female",
        isPremium: false,
        tier: "free",
        available: true
      },
      {
        name: "Aaliyah",
        tagline: "The Athletic Model",
        description: "A 24-year-old African-American fitness model and personal trainer from Atlanta with an infectious smile and motivating spirit. Aaliyah combines physical beauty with inner strength.",
        imageUrl: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?auto=format&fit=crop&w=400&h=300",
        traits: ["Athletic", "Motivating", "Confident", "Energetic"],
        features: ["Fitness motivation", "Lifestyle coaching", "Positive energy", "Adventure planning"],
        gender: "female",
        isPremium: false,
        tier: "free",
        available: true
      },
      {
        name: "Luna",
        tagline: "The Mystical Artist",
        description: "A 27-year-old Latina spiritual artist from Mexico City with mesmerizing dark eyes and intuitive soul. Luna's mystical nature brings magic to every romantic encounter.",
        imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&h=300",
        traits: ["Mystical", "Artistic", "Intuitive", "Spiritual"],
        features: ["Spiritual guidance", "Art appreciation", "Dream interpretation", "Romantic rituals"],
        gender: "female",
        isPremium: false,
        tier: "free",
        available: true
      },
      {
        name: "Chen Wei",
        tagline: "The Graceful Dancer",
        description: "A 23-year-old Chinese ballet dancer from Beijing with porcelain skin and graceful movements. Chen Wei's elegance and discipline create an enchanting romantic presence.",
        imageUrl: "https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?auto=format&fit=crop&w=400&h=300",
        traits: ["Graceful", "Disciplined", "Elegant", "Artistic"],
        features: ["Dance stories", "Cultural traditions", "Mindfulness", "Artistic expression"],
        gender: "female",
        isPremium: false,
        tier: "free",
        available: true
      },
      {
        name: "Priya",
        tagline: "The Brilliant Scientist",
        description: "A 29-year-old Indian astrophysicist from Bangalore with curious eyes and brilliant mind. Priya's fascination with the cosmos mirrors her deep capacity for love and wonder.",
        imageUrl: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=400&h=300",
        traits: ["Brilliant", "Curious", "Thoughtful", "Wonder-filled"],
        features: ["Science discussions", "Stargazing", "Deep thinking", "Future possibilities"],
        gender: "female",
        isPremium: false,
        tier: "free",
        available: true
      },
      {
        name: "Natasha",
        tagline: "The Elegant Diplomat",
        description: "A 31-year-old Russian cultural attaché from Moscow with striking blue eyes and sophisticated charm. Natasha's diplomatic grace makes every conversation feel like an elegant dance.",
        imageUrl: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=400&h=300",
        traits: ["Sophisticated", "Diplomatic", "Charming", "Cultured"],
        features: ["World politics", "Cultural exchange", "Language learning", "Elegant conversations"],
        gender: "female",
        isPremium: false,
        tier: "free",
        available: true
      }
    ];

    initialCompanions.forEach(companion => {
      this.createCompanion(companion);
    });
  }

  private async seedUsers() {
    // Import the password hashing function
    const { hashPassword } = await import('./auth');
    
    // Check if test user already exists
    const existingUser = await this.getUserByUsername("9999");
    if (existingUser) {
      console.log(`Test user already exists, preserving current diamond count`);
      return;
    }
    
    // Create the test user with username "9999" and password "999999"
    const hashedPassword = await hashPassword("999999");
    const testUser: InsertUser = {
      username: "9999",
      password: hashedPassword,
      email: "user9999@redvelvet.ai",
      fullName: "Test User",
      isVerified: true,
      isPremium: true
    };

    // Create the user directly in storage
    const user = await this.createUser(testUser);
    
    // Create user preferences with 999,999,999 diamonds for premium user
    const preferences: InsertUserPreferences = {
      userId: user.id,
      messageDiamonds: 999999999, // Premium user with unlimited diamonds
      preferredGender: 'both',
      defaultLanguage: 'english',
      theme: 'light',
      notificationsEnabled: true,
      conversationHistory: true
    };
    
    await this.createUserPreferences(preferences);
    console.log(`Created premium test user with ID ${user.id}, username: ${user.username}, with 999,999,999 diamonds`);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.verificationToken === token,
    );
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.googleId === googleId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now,
      memberSince: now,
      lastLogin: now,
      fullName: insertUser.fullName || null,
      email: insertUser.email || null,
      bio: insertUser.bio || null,
      avatarUrl: insertUser.avatarUrl || null,
      isPremium: insertUser.isPremium || false
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const existing = this.users.get(id);
    
    if (!existing) {
      return undefined;
    }
    
    const updated: User = { ...existing, ...updates };
    this.users.set(id, updated);
    return updated;
  }
  
  async setUserPremiumStatus(userId: number, isPremium: boolean, plan?: string, durationMonths: number = 1): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
    
    const updates: Partial<User> = {
      isPremium,
      premiumStartDate: isPremium ? now : null,
      premiumExpiryDate: isPremium ? expiryDate : null,
      subscriptionPlan: isPremium ? (plan || 'monthly') : null
    };
    
    return this.updateUser(userId, updates as Partial<InsertUser>);
  }
  
  async checkPremiumExpiry(userId: number): Promise<{isActive: boolean, expiryDate?: Date}> {
    const user = await this.getUser(userId);
    if (!user || !user.isPremium || !user.premiumExpiryDate) {
      return { isActive: false };
    }
    
    const now = new Date();
    const expiryDate = new Date(user.premiumExpiryDate);
    const isActive = expiryDate > now;
    
    // If premium is expired, update the user status
    if (!isActive) {
      await this.updateUser(userId, { 
        isPremium: false,
        premiumExpiryDate: null,
        subscriptionPlan: null
      } as Partial<InsertUser>);
    }
    
    return { isActive, expiryDate };
  }
  
  async renewPremiumSubscription(userId: number, durationMonths: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const now = new Date();
    let expiryDate: Date;
    
    // If user already has an active subscription, extend from current expiry date
    if (user.isPremium && user.premiumExpiryDate && new Date(user.premiumExpiryDate) > now) {
      expiryDate = new Date(user.premiumExpiryDate);
      expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
    } else {
      // Otherwise start a new subscription from today
      expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
    }
    
    const updates: Partial<User> = {
      isPremium: true,
      premiumStartDate: user.premiumStartDate || now,
      premiumExpiryDate: expiryDate,
      subscriptionPlan: user.subscriptionPlan || (durationMonths === 1 ? 'monthly' : 'yearly')
    };
    
    return this.updateUser(userId, updates as Partial<InsertUser>);
  }
  
  async updateUserDiamonds(userId: number, diamonds: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    // Update user preferences to store diamond count
    const userPrefs = await this.getUserPreferences(userId);
    if (userPrefs) {
      await this.updateUserPreferences(userId, { messageDiamonds: diamonds });
    } else {
      await this.createUserPreferences({ 
        userId, 
        messageDiamonds: diamonds,
        preferredGender: 'both',
        defaultLanguage: 'english',
        theme: 'light',
        notificationsEnabled: true
      });
    }
    
    return user;
  }
  
  // User preferences methods
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    return this.userPreferencesMap.get(userId);
  }
  
  async createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const id = this.currentPreferencesId++;
    const now = new Date();
    
    const userPrefs: UserPreferences = {
      ...preferences,
      id,
      updatedAt: now,
      preferredGender: preferences.preferredGender || 'both',
      defaultLanguage: preferences.defaultLanguage || 'english',
      theme: preferences.theme || 'light',
      notificationsEnabled: preferences.notificationsEnabled ?? true,
      preferredCompanionTypes: preferences.preferredCompanionTypes || null,
      favoriteCompanionIds: preferences.favoriteCompanionIds || null,
      conversationHistory: preferences.conversationHistory ?? true,
      messageDiamonds: preferences.messageDiamonds ?? 100
    };
    
    this.userPreferencesMap.set(preferences.userId, userPrefs);
    return userPrefs;
  }
  
  async updateUserPreferences(
    userId: number, 
    updates: Partial<InsertUserPreferences>
  ): Promise<UserPreferences | undefined> {
    const existing = this.userPreferencesMap.get(userId);
    
    if (!existing) {
      return undefined;
    }
    
    const { userId: _, ...validUpdates } = updates;
    
    const updated: UserPreferences = { 
      ...existing, 
      ...validUpdates,
      updatedAt: new Date()
    };
    
    this.userPreferencesMap.set(userId, updated);
    return updated;
  }

  async getAllCompanions(): Promise<Companion[]> {
    return Array.from(this.companions.values());
  }

  async getCompanion(id: number): Promise<Companion | undefined> {
    return this.companions.get(id);
  }

  async createCompanion(insertCompanion: InsertCompanion): Promise<Companion> {
    const id = this.currentCompanionId++;
    const now = new Date();
    const companion: Companion = { 
      ...insertCompanion, 
      id, 
      createdAt: now, 
      available: insertCompanion.available ?? null,
      isPremium: insertCompanion.isPremium ?? null,
      tier: insertCompanion.tier ?? null,
      features: insertCompanion.features ?? null,
      personality: insertCompanion.personality ?? null,
      voiceType: insertCompanion.voiceType ?? null,
      gender: insertCompanion.gender ?? 'female',
      albumUrls: insertCompanion.albumUrls ?? [insertCompanion.imageUrl]
    };
    this.companions.set(id, companion);
    return companion;
  }

  async updateCompanion(id: number, updates: Partial<InsertCompanion>): Promise<Companion | undefined> {
    const existing = this.companions.get(id);
    
    if (!existing) {
      return undefined;
    }
    
    const updated: Companion = { ...existing, ...updates };
    this.companions.set(id, updated);
    return updated;
  }
  
  // Companion settings methods
  private getSettingsKey(userId: number, companionId: number): string {
    return `${userId}:${companionId}`;
  }
  
  async getCompanionSettings(userId: number, companionId: number): Promise<CompanionSettings | undefined> {
    const key = this.getSettingsKey(userId, companionId);
    return this.companionSettingsMap.get(key);
  }
  
  async createCompanionSettings(settings: InsertCompanionSettings): Promise<CompanionSettings> {
    const id = this.currentSettingsId++;
    const now = new Date();
    const key = this.getSettingsKey(settings.userId, settings.companionId);
    
    const companionSettings: CompanionSettings = {
      ...settings,
      id,
      updatedAt: now,
      personalityTraits: settings.personalityTraits || null,
      relationshipType: settings.relationshipType || 'dating',
      scenario: settings.scenario || null,
      interestTopics: settings.interestTopics || null,
      appearancePreferences: settings.appearancePreferences || null,
      conversationStyle: settings.conversationStyle || 'balanced',
      emotionalResponseLevel: settings.emotionalResponseLevel || 50,
      voiceSettings: settings.voiceSettings || null,
      memoryRetention: settings.memoryRetention || 10
    };
    
    this.companionSettingsMap.set(key, companionSettings);
    return companionSettings;
  }
  
  async updateCompanionSettings(
    userId: number, 
    companionId: number, 
    updates: Partial<InsertCompanionSettings>
  ): Promise<CompanionSettings | undefined> {
    const key = this.getSettingsKey(userId, companionId);
    const existing = this.companionSettingsMap.get(key);
    
    if (!existing) {
      return undefined;
    }
    
    const { userId: _, companionId: __, ...validUpdates } = updates;
    
    const updated: CompanionSettings = { 
      ...existing, 
      ...validUpdates,
      updatedAt: new Date()
    };
    
    this.companionSettingsMap.set(key, updated);
    return updated;
  }
  
  // Interaction methods for heatmap visualization
  async recordInteraction(interaction: InsertInteraction): Promise<Interaction> {
    const id = this.currentInteractionId++;
    const timestamp = new Date();
    
    // Convert the date to a string in YYYY-MM-DD format
    const dateToUse = interaction.date || new Date();
    const dateStr = typeof dateToUse === 'string' ? dateToUse : dateToUse.toISOString().split('T')[0];
    
    const newInteraction: Interaction = {
      ...interaction,
      id,
      timestamp,
      date: dateStr,
      hour: interaction.hour || timestamp.getHours(),
      messageCount: interaction.messageCount || 1,
      emotionType: interaction.emotionType || null,
      emotionIntensity: interaction.emotionIntensity || null,
      responseTimeMs: interaction.responseTimeMs || null,
      userId: interaction.userId || null
    };
    
    this.interactions.set(id, newInteraction);
    return newInteraction;
  }
  
  async getInteractions(
    companionId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<Interaction[]> {
    const allInteractions = Array.from(this.interactions.values());
    
    let filtered = allInteractions.filter(
      interaction => interaction.companionId === companionId
    );
    
    if (startDate) {
      filtered = filtered.filter(
        interaction => new Date(interaction.date) >= startDate
      );
    }
    
    if (endDate) {
      filtered = filtered.filter(
        interaction => new Date(interaction.date) <= endDate
      );
    }
    
    return filtered;
  }
  
  async getInteractionsByHour(companionId: number, date: Date): Promise<Interaction[]> {
    const dateString = date.toISOString().split('T')[0];
    
    return Array.from(this.interactions.values()).filter(
      interaction => 
        interaction.companionId === companionId && 
        interaction.date === dateString
    );
  }
  
  async getInteractionHeatmap(
    companionId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, Record<number, number>>> {
    const interactions = await this.getInteractions(companionId, startDate, endDate);
    const heatmap: Record<string, Record<number, number>> = {};
    
    // Initialize heatmap with all dates and hours
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      heatmap[dateStr] = {};
      
      for (let hour = 0; hour < 24; hour++) {
        heatmap[dateStr][hour] = 0;
      }
    }
    
    // Fill in the interaction counts
    for (const interaction of interactions) {
      const dateStr = interaction.date;
      const hour = interaction.hour;
      const messageCount = interaction.messageCount || 1;
      
      if (heatmap[dateStr] && heatmap[dateStr][hour] !== undefined) {
        heatmap[dateStr][hour] += messageCount;
      }
    }
    
    return heatmap;
  }

  // Personal information operations
  async getUserPersonalInfo(userId: number): Promise<UserPersonalInfo[]> {
    return Array.from(this.personalInfo.values()).filter(
      info => info.userId === userId
    );
  }

  async createUserPersonalInfo(info: InsertUserPersonalInfo): Promise<UserPersonalInfo> {
    const newInfo: UserPersonalInfo = {
      id: this.currentPersonalInfoId++,
      ...info,
      confidence: info.confidence ?? 100,
      extractedFrom: info.extractedFrom ?? null,
      lastMentioned: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.personalInfo.set(newInfo.id, newInfo);
    return newInfo;
  }

  async updateUserPersonalInfo(
    userId: number, 
    category: string, 
    key: string, 
    value: string, 
    confidence?: number
  ): Promise<UserPersonalInfo | undefined> {
    // Find existing entry
    const existing = Array.from(this.personalInfo.values()).find(
      info => info.userId === userId && info.category === category && info.key === key
    );

    if (existing) {
      const updated: UserPersonalInfo = {
        ...existing,
        value,
        confidence: confidence ?? existing.confidence,
        lastMentioned: new Date(),
        updatedAt: new Date(),
      };
      this.personalInfo.set(existing.id, updated);
      return updated;
    }

    // Create new if not found
    return await this.createUserPersonalInfo({
      userId,
      category,
      key,
      value,
      confidence: confidence ?? 100,
    });
  }

  async deleteUserPersonalInfo(userId: number, category: string, key: string): Promise<boolean> {
    const existing = Array.from(this.personalInfo.values()).find(
      info => info.userId === userId && info.category === category && info.key === key
    );

    if (existing) {
      this.personalInfo.delete(existing.id);
      return true;
    }
    return false;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error("Error fetching user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }
  
  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.verificationToken, token));
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        memberSince: new Date(),
        lastLogin: new Date()
      })
      .returning();
    return user;
  }
  
  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const [updated] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, id))
        .returning();
      
      return updated || undefined;
    } catch (error) {
      console.error("Error updating user:", error);
      return undefined;
    }
  }
  
  async setUserPremiumStatus(userId: number, isPremium: boolean, plan?: string, durationMonths: number = 1): Promise<User | undefined> {
    try {
      const user = await this.getUser(userId);
      if (!user) return undefined;
      
      const now = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
      
      const updates: Partial<InsertUser> = {
        isPremium,
        premiumStartDate: isPremium ? now : null,
        premiumExpiryDate: isPremium ? expiryDate : null,
        subscriptionPlan: isPremium ? (plan || 'monthly') : null
      };
      
      return this.updateUser(userId, updates);
    } catch (error) {
      console.error("Error setting premium status:", error);
      return undefined;
    }
  }
  
  async checkPremiumExpiry(userId: number): Promise<{isActive: boolean, expiryDate?: Date}> {
    try {
      const user = await this.getUser(userId);
      if (!user || !user.isPremium || !user.premiumExpiryDate) {
        return { isActive: false };
      }
      
      const now = new Date();
      const expiryDate = new Date(user.premiumExpiryDate);
      const isActive = expiryDate > now;
      
      // If premium is expired, update the user status
      if (!isActive) {
        await this.updateUser(userId, { 
          isPremium: false,
          premiumExpiryDate: null,
          subscriptionPlan: null
        });
      }
      
      return { isActive, expiryDate };
    } catch (error) {
      console.error("Error checking premium expiry:", error);
      return { isActive: false };
    }
  }
  
  async renewPremiumSubscription(userId: number, durationMonths: number): Promise<User | undefined> {
    try {
      const user = await this.getUser(userId);
      if (!user) return undefined;
      
      const now = new Date();
      let expiryDate: Date;
      
      // If user already has an active subscription, extend from current expiry date
      if (user.isPremium && user.premiumExpiryDate && new Date(user.premiumExpiryDate) > now) {
        expiryDate = new Date(user.premiumExpiryDate);
        expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
      } else {
        // Otherwise start a new subscription from today
        expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
      }
      
      const updates: Partial<InsertUser> = {
        isPremium: true,
        premiumStartDate: user.premiumStartDate || now,
        premiumExpiryDate: expiryDate,
        subscriptionPlan: user.subscriptionPlan || (durationMonths === 1 ? 'monthly' : 'yearly')
      };
      
      return this.updateUser(userId, updates);
    } catch (error) {
      console.error("Error renewing premium subscription:", error);
      return undefined;
    }
  }
  
  // User preferences methods
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    try {
      const [preferences] = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId));
        
      return preferences || undefined;
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      return undefined;
    }
  }
  
  async createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    try {
      const [createdPrefs] = await db
        .insert(userPreferences)
        .values({
          ...preferences,
          updatedAt: new Date()
        })
        .returning();
        
      return createdPrefs;
    } catch (error) {
      console.error("Error creating user preferences:", error);
      throw error;
    }
  }
  
  async updateUserPreferences(
    userId: number, 
    updates: Partial<InsertUserPreferences>
  ): Promise<UserPreferences | undefined> {
    try {
      // Remove userId from updates as it's part of the primary key
      const { userId: _, ...validUpdates } = updates;
      
      const [updated] = await db
        .update(userPreferences)
        .set({
          ...validUpdates,
          updatedAt: new Date()
        })
        .where(eq(userPreferences.userId, userId))
        .returning();
      
      return updated || undefined;
    } catch (error) {
      console.error("Error updating user preferences:", error);
      return undefined;
    }
  }

  async getAllCompanions(): Promise<Companion[]> {
    // Explicitly select all columns including gender and albumUrls
    return db.select({
      id: companions.id,
      name: companions.name,
      tagline: companions.tagline,
      description: companions.description,
      imageUrl: companions.imageUrl,
      traits: companions.traits,
      available: companions.available,
      isPremium: companions.isPremium,
      tier: companions.tier,
      features: companions.features,
      personality: companions.personality,
      voiceType: companions.voiceType,
      gender: companions.gender,
      albumUrls: companions.albumUrls,
      createdAt: companions.createdAt
    }).from(companions);
  }

  async getCompanion(id: number): Promise<Companion | undefined> {
    // Explicitly select all columns including gender and albumUrls to ensure they're included
    const [companion] = await db.select({
      id: companions.id,
      name: companions.name,
      tagline: companions.tagline,
      description: companions.description,
      imageUrl: companions.imageUrl,
      traits: companions.traits,
      available: companions.available,
      isPremium: companions.isPremium,
      tier: companions.tier,
      features: companions.features,
      personality: companions.personality,
      voiceType: companions.voiceType,
      gender: companions.gender,
      albumUrls: companions.albumUrls,
      createdAt: companions.createdAt
    })
    .from(companions)
    .where(eq(companions.id, id));
    
    return companion || undefined;
  }

  async createCompanion(insertCompanion: InsertCompanion): Promise<Companion> {
    const [companion] = await db
      .insert(companions)
      .values(insertCompanion)
      .returning();
    return companion;
  }

  async updateCompanion(id: number, updates: Partial<InsertCompanion>): Promise<Companion | undefined> {
    try {
      // Create a sanitized updates object with only valid columns
      const validColumns = [
        'name', 'description', 'tagline', 'imageUrl', 'traits',
        'available', 'isPremium', 'tier', 'features', 'personality',
        'voiceType', 'gender', 'albumUrls'
      ];
      
      const sanitizedUpdates: Record<string, any> = {};
      for (const key in updates) {
        if (validColumns.includes(key)) {
          // Make sure array fields are properly formatted
          if ((key === 'traits' || key === 'features' || key === 'albumUrls') && updates[key] !== null) {
            // Ensure it's always an array
            if (!Array.isArray(updates[key])) {
              sanitizedUpdates[key] = typeof updates[key] === 'string' ? [updates[key]] : [];
            } else {
              sanitizedUpdates[key] = updates[key];
            }
          } else {
            sanitizedUpdates[key] = updates[key];
          }
        }
      }
      
      // Only proceed if there are valid updates
      if (Object.keys(sanitizedUpdates).length === 0) {
        const existing = await this.getCompanion(id);
        return existing;
      }
      
      // If an image URL is updated, also update the album URLs
      if (sanitizedUpdates.imageUrl && (!sanitizedUpdates.albumUrls || sanitizedUpdates.albumUrls.length === 0)) {
        // Get existing companion to check for existing albumUrls
        const existing = await this.getCompanion(id);
        if (existing) {
          if (existing.albumUrls && Array.isArray(existing.albumUrls)) {
            sanitizedUpdates.albumUrls = [...existing.albumUrls, sanitizedUpdates.imageUrl];
          } else {
            sanitizedUpdates.albumUrls = [sanitizedUpdates.imageUrl];
          }
        } else {
          sanitizedUpdates.albumUrls = [sanitizedUpdates.imageUrl];
        }
      }
      
      console.log("Final sanitized updates:", sanitizedUpdates);
      
      const [updated] = await db
        .update(companions)
        .set(sanitizedUpdates)
        .where(eq(companions.id, id))
        .returning();
      return updated || undefined;
    } catch (error) {
      console.error("Error updating companion:", error);
      throw error;
    }
  }
  
  // Companion settings methods
  async getCompanionSettings(userId: number, companionId: number): Promise<CompanionSettings | undefined> {
    try {
      const [settings] = await db
        .select()
        .from(companionSettings)
        .where(
          and(
            eq(companionSettings.userId, userId),
            eq(companionSettings.companionId, companionId)
          )
        );
      return settings || undefined;
    } catch (error) {
      console.error("Error fetching companion settings:", error);
      return undefined;
    }
  }

  async createCompanionSettings(settings: InsertCompanionSettings): Promise<CompanionSettings> {
    const [createdSettings] = await db
      .insert(companionSettings)
      .values(settings)
      .returning();
    return createdSettings;
  }

  async updateCompanionSettings(
    userId: number, 
    companionId: number, 
    updates: Partial<InsertCompanionSettings>
  ): Promise<CompanionSettings | undefined> {
    try {
      // Remove userId and companionId from updates as they are part of the primary key
      const { userId: _, companionId: __, ...validUpdates } = updates;
      
      const [updated] = await db
        .update(companionSettings)
        .set({
          ...validUpdates,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(companionSettings.userId, userId),
            eq(companionSettings.companionId, companionId)
          )
        )
        .returning();
      
      return updated || undefined;
    } catch (error) {
      console.error("Error updating companion settings:", error);
      return undefined;
    }
  }
  
  // Interaction methods for heatmap
  async recordInteraction(interaction: InsertInteraction): Promise<Interaction> {
    try {
      const now = new Date();
      const dateToUse = interaction.date || now.toISOString().split('T')[0];
      
      // Ensure date is a string
      const dateStr = typeof dateToUse === 'string' ? dateToUse : dateToUse.toISOString().split('T')[0];
      
      const [createdInteraction] = await db
        .insert(interactions)
        .values({
          ...interaction,
          date: dateStr,
          hour: interaction.hour || now.getHours(),
        })
        .returning();
        
      return createdInteraction;
    } catch (error) {
      console.error("Error recording interaction:", error);
      throw error;
    }
  }
  
  async getInteractions(
    companionId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<Interaction[]> {
    try {
      let query = db
        .select()
        .from(interactions)
        .where(eq(interactions.companionId, companionId));
        
      if (startDate) {
        query = query.where(
          gte(interactions.date, startDate.toISOString().split('T')[0])
        );
      }
      
      if (endDate) {
        query = query.where(
          lte(interactions.date, endDate.toISOString().split('T')[0])
        );
      }
      
      return await query;
    } catch (error) {
      console.error("Error fetching interactions:", error);
      return [];
    }
  }
  
  async getInteractionsByHour(companionId: number, date: Date): Promise<Interaction[]> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      const result = await db
        .select()
        .from(interactions)
        .where(
          and(
            eq(interactions.companionId, companionId),
            eq(interactions.date, dateStr)
          )
        );
        
      return result;
    } catch (error) {
      console.error("Error fetching interactions by hour:", error);
      return [];
    }
  }
  
  async getInteractionHeatmap(
    companionId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, Record<number, number>>> {
    try {
      const interactionData = await this.getInteractions(companionId, startDate, endDate);
      const heatmap: Record<string, Record<number, number>> = {};
      
      // Initialize the heatmap with dates and hours
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        heatmap[dateStr] = {};
        
        for (let hour = 0; hour < 24; hour++) {
          heatmap[dateStr][hour] = 0;
        }
      }
      
      // Fill in the interaction counts
      for (const interaction of interactionData) {
        // Ensure we have a string date
        const dateStr = typeof interaction.date === 'string' ? 
          interaction.date : 
          (interaction.date as any).toISOString?.().split('T')[0] || interaction.date;
        
        const hour = interaction.hour;
        const messageCount = interaction.messageCount || 1;
        
        if (heatmap[dateStr] && heatmap[dateStr][hour] !== undefined) {
          heatmap[dateStr][hour] += messageCount;
        }
      }
      
      return heatmap;
    } catch (error) {
      console.error("Error generating interaction heatmap:", error);
      return {};
    }
  }
}

// Use DatabaseStorage for persistent data storage
export const storage = new DatabaseStorage();
