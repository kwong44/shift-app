import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

console.debug('[useDailyFocusCompletion] Hook file loaded.');

/**
 * Custom hook to check the completion status of a given list of exercises for the current day from the `daily_exercise_logs` table.
 * @param {string[]} exerciseIdsToTrack - An array of exercise IDs (e.g., ['mindfulness_breath_5min', 'tasks_planner']) to track.
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
    console.debug(`[useDailyFocusCompletion] Fetching daily completion status for: ${stableExerciseIdsKey} from daily_exercise_logs`);

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
      const todayISO = today.toISOString();
      
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const tomorrowISO = tomorrow.toISOString();

      console.debug(`[useDailyFocusCompletion] Querying daily_exercise_logs for user ${user.id} between ${todayISO} and ${tomorrowISO}`);

      const { data: completedLogs, error: dbError } = await supabase
        .from('daily_exercise_logs')
        .select('exercise_id') // Select only the exercise_id
        .eq('user_id', user.id)
        .gte('completed_at', todayISO)
        .lt('completed_at', tomorrowISO);

      if (dbError) {
        console.error('[useDailyFocusCompletion] Error fetching from daily_exercise_logs:', dbError.message);
        setError(dbError.message);
        // Initialize all tracked exercises to false on error
        const errorStatus = {};
        exerciseIdsToTrack.forEach(id => errorStatus[id] = false);
        setDailyCompletionStatus(errorStatus);
        setLoading(false);
        return;
      }

      const completedTodaySet = new Set();
      if (completedLogs) {
        completedLogs.forEach(log => completedTodaySet.add(log.exercise_id));
        console.debug('[useDailyFocusCompletion] Exercise IDs completed today from DB:', Array.from(completedTodaySet));
      }

      const newCompletionStatus = {};
      exerciseIdsToTrack.forEach(exerciseId => {
        newCompletionStatus[exerciseId] = completedTodaySet.has(exerciseId);
      });

      console.debug('[useDailyFocusCompletion] Daily completion status processed:', newCompletionStatus);
      setDailyCompletionStatus(newCompletionStatus);

    } catch (err) {
      console.error('[useDailyFocusCompletion] General error in fetchCompletionStatus:', err.message);
      setError(err.message);
       // Initialize all tracked exercises to false on general error
      const generalErrorStatus = {};
      exerciseIdsToTrack.forEach(id => generalErrorStatus[id] = false);
      setDailyCompletionStatus(generalErrorStatus);
    } finally {
      setLoading(false);
    }
  }, [stableExerciseIdsKey, exerciseIdsToTrack]); // exerciseIdsToTrack added as it's used in error path

  useEffect(() => {
    // Ensure fetchCompletionStatus is called only when exerciseIdsToTrack is not empty
    // and user is available (implicit by fetchCompletionStatus internal check)
    if (exerciseIdsToTrack.length > 0) {
        fetchCompletionStatus();
    }
  }, [fetchCompletionStatus, exerciseIdsToTrack.length]); // re-run if the function or number of items to track changes

  const refreshDailyStatus = useCallback(() => {
    console.debug('[useDailyFocusCompletion] Manual refresh triggered.');
    if (exerciseIdsToTrack.length > 0) {
        fetchCompletionStatus();
    }
  }, [fetchCompletionStatus, exerciseIdsToTrack.length]);

  return {
    dailyCompletionStatus,
    loadingCompletion: loading,
    completionError: error,
    refreshDailyStatus,
  };
};

export default useDailyFocusCompletion; 