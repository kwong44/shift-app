import { supabase } from '../../config/supabase';

/**
 * Create a visualization exercise
 * @param {string} userId - The user's ID
 * @param {string} content - The visualization content
 * @returns {Promise} - The created visualization
 */
export const createVisualization = async (userId, content) => {
  try {
    console.debug('[createVisualization] Creating visualization:', { userId });
    
    const { data, error } = await supabase
      .from('visualizations')
      .insert({
        user_id: userId,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating visualization:', error.message);
    throw error;
  }
};

/**
 * Complete a visualization exercise
 * @param {string} visualizationId - The visualization ID
 * @returns {Promise} - The updated visualization
 */
export const completeVisualization = async (visualizationId) => {
  try {
    console.debug('[completeVisualization] Completing visualization:', { visualizationId });
    
    const { data, error } = await supabase
      .from('visualizations')
      .update({ completed: true })
      .eq('id', visualizationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error completing visualization:', error.message);
    throw error;
  }
};

/**
 * Get visualizations
 * @param {string} userId - The user's ID
 * @param {boolean} includeCompleted - Whether to include completed visualizations
 * @returns {Promise} - Array of visualizations
 */
export const getVisualizations = async (userId, includeCompleted = true) => {
  try {
    console.debug('[getVisualizations] Fetching visualizations:', { userId, includeCompleted });
    
    let query = supabase
      .from('visualizations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!includeCompleted) {
      query = query.eq('completed', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching visualizations:', error.message);
    throw error;
  }
}; 