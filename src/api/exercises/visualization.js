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
 * @param {number} actualDurationInSeconds - The actual duration of the visualization in seconds.
 * @returns {Promise<object>} - The updated visualization entry.
 */
export const completeVisualization = async (visualizationId, actualDurationInSeconds) => {
  try {
    // Validate inputs
    if (!visualizationId) throw new Error('Visualization ID is required.');
    if (actualDurationInSeconds === undefined || actualDurationInSeconds === null || actualDurationInSeconds < 0) {
      // Allow 0 duration if it signifies an immediate completion without timed tracking, but generally expect positive.
      // For now, let's assume 0 is a valid "completed instantly" or not-timed scenario.
      // If it strictly must be > 0 for timed sessions, adjust this check.
      console.warn('[completeVisualization] actualDurationInSeconds is undefined, null, or negative. Proceeding, but this might indicate an issue.', { actualDurationInSeconds });
      // Consider throwing an error if duration is critical and must be positive:
      // throw new Error('Valid actualDurationInSeconds is required.');
    }

    console.debug('[completeVisualization] Completing visualization:', { visualizationId, actualDurationInSeconds });
    
    const updatePayload = {
      completed: true,
      completed_at: new Date().toISOString(),
      duration_seconds: actualDurationInSeconds,
    };

    const { data, error } = await supabase
      .from('visualizations')
      .update(updatePayload)
      .eq('id', visualizationId)
      .select()
      .single();

    if (error) {
      console.error('[completeVisualization] Database error:', error);
      throw error;
    }

    console.debug('[completeVisualization] Visualization completed successfully:', data);
    return data;
  } catch (error) {
    console.error('[completeVisualization] Error:', error.message);
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