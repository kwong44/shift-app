import { supabase } from '../../config/supabase';

/**
 * @deprecated Since version 2.0.0. Use createWeeklyGoalForLongTermGoal() or createSimpleWeeklyGoal() instead.
 * 
 * Create a new weekly goal (OLD SYSTEM - DEPRECATED)
 * This function is kept for transition period but will throw an error as the database columns have been removed.
 * 
 * @param {string} userId - User ID
 * @param {string} roadmapId - ID of the roadmap this goal belongs to (REMOVED FROM DB)
 * @param {string} ltaIdRef - Reference ID of the Long-Term Aspiration this goal is for (REMOVED FROM DB)  
 * @param {string} text - Goal text content
 * @returns {Promise} - Throws error - function is deprecated
 * @throws {Error} Always throws - function is deprecated and database columns removed
 */
export const createWeeklyGoal = async (userId, roadmapId, ltaIdRef, text) => {
  console.warn('[Goals API] DEPRECATED: createWeeklyGoal function is deprecated. Use createWeeklyGoalForLongTermGoal or createSimpleWeeklyGoal instead.');
  
  try {
    // Calculate the end of the current week (Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const daysUntilEndOfWeek = 7 - dayOfWeek;
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + daysUntilEndOfWeek);
    endOfWeek.setHours(23, 59, 59, 999);

    // Debug log
    console.debug('[Goals API] Creating weekly goal (DEPRECATED)', { userId, roadmapId, ltaIdRef, text, weekEnding: endOfWeek });

    // NOTE: roadmap_id and lta_id_ref columns have been removed from weekly_goals table
    // This function will fail and should not be used
    throw new Error('DEPRECATED: roadmap_id and lta_id_ref columns have been removed. Use createWeeklyGoalForLongTermGoal instead.');

  } catch (error) {
    console.error('[Goals API] Error in createWeeklyGoal (DEPRECATED):', error.message);
    throw error;
  }
};

/**
 * Update an existing weekly goal
 * @param {string} userId - User ID
 * @param {string} goalId - Goal ID to update
 * @param {object} updates - Properties to update
 * @returns {Promise} - The updated goal object
 */
