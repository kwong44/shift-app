export * from './binaural';
export * from './visualization';
export * from './tasks';
export * from './deepWork';
export * from './mindfulness';
export * from './journaling';
export * from './goals';

import { supabase } from '../../config/supabase';

/**
 * Get exercise breakdown data for the last 30 days
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} - Array of exercise breakdown data grouped by type
 */
export const getExerciseBreakdown = async (userId) => {
  try {
    console.debug('[getExerciseBreakdown] Fetching exercise breakdown for user:', userId);
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    
    console.debug('[getExerciseBreakdown] Fetching data from:', thirtyDaysAgo.toISOString());

    // Fetch exercise logs from the last 30 days
    const { data: exerciseLogs, error } = await supabase
      .from('daily_exercise_logs')
      .select('exercise_type, duration_seconds, completed_at')
      .eq('user_id', userId)
      .gte('completed_at', thirtyDaysAgo.toISOString())
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('[getExerciseBreakdown] Database error:', error);
      throw error;
    }

    console.debug('[getExerciseBreakdown] Raw exercise logs:', exerciseLogs?.length || 0, 'entries');

    // Group and aggregate data by exercise type
    const breakdown = {};
    
    if (exerciseLogs && exerciseLogs.length > 0) {
      exerciseLogs.forEach(log => {
        const type = log.exercise_type;
        
        if (!breakdown[type]) {
          breakdown[type] = {
            type: type,
            count: 0,
            totalDurationSeconds: 0,
            totalDurationMinutes: 0,
            percentage: 0
          };
        }
        
        breakdown[type].count += 1;
        breakdown[type].totalDurationSeconds += log.duration_seconds || 0;
      });

      // Calculate total exercises and percentages
      const totalExercises = exerciseLogs.length;
      
      Object.keys(breakdown).forEach(type => {
        breakdown[type].totalDurationMinutes = Math.round(breakdown[type].totalDurationSeconds / 60);
        breakdown[type].percentage = Math.round((breakdown[type].count / totalExercises) * 100);
      });
    }

    // Convert to array and sort by count (most frequent first)
    const breakdownArray = Object.values(breakdown).sort((a, b) => b.count - a.count);
    
    console.debug('[getExerciseBreakdown] Processed breakdown:', breakdownArray);
    
    return breakdownArray;
  } catch (error) {
    console.error('[getExerciseBreakdown] Error:', error.message);
    throw error;
  }
};

/**
 * Get total exercise statistics for the last 30 days
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - Object with total stats
 */
export const getExerciseStats = async (userId) => {
  try {
    console.debug('[getExerciseStats] Fetching exercise stats for user:', userId);
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Fetch exercise logs from the last 30 days
    const { data: exerciseLogs, error } = await supabase
      .from('daily_exercise_logs')
      .select('duration_seconds, completed_at')
      .eq('user_id', userId)
      .gte('completed_at', thirtyDaysAgo.toISOString());

    if (error) {
      console.error('[getExerciseStats] Database error:', error);
      throw error;
    }

    const totalExercises = exerciseLogs?.length || 0;
    const totalDurationSeconds = exerciseLogs?.reduce((sum, log) => sum + (log.duration_seconds || 0), 0) || 0;
    const totalDurationMinutes = Math.round(totalDurationSeconds / 60);

    // Calculate unique days with exercises
    const uniqueDays = new Set();
    exerciseLogs?.forEach(log => {
      const date = new Date(log.completed_at);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      uniqueDays.add(dateString);
    });

    const activeDays = uniqueDays.size;

    const stats = {
      totalExercises,
      totalDurationMinutes,
      activeDays,
      averagePerDay: activeDays > 0 ? Math.round(totalExercises / activeDays * 10) / 10 : 0
    };

    console.debug('[getExerciseStats] Calculated stats:', stats);
    
    return stats;
  } catch (error) {
    console.error('[getExerciseStats] Error:', error.message);
    throw error;
  }
}; 