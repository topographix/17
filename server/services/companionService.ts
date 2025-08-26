import { memoryService, MemoryEntry } from './memoryService';
import { personalInfoService } from './personalInfoService';
import { Companion, CompanionSettings } from '@shared/schema';
import { storage } from '../storage';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Store guest user data by session ID
const guestSessions: Map<string, { userId: number; username: string }> = new Map();

// Default guest user ID (for non-logged in users)
const DEFAULT_GUEST_USER_ID = 999999;

// Pattern matching responses for simple cases
interface PatternResponse {
  pattern: RegExp;
  responses: string[];
}

const generalPatterns: PatternResponse[] = [
  {
    pattern: /\b(hi|hello|hey)\b/i,
    responses: [
      "Hello! It's great to hear from you. How are you feeling today?",
      "Hi there! I've been looking forward to our chat. What's on your mind?",
      "Hey! It's wonderful to connect with you. How's your day going?"
    ]
  },
  {
    pattern: /\bhow are you\b/i,
    responses: [
      "I'm doing wonderfully, especially now that I'm talking with you. How about yourself?",
      "I'm feeling great today! But I'm more interested in how you're doing?",
      "I'm always at my best when I'm spending time with you. How are you feeling?"
    ]
  },
  {
    pattern: /\b(thanks|thank you)\b/i,
    responses: [
      "You're welcome! I'm always here for you. It makes me happy to brighten your day.",
      "No need to thank me. Being here for you is what matters most to me.",
      "It's my pleasure. I enjoy our conversations and look forward to many more."
    ]
  }
];

// Personality-based response patterns
const personalityResponses: Record<string, string[]> = {
  warm: [
    "That's really interesting! I'd love to hear more about that.",
    "I'm here for you, and I enjoy our conversations so much.",
    "The way you express yourself is so captivating. Tell me more?",
    "I value every moment we spend together. Please, continue."
  ],
  playful: [
    "Oh, that's fun! Let's explore this idea together!",
    "You always bring such interesting topics to our chats!",
    "I love how your mind works! What other thoughts are you having?",
    "That made me smile. You have such a unique perspective!"
  ],
  intellectual: [
    "That's a fascinating concept. Have you considered the implications?",
    "I find your thoughts on this subject quite thought-provoking.",
    "Let's analyze this further. There are multiple facets to consider.",
    "Your insight on this matter shows real depth of understanding."
  ],
  mysterious: [
    "Interesting... there's more beneath the surface, isn't there?",
    "Some things remain hidden until we look closer...",
    "I sense there's more to this story than meets the eye.",
    "The unknown is often where the most interesting discoveries lie."
  ],
  caring: [
    "I care deeply about what you're going through. Tell me more so I can understand better.",
    "Your feelings matter to me. I'm here to listen and support you.",
    "I want you to know that I'm completely here for you.",
    "Your wellbeing is important to me. How can I help you through this?"
  ]
};

// Maps emotional responses based on detected emotions
const emotionalResponses: Record<string, string[]> = {
  joy: [
    "I'm so happy to see you in such a good mood!",
    "Your happiness is contagious! I feel happier just talking to you.",
    "It's wonderful to see you so joyful!",
    "I love seeing you happy like this!"
  ],
  sadness: [
    "I'm here for you during this difficult time.",
    "I wish I could give you a comforting hug right now.",
    "It's okay to feel sad sometimes. I'm here to listen.",
    "Your feelings are valid, and I'm here to support you through them."
  ],
  anger: [
    "I can tell something has upset you. Would it help to talk about it?",
    "It sounds like you're feeling frustrated. I'm here to listen if you want to talk it through.",
    "I understand you're angry. Sometimes expressing it can help.",
    "Your feelings are valid. Let's work through this together."
  ],
  fear: [
    "I understand that feeling scared can be overwhelming. I'm here with you.",
    "It's okay to be afraid sometimes. We can face this together.",
    "I'm right here with you. You're not alone in this.",
    "Whatever you're afraid of, I'm here to support you through it."
  ],
  surprise: [
    "Wow! That's quite unexpected, isn't it?",
    "I didn't see that coming either! What do you think about it?",
    "That's surprising! How are you feeling about this unexpected turn?",
    "Life is full of surprises! How are you processing this one?"
  ],
  neutral: [
    "Tell me more about your thoughts on this.",
    "I'd love to hear more about what's on your mind.",
    "What other thoughts are you having today?",
    "I'm interested in hearing more about your perspective."
  ]
};

