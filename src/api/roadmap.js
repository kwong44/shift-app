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
        }
      })
      .select()
      .single();

    if (error) throw error;

    // Store in local storage
    await AsyncStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(data));

    return data;
  } catch (error) {
    console.error('Error creating roadmap:', error.message);
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
  const goals = [];
  const milestones = [];

  // Transform improvement areas into goals
  if (assessmentData.improvementAreas) {
    assessmentData.improvementAreas.forEach((area, index) => {
      const goalId = `goal_${index}`;
      goals.push({
        id: goalId,
        description: area,
        timeline: '3 months', // Default timeline
        status: 'pending',
        priority: index + 1
      });

      // Create milestones for each goal
      milestones.push({
        goal_id: goalId,
        description: `Start working on ${area}`,
        target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        status: 'pending'
      });
    });
  }

  // Transform long-term goals into additional goals
  if (assessmentData.longTermGoals) {
    Object.entries(assessmentData.longTermGoals).forEach(([key, value], index) => {
      const goalId = `ltg_${index}`;
      goals.push({
        id: goalId,
        description: value,
        timeline: '12 months', // Long-term timeline
        status: 'pending',
        priority: goals.length + 1
      });

      // Create milestones for each long-term goal
      milestones.push({
        goal_id: goalId,
        description: `Begin ${value.toLowerCase()}`,
        target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month from now
        status: 'pending'
      });
    });
  }

  return {
    goals,
    milestones
  };
};

export default {
  fetchRoadmap,
  createRoadmap,
  updateRoadmap,
  clearLocalRoadmap
}; 