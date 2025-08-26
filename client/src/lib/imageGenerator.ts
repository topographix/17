import type { Companion } from "@shared/schema";

// Define character attributes for consistent image generation
interface CharacterAttributes {
  hairColor: string;
  skinTone: string;
  eyeColor: string;
  lipColor: string;
  bodyShape: 'slim' | 'athletic' | 'curvy';
  facialFeatures: string;
  style: string;
}

// Map companion IDs to consistent character attributes
const characterAttributesMap: Record<number, CharacterAttributes> = {
  1: { // Sophia
    hairColor: '#8B4513', // brown
    skinTone: '#F5DEB3', // wheat
    eyeColor: '#1E90FF', // blue
    lipColor: '#FF69B4', // pink
    bodyShape: 'curvy',
    facialFeatures: 'heart-shaped face, high cheekbones',
    style: 'romantic, elegant'
  },
  2: { // Jackson
    hairColor: '#000000', // black
    skinTone: '#D2B48C', // tan
    eyeColor: '#8B4513', // brown
    lipColor: '#CD5C5C', // indian red
    bodyShape: 'athletic',
    facialFeatures: 'strong jawline, defined features',
    style: 'confident, modern'
  },
  3: { // Emma
    hairColor: '#FFD700', // gold/blonde
    skinTone: '#FFDAB9', // peachpuff
    eyeColor: '#008000', // green
    lipColor: '#FF1493', // deep pink
    bodyShape: 'slim',
    facialFeatures: 'delicate features, dimples',
    style: 'playful, cute'
  },
  // Add more characters as needed...
};

// Default attributes for companions not in the map
const defaultAttributes: CharacterAttributes = {
  hairColor: '#A52A2A', // brown
  skinTone: '#F5DEB3', // wheat
  eyeColor: '#4682B4', // steelblue
  lipColor: '#DB7093', // palevioletred
  bodyShape: 'slim',
  facialFeatures: 'balanced features',
  style: 'casual, friendly'
};

// Get consistent attributes for a companion
export function getCharacterAttributes(companionId: number): CharacterAttributes {
  // Make sure to use a consistent attribute set based on the companion ID
  // or generate a deterministic one if not found
  if (characterAttributesMap[companionId]) {
    return characterAttributesMap[companionId];
  } else {
    // Create deterministic attributes based on companion ID
    // This ensures consistency for companions not in our map
    const seed = companionId % 10; // Simple deterministic seed
    
    // Create variations based on the seed
    const hairColors = ['#8B4513', '#000000', '#FFD700', '#A52A2A', '#D2691E', '#CD853F', '#800000', '#4B0082', '#FF4500', '#C71585'];
    const skinTones = ['#F5DEB3', '#FFDAB9', '#FFF8DC', '#FFE4C4', '#D2B48C', '#BC8F8F', '#F0E68C', '#EEE8AA', '#FAEBD7', '#FFE4B5'];
    const eyeColors = ['#1E90FF', '#8B4513', '#008000', '#4682B4', '#663399', '#2E8B57', '#800000', '#008080', '#4B0082', '#FF1493'];
    const lipColors = ['#FF69B4', '#CD5C5C', '#FF1493', '#DB7093', '#FA8072', '#E9967A', '#FFC0CB', '#DDA0DD', '#FF00FF', '#C71585'];
    const bodyShapes: Array<'slim' | 'athletic' | 'curvy'> = ['slim', 'athletic', 'curvy', 'slim', 'athletic', 'curvy', 'slim', 'athletic', 'curvy', 'slim'];
    
    return {
      hairColor: hairColors[seed],
      skinTone: skinTones[seed],
      eyeColor: eyeColors[seed],
      lipColor: lipColors[seed],
      bodyShape: bodyShapes[seed],
      facialFeatures: 'balanced features',
      style: 'personalized style'
    };
  }
}

