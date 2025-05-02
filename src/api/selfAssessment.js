import { supabase } from '../config/supabase';

/**
 * Submit a user's self-assessment to Supabase
 * @param {string} userId - The user's ID from Supabase Auth
 * @param {object} responses - Assessment responses { currentHabits, improvementAreas, longTermGoals, engagementPrefs }
 * @returns {Promise} - The created self-assessment record
 */
export const submitSelfAssessment = async (userId, responses) => {
  try {
    console.log('[SelfAssessment] Submitting assessment for user:', userId);
    console.log('[SelfAssessment] Assessment data:', responses);

    // Validate the responses object
    if (!responses.currentHabits || !responses.engagementPrefs || !responses.satisfactionBaseline) {
      console.error('[SelfAssessment] Missing required data:', {
        hasCurrentHabits: !!responses.currentHabits,
        hasEngagementPrefs: !!responses.engagementPrefs,
        hasSatisfactionBaseline: !!responses.satisfactionBaseline
      });
      throw new Error('Missing required assessment data');
    }

    // Format the responses for storage
    const formattedResponses = {
      habits: {
        current: responses.currentHabits,
        timestamp: new Date().toISOString()
      },
      satisfaction_baseline: {
        ...responses.satisfactionBaseline,
        timestamp: new Date().toISOString()
      },
      engagement_preferences: {
        ...responses.engagementPrefs,
        timestamp: new Date().toISOString()
      }
    };

    console.log('[SelfAssessment] Formatted responses:', formattedResponses);

    const { data, error } = await supabase
      .from('self_assessments')
      .insert({
        user_id: userId,
        responses: formattedResponses,
        assessment_version: 2
      })
      .select()
      .single();
      
    if (error) {
      console.error('[SelfAssessment] Database error:', error);
      throw error;
    }

    console.log('[SelfAssessment] Successfully submitted:', data);
    return data;
  } catch (error) {
    console.error('[SelfAssessment] Error:', error.message);
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
    if (!userId) return false;

    // Check both self_assessments and roadmaps to ensure complete onboarding
    const [assessmentResult, roadmapResult] = await Promise.all([
      supabase
        .from('self_assessments')
        .select('id, created_at')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('roadmaps')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()
    ]);

    // Log for debugging
    console.debug('Assessment check results:', {
      userId,
      hasAssessment: !!assessmentResult.data,
      hasRoadmap: !!roadmapResult.data,
      assessmentError: assessmentResult.error,
      roadmapError: roadmapResult.error
    });

    // Return true only if both assessment and roadmap exist
    return !!(assessmentResult.data && roadmapResult.data);
  } catch (error) {
    console.error('Error in hasCompletedAssessment:', error);
    // Return false on error to ensure user can complete assessment
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
    console.log('[SelfAssessment] Getting stats for user:', userId);

    const { data, error } = await supabase
      .from('self_assessments')
      .select('responses')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    const responses = data.responses;
    const stats = {
      totalHabits: responses.habits?.current?.length || 0,
      satisfactionScore: responses.satisfaction_baseline?.overallScore || 0,
      preferredExercises: responses.engagement_preferences?.preferredExercises?.length || 0,
      lastUpdated: responses.engagement_preferences?.timestamp || new Date().toISOString()
    };

    console.log('[SelfAssessment] Stats calculated:', stats);
    return stats;
  } catch (error) {
    console.error('[SelfAssessment] Error getting stats:', error.message);
    throw error;
  }
}; 