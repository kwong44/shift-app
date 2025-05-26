import { supabase } from '../../config/supabase';

/**
 * Start a deep work session
 * @param {string} userId - The user's ID
 * @param {string} taskId - Optional associated task ID
 * @param {number} duration - Planned duration in minutes
 * @returns {Promise} - The created session
 */
export const startDeepWorkSession = async (userId, taskId, duration) => {
  try {
    console.debug('[startDeepWorkSession] Starting session:', { userId, taskId, duration });
    
    const { data, error } = await supabase
      .from('deep_work_sessions')
      .insert({
        user_id: userId,
        task_id: taskId,
        duration,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error starting deep work session:', error.message);
    throw error;
  }
};

/**
 * End a deep work session
 * @param {string} sessionId - The session ID
 * @param {number} actualDurationSpent - The actual duration of the session in seconds.
 * @returns {Promise} - The updated session
 */
export const endDeepWorkSession = async (sessionId, actualDurationSpent) => {
  try {
    console.debug('[endDeepWorkSession] Ending session:', { sessionId, actualDurationSpent });
    
    const updates = {
      end_time: new Date().toISOString(),
    };

    // Only add actual_duration_seconds if it's a valid number (and non-negative)
    if (typeof actualDurationSpent === 'number' && actualDurationSpent >= 0) {
      updates.actual_duration_seconds = actualDurationSpent;
    } else {
      console.warn(`[endDeepWorkSession] Invalid or missing actualDurationSpent for session ${sessionId}:`, actualDurationSpent);
    }

    const { data, error } = await supabase
      .from('deep_work_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    console.debug('[endDeepWorkSession] Session ended and updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error ending deep work session:', error.message);
    throw error;
  }
};

/**
 * Get deep work sessions
 * @param {string} userId - The user's ID
 * @param {Date} startDate - Optional start date filter
 * @param {Date} endDate - Optional end date filter
 * @returns {Promise} - Array of sessions
 */
export const getDeepWorkSessions = async (userId, startDate = null, endDate = null) => {
  try {
    console.debug('[getDeepWorkSessions] Fetching sessions:', { userId, startDate, endDate });
    
    let query = supabase
      .from('deep_work_sessions')
      .select('*, tasks(description)')
      .eq('user_id', userId)
      .order('start_time', { ascending: false });

    if (startDate) {
      query = query.gte('start_time', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('start_time', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching deep work sessions:', error.message);
    throw error;
  }
}; 