// Generate a consistent avatar SVG
export function generateAvatarSvg(companion: Companion | undefined): string {
  if (!companion) return generateDefaultAvatar();
  
  const attributes = getCharacterAttributes(companion.id);
  const { skinTone, hairColor, eyeColor } = attributes;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="90" fill="${skinTone}" />
    <circle cx="65" cy="85" r="10" fill="white" />
    <circle cx="65" cy="85" r="5" fill="${eyeColor}" />
    <circle cx="135" cy="85" r="10" fill="white" />
    <circle cx="135" cy="85" r="5" fill="${eyeColor}" />
    <path d="M75,120 Q100,140 125,120" fill="none" stroke="#000000" stroke-width="2" />
    <path d="M50,60 Q100,30 150,60" fill="${hairColor}" />
    <path d="M30,100 Q50,20 100,30 Q150,20 170,100" fill="${hairColor}" />
  </svg>`;
}

// Generate a default avatar
function generateDefaultAvatar(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="90" fill="#F5DEB3" />
    <circle cx="65" cy="85" r="10" fill="white" />
    <circle cx="65" cy="85" r="5" fill="#4682B4" />
    <circle cx="135" cy="85" r="10" fill="white" />
    <circle cx="135" cy="85" r="5" fill="#4682B4" />
    <path d="M75,120 Q100,140 125,120" fill="none" stroke="#000000" stroke-width="2" />
  </svg>`;
}

// Define scene types for image generation
export type SceneType = 'portrait' | 'romantic' | 'casual' | 'fantasy';

