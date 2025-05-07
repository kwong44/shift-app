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
    value: 'confidence', 
    label: 'Self-Confidence', 
    description: 'Build confidence and positive self-image',
    icon: 'account-star',
    color: '#7D8CC4',
    gradient: ['#7D8CC4', '#5C6BC0']
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
    default:
      return 'Enter your positive affirmation';
  }
}; 