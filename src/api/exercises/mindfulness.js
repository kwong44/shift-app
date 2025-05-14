import { supabase } from '../../config/supabase';

/**
 * Log a mindfulness check-in
 * @param {string} userId - The user's ID
 * @param {object} response - The mindfulness check-in response
 * @returns {Promise} - The created log
 */
export const logMindfulnessCheckIn = async (userId, response) => {
  try {
    console.debug('[logMindfulnessCheckIn] Logging check-in:', { userId });
    
    const { data, error } = await supabase
      .from('mindfulness_logs')
      .insert({
        user_id: userId,
        response,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error logging mindfulness check-in:', error.message);
    throw error;
  }
}; 