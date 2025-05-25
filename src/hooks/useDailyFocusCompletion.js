import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase'; // Assuming supabase config is at src/config/supabase.js

// Comprehensive configuration for ALL trackable exercises
const ALL_EXERCISES_COMPLETION_CONFIG = {
  mindfulness: { tableName: 'mindfulness_logs', dateColumn: 'completed_at', completedColumn: 'completed' },
  visualization: { tableName: 'visualizations', dateColumn: 'completed_at', completedColumn: 'completed' },
  tasks: { tableName: 'tasks', dateColumn: 'updated_at', completedColumn: 'completed' }, 
  deepwork: { tableName: 'deep_work_sessions', dateColumn: 'end_time', completedColumn: null },
  binaural: { tableName: 'binaural_sessions', dateColumn: 'completed_at', completedColumn: 'completed' },
  journaling: { tableName: 'journal_entries', dateColumn: 'created_at', completedColumn: null }, // Completion implicit by creation today
};

/**
 * Custom hook to check the completion status of a given list of exercises for the current day.
 * @param {string[]} exerciseIdsToTrack - An array of exercise IDs (e.g., ['mindfulness', 'tasks']) to track.
 * @returns {object} { dailyCompletionStatus, loadingCompletion, completionError, refreshDailyStatus }
 */
const useDailyFocusCompletion = (exerciseIdsToTrack = []) => {
  const [dailyCompletionStatus, setDailyCompletionStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sort and stringify exerciseIdsToTrack for stable dependency in useCallback/useEffect
  const stableExerciseIdsKey = JSON.stringify([...exerciseIdsToTrack].sort());

  console.debug(`[useDailyFocusCompletion] Hook initialized. Tracking: ${stableExerciseIdsKey}`);

  const fetchCompletionStatus = useCallback(async () => {
    if (!exerciseIdsToTrack || exerciseIdsToTrack.length === 0) {
      console.debug('[useDailyFocusCompletion] No exercises to track. Setting empty status.');
      setDailyCompletionStatus({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    console.debug(`[useDailyFocusCompletion] Fetching daily completion status for: ${stableExerciseIdsKey}`);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('[useDailyFocusCompletion] User not found. Cannot fetch completion status.');
        setLoading(false);
        setDailyCompletionStatus({});
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const newCompletionStatus = {};

      for (const exerciseId of exerciseIdsToTrack) {
        const config = ALL_EXERCISES_COMPLETION_CONFIG[exerciseId];
        if (!config) {
          console.warn(`[useDailyFocusCompletion] No configuration found for exerciseId: ${exerciseId}. Skipping.`);
          newCompletionStatus[exerciseId] = false; // Default to false if unknown
          continue;
        }

        console.debug(`[useDailyFocusCompletion] Querying ${config.tableName} for ${exerciseId}`);
        
        let query;
        let count = 0; // Initialize count

        if (exerciseId === 'tasks') {
          // Try a simpler select for tasks as a diagnostic step / workaround
          console.debug('[useDailyFocusCompletion] Using simplified select for tasks table.');
          query = supabase
            .from(config.tableName)
            .select('id') // Simpler select
            .eq('user_id', user.id)
            .gte(config.dateColumn, today.toISOString())
            .lt(config.dateColumn, tomorrow.toISOString());
          if (config.completedColumn) {
            query = query.eq(config.completedColumn, true);
          }
          const { data: taskLogs, error: taskDbError } = await query;
          let dbError = taskDbError; // Assign to the outer scope dbError
          if (taskLogs) {
            count = taskLogs.length; // Get count from the length of the result
          }
        } else {
          // Original efficient query for other tables
          query = supabase
            .from(config.tableName)
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte(config.dateColumn, today.toISOString())
            .lt(config.dateColumn, tomorrow.toISOString());
          if (config.completedColumn) {
            query = query.eq(config.completedColumn, true);
          }
          const { error: otherDbError, count: otherCount } = await query;
          dbError = otherDbError; // Assign to the outer scope dbError
          count = otherCount;     // Assign to the outer scope count
        }
        
        if (dbError) {
          console.error(`[useDailyFocusCompletion] Error fetching from ${config.tableName} for ${exerciseId}:`, dbError.message);
          newCompletionStatus[exerciseId] = false; 
          // Optionally, set a general error state or collect individual errors
          setError(prevError => prevError ? `${prevError}, ${dbError.message}` : dbError.message);
          continue; 
        }

        if (count && count > 0) {
          console.debug(`[useDailyFocusCompletion] ${exerciseId} completed today (count: ${count}).`);
          newCompletionStatus[exerciseId] = true;
        } else {
          console.debug(`[useDailyFocusCompletion] ${exerciseId} not completed today.`);
          newCompletionStatus[exerciseId] = false;
        }
      }

      console.debug('[useDailyFocusCompletion] Daily completion status fetched:', newCompletionStatus);
      setDailyCompletionStatus(newCompletionStatus);
    } catch (err) {
      console.error('[useDailyFocusCompletion] General error:', err.message);
      setError(err.message);
      setDailyCompletionStatus({});
    } finally {
      setLoading(false);
    }
  }, [stableExerciseIdsKey]); // Depend on the stable key of exercise IDs

  useEffect(() => {
    fetchCompletionStatus();
  }, [fetchCompletionStatus]);

  const refreshDailyStatus = useCallback(() => {
    console.debug('[useDailyFocusCompletion] Manual refresh triggered.');
    fetchCompletionStatus();
  }, [fetchCompletionStatus]);

  return {
    dailyCompletionStatus,
    loadingCompletion: loading,
    completionError: error,
    refreshDailyStatus,
  };
};

export default useDailyFocusCompletion; 