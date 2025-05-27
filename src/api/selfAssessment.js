import { supabase } from '../config/supabase';

/**
 * Submit a user's self-assessment to Supabase
 * @param {string} userId - The user's ID from Supabase Auth
 * @param {object} responses - Assessment responses { satisfactionBaseline, engagementPrefs, growthAreas, aspirations }
 * @returns {Promise} - The created self-assessment record
 */
export const submitSelfAssessment = async (userId, responses) => {
  try {
    console.log('[SelfAssessment] Submitting assessment for user:', userId);
    // Log the incoming responses, ensuring sensitive data is handled appropriately if necessary in a real app
    console.log('[SelfAssessment] Assessment data (v3):', JSON.stringify(responses, null, 2));

    // Validate the responses object
    if (!responses.satisfactionBaseline || !responses.engagementPrefs || !responses.growthAreas || !responses.aspirations) {
      console.error('[SelfAssessment] Missing required data (v3):', {
        hasSatisfactionBaseline: !!responses.satisfactionBaseline,
        hasEngagementPrefs: !!responses.engagementPrefs,
        hasGrowthAreas: !!responses.growthAreas,
        hasAspirations: !!responses.aspirations,
      });
      throw new Error('Missing required assessment data (satisfaction, engagement, growth areas, or aspirations)');
    }
    // Additional check for empty arrays if that's a concern
    if (responses.growthAreas.length === 0) {
      console.error('[SelfAssessment] Growth areas array cannot be empty.');
      throw new Error('Growth areas must be provided.');
    }
    if (responses.aspirations.length === 0) {
      console.error('[SelfAssessment] Aspirations array cannot be empty.');
      throw new Error('At least one aspiration must be defined.');
    }

    // Format the responses for storage
    const formattedResponses = {
      satisfaction_baseline: {
        ...responses.satisfactionBaseline,
        timestamp: new Date().toISOString()
      },
      engagement_preferences: {
        ...responses.engagementPrefs,
        timestamp: new Date().toISOString()
      },
      // New fields for v3 assessment
      growth_areas: { // Store the selected growth areas
        areas: responses.growthAreas, // This will be an array of area objects
        timestamp: new Date().toISOString()
      },
      aspirations: { // Store the user-defined Long-Term Aspirations
        defined_ltas: responses.aspirations, // This will be an array of LTA objects
        timestamp: new Date().toISOString()
      }
    };

    console.log('[SelfAssessment] Formatted responses for Supabase (v3):', JSON.stringify(formattedResponses, null, 2));

    const { data, error } = await supabase
      .from('self_assessments')
      .insert({
        user_id: userId,
        responses: formattedResponses,
        assessment_version: 3 // Increment version due to structural changes
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