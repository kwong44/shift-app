import { supabase } from '../config/supabase';

/**
 * Create a new long-term goal
 * @param {string} userId - User ID
 * @param {object} goalData - Goal data object
 * @param {string} goalData.title - Goal title/text
 * @param {string} goalData.description - Optional detailed description
 * @param {string} goalData.category - Optional category (health, career, etc.)
 * @param {number} goalData.priority - Priority level (1-10)
 * @param {string} goalData.source - Source: 'user', 'ai_coach', or 'roadmap_migration'
 * @param {string} goalData.target_date - Optional target completion date
 * @returns {Promise} - The created goal object
 */
export const createLongTermGoal = async (userId, goalData) => {
  try {
    console.debug('[LongTermGoals API] Creating long-term goal', { userId, goalData });

    const { data, error } = await supabase
      .from('long_term_goals')
      .insert({
        user_id: userId,
        title: goalData.title,
        description: goalData.description || null,
        category: goalData.category || null,
        priority: goalData.priority || 1,
        source: goalData.source || 'user',
        target_date: goalData.target_date || null,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('[LongTermGoals API] Error creating long-term goal:', error);
      throw error;
    }

    console.debug('[LongTermGoals API] Long-term goal created successfully:', data);
    return data;
  } catch (error) {
    console.error('[LongTermGoals API] Error in createLongTermGoal:', error.message);
    throw error;
  }
};

/**
 * Get all long-term goals for a user
 * @param {string} userId - User ID
 * @param {string} status - Optional status filter ('active', 'completed', 'paused', 'archived')
 * @returns {Promise} - Array of long-term goals
 */
export const getLongTermGoals = async (userId, status = null) => {
  try {
    console.debug('[LongTermGoals API] Fetching long-term goals', { userId, status });

    let query = supabase
      .from('long_term_goals')
      .select('*')
      .eq('user_id', userId)
      .order('priority', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[LongTermGoals API] Error fetching long-term goals:', error);
      throw error;
    }

    console.debug(`[LongTermGoals API] Fetched ${data?.length || 0} long-term goals`);
    return data || [];
  } catch (error) {
    console.error('[LongTermGoals API] Error in getLongTermGoals:', error.message);
    throw error;
  }
};

/**
 * Update a long-term goal
 * @param {string} userId - User ID
 * @param {string} goalId - Goal ID to update
 * @param {object} updates - Properties to update
 * @returns {Promise} - The updated goal object
 */
export const updateLongTermGoal = async (userId, goalId, updates) => {
  try {
    console.debug('[LongTermGoals API] Updating long-term goal', { userId, goalId, updates });

    const { data, error } = await supabase
      .from('long_term_goals')
      .update(updates)
      .eq('id', goalId)
      .eq('user_id', userId) // Security: ensure user owns this goal
      .select()
      .single();

    if (error) {
      console.error('[LongTermGoals API] Error updating long-term goal:', error);
      throw error;
    }

    console.debug('[LongTermGoals API] Long-term goal updated successfully:', data);
    return data;
  } catch (error) {
    console.error('[LongTermGoals API] Error in updateLongTermGoal:', error.message);
    throw error;
  }
};

/**
 * Delete a long-term goal
 * @param {string} userId - User ID
 * @param {string} goalId - Goal ID to delete
 * @returns {Promise} - Success status
 */
export const deleteLongTermGoal = async (userId, goalId) => {
  try {
    console.debug('[LongTermGoals API] Deleting long-term goal', { userId, goalId });

    const { error } = await supabase
      .from('long_term_goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId); // Security: ensure user owns this goal

    if (error) {
      console.error('[LongTermGoals API] Error deleting long-term goal:', error);
      throw error;
    }

    console.debug('[LongTermGoals API] Long-term goal deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('[LongTermGoals API] Error in deleteLongTermGoal:', error.message);
    throw error;
  }
};

/**
 * Get long-term goals with their associated weekly goals
 * @param {string} userId - User ID
 * @returns {Promise} - Array of long-term goals with weekly_goals array
 */
export const getLongTermGoalsWithWeeklyGoals = async (userId) => {
  try {
    console.debug('[LongTermGoals API] Fetching long-term goals with weekly goals', { userId });

    // First get all long-term goals
    const longTermGoals = await getLongTermGoals(userId, 'active');
    
    // Then get all weekly goals for this user
    const { data: weeklyGoals, error: weeklyError } = await supabase
      .from('weekly_goals')
      .select('*')
      .eq('user_id', userId)
      .not('long_term_goal_id', 'is', null); // Only get weekly goals linked to long-term goals

    if (weeklyError) {
      console.error('[LongTermGoals API] Error fetching weekly goals:', weeklyError);
      throw weeklyError;
    }

    // Group weekly goals by long-term goal ID
    const goalMap = longTermGoals.map(ltg => ({
      ...ltg,
      weekly_goals: (weeklyGoals || []).filter(wg => wg.long_term_goal_id === ltg.id)
    }));

    console.debug(`[LongTermGoals API] Fetched ${goalMap.length} long-term goals with weekly goals`);
    return goalMap;
  } catch (error) {
    console.error('[LongTermGoals API] Error in getLongTermGoalsWithWeeklyGoals:', error.message);
    throw error;
  }
};

/**
 * Create a long-term goal from AI Coach suggestion
 * @param {string} userId - User ID
 * @param {string} title - Goal title suggested by AI Coach
 * @param {string} category - Optional category
 * @returns {Promise} - The created goal object
 */
export const createAICoachLongTermGoal = async (userId, title, category = null) => {
  try {
    console.debug('[LongTermGoals API] Creating AI Coach suggested long-term goal', { userId, title, category });

    return await createLongTermGoal(userId, {
      title,
      description: `Goal suggested by your AI Coach to support your growth journey.`,
      category,
      source: 'ai_coach',
      priority: 5 // Medium priority for AI suggestions
    });
  } catch (error) {
    console.error('[LongTermGoals API] Error creating AI Coach long-term goal:', error.message);
    throw error;
  }
};

export default {
  createLongTermGoal,
  getLongTermGoals,
  updateLongTermGoal,
  deleteLongTermGoal,
  getLongTermGoalsWithWeeklyGoals,
  createAICoachLongTermGoal
}; 