export const updateWeeklyGoal = async (userId, goalId, updates) => {
  try {
    // Debug log
    console.debug('[Goals API] Updating weekly goal', { userId, goalId, updates });

    const { data, error } = await supabase
      .from('weekly_goals')
      .update(updates)
      .eq('id', goalId)
      .eq('user_id', userId) // Security: ensure user owns this goal
      .select()
      .single();

    if (error) {
      console.error('[Goals API] Error updating weekly goal:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[Goals API] Error in updateWeeklyGoal:', error.message);
    throw error;
  }
};

/**
 * Delete a weekly goal
 * @param {string} userId - User ID
 * @param {string} goalId - Goal ID to delete
 * @returns {Promise} - Success status
 */
export const deleteWeeklyGoal = async (userId, goalId) => {
  try {
    // Debug log
    console.debug('[Goals API] Deleting weekly goal', { userId, goalId });

    const { error } = await supabase
      .from('weekly_goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId); // Security: ensure user owns this goal

    if (error) {
      console.error('[Goals API] Error deleting weekly goal:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('[Goals API] Error in deleteWeeklyGoal:', error.message);
    throw error;
  }
};

/**
 * Get weekly goals for the current week
 * @param {string} userId - User ID
 * @returns {Promise} - Array of weekly goals
 */
export const getWeeklyGoals = async (userId) => {
  try {
    // Calculate the start and end of the current week
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
    
    // Start of week (Monday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);
    
    // End of week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Debug log
    console.debug('[Goals API] Fetching weekly goals', { 
      userId, 
      weekStart: startOfWeek, 
      weekEnd: endOfWeek 
    });

    const { data, error } = await supabase
      .from('weekly_goals')
      .select('*')
      .eq('user_id', userId)
      .gte('week_ending', startOfWeek.toISOString())
      .lte('week_ending', endOfWeek.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Goals API] Error fetching weekly goals:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[Goals API] Error in getWeeklyGoals:', error.message);
    throw error;
  }
};

/**
 * Fetch all weekly goals for a user, regardless of week.
 * Uses the new long_term_goal_id for linking to long-term goals.
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} - An array of all weekly goals for the user
 */
export const fetchAllUserWeeklyGoals = async (userId) => {
  try {
    if (!userId) {
      console.debug('[Goals API] fetchAllUserWeeklyGoals: No user ID provided.');
      return [];
    }

    console.debug('[Goals API] Fetching all weekly goals for user:', userId);

    const { data, error } = await supabase
      .from('weekly_goals')
      .select('*') // Select all columns, including new ones
      .eq('user_id', userId)
      .order('created_at', { ascending: false }); // Or any preferred order

    if (error) {
      console.error('[Goals API] Error fetching all weekly goals:', error);
      throw error;
    }

    console.debug('[Goals API] Successfully fetched all weekly goals:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('[Goals API] Error in fetchAllUserWeeklyGoals:', error.message);
    throw error;
  }
};

/**
 * Create a simple weekly goal (simplified version for AI Coach)
 * @param {string} userId - User ID
 * @param {string} text - Goal text content
 * @returns {Promise} - The created goal object
 */
export const createSimpleWeeklyGoal = async (userId, text) => {
  try {
    // Calculate the end of the current week (Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const daysUntilEndOfWeek = 7 - dayOfWeek;
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + daysUntilEndOfWeek);
    endOfWeek.setHours(23, 59, 59, 999);

    // Debug log
    console.debug('[Goals API] Creating simple weekly goal', { userId, text, weekEnding: endOfWeek });

    // For AI Coach goals, we'll create them without any linkage initially
    // This allows for quick goal creation that can be used standalone
    const { data, error } = await supabase
      .from('weekly_goals')
      .insert({
        user_id: userId,
        text,
        completed: false,
        week_ending: endOfWeek.toISOString(),
        long_term_goal_id: null // No linkage for standalone goals
      })
      .select()
      .single();

    if (error) {
      console.error('[Goals API] Error creating simple weekly goal:', error);
      throw error;
    }

    console.debug('[Goals API] Simple weekly goal created successfully:', data);
    return data;
  } catch (error) {
    console.error('[Goals API] Error in createSimpleWeeklyGoal:', error.message);
    throw error;
  }
};

/**
 * Create a weekly goal linked to a long-term goal (NEW SYSTEM)
 * @param {string} userId - User ID
 * @param {string} longTermGoalId - ID of the long-term goal this weekly goal belongs to
 * @param {string} text - Goal text content
 * @returns {Promise} - The created goal object
 */
export const createWeeklyGoalForLongTermGoal = async (userId, longTermGoalId, text) => {
  try {
    // Calculate the end of the current week (Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const daysUntilEndOfWeek = 7 - dayOfWeek;
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + daysUntilEndOfWeek);
    endOfWeek.setHours(23, 59, 59, 999);

    // Debug log - Rule: Always add debug logs
    console.debug('[Goals API] Creating weekly goal for long-term goal', { 
      userId, 
      longTermGoalId, 
      text, 
      weekEnding: endOfWeek 
    });

    const { data, error } = await supabase
      .from('weekly_goals')
      .insert({
        user_id: userId,
        text,
        completed: false,
        week_ending: endOfWeek.toISOString(),
        long_term_goal_id: longTermGoalId // NEW: Use the new foreign key
      })
      .select()
      .single();

    if (error) {
      console.error('[Goals API] Error creating weekly goal for long-term goal:', error);
      throw error;
    }

    console.debug('[Goals API] Weekly goal created successfully for long-term goal:', data);
    return data;
  } catch (error) {
    console.error('[Goals API] Error in createWeeklyGoalForLongTermGoal:', error.message);
    throw error;
  }
}; 