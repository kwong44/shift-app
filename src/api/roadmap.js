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
    console.log('[Roadmap] Creating roadmap for user:', userId);
    
    // Transform assessment data into roadmap goals and milestones
    const roadmapData = generateRoadmapFromAssessment(assessmentData);

    const { data, error } = await supabase
      .from('roadmaps')
      .insert({
        user_id: userId,
        goals: roadmapData.goals,
        milestones: roadmapData.milestones,
        progress: {
          completed_goals: 0,
          total_goals: roadmapData.goals.length
        },
        metadata: roadmapData.metadata,
        current_phase: 1,
        phases: [{
          number: 1,
          name: 'Getting Started',
          description: 'Building foundational habits and routines',
          status: 'active'
        }]
      })
      .select()
      .single();

    if (error) {
      console.error('[Roadmap] Error creating roadmap:', error);
      throw error;
    }

    console.log('[Roadmap] Successfully created roadmap:', data);

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
 * @param {object} assessmentData - The user's self-assessment responses
 * @returns {object} - Formatted roadmap data with goals and milestones
 */
const generateRoadmapFromAssessment = (assessmentData) => {
  console.log('[Roadmap] Generating roadmap from assessment data:', assessmentData);
  
  const goals = [];
  const milestones = [];

  // Transform focus areas (currentHabits) into goals
  const focusAreas = assessmentData.currentHabits || [];
  console.log('[Roadmap] Processing focus areas:', focusAreas);
  
  focusAreas.forEach((area, index) => {
    const goalId = `goal_${index}`;
    goals.push({
      id: goalId,
      description: area,
      timeline: '3 months',
      status: 'pending',
      priority: index + 1,
      type: 'focus_area'
    });

    milestones.push({
      goal_id: goalId,
      description: `Start working on ${area}`,
      target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    });
  });

  // Add satisfaction baseline goal if score is below 7
  if (assessmentData.satisfactionBaseline?.overallScore < 7) {
    console.log('[Roadmap] Adding satisfaction improvement goal');
    const goalId = 'satisfaction_improvement';
    goals.push({
      id: goalId,
      description: 'Improve overall life satisfaction',
      timeline: '6 months',
      status: 'pending',
      priority: goals.length + 1,
      type: 'satisfaction'
    });

    milestones.push({
      goal_id: goalId,
      description: 'Set small daily actions for improvement',
      target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    });
  }

  // Add engagement preferences as metadata
  const metadata = {
    preferredTime: assessmentData.engagementPrefs?.preferredTime,
    sessionLength: assessmentData.engagementPrefs?.sessionLength,
    reminderFrequency: assessmentData.engagementPrefs?.reminderFrequency,
    preferredExercises: assessmentData.engagementPrefs?.preferredExercises
  };

  console.log('[Roadmap] Generated goals:', goals);
  console.log('[Roadmap] Generated milestones:', milestones);
  console.log('[Roadmap] Metadata:', metadata);

  return {
    goals,
    milestones,
    metadata
  };
};

export default {
  fetchRoadmap,
  createRoadmap,
  updateRoadmap,
  clearLocalRoadmap
}; 