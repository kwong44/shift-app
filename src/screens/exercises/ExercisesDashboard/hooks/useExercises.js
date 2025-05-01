import { useState, useEffect } from 'react';
import { supabase } from '../../../../config/supabase';

const useExercises = () => {
  const [completedExercises, setCompletedExercises] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug logging
  console.debug('useExercises hook initialized');

  const loadCompletedExercises = async () => {
    try {
      console.debug('Fetching completed exercises');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: logs, error } = await supabase
        .from('progress_logs')
        .select('exercise_type')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString());

      if (error) throw error;

      console.debug('Completed exercises data received:', { logs });

      const completed = {};
      logs.forEach(log => {
        completed[log.exercise_type] = true;
      });

      setCompletedExercises(completed);
    } catch (err) {
      console.error('Error in useExercises:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompletedExercises();
  }, []);

  return {
    completedExercises,
    loading,
    error,
    refreshExercises: loadCompletedExercises
  };
};

export default useExercises; 