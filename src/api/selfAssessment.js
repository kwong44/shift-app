import { supabase } from '../config/supabase';

/**
 * Submit a user's self-assessment to Supabase
 * @param {string} userId - The user's ID from Supabase Auth
 * @param {object} responses - Assessment responses { currentHabits, improvementAreas, longTermGoals, engagementPrefs }
 * @returns {Promise} - The created self-assessment record
 */
export const submitSelfAssessment = async (userId, responses) => {
  try {
    const { data, error } = await supabase
      .from('self_assessments')
      .insert({
        user_id: userId,
        responses
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error submitting self-assessment:', error.message);
    throw error;
  }
};

/**
 * Get a user's latest self-assessment
 * @param {string} userId - The user's ID from Supabase Auth
 * @returns {Promise} - The latest self-assessment record
 */
export const getLatestSelfAssessment = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('self_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows returned" error
    return data;
  } catch (error) {
    console.error('Error getting self-assessment:', error.message);
    throw error;
  }
}; 