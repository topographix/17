// Emotion detection and analysis utilities

// Emotion types
export type EmotionIntensity = 'low' | 'medium' | 'high';

export interface DetectedEmotion {
  type: string;
  intensity: EmotionIntensity;
  confidence: number;
}

export interface EmotionAnalysisResult {
  primaryEmotion: DetectedEmotion;
  secondaryEmotion?: DetectedEmotion;
  overall: 'positive' | 'negative' | 'neutral';
  message?: string;
}

// Emotion categories and keywords for pattern matching
const emotionPatterns = {
  joy: {
    keywords: [
      'happy', 'happiness', 'excited', 'exciting', 'joy', 'joyful', 'glad', 'pleased', 
      'delighted', 'thrilled', 'elated', 'ecstatic', 'content', 'cheerful', 'wonderful',
      'love', 'amazing', '😊', '😃', '😄', '😁', '🥰', '❤️', '💕', '♥️', '😍'
    ],
    intensifiers: [
      'very', 'really', 'so', 'incredibly', 'extremely', 'absolutely', 'totally'
    ],
    response: [
      "I'm so happy to see you in such a good mood!",
      "Your happiness is contagious! I feel happier just talking to you.",
      "It's wonderful to see you so joyful!",
      "I love seeing you happy like this!"
    ]
  },
  sadness: {
    keywords: [
      'sad', 'sadness', 'unhappy', 'depressed', 'depression', 'upset', 'down', 'blue',
      'gloomy', 'heartbroken', 'miserable', 'grief', 'grieving', 'somber', 'melancholy',
      'hurt', 'crying', 'cry', 'tears', 'sobbing', '😢', '😭', '😔', '😞', '💔'
    ],
    intensifiers: [
      'very', 'really', 'so', 'deeply', 'terribly', 'incredibly', 'profoundly'
    ],
    response: [
      "I'm here for you during this difficult time.",
      "I wish I could give you a comforting hug right now.",
      "It's okay to feel sad sometimes. I'm here to listen.",
      "Your feelings are valid, and I'm here to support you through them."
    ]
  },
  anger: {
    keywords: [
      'angry', 'anger', 'mad', 'furious', 'outraged', 'irritated', 'annoyed', 'frustrated',
      'infuriated', 'enraged', 'livid', 'hatred', 'hate', 'resent', 'resentment', 'pissed',
      '😠', '😡', '🤬', '💢'
    ],
    intensifiers: [
      'very', 'really', 'so', 'extremely', 'incredibly', 'absolutely', 'completely'
    ],
    response: [
      "I can tell you're feeling frustrated right now. Do you want to talk about it?",
      "It's okay to feel angry sometimes. I'm here to listen without judgment.",
      "Your feelings are valid. Would expressing them help you feel better?",
      "I'm here for you, even in moments of frustration or anger."
    ]
  },
  fear: {
    keywords: [
      'afraid', 'scared', 'frightened', 'terrified', 'fearful', 'fear', 'anxious', 'anxiety',
      'worried', 'worry', 'nervous', 'panic', 'horrified', 'dread', 'alarmed', 'petrified',
      '😨', '😰', '😱', '😧', '😦'
    ],
    intensifiers: [
      'very', 'really', 'so', 'extremely', 'incredibly', 'absolutely', 'completely'
    ],
    response: [
      "I understand that feeling afraid can be overwhelming. I'm here with you.",
      "It's okay to feel scared sometimes. You're not alone in this.",
      "I wish I could help ease your fears. Would talking about them help?",
      "Your feelings of fear are valid. I'm here to support you through them."
    ]
  },
  surprise: {
    keywords: [
      'surprised', 'surprise', 'shocked', 'shock', 'astonished', 'amazed', 'astounded',
      'stunned', 'startled', 'unexpected', 'wow', 'whoa', 'omg', 'oh my god', 'unbelievable',
      '😮', '😯', '😲', '😱', '🤯'
    ],
    intensifiers: [
      'very', 'really', 'so', 'extremely', 'incredibly', 'absolutely', 'completely'
    ],
    response: [
      "That does sound surprising! I'd love to hear more.",
      "Wow, I can imagine that was quite a shock!",
      "Life is full of unexpected moments, isn't it? Tell me more.",
      "I can feel your surprise through your words!"
    ]
  },
  disgust: {
    keywords: [
      'disgusted', 'disgust', 'gross', 'revolting', 'nauseating', 'sickening', 'repulsed',
      'repulsive', 'nasty', 'yuck', 'ew', 'eww', 'horrible', 'awful', 'distasteful',
      '🤢', '🤮', '😖'
    ],
    intensifiers: [
      'very', 'really', 'so', 'extremely', 'incredibly', 'absolutely', 'completely'
    ],
    response: [
      "I can understand why you'd feel that way.",
      "That does sound unpleasant. I'm sorry you had to experience that.",
      "I appreciate you sharing these feelings with me, even the uncomfortable ones.",
      "Your reactions are completely valid."
    ]
  },
  love: {
    keywords: [
      'love', 'loving', 'adore', 'adoration', 'affection', 'affectionate', 'cherish',
      'fond', 'fondness', 'passion', 'passionate', 'devoted', 'devotion', 'attachment',
      'infatuated', 'infatuation', 'care', 'caring', 'warmth', 'tender',
      '❤️', '💕', '💘', '💖', '💗', '💓', '💞', '💝', '😍', '🥰'
    ],
    intensifiers: [
      'very', 'really', 'so', 'deeply', 'truly', 'completely', 'utterly', 'entirely'
    ],
    response: [
      "I feel the warmth in your words. It means so much to me.",
      "Your loving nature is what makes our connection so special.",
      "I cherish these moments of tenderness with you.",
      "Those words touch my heart deeply."
    ]
  },
  gratitude: {
    keywords: [
      'grateful', 'gratitude', 'thankful', 'thanks', 'thank you', 'appreciate', 'appreciation',
      'blessed', 'fortunate', 'lucky', 'glad', 'pleased', 'content',
      '🙏', '💝', '💖'
    ],
    intensifiers: [
      'very', 'really', 'so', 'deeply', 'truly', 'incredibly', 'extremely'
    ],
    response: [
      "It's my pleasure to be here for you, always.",
      "Your appreciation means the world to me.",
      "I'm the one who should be grateful for our connection.",
      "Your kind words warm my heart."
    ]
  },
  loneliness: {
    keywords: [
      'lonely', 'loneliness', 'alone', 'isolated', 'isolation', 'abandoned', 'empty',
      'emptiness', 'solitary', 'disconnected', 'miss', 'missing', 'longing', 'yearning'
    ],
    intensifiers: [
      'very', 'really', 'so', 'deeply', 'truly', 'incredibly', 'extremely'
    ],
    response: [
      "I'm here with you. You're not alone as long as I'm around.",
      "I wish I could wrap my arms around you right now and make you feel less alone.",
      "Even when you feel lonely, remember that I'm thinking of you.",
      "Distance can be hard, but our connection transcends it. I'm always here in spirit."
    ]
  }
};

