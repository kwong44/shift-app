import { COLORS } from '../../../../config/theme';

// Emotion data mapping
const EMOTION_DATA = {
  motivated: { 
    icon: 'rocket-launch', 
    color: '#4CAF50', 
    description: 'Ready for challenges' 
  },
  grateful: { 
    icon: 'heart', 
    color: '#9C27B0', 
    description: 'Appreciating life\'s gifts' 
  },
  calm: { 
    icon: 'water', 
    color: '#2196F3', 
    description: 'Peaceful and centered' 
  },
  anxious: { 
    icon: 'alert', 
    color: '#FFC107', 
    description: 'Feeling uncertain' 
  },
  overwhelmed: { 
    icon: 'lightning-bolt', 
    color: '#F44336', 
    description: 'Dealing with too much' 
  }
};

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[MoodHelpers] ${message}`, data);
  }
};

export const getMoodIcon = (emotionType) => {
  debug.log('Getting emotion icon for:', emotionType);
  return EMOTION_DATA[emotionType]?.icon || 'help-circle-outline';
};

export const getMoodColor = (emotionType) => {
  debug.log('Getting emotion color for:', emotionType);
  return EMOTION_DATA[emotionType]?.color || COLORS.textLight;
};

export const getMoodDescription = (emotionType) => {
  debug.log('Getting emotion description for:', emotionType);
  return EMOTION_DATA[emotionType]?.description || 'Tracking your emotions';
};

export const calculateMoodTrend = (moods) => {
  debug.log('Calculating emotion trend from moods:', moods?.length);
  if (!moods || moods.length === 0) return 'calm';
  
  // Count occurrences of each emotion
  const emotionCounts = moods.reduce((counts, mood) => {
    const type = mood.mood_type || 'unknown';
    counts[type] = (counts[type] || 0) + 1;
    return counts;
  }, {});
  
  debug.log('Emotion counts:', emotionCounts);
  
  // Find most frequent emotion
  let maxCount = 0;
  let dominantEmotion = 'calm'; // Default
  
  Object.entries(emotionCounts).forEach(([emotion, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantEmotion = emotion;
    }
  });
  
  return dominantEmotion;
};

// Helper to get all defined emotions
export const getAllEmotions = () => {
  return Object.keys(EMOTION_DATA).map(id => ({
    id,
    ...EMOTION_DATA[id]
  }));
};
