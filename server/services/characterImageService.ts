import { storage } from '../storage';
import { Companion } from '@shared/schema';

interface ImageGenerationParams {
  name: string;
  description: string;
  traits: string[];
  gender: string;
  style?: string;
}

export class CharacterImageService {
  private readonly baseUrl = 'https://image.pollinations.ai/prompt/';
  
  /**
   * Generate a character-consistent portrait for a companion
   */
  async generateCharacterPortrait(companion: Companion): Promise<string> {
    try {
      const prompt = this.buildCharacterPrompt(companion);
      const encodedPrompt = encodeURIComponent(prompt);
      
      // Add parameters for consistency and quality
      const imageUrl = `${this.baseUrl}${encodedPrompt}?width=512&height=512&seed=${this.generateSeed(companion.name)}&model=flux&enhance=true`;
      
      console.log(`Generated character image for ${companion.name}: ${imageUrl}`);
      return imageUrl;
    } catch (error) {
      console.error(`Failed to generate image for ${companion.name}:`, error);
      throw new Error(`Image generation failed for ${companion.name}`);
    }
  }

  /**
   * Build a detailed prompt for character consistency
   */
  private buildCharacterPrompt(companion: Companion): string {
    const basePrompt = `Professional portrait of ${companion.name}, ${companion.description}`;
    
    // Add personality traits to the prompt
    const traitsText = companion.traits && companion.traits.length > 0 
      ? `, ${companion.traits.join(', ')} personality` 
      : '';
    
    // Add gender-specific styling
    const genderStyle = companion.gender === 'male' 
      ? ', handsome masculine features' 
      : ', beautiful feminine features';
    
    // Add photography style for consistency
    const styleElements = [
      'professional headshot',
      'soft lighting',
      'neutral background',
      'high quality',
      'detailed facial features',
      'realistic',
      'cinematic lighting'
    ].join(', ');
    
    return `${basePrompt}${traitsText}${genderStyle}, ${styleElements}`;
  }

  /**
   * Generate a consistent seed based on companion name for reproducible results
   */
  private generateSeed(name: string): number {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Generate images for all companions and update their imageUrl
   */
  async generateAllCompanionImages(): Promise<void> {
    console.log('Starting character image generation for all companions...');
    
    try {
      const companions = await storage.getAllCompanions();
      console.log(`Found ${companions.length} companions to generate images for`);
      
      for (const companion of companions) {
        try {
          console.log(`Generating image for ${companion.name}...`);
          const imageUrl = await this.generateCharacterPortrait(companion);
          
          // Update the companion with the new image URL
          await storage.updateCompanion(companion.id, { imageUrl });
          console.log(`✓ Updated ${companion.name} with new character image`);
          
          // Add a small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to generate image for ${companion.name}:`, error);
        }
      }
      
      console.log('Completed character image generation for all companions');
    } catch (error) {
      console.error('Failed to generate companion images:', error);
      throw error;
    }
  }

  /**
   * Generate a character image for a specific companion by ID
   */
  async generateImageForCompanion(companionId: number): Promise<string> {
    const companion = await storage.getCompanion(companionId);
    if (!companion) {
      throw new Error(`Companion with ID ${companionId} not found`);
    }
    
    const imageUrl = await this.generateCharacterPortrait(companion);
    await storage.updateCompanion(companionId, { imageUrl });
    
    return imageUrl;
  }
}

export const characterImageService = new CharacterImageService();