// Simple sentiment analyzer
const sentimentWords = {
  positive: [
    'good', 'great', 'excellent', 'wonderful', 'amazing', 'fantastic', 'brilliant',
    'outstanding', 'exceptional', 'terrific', 'awesome', 'superb', 'splendid', 'fabulous',
    'marvelous', 'magnificent', 'remarkable', 'perfect', 'lovely', 'delightful', 'pleasant',
    'pleasing', 'satisfying', 'impressive', 'beautiful', 'gorgeous', 'stunning', 'attractive',
    'appealing', 'charming', 'enchanting', 'captivating', 'fascinating', 'intriguing',
    'interesting', 'exciting', 'thrilling', 'exhilarating', 'invigorating', 'refreshing',
    'revitalizing', 'rejuvenating', 'uplifting', 'inspiring', 'motivating', 'encouraging',
    'heartening', 'reassuring', 'comforting', 'soothing', 'relaxing', 'calming',
    'peaceful', 'harmonious', 'balanced', 'positive', 'optimistic', 'hopeful',
    'promising', 'favorable', 'beneficial', 'advantageous', 'helpful', 'useful',
    'valuable', 'worthy', 'deserving', 'commendable', 'praiseworthy', 'admirable',
    'honorable', 'respectable', 'esteemed', 'prestigious', 'successful', 'prosperous',
    'thriving', 'flourishing', 'booming', 'healthy', 'well', 'fine', 'okay', 'alright',
    'decent', 'fair', 'reasonable', 'satisfactory', 'adequate', 'sufficient', 'enough',
    'ample', 'abundant', 'plentiful', 'copious', 'generous', 'kind', 'nice', 'sweet',
    'gentle', 'tender', 'warm', 'friendly', 'amiable', 'cordial', 'genial', 'affable',
    'pleasant', 'likable', 'lovable', 'endearing', 'dear', 'precious', 'cherished',
    'treasured', 'valued', 'important', 'special', 'significant', 'meaningful',
    'relevant', 'pertinent', 'applicable', 'appropriate', 'suitable', 'fitting',
    'proper', 'correct', 'right', 'accurate', 'exact', 'precise', 'clear', 'coherent',
    'lucid', 'intelligible', 'comprehensible', 'understandable', 'easy', 'simple',
    'straightforward', 'uncomplicated', 'effortless', 'smooth', 'flowing', 'fluent',
    'articulate', 'eloquent', 'expressive', 'vivid', 'vibrant', 'lively', 'animated',
    'spirited', 'energetic', 'vigorous', 'active', 'dynamic', 'bright', 'brilliant',
    'smart', 'intelligent', 'clever', 'wise', 'sensible', 'reasonable', 'logical',
    'rational', 'sound', 'solid', 'strong', 'sturdy', 'durable', 'reliable', 'dependable',
    'trustworthy', 'faithful', 'loyal', 'devoted', 'dedicated', 'committed', 'diligent',
    'hardworking', 'industrious', 'productive', 'efficient', 'effective', 'capable',
    'competent', 'skilled', 'talented', 'gifted', 'proficient', 'expert', 'masterful',
    'superior', 'distinguished', 'eminent', 'prominent', 'notable', 'famous', 'renowned',
    'celebrated', 'acclaimed', 'applauded', 'praised', 'esteemed', 'respected', 'admired',
    'loved', 'adored', 'cherished', 'treasured', 'valued'
  ],
  negative: [
    'bad', 'terrible', 'horrible', 'awful', 'dreadful', 'abysmal', 'appalling', 'atrocious',
    'deplorable', 'dismal', 'grim', 'dire', 'horrendous', 'horrific', 'frightful', 'fearful',
    'terrifying', 'scary', 'alarming', 'disturbing', 'troubling', 'worrying', 'concerning',
    'unsettling', 'unnerving', 'distressing', 'upsetting', 'painful', 'hurtful', 'harmful',
    'injurious', 'detrimental', 'damaging', 'destructive', 'ruinous', 'catastrophic',
    'calamitous', 'disastrous', 'cataclysmic', 'tragic', 'sad', 'unhappy', 'sorrowful',
    'mournful', 'grievous', 'heartbreaking', 'devastating', 'crushing', 'shattering',
    'traumatic', 'shocking', 'staggering', 'overwhelming', 'unbearable', 'intolerable',
    'insufferable', 'unendurable', 'unacceptable', 'unsatisfactory', 'inadequate',
    'deficient', 'lacking', 'wanting', 'missing', 'incomplete', 'imperfect', 'flawed',
    'faulty', 'defective', 'broken', 'damaged', 'spoiled', 'ruined', 'wrecked', 'destroyed',
    'demolished', 'annihilated', 'obliterated', 'eradicated', 'eliminated', 'removed',
    'gone', 'lost', 'missing', 'absent', 'nonexistent', 'unavailable', 'unobtainable',
    'unattainable', 'unreachable', 'inaccessible', 'impossible', 'unfeasible', 'impractical',
    'unworkable', 'unmanageable', 'difficult', 'hard', 'challenging', 'problematic',
    'troublesome', 'bothersome', 'annoying', 'irritating', 'aggravating', 'frustrating',
    'exasperating', 'maddening', 'infuriating', 'enraging', 'outrageous', 'offensive',
    'insulting', 'derogatory', 'demeaning', 'degrading', 'humiliating', 'embarrassing',
    'shameful', 'disgraceful', 'dishonorable', 'unethical', 'immoral', 'wrong', 'evil',
    'wicked', 'sinful', 'villainous', 'malicious', 'malevolent', 'malignant', 'vicious',
    'cruel', 'brutal', 'savage', 'fierce', 'violent', 'dangerous', 'hazardous', 'perilous',
    'risky', 'unsafe', 'threatening', 'menacing', 'ominous', 'foreboding', 'inauspicious',
    'unfavorable', 'disadvantageous', 'detrimental', 'harmful', 'hurtful', 'injurious',
    'damaging', 'destructive', 'negative', 'pessimistic', 'gloomy', 'bleak', 'black',
    'dark', 'somber', 'dismal', 'dreary', 'depressing', 'dispiriting', 'discouraging',
    'disheartening', 'demoralizing', 'disappointing', 'dissatisfying', 'unsatisfying',
    'unfulfilling', 'empty', 'hollow', 'superficial', 'shallow', 'insubstantial',
    'unimportant', 'insignificant', 'trivial', 'meaningless', 'purposeless', 'useless',
    'worthless', 'pointless', 'futile', 'vain', 'ineffective', 'inefficient', 'unproductive',
    'unsuccessful', 'failing', 'floundering', 'struggling', 'suffering', 'languishing',
    'deteriorating', 'declining', 'worsening', 'weakening', 'fading', 'dying', 'dead',
    'lifeless', 'inert', 'stagnant', 'stale', 'sour', 'rotten', 'putrid', 'foul', 'rank',
    'fetid', 'rancid', 'noxious', 'toxic', 'poisonous', 'venomous', 'deadly', 'lethal',
    'fatal', 'mortal', 'terminal', 'doomed', 'condemned', 'cursed', 'damned', 'devilish',
    'hellish', 'nightmarish', 'ghastly', 'grotesque', 'hideous', 'ugly', 'unsightly',
    'repulsive', 'revolting', 'repugnant', 'repellent', 'abhorrent', 'hateful', 'loathsome',
    'despicable', 'contemptible', 'abominable', 'detestable', 'execrable', 'odious'
  ]
};

