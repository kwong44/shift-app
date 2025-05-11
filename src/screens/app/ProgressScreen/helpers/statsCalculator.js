// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[StatsCalculator] ${message}`, data);
  }
};

// Add week calculation method to Date prototype if not exists
if (!Date.prototype.getWeek) {
  Date.prototype.getWeek = function() {
    const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  };
}

export const calculateWeeklyStreak = (exercises) => {
  debug.log('Calculating weekly streak from exercises:', exercises?.length);
  if (!exercises || exercises.length === 0) return 0;
  
  const today = new Date();
  const oneWeekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
  const activeInLastWeek = exercises.some(ex => new Date(ex.created_at) > oneWeekAgo);
  return activeInLastWeek ? 1 : 0;
};

export const calculateWeeklyProgress = (exercises) => {
  debug.log('Calculating weekly progress from exercises:', exercises?.length);
  if (!exercises || exercises.length === 0) return [];
  
  const weeklyData = exercises.reduce((acc, ex) => {
    const date = new Date(ex.created_at);
    const week = `${date.getFullYear()}-W${date.getWeek()}`;
    acc[week] = (acc[week] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(weeklyData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-8)
    .map(([week, count]) => ({ week, count }));
};

export const calculateExerciseBreakdown = (exercises) => {
  debug.log('Calculating exercise breakdown from exercises:', exercises?.length);
  return (exercises || []).reduce((acc, exercise) => {
    acc[exercise.type] = (acc[exercise.type] || 0) + 1;
    return acc;
  }, {});
};

export const calculateFocusTime = (exercises) => {
  debug.log('Calculating total focus time from exercises:', exercises?.length);
  return Math.round(
    (exercises || [])
      .filter(ex => ex.type === 'deep_work' || ex.type === 'focus')
      .reduce((total, ex) => total + (ex.duration || 0), 0) / 60
  );
};

export const calculateMindfulMinutes = (exercises) => {
  debug.log('Calculating mindful minutes from exercises:', exercises?.length);
  return Math.round(
    (exercises || [])
      .filter(ex => ex.type === 'mindfulness' || ex.type === 'meditation')
      .reduce((total, ex) => total + (ex.duration || 0), 0) / 60
  );
};
