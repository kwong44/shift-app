export { default as MoodModal } from './MoodModal';
export { default as TopBar } from './TopBar';
export { default as GrowthRoadmap } from './GrowthRoadmap';
export { default as DailyFocus } from './DailyFocus';
export { default as Insights } from './Insights';
export { default as PhaseUpModal } from '../../../../components/common/PhaseUpModal';

// Constants used across components
export const EMOTIONS = [
  { id: 'motivated', label: 'Motivated', color: '#4CAF50', icon: 'rocket-launch' },
  { id: 'grateful', label: 'Grateful', color: '#9C27B0', icon: 'heart' },
  { id: 'calm', label: 'Calm', color: '#2196F3', icon: 'water' },
  { id: 'anxious', label: 'Anxious', color: '#FFC107', icon: 'alert' },
  { id: 'overwhelmed', label: 'Overwhelmed', color: '#F44336', icon: 'lightning-bolt' }
];

// Keeping for backward compatibility but should be removed eventually
export const MOODS = EMOTIONS; 