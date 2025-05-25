import { supabase } from '../config/supabase';

/**
 * Fetches and calculates the progress summary for a given user.
 * - Focus Time (Binaural Beats, Deep Work) in minutes.
 * - Mindful Minutes (Visualization, Mindfulness) in minutes.
 * - Total Completed Exercises.
 * - Active Days (unique days with any completed exercise).
 * 
 * @param {string} userId The ID of the user.
 * @returns {Promise<object>} An object containing the progress summary:
 *   {
 *     focusTimeMinutes: number,
 *     mindfulMinutes: number,
 *     totalExercisesCompleted: number,
 *     activeDays: number,
 *   }
 */
export const getProgressSummary = async (userId) => {
  if (!userId) {
    console.error('[getProgressSummary] User ID is required.');
    throw new Error('User ID is required to fetch progress summary.');
  }

  console.debug(`[getProgressSummary] Fetching progress for user: ${userId}`);

  try {
    // --- 1. Focus Time --- 
    let totalFocusSeconds = 0;

    // Binaural Beats: sum of actual_duration_seconds where completed = true
    const { data: binauralData, error: binauralError } = await supabase
      .from('binaural_sessions')
      .select('actual_duration_seconds, completed_at')
      .eq('user_id', userId)
      .eq('completed', true);

    if (binauralError) {
      console.error('[getProgressSummary] Error fetching binaural sessions:', binauralError.message);
      // Decide if to throw or continue with partial data
      throw new Error(`Error fetching binaural sessions: ${binauralError.message}`);
    }
    binauralData.forEach(session => {
      if (session.actual_duration_seconds) {
        totalFocusSeconds += session.actual_duration_seconds;
      }
    });
    console.debug(`[getProgressSummary] Binaural focus seconds: ${totalFocusSeconds}`);

    // Deep Work: sum of (end_time - start_time) where end_time is not null
    const { data: deepWorkData, error: deepWorkError } = await supabase
      .from('deep_work_sessions')
      .select('start_time, end_time')
      .eq('user_id', userId)
      .not('end_time', 'is', null);

    if (deepWorkError) {
      console.error('[getProgressSummary] Error fetching deep work sessions:', deepWorkError.message);
      throw new Error(`Error fetching deep work sessions: ${deepWorkError.message}`);
    }
    deepWorkData.forEach(session => {
      if (session.start_time && session.end_time) {
        const startTime = new Date(session.start_time);
        const endTime = new Date(session.end_time);
        const durationMillis = endTime - startTime;
        if (durationMillis > 0) {
          totalFocusSeconds += Math.floor(durationMillis / 1000);
        }
      }
    });
    console.debug(`[getProgressSummary] Total focus seconds (after deep work): ${totalFocusSeconds}`);

    const focusTimeMinutes = Math.floor(totalFocusSeconds / 60);

    // --- 2. Mindful Minutes ---
    let totalMindfulSeconds = 0;

    // Visualization: sum of duration_seconds where completed = true
    const { data: vizData, error: vizError } = await supabase
      .from('visualizations')
      .select('duration_seconds, completed_at')
      .eq('user_id', userId)
      .eq('completed', true);

    if (vizError) {
      console.error('[getProgressSummary] Error fetching visualization sessions:', vizError.message);
      throw new Error(`Error fetching visualization sessions: ${vizError.message}`);
    }
    vizData.forEach(session => {
      if (session.duration_seconds) {
        totalMindfulSeconds += session.duration_seconds;
      }
    });
    console.debug(`[getProgressSummary] Visualization mindful seconds: ${totalMindfulSeconds}`);

    // Mindfulness: sum of duration_seconds where completed = true
    const { data: mindfulData, error: mindfulError } = await supabase
      .from('mindfulness_logs')
      .select('duration_seconds, completed_at')
      .eq('user_id', userId)
      .eq('completed', true);

    if (mindfulError) {
      console.error('[getProgressSummary] Error fetching mindfulness logs:', mindfulError.message);
      throw new Error(`Error fetching mindfulness logs: ${mindfulError.message}`);
    }
    mindfulData.forEach(session => {
      if (session.duration_seconds) {
        totalMindfulSeconds += session.duration_seconds;
      }
    });
    console.debug(`[getProgressSummary] Total mindful seconds (after mindfulness logs): ${totalMindfulSeconds}`);

    const mindfulMinutes = Math.floor(totalMindfulSeconds / 60);

    // --- 3. Total Completed Exercises ---
    let totalExercisesCompleted = 0;
    // Counts from already fetched data where applicable, or new counts for completed items.
    totalExercisesCompleted += binauralData.filter(s => s.actual_duration_seconds !== null && s.actual_duration_seconds >=0 ).length; // Count completed binaural
    totalExercisesCompleted += deepWorkData.length; // All fetched deep work sessions are completed (end_time is not null)
    totalExercisesCompleted += vizData.filter(s => s.duration_seconds !== null && s.duration_seconds >=0 ).length; // Count completed visualizations
    totalExercisesCompleted += mindfulData.filter(s => s.duration_seconds !== null && s.duration_seconds >=0 ).length; // Count completed mindfulness

    console.debug(`[getProgressSummary] Total exercises completed: ${totalExercisesCompleted}`);

    // --- 4. Active Days ---
    // Collect all completion timestamps (UTC date strings)
    const completionDates = new Set();

    binauralData.forEach(session => {
      if (session.completed_at) {
        completionDates.add(new Date(session.completed_at).toISOString().split('T')[0]);
      }
    });
    // For now, let's re-fetch with completed_at for simplicity for active days calculation for binaural
    // const { data: binauralDatesData, error: binauralDatesError } = await supabase
    //     .from('binaural_sessions')
    //     .select('completed_at')
    //     .eq('user_id', userId)
    //     .eq('completed', true)
    //     .not('completed_at', 'is', null);
    // if (binauralDatesError) throw new Error(`Error fetching binaural completion dates: ${binauralDatesError.message}`);
    // binauralDatesData.forEach(s => completionDates.add(new Date(s.completed_at).toISOString().split('T')[0]));

    deepWorkData.forEach(session => {
      if (session.end_time) {
        completionDates.add(new Date(session.end_time).toISOString().split('T')[0]);
      }
    });

    // Re-fetch for visualization with completed_at
    // const { data: vizDatesData, error: vizDatesError } = await supabase
    //     .from('visualizations')
    //     .select('completed_at')
    //     .eq('user_id', userId)
    //     .eq('completed', true)
    //     .not('completed_at', 'is', null);
    // if (vizDatesError) throw new Error(`Error fetching viz completion dates: ${vizDatesError.message}`);
    // vizDatesData.forEach(s => completionDates.add(new Date(s.completed_at).toISOString().split('T')[0]));
    vizData.forEach(session => {
      if (session.completed_at) {
        completionDates.add(new Date(session.completed_at).toISOString().split('T')[0]);
      }
    });

    // Re-fetch for mindfulness with completed_at
    // const { data: mindfulDatesData, error: mindfulDatesError } = await supabase
    //     .from('mindfulness_logs')
    //     .select('completed_at')
    //     .eq('user_id', userId)
    //     .eq('completed', true)
    //     .not('completed_at', 'is', null);
    // if (mindfulDatesError) throw new Error(`Error fetching mindful completion dates: ${mindfulDatesError.message}`);
    // mindfulDatesData.forEach(s => completionDates.add(new Date(s.completed_at).toISOString().split('T')[0]));
    mindfulData.forEach(session => {
      if (session.completed_at) {
        completionDates.add(new Date(session.completed_at).toISOString().split('T')[0]);
      }
    });

    const activeDays = completionDates.size;
    console.debug(`[getProgressSummary] Active days: ${activeDays}, Unique dates found:`, Array.from(completionDates));

    const summary = {
      focusTimeMinutes,
      mindfulMinutes,
      totalExercisesCompleted,
      activeDays,
    };

    console.debug('[getProgressSummary] Summary calculated:', summary);
    return summary;

  } catch (error) {
    console.error('[getProgressSummary] Failed to calculate progress summary:', error.message);
    // Return a default/error state or rethrow
    // For now, rethrow to let the caller handle it.
    // In a real app, might return a default object like all zeros.
    throw error; 
  }
}; 