// Generate a character image based on scene type
export function generateCharacterImage(
  companion: Companion | undefined, 
  sceneType: SceneType = 'portrait',
  prompt?: string
): string {
  if (!companion) return generateDefaultAvatar();
  
  const attributes = getCharacterAttributes(companion.id);
  const { skinTone, hairColor, eyeColor, lipColor, bodyShape, style } = attributes;
  
  // Match scene colors with the companion's style
  const isDark = companion.personality === 'mysterious' || companion.personality === 'intense';
  const isRomantic = companion.personality === 'warm' || companion.personality === 'passionate';
  
  const backgroundColors = {
    portrait: isDark ? '#2F4F4F' : '#F0F8FF',
    romantic: isRomantic ? '#FFE4E1' : '#E6E6FA',
    casual: '#F5F5DC',
    fantasy: '#E6E6FA'
  };
  
  const backgroundColor = backgroundColors[sceneType];
  
  // Generate a character image SVG based on scene type
  switch (sceneType) {
    case 'portrait':
      // Determine gender-specific visualization
      const isMale = companion.gender === 'male';
      
      // Create different hair styles based on gender
      const hairStyle = isMale 
        ? `<path d="M130,100 Q200,70 270,100" fill="${hairColor}" />
           <path d="M120,140 Q150,60 200,70 Q250,60 280,140" fill="${hairColor}" />`
        : `<path d="M130,100 Q200,50 270,100" fill="${hairColor}" />
           <path d="M100,180 Q150,30 200,60 Q250,30 300,180" fill="${hairColor}" />`;
      
      // Create different facial features based on gender
      const faceFeatures = isMale
        ? `<path d="M170,200 Q200,215 230,200" fill="none" stroke="${lipColor}" stroke-width="3" />
           <path d="M160,130 Q180,110 200,130" fill="none" stroke="#000" stroke-width="1.5" />
           <path d="M200,130 Q220,110 240,130" fill="none" stroke="#000" stroke-width="1.5" />`
        : `<path d="M170,200 Q200,222 230,200" fill="none" stroke="${lipColor}" stroke-width="4" />
           <path d="M140,90 Q170,80 180,90" fill="none" stroke="#000" stroke-width="1" />
           <path d="M220,90 Q230,80 260,90" fill="none" stroke="#000" stroke-width="1" />`;
      
      // Create different body shapes based on gender
      const bodyShape = isMale
        ? `<path d="M150,300 L140,380 L260,380 L250,300" fill="${skinTone}" />
           <path d="M160,300 L155,340 L245,340 L240,300" fill="#333333" />`
        : `<path d="M120,350 Q200,400 280,350" fill="#FFC0CB" />
           <path d="M160,300 Q200,330 240,300" fill="#FFC0CB" />`;
      
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
        <rect x="0" y="0" width="400" height="500" fill="${backgroundColor}" />
        <text x="200" y="30" font-family="Arial" font-size="20" text-anchor="middle" fill="#333333">
          ${companion.name} - ${companion.tagline || 'Your companion'}
        </text>
        <circle cx="200" cy="180" r="120" fill="${skinTone}" />
        ${hairStyle}
        <circle cx="160" cy="150" r="15" fill="white" />
        <circle cx="160" cy="150" r="8" fill="${eyeColor}" />
        <circle cx="240" cy="150" r="15" fill="white" />
        <circle cx="240" cy="150" r="8" fill="${eyeColor}" />
        ${faceFeatures}
        ${bodyShape}
        <text x="200" y="450" font-family="Arial" font-size="16" text-anchor="middle" fill="#333333">
          ${prompt || 'Looking forward to chatting with you!'}
        </text>
      </svg>`;
    
    case 'romantic':
      // Determine gender-specific visualization for romantic scene
      const isMaleRomantic = companion.gender === 'male';
      
      // Create different hair styles for romantic scene
      const hairStyleRomantic = isMaleRomantic 
        ? `<path d="M130,100 Q200,70 270,100" fill="${hairColor}" />
           <path d="M120,150 Q150,50 200,70 Q250,50 280,150" fill="${hairColor}" />`
        : `<path d="M130,100 Q200,50 270,100" fill="${hairColor}" />
           <path d="M100,180 Q150,30 200,60 Q250,30 300,180" fill="${hairColor}" />`;
      
      // Create different facial features for romantic scene
      const faceFeaturesRomantic = isMaleRomantic
        ? `<path d="M170,200 Q200,215 230,200" fill="none" stroke="${lipColor}" stroke-width="3" />
           <path d="M160,130 Q180,120 200,130" fill="none" stroke="#000" stroke-width="1.2" />
           <path d="M200,130 Q220,120 240,130" fill="none" stroke="#000" stroke-width="1.2" />`
        : `<path d="M170,200 Q200,225 230,200" fill="none" stroke="${lipColor}" stroke-width="4" />
           <path d="M140,90 Q170,85 180,90" fill="none" stroke="#000" stroke-width="1" />
           <path d="M220,90 Q230,85 260,90" fill="none" stroke="#000" stroke-width="1" />`;
      
      // Create romantic scene elements
      const romanticeElements = isMaleRomantic
        ? `<path d="M0,350 C100,300 300,400 400,350 L400,500 L0,500 Z" fill="#87CEFA" opacity="0.2" />
           <path d="M280,70 Q320,90 340,50" fill="none" stroke="#FF69B4" stroke-width="2" />`
        : `<path d="M0,350 C100,300 300,400 400,350 L400,500 L0,500 Z" fill="#FF69B4" opacity="0.2" />
           <circle cx="330" cy="80" r="40" fill="#FF69B4" opacity="0.4" />`;
      
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
        <rect x="0" y="0" width="400" height="500" fill="${backgroundColor}" />
        ${romanticeElements}
        <circle cx="200" cy="180" r="120" fill="${skinTone}" />
        ${hairStyleRomantic}
        <circle cx="160" cy="150" r="15" fill="white" />
        <circle cx="160" cy="150" r="8" fill="${eyeColor}" />
        <circle cx="240" cy="150" r="15" fill="white" />
        <circle cx="240" cy="150" r="8" fill="${eyeColor}" />
        ${faceFeaturesRomantic}
        <path d="M120,350 Q150,370 200,355 Q250,370 280,350" fill="${isMaleRomantic ? '#87CEFA' : '#FF69B4'}" opacity="0.4" />
        <text x="200" y="450" font-family="Arial" font-size="16" text-anchor="middle" fill="#333333">
          ${prompt || 'Thinking about you...'}
        </text>
      </svg>`;
      
    case 'casual':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
        <rect x="0" y="0" width="400" height="500" fill="${backgroundColor}" />
        <rect x="0" y="300" width="400" height="200" fill="#87CEEB" opacity="0.3" />
        <circle cx="50" cy="50" r="20" fill="#FFD700" />
        <circle cx="200" cy="180" r="120" fill="${skinTone}" />
        <path d="M130,100 Q200,50 270,100" fill="${hairColor}" />
        <path d="M100,180 Q150,30 200,60 Q250,30 300,180" fill="${hairColor}" />
        <circle cx="160" cy="150" r="15" fill="white" />
        <circle cx="160" cy="150" r="8" fill="${eyeColor}" />
        <circle cx="240" cy="150" r="15" fill="white" />
        <circle cx="240" cy="150" r="8" fill="${eyeColor}" />
        <path d="M170,200 Q200,220 230,200" fill="none" stroke="${lipColor}" stroke-width="4" />
        <text x="200" y="450" font-family="Arial" font-size="16" text-anchor="middle" fill="#333333">
          ${prompt || 'Just hanging out!'}
        </text>
      </svg>`;
      
    case 'fantasy':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
        <rect x="0" y="0" width="400" height="500" fill="${backgroundColor}" />
        <circle cx="100" cy="100" r="50" fill="#FFD700" opacity="0.3" />
        <circle cx="300" cy="150" r="70" fill="#9370DB" opacity="0.3" />
        <circle cx="200" cy="180" r="120" fill="${skinTone}" />
        <path d="M130,100 Q200,50 270,100" fill="${hairColor}" />
        <path d="M100,180 Q150,30 200,60 Q250,30 300,180" fill="${hairColor}" />
        <circle cx="160" cy="150" r="15" fill="white" />
        <circle cx="160" cy="150" r="8" fill="${eyeColor}" />
        <circle cx="240" cy="150" r="15" fill="white" />
        <circle cx="240" cy="150" r="8" fill="${eyeColor}" />
        <path d="M170,200 Q200,220 230,200" fill="none" stroke="${lipColor}" stroke-width="4" />
        <path d="M130,300 Q200,350 270,300" fill="none" stroke="#FFD700" stroke-width="2" />
        <text x="200" y="450" font-family="Arial" font-size="16" text-anchor="middle" fill="#333333">
          ${prompt || 'In a magical world with you...'}
        </text>
      </svg>`;
  }
}

