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
 * @returns {Promise} - The updated session
 */
export const endDeepWorkSession = async (sessionId) => {
  try {
    console.debug('[endDeepWorkSession] Ending session:', { sessionId });
    
    const { data, error } = await supabase
      .from('deep_work_sessions')
      .update({ end_time: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
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