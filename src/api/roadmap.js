import { supabase } from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ROADMAP_STORAGE_KEY = '@roadmap';

/**
 * Fetch user's roadmap from Supabase
 * @param {string} userId - The user's ID from Supabase Auth
 * @returns {Promise} - The roadmap object
 */
export const fetchRoadmap = async (userId) => {
  try {
    // First try to get from local storage
    const localRoadmap = await AsyncStorage.getItem(ROADMAP_STORAGE_KEY);
    if (localRoadmap) {
      return JSON.parse(localRoadmap);
    }

    // If not in local storage, fetch from Supabase
    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    // Store in local storage for offline access
    if (data) {
      await AsyncStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(data));
    }

    return data;
  } catch (error) {
    console.error('Error fetching roadmap:', error.message);
    throw error;
  }
};

/**
 * Create a new roadmap for the user
 * @param {string} userId - The user's ID from Supabase Auth
 * @param {object} assessmentData - The user's self-assessment data
 * @returns {Promise} - The created roadmap object
 */
export const createRoadmap = async (userId, assessmentData) => {
  try {
    // Log the user ID and a summary of assessment data (e.g., number of aspirations)
    console.log('[Roadmap] Creating roadmap (v2 - LTA based) for user:', userId, 
                `with ${assessmentData?.aspirations?.length || 0} aspirations.`);
    
    // Transform assessment data into roadmap goals (LTAs) and metadata
    const roadmapData = generateRoadmapFromAssessment(assessmentData);

    // Ensure roadmapData.goals is an array, even if empty
    const goalsToInsert = roadmapData.goals || [];

    const { data, error } = await supabase
      .from('roadmaps')
      .insert({
        user_id: userId,
        goals: goalsToInsert, // These are now the LTAs
        // milestones: roadmapData.milestones, // Milestones are no longer part of the initial roadmap creation here
        progress: {
          completed_goals: 0,
          total_goals: goalsToInsert.length, // Based on the number of LTAs
          // We might add more detailed progress tracking later, e.g., per LTA or overall WG completion
        },
        metadata: roadmapData.metadata, // Contains engagement prefs, satisfaction baseline, etc.
        current_phase: 1, // Default starting phase
        phases: [{
          number: 1,
          name: 'Embarking on Your Journey', // Renamed for a more motivational feel
          description: 'Defining long-term aspirations and starting to build momentum.',
          status: 'active'
        }]
        // roadmap_version: '2.0' // Optional: if you want to version the roadmap structure itself
      })
      .select()
      .single();

    if (error) {
      console.error('[Roadmap] Error creating roadmap in Supabase:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('[Roadmap] Successfully created LTA-based roadmap:', JSON.stringify(data, null, 2));

    // Store in local storage
    await AsyncStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(data));

    return data;
  } catch (error) {
    console.error('[Roadmap] Error creating roadmap:', error.message);
    throw error;
  }
};

/**
 * Update user's roadmap progress
 * @param {string} roadmapId - The roadmap ID
 * @param {object} updates - The updates to apply to the roadmap
 * @returns {Promise} - The updated roadmap object
 */
export const updateRoadmap = async (roadmapId, updates) => {
  try {
    const { data, error } = await supabase
      .from('roadmaps')
      .update(updates)
      .eq('id', roadmapId)
      .select()
      .single();

    if (error) throw error;

    // Update local storage
    await AsyncStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(data));

    return data;
  } catch (error) {
    console.error('Error updating roadmap:', error.message);
    throw error;
  }
};

/**
 * Clear locally stored roadmap data
 * Useful when logging out or debugging
 */
export const clearLocalRoadmap = async () => {
  try {
    await AsyncStorage.removeItem(ROADMAP_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing local roadmap:', error.message);
  }
};

/**
 * Generate a structured roadmap from assessment data
 * NEW: References existing long-term goals from database instead of creating new JSON entries
 * @param {object} assessmentData - The user's self-assessment responses  
 * @returns {object} - Formatted roadmap data with goals referencing database IDs
 */
const generateRoadmapFromAssessment = (assessmentData) => {
  // Console log the raw assessmentData to see what's coming in
  console.log('[Roadmap] Generating roadmap from assessment data (v3 - DB reference based):', JSON.stringify(assessmentData, null, 2));
  
  const goals = [];

  // Transform user-defined aspirations (LTAs) into roadmap goals that REFERENCE the database
  const userAspirations = assessmentData.aspirations || []; // This now comes from definedLTAs in onboarding
  console.log('[Roadmap] Processing user aspirations (LTAs) with DB references:', JSON.stringify(userAspirations, null, 2));
  
  userAspirations.forEach((aspiration, index) => {
    // NEW: Instead of generating IDs, use the actual database long_term_goal_id
    if (!aspiration.longTermGoalId) {
      console.warn('[Roadmap] WARNING: Aspiration missing longTermGoalId database reference:', aspiration);
    }
    
    goals.push({
      id: aspiration.longTermGoalId || `fallback_lta_${index}_${new Date().getTime()}`, // NEW: Use DB ID as primary reference
      legacyId: `user_lta_${index}_${new Date().getTime()}`, // Keep legacy ID for compatibility 
      text: aspiration.text, // User's own words for their LTA
      timeline: 'long-term', // Default timeline, user breaks it down with WGs
      status: 'pending', // Initial status
      priority: index + 1, // Simple priority based on order of definition
      type: 'user_defined_lta', // Clearly mark as a user-defined Long-Term Aspiration
      areaId: aspiration.areaId, // Link to the growth area
      areaLabel: aspiration.areaLabel, // Store label for convenience
      longTermGoalId: aspiration.longTermGoalId, // NEW: Explicit reference to database table
      source: 'onboarding', // NEW: Track source
      created_at: new Date().toISOString(),
    });
  });

  // The satisfaction improvement goal - we can still add this as a JSON goal for phases/milestones
  // But it could also be created in the database if needed
  if (assessmentData.satisfactionBaseline?.overallScore < 7) {
    console.log('[Roadmap] Adding satisfaction improvement goal (JSON-only for phases)');
    const goalId = `satisfaction_improvement_${new Date().getTime()}`;
    goals.push({
      id: goalId,
      text: 'Improve overall life satisfaction',
      timeline: 'ongoing', // Satisfaction is an ongoing process
      status: 'pending',
      priority: goals.length + 1,
      type: 'system_suggested_satisfaction', // Differentiate from user LTAs
      longTermGoalId: null, // This one stays JSON-only for now
      source: 'system',
      created_at: new Date().toISOString(),
    });
  }

  // Add engagement preferences and other relevant selections as metadata
  const metadata = {
    assessmentVersion: assessmentData.assessment_version || '3', // Store assessment version used
    satisfactionBaseline: assessmentData.satisfactionBaseline,
    engagementPreferences: assessmentData.engagementPrefs,
    growthAreasSelected: assessmentData.growthAreas, // Store the selected growth areas raw objects
    longTermGoalIds: userAspirations.map(asp => asp.longTermGoalId).filter(Boolean), // NEW: Track DB IDs for easy reference
  };

  console.log('[Roadmap] Generated goals (DB-reference based):', JSON.stringify(goals, null, 2));
  console.log('[Roadmap] Generated metadata with DB references:', JSON.stringify(metadata, null, 2));

  return {
    goals, // These now reference the database long_term_goals table
    metadata
  };
};

export default {
  fetchRoadmap,
  createRoadmap,
  updateRoadmap,
  clearLocalRoadmap
}; 