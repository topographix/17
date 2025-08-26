import type { Companion } from "@shared/schema";

// Free image generation service using Pollinations API
class ImageService {
  private readonly baseUrl = "https://image.pollinations.ai/prompt/";
  
  async generateImage(prompt: string, companion?: Companion): Promise<{ imageUrl: string; cost: number }> {
    try {
      // Build character-consistent prompt for companion
      let enhancedPrompt = prompt;
      
      if (companion) {
        // Character-specific features for consistency
        const genderDesc = companion.gender === 'male' ? 'handsome man' : 'beautiful woman';
        const personalityDesc = companion.personality ? `, ${companion.personality} personality` : '';
        
        // Add companion name as character seed for consistency
        const nameHash = this.generateNameSeed(companion.name);
        
        // Build detailed character description
        const characterDetails = [
          genderDesc,
          personalityDesc,
          companion.traits && companion.traits.length > 0 ? `, ${companion.traits.slice(0, 3).join(', ')} traits` : '',
          `, consistent character design`,
          `, detailed facial features`,
          `, high quality portrait`
        ].filter(Boolean).join('');
        
        enhancedPrompt = `${characterDetails}, ${prompt}, realistic, cinematic lighting, professional quality`;
      }
      
      // Clean and encode the prompt
      const cleanPrompt = enhancedPrompt
        .replace(/[^a-zA-Z0-9\s,.-]/g, '') // Remove special characters
        .trim()
        .replace(/\s+/g, '%20'); // URL encode spaces
      
      // Use companion name for consistent seed if available
      const seed = companion ? this.generateNameSeed(companion.name) : Date.now();
      
      // Generate image URL using Pollinations (free service)
      const imageUrl = `${this.baseUrl}${cleanPrompt}?width=512&height=512&model=flux&seed=${seed}`;
      
      return {
        imageUrl,
        cost: 5 // 5 diamonds for premium users
      };
    } catch (error) {
      console.error('Image generation error:', error);
      throw new Error('Failed to generate image');
    }
  }

  private generateNameSeed(name: string): number {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      return response.ok && contentType !== null && contentType.startsWith('image/');
    } catch {
      return false;
    }
  }
}

export const imageService = new ImageService();