import Anthropic from '@anthropic-ai/sdk';
import { storage } from '../storage';
import type { InsertUserPersonalInfo } from '@shared/schema';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface ExtractedInfo {
  category: string;
  key: string;
  value: string;
  confidence: number;
}

export class PersonalInfoService {
  /**
   * Extract personal information from user message using AI
   */
  async extractPersonalInfo(message: string, userId: number): Promise<ExtractedInfo[]> {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514', // the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Analyze this message and extract any personal information about the user. Look for:

Personal Details:
- Name, age, birthday, zodiac sign
- Physical appearance, height, weight
- Family information, relationship status

Location & Background:
- City, country, nationality
- Home address or area they live in
- Places they've lived or visited

Work & Education:
- Job, occupation, profession
- Company, workplace
- Education level, school, university
- Income or financial status

Preferences & Interests:
- Sexual orientation, relationship preferences
- Hobbies, interests, activities
- Food preferences, dietary restrictions
- Music, movies, books they like
- Political views, religious beliefs

Message to analyze: "${message}"

Return ONLY a JSON array of objects with this format:
[
  {
    "category": "personal|location|work|preferences|relationships",
    "key": "descriptive_key_name",
    "value": "extracted_value",
    "confidence": 85
  }
]

If no personal information is found, return an empty array [].
Be conservative - only extract clear, explicit information. Don't make assumptions.`
        }],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return [];
      }

      try {
        const extracted = JSON.parse(content.text);
        return Array.isArray(extracted) ? extracted : [];
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Error extracting personal info:', error);
      return [];
    }
  }

  /**
   * Store extracted personal information for a user
   */
  async storePersonalInfo(
    userId: number, 
    extractedInfo: ExtractedInfo[], 
    conversationContext?: string
  ): Promise<void> {
    for (const info of extractedInfo) {
      try {
        await storage.updateUserPersonalInfo(
          userId,
          info.category,
          info.key,
          info.value,
          info.confidence
        );
        
        console.log(`Stored personal info for user ${userId}: ${info.category}.${info.key} = ${info.value} (${info.confidence}% confidence)`);
      } catch (error) {
        console.error(`Failed to store personal info for user ${userId}:`, error);
      }
    }
  }

  /**
   * Get formatted personal context for AI conversations
   */
  async getPersonalContext(userId: number): Promise<string> {
    try {
      const personalInfo = await storage.getUserPersonalInfo(userId);
      
      if (personalInfo.length === 0) {
        return '';
      }

      const grouped: Record<string, Record<string, string>> = {};
      
      // Group by category
      for (const info of personalInfo) {
        if (!grouped[info.category]) {
          grouped[info.category] = {};
        }
        grouped[info.category][info.key] = info.value;
      }

      // Format for AI context
      const contextParts: string[] = [];
      
      for (const [category, details] of Object.entries(grouped)) {
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        const detailsList = Object.entries(details)
          .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
          .join(', ');
        
        contextParts.push(`${categoryName}: ${detailsList}`);
      }

      return contextParts.length > 0 
        ? `User's personal information: ${contextParts.join('; ')}.`
        : '';
    } catch (error) {
      console.error('Error getting personal context:', error);
      return '';
    }
  }

  /**
   * Process a message and extract/store personal information if user is premium
   */
  async processMessage(message: string, userId: number, isPremium: boolean): Promise<string> {
    if (!isPremium) {
      return '';
    }

    const extractedInfo = await this.extractPersonalInfo(message, userId);
    
    if (extractedInfo.length > 0) {
      await this.storePersonalInfo(userId, extractedInfo, message);
    }

    return await this.getPersonalContext(userId);
  }
}

export const personalInfoService = new PersonalInfoService();