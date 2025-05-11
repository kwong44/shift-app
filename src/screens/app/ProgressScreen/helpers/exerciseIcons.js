import { MaterialCommunityIcons } from '@expo/vector-icons';

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[ExerciseIcons] ${message}`, data);
  }
};

export const formatExerciseType = (type) => {
  if (!type) return 'Unknown';
  return type
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getExerciseIcon = (type) => {
  debug.log('Getting icon for exercise type:', type);
  const icons = {
    mindfulness: 'meditation',
    deep_work: 'brain',
    binaural_beats: 'headphones',
    visualization: 'eye-outline',
    journaling: 'notebook-edit-outline',
    task_planning: 'format-list-checks',
    focus: 'crosshairs-gps',
    meditation: 'meditation',
  };
  return icons[type] || 'weight-lifter';
};