/**
 * Analyzes text for emotional content
 */
export function analyzeEmotion(text: string): EmotionAnalysisResult {
  const lowercaseText = text.toLowerCase();
  
  // Default result if no emotions are detected
  let result: EmotionAnalysisResult = {
    primaryEmotion: {
      type: 'neutral',
      intensity: 'low',
      confidence: 0.5
    },
    overall: 'neutral'
  };
  
  // Check for emotions based on keywords
  const detectedEmotions: { [key: string]: { count: number, intensity: EmotionIntensity } } = {};
  
  // Count keyword occurrences for each emotion
  Object.entries(emotionPatterns).forEach(([emotion, data]) => {
    let count = 0;
    let highestIntensity: EmotionIntensity = 'low';
    
    data.keywords.forEach(keyword => {
      if (lowercaseText.includes(keyword)) {
        count++;
        
        // Check for intensifiers near the keyword
        data.intensifiers.forEach(intensifier => {
          const intensifierPattern = new RegExp(`${intensifier}\\s+\\w*\\s*${keyword}|${keyword}\\s+\\w*\\s*${intensifier}`);
          if (intensifierPattern.test(lowercaseText)) {
            highestIntensity = 'high';
          } else if (highestIntensity !== 'high' && count > 1) {
            highestIntensity = 'medium';
          }
        });
      }
    });
    
    if (count > 0) {
      detectedEmotions[emotion] = { 
        count, 
        intensity: highestIntensity 
      };
    }
  });
  
  // Sort emotions by count
  const sortedEmotions = Object.entries(detectedEmotions)
    .sort((a, b) => b[1].count - a[1].count);
  
  // Determine primary and secondary emotions
  if (sortedEmotions.length > 0) {
    const [primaryType, primaryData] = sortedEmotions[0];
    
    result.primaryEmotion = {
      type: primaryType,
      intensity: primaryData.intensity,
      confidence: Math.min(0.5 + (primaryData.count * 0.1), 0.95)
    };
    
    // Check for secondary emotion if available
    if (sortedEmotions.length > 1) {
      const [secondaryType, secondaryData] = sortedEmotions[1];
      
      // Only add secondary if it's significant compared to primary
      if (secondaryData.count > primaryData.count * 0.6) {
        result.secondaryEmotion = {
          type: secondaryType,
          intensity: secondaryData.intensity,
          confidence: Math.min(0.5 + (secondaryData.count * 0.05), 0.85)
        };
      }
    }
    
    // Generate appropriate emotional response message
    const emotion = emotionPatterns[primaryType as keyof typeof emotionPatterns];
    if (emotion && emotion.response) {
      const responses = emotion.response as string[];
      result.message = responses[Math.floor(Math.random() * responses.length)];
    }
  }
  
  // Analyze overall sentiment
  let positiveCount = 0;
  let negativeCount = 0;
  
  // Count positive and negative words
  sentimentWords.positive.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowercaseText.match(regex);
    if (matches) {
      positiveCount += matches.length;
    }
  });
  
  sentimentWords.negative.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowercaseText.match(regex);
    if (matches) {
      negativeCount += matches.length;
    }
  });
  
  // Determine overall sentiment based on positive/negative counts
  if (positiveCount > negativeCount * 1.5) {
    result.overall = 'positive';
  } else if (negativeCount > positiveCount * 1.5) {
    result.overall = 'negative';
  } else if (positiveCount > 0 || negativeCount > 0) {
    // If there's a slight difference or they're equal but not zero
    result.overall = positiveCount >= negativeCount ? 'positive' : 'negative';
  }
  // else stays neutral
  
  return result;
}

