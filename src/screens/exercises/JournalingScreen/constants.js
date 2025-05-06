// Constants for JournalingScreen
export const JOURNAL_PROMPTS = {
  gratitude: [
    "What are three things you're grateful for today?",
    "Who made a positive impact on your day and why?",
    "What opportunity or challenge are you thankful for?",
  ],
  reflection: [
    "What was the most meaningful part of your day?",
    "What did you learn about yourself today?",
    "How did you handle challenges that arose?",
  ],
  growth: [
    "What progress did you make toward your goals today?",
    "What would you like to improve or do differently tomorrow?",
    "What new insight or skill did you gain today?",
  ],
};

export const PROMPT_TYPES = [
  { 
    value: 'gratitude', 
    label: 'Gratitude', 
    icon: 'heart', 
    color: '#4C63B6',
    gradient: ['#4C63B6', '#3F51B5'],
    description: 'Express appreciation for positive aspects of your life'
  },
  { 
    value: 'reflection', 
    label: 'Reflection', 
    icon: 'thought-bubble', 
    color: '#7D8CC4',
    gradient: ['#7D8CC4', '#5C6BC0'],
    description: 'Explore your thoughts and experiences'
  },
  { 
    value: 'growth', 
    label: 'Growth', 
    icon: 'sprout', 
    color: '#5C96AE',
    gradient: ['#5C96AE', '#4A7F9B'],
    description: 'Focus on personal progress and future improvement'
  },
]; 