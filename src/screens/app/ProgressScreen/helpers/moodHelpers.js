import { COLORS } from '../../../../config/theme';

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[MoodHelpers] ${message}`, data);
  }
};

export const getMoodIcon = (trend) => {
  debug.log('Getting mood icon for trend:', trend);
  switch (trend) {
    case 'positive': return 'emoticon-happy-outline';
    case 'negative': return 'emoticon-sad-outline';
    default: return 'emoticon-neutral-outline';
  }
};

export const getMoodColor = (trend) => {
  debug.log('Getting mood color for trend:', trend);
  switch (trend) {
    case 'positive': return COLORS.success;
    case 'negative': return COLORS.error;
    default: return COLORS.textLight;
  }
};

export const calculateMoodTrend = (moods) => {
  debug.log('Calculating mood trend from moods:', moods?.length);
  if (!moods || moods.length === 0) return 'neutral';
  const moodScores = moods.map(m => parseInt(m.mood, 10)).filter(score => !isNaN(score));
  if (moodScores.length === 0) return 'neutral';
  const average = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;
  return average > 3.5 ? 'positive' : average < 2.5 ? 'negative' : 'neutral';
};
