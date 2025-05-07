// Constants for MindfulnessScreen
export const MINDFULNESS_TYPES = [
  { 
    value: 'breath', 
    label: 'Breath Focus', 
    description: 'Focus your attention on your breathing',
    details: 'Improves concentration and reduces stress by bringing awareness to your breath',
    icon: 'weather-windy',
    color: '#4C63B6',
    colorSecondary: '#3949AB',
    gradient: ['#4C63B6', '#3949AB'],
    duration: 300, // 5 minutes
    instructions: 'Breathe deeply and focus on the sensation of air moving in and out of your body. Notice the rise and fall of your chest and abdomen. When your mind wanders, gently bring your attention back to your breath.'
  },
  { 
    value: 'body', 
    label: 'Body Scan', 
    description: 'Bring awareness to each part of your body',
    details: 'Releases tension and promotes physical awareness by systematically scanning the body',
    icon: 'human',
    color: '#7D8CC4',
    colorSecondary: '#5C6BC0',
    gradient: ['#7D8CC4', '#5C6BC0'],
    duration: 480, // 8 minutes
    instructions: 'Start from the top of your head and slowly move down to your toes, paying attention to sensations in each part of your body. If you notice tension, consciously try to release it.'
  },
  { 
    value: 'senses', 
    label: 'Five Senses', 
    description: 'Connect with your surroundings through your senses',
    details: 'Grounds you in the present moment by engaging all five senses',
    icon: 'eye',
    color: '#5C96AE',
    colorSecondary: '#4A7B8A',
    gradient: ['#5C96AE', '#4A7B8A'],
    duration: 240, // 4 minutes
    instructions: 'Notice 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. This exercise will anchor you in the present moment.'
  },
]; 