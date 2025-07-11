// src/constants/masterExerciseList.js
// This file serves as the single source of truth for all available exercises in the app.
// It's used to dynamically populate exercise lists, including the DailyFocus component.

import { COLORS } from '../config/theme'; // Assuming COLORS are defined in theme.js

// Helper to convert minutes to seconds for consistency
const minutesToSeconds = (minutes) => minutes * 60;

export const MASTER_EXERCISE_LIST = [
  // === Mindfulness Exercises ===
  {
    id: 'mindfulness_breath_5min',
    title: 'Breath Focus',
    type: 'Mindfulness',
    description: 'Anchor your attention on breathing',
    icon: 'weather-windy',
    route: 'MindfulnessSetup',
    tags: ['stress_reduction', 'focus', 'calm', 'short_session', 'beginner'],
    gradientColors: COLORS.mindfulnessGradients?.breath || ['#00B894', '#007E66'], // tealGradient
    defaultDurationText: '5 min',
    defaultDurationSeconds: minutesToSeconds(5),
    defaultSettings: { mindfulnessType: 'breath', duration: minutesToSeconds(5) },
    isQuickStart: false, // Requires setup for duration typically
  },
  {
    id: 'mindfulness_body_scan_8min',
    title: 'Body Scan',
    type: 'Mindfulness',
    description: 'Release tension through awareness',
    icon: 'human',
    route: 'MindfulnessSetup',
    tags: ['relaxation', 'body_awareness', 'tension_release'],
    gradientColors: COLORS.mindfulnessGradients?.body || ['#00B894', '#007E66'], // tealGradient
    defaultDurationText: '8 min',
    defaultDurationSeconds: minutesToSeconds(8),
    defaultSettings: { mindfulnessType: 'body', duration: minutesToSeconds(8) },
    isQuickStart: false,
  },
  {
    id: 'mindfulness_senses_4min',
    title: 'Five Senses',
    type: 'Mindfulness',
    description: 'Connect with your surroundings',
    icon: 'eye',
    route: 'MindfulnessSetup',
    tags: ['grounding', 'present_moment', 'short_session'],
    gradientColors: COLORS.mindfulnessGradients?.senses || ['#00B894', '#007E66'], // tealGradient
    defaultDurationText: '4 min',
    defaultDurationSeconds: minutesToSeconds(4),
    defaultSettings: { mindfulnessType: 'senses', duration: minutesToSeconds(4) },
    isQuickStart: false,
  },

  // === Visualization Exercises ===
  {
    id: 'visualization_goals_5min',
    title: 'Goal Achievement Visualization',
    type: 'Visualization',
    description: 'Visualize successfully achieving your goals',
    icon: 'target',
    route: 'VisualizationSetup',
    tags: ['goal_setting', 'motivation', 'success_mindset'],
    gradientColors: COLORS.visualizationGradients?.goals || ['#FF7675', '#FF5D5D'], // coralGradient
    defaultDurationText: '5 min',
    defaultDurationSeconds: minutesToSeconds(5),
    defaultSettings: { visualizationType: 'goals', duration: minutesToSeconds(5) },
    isQuickStart: false, // Requires setup for affirmation & duration
  },
  {
    id: 'visualization_ideal_life_5min',
    title: 'Ideal Life Visualization',
    type: 'Visualization',
    description: 'Envision your perfect future and lifestyle',
    icon: 'home-heart',
    route: 'VisualizationSetup',
    tags: ['future_planning', 'inspiration', 'positive_outlook'],
    gradientColors: COLORS.visualizationGradients?.ideal_life || ['#FF7675', '#FF5D5D'], // coralGradient
    defaultDurationText: '5 min',
    defaultDurationSeconds: minutesToSeconds(5),
    defaultSettings: { visualizationType: 'ideal_life', duration: minutesToSeconds(5) },
    isQuickStart: false,
  },
  {
    id: 'visualization_confidence_5min',
    title: 'Self-Confidence Visualization',
    type: 'Visualization',
    description: 'Build confidence and positive self-image',
    icon: 'account-star',
    route: 'VisualizationSetup',
    tags: ['self_esteem', 'confidence_boost', 'positive_self_image'],
    gradientColors: COLORS.visualizationGradients?.confidence || ['#FF7675', '#FF5D5D'], // coralGradient
    defaultDurationText: '5 min',
    defaultDurationSeconds: minutesToSeconds(5),
    defaultSettings: { visualizationType: 'confidence', duration: minutesToSeconds(5) },
    isQuickStart: false,
  },
  {
    id: 'visualization_contentment_5min',
    title: 'Contentment Visualization',
    type: 'Visualization',
    description: 'Embrace gratitude and present moment awareness',
    icon: 'heart-pulse',
    route: 'VisualizationSetup',
    tags: ['gratitude', 'present_moment', 'inner_peace'],
    gradientColors: COLORS.visualizationGradients?.contentment || ['#FF7675', '#FF5D5D'], // coralGradient
    defaultDurationText: '5 min',
    defaultDurationSeconds: minutesToSeconds(5),
    defaultSettings: { visualizationType: 'contentment', duration: minutesToSeconds(5) },
    isQuickStart: false,
  },
  {
    id: 'visualization_calm_5min',
    title: 'Inner Peace Visualization',
    type: 'Visualization',
    description: 'Find calmness and emotional balance',
    icon: 'wave',
    route: 'VisualizationSetup',
    tags: ['calm', 'emotional_regulation', 'relaxation'],
    gradientColors: COLORS.visualizationGradients?.calm || ['#FF7675', '#FF5D5D'], // coralGradient
    defaultDurationText: '5 min',
    defaultDurationSeconds: minutesToSeconds(5),
    defaultSettings: { visualizationType: 'calm', duration: minutesToSeconds(5) },
    isQuickStart: false,
  },

  // === Task Planning ===
  {
    id: 'tasks_planner',
    title: 'Task Planning',
    type: 'Task Planning',
    description: 'Organize & Focus on your priorities',
    icon: 'checkbox-marked-outline',
    route: 'TaskPlanner',
    tags: ['organization', 'productivity', 'planning', 'focus'],
    gradientColors: COLORS.purpleGradient ? [COLORS.purpleGradient.start, COLORS.purpleGradient.end] : ['#6C63FF', '#5F52EE'], // purpleGradient
    defaultDurationText: 'Flexible', // Duration is user-dependent
    defaultDurationSeconds: null, // Not a timed session in the same way
    defaultSettings: {},
    isQuickStart: true, // Directly goes to the planner
  },

  // === Deep Work Sessions ===
  {
    id: 'deepwork_pomodoro_25min',
    title: 'Pomodoro Session',
    type: 'Deep Work',
    description: 'Classic 25-minute focus interval',
    icon: 'timer-outline',
    route: 'DeepWorkSetup',
    tags: ['focus', 'productivity', 'time_management', 'pomodoro'],
    gradientColors: COLORS.deepWorkGradients?.pomodoro || ['#5AC8FA', '#4B9EF8'], // blueGradient
    defaultDurationText: '25 min',
    defaultDurationSeconds: minutesToSeconds(25),
    defaultSettings: { duration: minutesToSeconds(25) },
    isQuickStart: false, // Requires task description and duration confirmation
  },
  {
    id: 'deepwork_extended_45min',
    title: 'Extended Focus Session',
    type: 'Deep Work',
    description: '45-minute focused work period',
    icon: 'timer-sand',
    route: 'DeepWorkSetup',
    tags: ['focus', 'deep_work', 'productivity'],
    gradientColors: COLORS.deepWorkGradients?.extended || ['#5AC8FA', '#4B9EF8'], // blueGradient
    defaultDurationText: '45 min',
    defaultDurationSeconds: minutesToSeconds(45),
    defaultSettings: { duration: minutesToSeconds(45) },
    isQuickStart: false,
  },
  {
    id: 'deepwork_deep_50min',
    title: 'Deep Work Block',
    type: 'Deep Work',
    description: '50-minute intense work session',
    icon: 'timer',
    route: 'DeepWorkSetup',
    tags: ['deep_work', 'intense_focus', 'productivity'],
    gradientColors: COLORS.deepWorkGradients?.deep || ['#5AC8FA', '#4B9EF8'], // blueGradient
    defaultDurationText: '50 min',
    defaultDurationSeconds: minutesToSeconds(50),
    defaultSettings: { duration: minutesToSeconds(50) },
    isQuickStart: false,
  },

  // === Binaural Beats ===
  {
    id: 'binaural_focus_beta_20min',
    title: 'Focus Beats (Beta)',
    type: 'Binaural Beats',
    description: 'Enhance concentration and mental clarity',
    icon: 'brain',
    route: 'BinauralSetup',
    tags: ['focus', 'concentration', 'study', 'work', 'beta_waves'],
    gradientColors: COLORS.binauralGradients?.focus || ['#7D8CC4', '#5D6CAF'], // indigoGradient
    defaultDurationText: '20 min',
    defaultDurationSeconds: minutesToSeconds(20),
    defaultSettings: { binauralType: 'focus', name: 'Focus', frequency: 15, baseFrequency: 200, duration: minutesToSeconds(20), waveform: 'sine', category: 'Beta' },
    category: 'Beta',
    isQuickStart: false, // Requires setup
  },
  {
    id: 'binaural_meditation_theta_15min',
    title: 'Meditation Beats (Theta)',
    type: 'Binaural Beats',
    description: 'Deep relaxation and mindfulness support',
    icon: 'meditation',
    route: 'BinauralSetup',
    tags: ['meditation', 'relaxation', 'mindfulness', 'theta_waves'],
    gradientColors: COLORS.binauralGradients?.meditation || ['#7D8CC4', '#5D6CAF'], // indigoGradient
    defaultDurationText: '15 min',
    defaultDurationSeconds: minutesToSeconds(15),
    defaultSettings: { binauralType: 'meditation', name: 'Meditation', frequency: 6, baseFrequency: 180, duration: minutesToSeconds(15), waveform: 'sine', category: 'Theta' },
    category: 'Theta',
    isQuickStart: false,
  },
  {
    id: 'binaural_creativity_alpha_30min',
    title: 'Creativity Beats (Alpha)',
    type: 'Binaural Beats',
    description: 'Boost creative thinking and flow state',
    icon: 'lightbulb-on-outline',
    route: 'BinauralSetup',
    tags: ['creativity', 'flow_state', 'inspiration', 'alpha_waves'],
    gradientColors: COLORS.binauralGradients?.creativity || ['#7D8CC4', '#5D6CAF'], // indigoGradient
    defaultDurationText: '30 min',
    defaultDurationSeconds: minutesToSeconds(30),
    defaultSettings: { binauralType: 'creativity', name: 'Creativity', frequency: 8, baseFrequency: 160, duration: minutesToSeconds(30), waveform: 'triangle', category: 'Alpha' },
    category: 'Alpha',
    isQuickStart: false,
  },
  {
    id: 'binaural_sleep_theta_30min',
    title: 'Sleep Beats (Theta)',
    type: 'Binaural Beats',
    description: 'Aid in falling asleep and better rest',
    icon: 'power-sleep',
    route: 'BinauralSetup',
    tags: ['sleep', 'relaxation', 'insomnia_aid', 'theta_waves'],
    gradientColors: COLORS.binauralGradients?.sleep || ['#7D8CC4', '#5D6CAF'], // indigoGradient
    defaultDurationText: '30 min',
    defaultDurationSeconds: minutesToSeconds(30),
    defaultSettings: { binauralType: 'sleep', name: 'Sleep', frequency: 4, baseFrequency: 140, duration: minutesToSeconds(30), waveform: 'sine', category: 'Theta' },
    category: 'Theta',
    isQuickStart: false,
  },

  // === Journaling ===
  {
    id: 'journaling_gratitude',
    title: 'Gratitude Journaling',
    type: 'Journaling',
    description: 'Express appreciation for positive aspects',
    icon: 'heart-outline',
    route: 'Journaling', 
    tags: ['gratitude', 'positive_psychology', 'reflection', 'well_being'],
    gradientColors: COLORS.journalingGradients?.gratitude || ['#FFD700', '#FFA500'], // yellowGradient
    defaultDurationText: '5-10 min', // User-defined
    defaultDurationSeconds: null,
    defaultSettings: { promptType: 'gratitude' }, 
    isQuickStart: true, 
  },
  {
    id: 'journaling_reflection',
    title: 'Daily Reflection',
    type: 'Journaling',
    description: 'Explore your thoughts and experiences',
    icon: 'thought-bubble-outline',
    route: 'Journaling',
    tags: ['self_reflection', 'mindfulness', 'personal_growth'],
    gradientColors: COLORS.journalingGradients?.reflection || ['#FFD700', '#FFA500'], // yellowGradient
    defaultDurationText: '5-10 min',
    defaultDurationSeconds: null,
    defaultSettings: { promptType: 'reflection' },
    isQuickStart: true,
  },
  {
    id: 'journaling_growth',
    title: 'Growth Journaling',
    type: 'Journaling',
    description: 'Focus on personal progress and improvement',
    icon: 'chart-line',
    route: 'Journaling',
    tags: ['personal_development', 'goal_setting', 'learning'],
    gradientColors: COLORS.journalingGradients?.growth || ['#FFD700', '#FFA500'], // yellowGradient
    defaultDurationText: '5-10 min',
    defaultDurationSeconds: null,
    defaultSettings: { promptType: 'growth' },
    isQuickStart: true,
  },
  {
    id: 'journaling_free_write',
    title: 'Free Write',
    type: 'Journaling',
    description: 'Unstructured writing to clear your mind',
    icon: 'pencil-outline',
    route: 'Journaling', 
    tags: ['mind_clearing', 'creativity', 'self_expression'],
    gradientColors: COLORS.journalingGradients?.free_write || ['#FFD700', '#FFA500'], // yellowGradient
    defaultDurationText: 'Flexible',
    defaultDurationSeconds: null,
    defaultSettings: { promptType: 'free_write' }, // Special type for no prompt
    isQuickStart: true,
  },
];

console.debug('[MasterExerciseList] Loaded with consistent color scheme', { 
  count: MASTER_EXERCISE_LIST.length,
  colorMapping: {
    mindfulness: 'tealGradient',
    visualization: 'coralGradient', 
    tasks: 'purpleGradient',
    deepWork: 'blueGradient',
    binaural: 'indigoGradient',
    journaling: 'yellowGradient'
  }
});

// It might be useful to have a helper function to get an exercise by ID
export const getExerciseById = (id) => {
  return MASTER_EXERCISE_LIST.find(exercise => exercise.id === id) || null;
};

// Note: Exercise-specific gradients are now properly defined in theme.js
// Each exercise type has a consistent color scheme:
// - Mindfulness: tealGradient (#00B894 → #007E66)
// - Visualization: coralGradient (#FF7675 → #FF5D5D) 
// - Deep Work: blueGradient (#5AC8FA → #4B9EF8)
// - Binaural Beats: indigoGradient (#7D8CC4 → #5D6CAF)
// - Journaling: yellowGradient (#FFD700 → #FFA500)
// - Task Planning: purpleGradient (#6C63FF → #5F52EE)