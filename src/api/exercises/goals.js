import { supabase } from '../../config/supabase';

/**
 * Create a new weekly goal
 * @param {string} userId - User ID
 * @param {string} text - Goal text content
 * @returns {Promise} - The created goal object
 */
export const createWeeklyGoal = async (userId, text) => {
  try {
    // Calculate the end of the current week (Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const daysUntilEndOfWeek = 7 - dayOfWeek;
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + daysUntilEndOfWeek);
    endOfWeek.setHours(23, 59, 59, 999);

    // Debug log
    console.debug('[Goals API] Creating weekly goal', { userId, text, weekEnding: endOfWeek });

    const { data, error } = await supabase
      .from('weekly_goals')
      .insert({
        user_id: userId,
        text,
        completed: false,
        week_ending: endOfWeek.toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[Goals API] Error creating weekly goal:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[Goals API] Error in createWeeklyGoal:', error.message);
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