// Convert SVG to a data URL
export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Create a prompt for image generation based on the companion
export function createImagePrompt(companion: Companion, userInput?: string): string {
  const attributes = getCharacterAttributes(companion.id);
  
  // Extract key details
  const gender = companion.gender || 'female';
  const { hairColor, skinTone, eyeColor, bodyShape, style } = attributes;
  
  // Translate color codes to descriptive words
  const hairColorName = getColorName(hairColor);
  const skinToneName = getColorName(skinTone);
  const eyeColorName = getColorName(eyeColor);
  
  // Build a base prompt
  let basePrompt = `A ${bodyShape} ${gender} with ${hairColorName} hair, ${skinToneName} skin, and ${eyeColorName} eyes. Style: ${style}.`;
  
  // Add personality traits
  if (companion.personality) {
    basePrompt += ` Expressing a ${companion.personality} personality.`;
  }
  
  // Incorporate user input if provided
  if (userInput) {
    basePrompt += ` ${userInput}`;
  }
  
  return basePrompt;
}

// Helper function to convert hex color to color name
function getColorName(hexColor: string): string {
  const colorMap: Record<string, string> = {
    '#000000': 'black',
    '#FFFFFF': 'white',
    '#FF0000': 'red',
    '#00FF00': 'green',
    '#0000FF': 'blue',
    '#FFFF00': 'yellow',
    '#FF00FF': 'magenta',
    '#00FFFF': 'cyan',
    '#FFA500': 'orange',
    '#800080': 'purple',
    '#A52A2A': 'brown',
    '#FFD700': 'golden blonde',
    '#8B4513': 'brown',
    '#D2B48C': 'tan',
    '#F5DEB3': 'fair',
    '#FFDAB9': 'peachy',
    '#4682B4': 'blue',
    '#1E90FF': 'blue',
    '#008000': 'green',
    '#FF69B4': 'pink',
    '#DB7093': 'pink',
    '#CD5C5C': 'reddish',
  };
  
  return colorMap[hexColor] || 'natural';
}