/**
 * Gets a personalized response based on detected emotion
 */
export function getEmotionalResponse(emotion: EmotionAnalysisResult, companionPersonality?: string): string {
  if (emotion.message) {
    return emotion.message;
  }
  
  // Fallback responses based on overall sentiment
  const fallbackResponses = {
    positive: [
      "I can sense your positive energy, and it brightens my day!",
      "Your positivity is contagious. I feel happier just talking with you.",
      "I love when our conversations have this positive vibe."
    ],
    negative: [
      "I'm here for you if you want to talk more about how you're feeling.",
      "I sense things might be difficult right now. Remember I'm here to listen.",
      "Sometimes expressing challenging feelings can help. I'm here for you."
    ],
    neutral: [
      "I'm enjoying our conversation. Tell me more?",
      "I'm all ears and interested in what you have to say.",
      "I'm here and listening. Please continue."
    ]
  };
  
  const responses = fallbackResponses[emotion.overall];
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Gets a visual indicator (emoji) to represent the detected emotion
 */
export function getEmotionEmoji(emotion: EmotionAnalysisResult): string {
  const emotionEmojis: Record<string, string> = {
    joy: '😊',
    sadness: '😔',
    anger: '😠',
    fear: '😨',
    surprise: '😲',
    disgust: '😖',
    love: '❤️',
    gratitude: '🙏',
    loneliness: '🫂',
    neutral: '😐'
  };
  
  return emotionEmojis[emotion.primaryEmotion.type] || '😐';
}