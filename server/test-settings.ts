import { storage } from './storage';
import { companionService } from './services/companionService';

// Test script to demonstrate how different settings affect AI responses
async function testSettingsImpact() {
  console.log('\n=== Testing AI Response Adaptation to User Settings ===\n');
  
  const testMessage = "I'm feeling a bit lonely tonight";
  const companionId = 1; // Sophia
  const testUserId = 999; // Test user ID
  
  // Test 1: Default settings (romantic partner)
  console.log('1. DEFAULT SETTINGS (romantic partner):');
  try {
    const defaultResponse = await companionService.processMessage({
      message: testMessage,
      companionId,
      userId: testUserId,
      sessionId: 'test_default'
    });
    console.log(`Response: ${defaultResponse.text}\n`);
  } catch (error) {
    console.log(`Error: ${error}\n`);
  }
  
  // Test 2: Friends with benefits
  console.log('2. FRIENDS WITH BENEFITS:');
  try {
    // Create custom settings for friends with benefits
    await storage.createCompanionSettings({
      userId: testUserId + 1,
      companionId,
      relationshipStatus: 'friends with benefits',
      personalityTraits: ['playful', 'casual', 'flirty'],
      communicationStyle: 'casual',
      preferredTopics: ['fun', 'activities']
    });
    
    const fwbResponse = await companionService.processMessage({
      message: testMessage,
      companionId,
      userId: testUserId + 1,
      sessionId: 'test_fwb'
    });
    console.log(`Response: ${fwbResponse.text}\n`);
  } catch (error) {
    console.log(`Error: ${error}\n`);
  }
  
  // Test 3: Caring and funny personality
  console.log('3. CARING & FUNNY PERSONALITY:');
  try {
    await storage.createCompanionSettings({
      userId: testUserId + 2,
      companionId,
      relationshipStatus: 'boyfriend/girlfriend',
      personalityTraits: ['caring', 'funny', 'supportive'],
      communicationStyle: 'warm',
      preferredTopics: ['humor', 'daily life']
    });
    
    const caringResponse = await companionService.processMessage({
      message: testMessage,
      companionId,
      userId: testUserId + 2,
      sessionId: 'test_caring'
    });
    console.log(`Response: ${caringResponse.text}\n`);
  } catch (error) {
    console.log(`Error: ${error}\n`);
  }
  
  // Test 4: Adventurous and intellectual
  console.log('4. ADVENTUROUS & INTELLECTUAL:');
  try {
    await storage.createCompanionSettings({
      userId: testUserId + 3,
      companionId,
      relationshipStatus: 'dating',
      personalityTraits: ['adventurous', 'intellectual', 'curious'],
      communicationStyle: 'engaging',
      preferredTopics: ['travel', 'books', 'ideas']
    });
    
    const adventurousResponse = await companionService.processMessage({
      message: testMessage,
      companionId,
      userId: testUserId + 3,
      sessionId: 'test_adventurous'
    });
    console.log(`Response: ${adventurousResponse.text}\n`);
  } catch (error) {
    console.log(`Error: ${error}\n`);
  }
  
  console.log('=== Settings Impact Test Complete ===\n');
}

// Export for manual testing
export { testSettingsImpact };