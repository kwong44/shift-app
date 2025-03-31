import { supabase } from '../config/supabase';

/**
 * Submit a user's self-assessment to Supabase
 * @param {string} userId - The user's ID from Supabase Auth
 * @param {object} responses - Assessment responses { currentHabits, improvementAreas, longTermGoals, engagementPrefs }
 * @returns {Promise} - The created self-assessment record
 */
export const submitSelfAssessment = async (userId, responses) => {
  try {
    // Validate the responses object
    if (!responses.currentHabits || !responses.improvementAreas || !responses.longTermGoals || !responses.engagementPrefs) {
      throw new Error('Missing required assessment data');
    }

    // Format the responses for storage
    const formattedResponses = {
      habits: {
        current: responses.currentHabits,
        timestamp: new Date().toISOString()
      },
      improvement_areas: {
        areas: responses.improvementAreas,
        timestamp: new Date().toISOString()
      },
      goals: {
        long_term: responses.longTermGoals,
        timestamp: new Date().toISOString()
      },
      engagement_preferences: {
        ...responses.engagementPrefs,
        timestamp: new Date().toISOString()
      }
    };

    const { data, error } = await supabase
      .from('self_assessments')
      .insert({
        user_id: userId,
        responses: formattedResponses
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

/**
 * Check if a user has completed their self-assessment
 * @param {string} userId - The user's ID from Supabase Auth
 * @returns {Promise<boolean>} - Whether the user has completed their assessment
 */
export const hasCompletedAssessment = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('self_assessments')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking assessment completion:', error.message);
    return false;
  }
};

/**
 * Get assessment completion statistics
 * @param {string} userId - The user's ID from Supabase Auth
 * @returns {Promise} - Assessment statistics
 */
export const getAssessmentStats = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('self_assessments')
      .select('responses')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    const responses = data.responses;
    return {
      totalHabits: responses.habits.current.length,
      totalImprovementAreas: responses.improvement_areas.areas.length,
      totalGoals: Object.keys(responses.goals.long_term).length,
      preferredExercises: responses.engagement_preferences.preferredExercises.length,
      lastUpdated: responses.engagement_preferences.timestamp
    };
  } catch (error) {
    console.error('Error getting assessment stats:', error.message);
    throw error;
  }
}; 