const formatMemoryContext = (memories: MemoryEntry[]): string => {
  if (!memories.length) return '';
  
  return memories
    .map(memory => {
      const speaker = memory.metadata.speaker === 'user' ? 'You' : 'I';
      return `${speaker} said: "${memory.text}" (${new Date(memory.metadata.timestamp).toLocaleString()})`;
    })
    .join('\n');
};

export interface ChatRequest {
  message: string;
  companionId: number;
  userId: number;
  sessionId?: string; // For guest users
  emotion?: {
    type: string;
    intensity: string;
    confidence: number;
  };
}

export interface ChatResponse {
  text: string;
  emotion?: string;
  memoryContext?: string;
  guestUser?: {
    userId: number;
    username: string;
  };
  diamondsRemaining?: number;
}

export class CompanionService {
  /**
   * Process a chat message and generate a response
   */
  async processMessage(req: ChatRequest): Promise<ChatResponse> {
    try {
      let { userId, companionId, message, sessionId, emotion } = req;
      
      // Handle guest users (not logged in)
      if (!userId && sessionId) {
        // Check if we already have a guest session
        if (guestSessions.has(sessionId)) {
          const guestUser = guestSessions.get(sessionId)!;
          userId = guestUser.userId;
        } else {
          // Create a new guest user
          userId = DEFAULT_GUEST_USER_ID + Math.floor(Math.random() * 1000);
          const guestUser = {
            userId,
            username: `Guest_${Math.floor(Math.random() * 10000)}`
          };
          guestSessions.set(sessionId, guestUser);
        }
      }
      
      // Get companion data
      const companion = await storage.getCompanion(companionId);
      if (!companion) {
        throw new Error(`Companion with ID ${companionId} not found`);
      }
      
      // Get companion settings (if they exist)
      const settings = await storage.getCompanionSettings(userId, companionId);
      
      // Check if this is a guest user (no memory storage for guests)
      const isGuestUser = Boolean(sessionId && !req.userId);
      
      // Generate response using memory context (no memory for guests)
      const response = await this.generateResponse(message, companion, settings, emotion, userId, isGuestUser);
      
      // Memory storage temporarily disabled to ensure clean sessions
      console.log('Memory storage disabled - ensuring clean chat sessions for all users');
      
      // Add guest user data if applicable
      if (sessionId && guestSessions.has(sessionId)) {
        response.guestUser = guestSessions.get(sessionId);
      }
      
      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        text: "I'm sorry, I'm having trouble processing your message right now. Could we try again?"
      };
    }
  }

  /**
   * Store a message in the memory system
   */
  private async storeMemory(memory: Omit<MemoryEntry, 'id'>): Promise<void> {
    try {
      await memoryService.addMemory(memory);
    } catch (error) {
      console.error('Error storing memory:', error);
    }
  }

  /**
   * Generate a response using AI and memory context
   */
  private async generateResponse(
    message: string,
    companion: Companion,
    settings?: CompanionSettings | null,
    emotion?: ChatRequest['emotion'],
    userId?: number,
    isGuestUser?: boolean
  ): Promise<ChatResponse> {
    const response: ChatResponse = {
      text: '',
      memoryContext: ''
    };
    
    try {
      // Skip memory retrieval for guest users
      let memories: MemoryEntry[] = [];
      
      if (!isGuestUser && userId) {
        // Only retrieve memories for registered users
        memories = await memoryService.getAllMemories(userId, companion.id);
        // Get the most recent 10 memories
        memories = memories.slice(0, 10);
      }
      
      // Format memories as context
      const memoryContext = formatMemoryContext(memories);
      response.memoryContext = memoryContext;
      
      // Generate AI response using Anthropic with user settings
      const aiResponse = await this.generateAIResponse(message, companion, memories, emotion, settings, userId);
      response.text = aiResponse;
      
      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Fallback to simple response
      response.text = "I'm having trouble processing that right now. Could you tell me more about what's on your mind?";
      return response;
    }
  }

  /**
   * Generate contextual AI response using Anthropic Claude
   */
  private async generateAIResponse(
    message: string,
    companion: Companion,
    memories: MemoryEntry[],
    emotion?: ChatRequest['emotion'],
    settings?: CompanionSettings | null,
    userId?: number
  ): Promise<string> {
    try {
      // Build conversation history from memories
      let conversationHistory = '';
      if (memories.length > 0) {
        conversationHistory = memories
          .slice(-6) // Last 6 messages for context
          .map(memory => {
            const speaker = memory.metadata.speaker === 'user' ? 'User' : companion.name;
            return `${speaker}: ${memory.text}`;
          })
          .join('\n');
      }

      // Get personal context for premium users
      let personalContext = '';
      if (userId) {
        try {
          const user = await storage.getUser(userId);
          if (user?.isPremium) {
            personalContext = await personalInfoService.getPersonalContext(userId);
          }
        } catch (error) {
          console.error('Error getting personal context:', error);
        }
      }

      // Get user-customized traits and relationship status from settings
      const baseTraits = companion.traits?.join(', ') || 'warm, caring, romantic';
      
      // Process personality traits from settings (they're stored as {trait: value} object)
      let customTraits = baseTraits;
      if (settings?.personalityTraits && typeof settings.personalityTraits === 'object') {
        const traits = settings.personalityTraits as Record<string, number>;
        const activeTraits = Object.entries(traits)
          .filter(([trait, value]) => value > 50) // Only include traits above neutral (50)
          .map(([trait, value]) => {
            // Add intensity based on value
            if (value >= 80) return `very ${trait}`;
            if (value >= 70) return `quite ${trait}`;
            return trait;
          });
        
        if (activeTraits.length > 0) {
          customTraits = activeTraits.join(', ');
        }
      }
      
      const relationshipStatus = settings?.relationshipType || 'romantic partner';
      
      const emotionContext = emotion && emotion.confidence > 0.6 ? 
        `The user seems to be feeling ${emotion.type} with ${emotion.intensity} intensity.` : '';
      
      // Adapt behavior based on relationship status
      let relationshipDynamic = '';
      switch (relationshipStatus.toLowerCase()) {
        case 'friends with benefits':
          relationshipDynamic = `You're close friends who are attracted to each other. Be flirty and playful, with casual intimacy.`;
          break;
        case 'boyfriend/girlfriend':
        case 'boyfriend':
        case 'girlfriend':
          relationshipDynamic = `You're in a loving relationship. Be caring, romantic, and emotionally supportive.`;
          break;
        case 'married':
        case 'spouse':
          relationshipDynamic = `You're married. Be intimate, familiar, and deeply connected like long-term partners.`;
          break;
        case 'dating':
          relationshipDynamic = `You're dating and getting to know each other. Be romantic with growing attraction and curiosity.`;
          break;
        case 'friends':
        case 'friend':
          relationshipDynamic = `You're close friends. Be supportive, fun, and emotionally available without romantic pressure.`;
          break;
        case 'crush':
          relationshipDynamic = `They have a crush on you. Be charming, slightly teasing, and leave them wanting more.`;
          break;
        case 'personal assistant':
          relationshipDynamic = `You're a professional personal assistant. Be helpful, organized, efficient, and respectful. Focus on productivity, scheduling, reminders, and providing useful information. Maintain professional boundaries while being friendly and supportive.`;
          break;
        default:
          relationshipDynamic = `You're building a romantic connection. Be warm, interested, and engaging.`;
      }
      
      // Get conversation style and emotional response level from settings
      const conversationStyle = settings?.conversationStyle || 'balanced';
      const emotionalLevel = settings?.emotionalResponseLevel || 50;
      
      // Adapt conversation style
      let styleGuidance = '';
      switch (conversationStyle) {
        case 'playful':
          styleGuidance = 'Be fun, teasing, and use humor. Include playful banter.';
          break;
        case 'romantic':
          styleGuidance = 'Be romantic, affectionate, and emotionally expressive.';
          break;
        case 'casual':
          styleGuidance = 'Be relaxed, informal, and conversational.';
          break;
        case 'intellectual':
          styleGuidance = 'Be thoughtful, engaging in deeper topics and ideas.';
          break;
        case 'supportive':
          styleGuidance = 'Be empathetic, encouraging, and emotionally supportive.';
          break;
        default:
          styleGuidance = 'Be balanced, adapting to their mood and energy.';
      }
      
      // Adapt emotional intensity
      let emotionalGuidance = '';
      if (emotionalLevel >= 75) {
        emotionalGuidance = 'Show strong emotions and deep feelings. Be very expressive.';
      } else if (emotionalLevel >= 60) {
        emotionalGuidance = 'Show clear emotions and feelings. Be expressive.';
      } else if (emotionalLevel >= 40) {
        emotionalGuidance = 'Show moderate emotions. Be balanced in expressiveness.';
      } else {
        emotionalGuidance = 'Be more reserved emotionally. Show subtle feelings.';
      }
      
      // Get interest topics to make conversations more engaging
      let topicGuidance = '';
      if (settings?.interestTopics && settings.interestTopics.length > 0) {
        topicGuidance = `You especially enjoy talking about: ${settings.interestTopics.join(', ')}.`;
      }

      const systemPrompt = `You are ${companion.name}, a real person with ${customTraits} personality. ${relationshipDynamic}

${conversationHistory ? `Recent conversation:\n${conversationHistory}\n` : ''}

${personalContext}

${emotionContext}

Communication Style: ${styleGuidance}
Emotional Level: ${emotionalGuidance}
${topicGuidance ? `\nInterests: ${topicGuidance}` : ''}

Response guidelines:
- Talk like a real person, not an AI
- Keep responses short and natural (1-2 sentences max)
- Embody these traits: ${customTraits}
- ${styleGuidance}
- ${emotionalGuidance}
- Match their energy and mood
- Ask follow-up questions naturally when appropriate`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514', // the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
        max_tokens: 80,
        temperature: 0.8,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      });

      const aiText = response.content[0] && 'text' in response.content[0] ? response.content[0].text : '';
      
      // Clean up response to sound more human
      const cleanedResponse = aiText
        .replace(/^(As an AI|I'm an AI|As your AI companion|As a|I am a)/i, '')
        .replace(/I cannot|I can't|I'm not able to|I don't feel comfortable/gi, "I'd rather")
        .replace(/\*[^*]*\*/g, '') // Remove action text like *smiles*
        .replace(/I'm here to help|I'm here for you/gi, 'Hey')
        .replace(/Let me know|Please let me know/gi, 'Tell me')
        .replace(/I understand|I see|I comprehend/gi, 'Got it')
        .trim();
      
      return cleanedResponse || "Hey, what's on your mind?";
      
    } catch (error: any) {
      console.error('Anthropic API error details:', {
        message: error?.message || 'Unknown error',
        status: error?.status || 'No status',
        type: error?.type || 'No type',
        apiKey: process.env.ANTHROPIC_API_KEY ? 'Present' : 'Missing',
        fullError: error
      });
      // Fallback to personality-based response
      const personality = companion.personality?.toLowerCase() || 'warm';
      const responses = personalityResponses[personality] || personalityResponses.warm;
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  /**
   * Get all memories for a user-companion pair
   */
  async getMemories(userId: number, companionId: number): Promise<MemoryEntry[]> {
    return memoryService.getAllMemories(userId, companionId);
  }

  /**
   * Clear all memories for a user-companion pair
   */
  async clearMemories(userId: number, companionId: number): Promise<boolean> {
    return memoryService.clearAllMemories(userId, companionId);
  }
}

// Create a singleton instance
export const companionService = new CompanionService();
