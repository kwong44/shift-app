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
    gradientColors: COLORS.mindfulnessGradients?.breath || ['#4C63B6', '#3949AB'],
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
    gradientColors: COLORS.mindfulnessGradients?.body || ['#7D8CC4', '#5C6BC0'],
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
    gradientColors: COLORS.mindfulnessGradients?.senses || ['#5C96AE', '#4A7B8A'],
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
    gradientColors: COLORS.visualizationGradients?.goals || ['#4C63B6', '#3F51B5'],
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
    gradientColors: COLORS.visualizationGradients?.ideal_life || ['#FF7675', '#FF5D5D'],
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
    gradientColors: COLORS.visualizationGradients?.confidence || ['#7D8CC4', '#5C6BC0'],
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
    gradientColors: COLORS.visualizationGradients?.contentment || ['#00B894', '#00A383'],
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
    gradientColors: COLORS.visualizationGradients?.calm || ['#5C96AE', '#4A7F9B'],
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
    gradientColors: COLORS.purpleGradient ? [COLORS.purpleGradient.start, COLORS.purpleGradient.end] : ['#6A1B9A', '#4A148C'],
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
    gradientColors: COLORS.deepWorkGradients?.pomodoro || ['#4C63B6', '#3F51B5'],
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
    gradientColors: COLORS.deepWorkGradients?.extended || ['#7D8CC4', '#5C6BC0'],
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
    gradientColors: COLORS.deepWorkGradients?.deep || ['#5C96AE', '#4A7F9B'],
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
    gradientColors: COLORS.binauralGradients?.focus || ['#1E88E5', '#1565C0'], // Example blue
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
    gradientColors: COLORS.binauralGradients?.meditation || ['#7E57C2', '#5E35B1'], // Example purple
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
    gradientColors: COLORS.binauralGradients?.creativity || ['#FFB300', '#FF8F00'], // Example amber
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
    gradientColors: COLORS.binauralGradients?.sleep || ['#424242', '#212121'], // Example dark grey
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
    gradientColors: COLORS.journalingGradients?.gratitude || ['#4C63B6', '#3F51B5'],
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
    gradientColors: COLORS.journalingGradients?.reflection || ['#7D8CC4', '#5C6BC0'],
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
    gradientColors: COLORS.journalingGradients?.growth || ['#5C96AE', '#4A7F9B'],
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
    gradientColors: COLORS.journalingGradients?.free_write || ['#BDBDBD', '#9E9E9E'], // Example grey
    defaultDurationText: 'Flexible',
    defaultDurationSeconds: null,
    defaultSettings: { promptType: 'free_write' }, // Special type for no prompt
    isQuickStart: true,
  },
];

console.debug('[MasterExerciseList] Loaded', { count: MASTER_EXERCISE_LIST.length });

// It might be useful to have a helper function to get an exercise by ID
export const getExerciseById = (id) => {
  return MASTER_EXERCISE_LIST.find(exercise => exercise.id === id) || null;
};

// Placeholder for color gradients if not defined in theme, to avoid errors
// This ensures that if you haven't defined these specific gradient objects in your COLORS theme,
// the app won't crash. You can refine these default fallbacks or add them to your theme.
if (!COLORS.mindfulnessGradients) COLORS.mindfulnessGradients = {};
if (!COLORS.visualizationGradients) COLORS.visualizationGradients = {};
if (!COLORS.deepWorkGradients) COLORS.deepWorkGradients = {};
if (!COLORS.binauralGradients) COLORS.binauralGradients = {};
if (!COLORS.journalingGradients) COLORS.journalingGradients = {};
if (!COLORS.purpleGradient) COLORS.purpleGradient = { start: '#AB47BC', end: '#8E24AA' }; // Default purple