// Constants for VisualizationScreen
export const VISUALIZATION_TYPES = [
  { 
    value: 'goals', 
    label: 'Goal Achievement', 
    description: 'Visualize successfully achieving your goals',
    icon: 'target',
    color: '#4C63B6',
    gradient: ['#4C63B6', '#3F51B5']
  },
  { 
    value: 'ideal_life', 
    label: 'Ideal Life', 
    description: 'Envision your perfect future and lifestyle',
    icon: 'home-heart',
    color: '#FF7675',
    gradient: ['#FF7675', '#FF5D5D']
  },
  { 
    value: 'confidence', 
    label: 'Self-Confidence', 
    description: 'Build confidence and positive self-image',
    icon: 'account-star',
    color: '#7D8CC4',
    gradient: ['#7D8CC4', '#5C6BC0']
  },
  { 
    value: 'contentment', 
    label: 'Contentment', 
    description: 'Embrace gratitude and present moment awareness',
    icon: 'heart-pulse',
    color: '#00B894',
    gradient: ['#00B894', '#00A383']
  },
  { 
    value: 'calm', 
    label: 'Inner Peace', 
    description: 'Find calmness and emotional balance',
    icon: 'wave',
    color: '#5C96AE',
    gradient: ['#5C96AE', '#4A7F9B']
  },
];

export const SESSION_DURATION = 300; // 5 minutes

export const getAffirmationPlaceholder = (visualizationType) => {
  switch (visualizationType) {
    case 'goals':
      return 'E.g., I am confidently working towards my goals and achieving success';
    case 'confidence':
      return 'E.g., I am capable, confident, and worthy of success';
    case 'calm':
      return 'E.g., I am calm, centered, and at peace with myself';
    case 'ideal_life':
      return 'E.g., I am creating my dream life filled with purpose, joy, and abundance';
    case 'contentment':
      return 'E.g., I am grateful for all that I have and find joy in the present moment';
    default:
      return 'Enter your positive affirmation';
  }
}; 

// Mapping of visualization types to their audio files
// This will be used by SetupScreen to fetch duration and useVisualizationAudio to play
export const VISUALIZATION_AUDIO_FILES = {
  goals: require('../../../../assets/audio/visualization/goals.mp3'),
  ideal_life: require('../../../../assets/audio/visualization/ideal_life.mp3'),
  confidence: require('../../../../assets/audio/visualization/confidence.mp3'),
  contentment: require('../../../../assets/audio/visualization/contentment.mp3'),
  calm: require('../../../../assets/audio/visualization/calm.mp3'),
  placeholder: require('../../../../assets/audio/silence.mp3'), // Fallback or for types without specific audio
}; 