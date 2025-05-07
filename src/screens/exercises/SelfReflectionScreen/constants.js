// Constants for SelfReflectionScreen
export const REFLECTION_TOPICS = [
  { 
    value: 'accomplishments', 
    label: 'Accomplishments', 
    description: 'Reflect on your achievements and progress',
    icon: 'trophy',
    color: '#4C63B6' 
  },
  { 
    value: 'challenges', 
    label: 'Challenges', 
    description: 'Examine difficulties and how you\'ve overcome them',
    icon: 'mountain',
    color: '#7D8CC4' 
  },
  { 
    value: 'growth', 
    label: 'Personal Growth', 
    description: 'Explore how you\'ve evolved over time',
    icon: 'sprout',
    color: '#5C96AE' 
  },
];

export const REFLECTION_QUESTIONS = {
  accomplishments: [
    "What achievement are you most proud of lately and why?",
    "What obstacles did you overcome to reach a recent goal?",
    "How has achieving something recently changed your perspective?",
  ],
  challenges: [
    "What's been your biggest challenge recently and how did you approach it?",
    "What lessons have you learned from a recent difficulty?",
    "How has a recent challenge changed how you view yourself?",
  ],
  growth: [
    "In what ways have you grown in the last few months?",
    "What new strength or quality have you discovered in yourself recently?",
    "How have your priorities or values shifted over time?",
  ],
}; 