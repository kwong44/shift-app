import { supabase } from '../config/supabase';

/**
 * Start a binaural beats session
 * @param {string} userId - The user's ID
 * @param {string} audioUrl - URL to the audio file
 * @param {number} duration - Duration in minutes
 * @param {string} purpose - Purpose of the session
 * @returns {Promise} - The created session
 */
export const startBinauralSession = async (userId, audioUrl, duration, purpose) => {
  try {
    const { data, error } = await supabase
      .from('binaural_sessions')
      .insert({
        user_id: userId,
        audio_url: audioUrl,
        duration,
        purpose,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error starting binaural session:', error.message);
    throw error;
  }
};

/**
 * Complete a binaural beats session
 * @param {string} sessionId - The session ID
 * @returns {Promise} - The updated session
 */
export const completeBinauralSession = async (sessionId) => {
  try {
    const { data, error } = await supabase
      .from('binaural_sessions')
      .update({ completed: true })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error completing binaural session:', error.message);
    throw error;
  }
};

/**
 * Create a visualization exercise
 * @param {string} userId - The user's ID
 * @param {string} content - The visualization content
 * @returns {Promise} - The created visualization
 */
export const createVisualization = async (userId, content) => {
  try {
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
 * Create a new task
 * @param {string} userId - The user's ID
 * @param {string} description - Task description
 * @param {number} priority - Task priority (1-5)
 * @param {Date} dueDate - Optional due date
 * @returns {Promise} - The created task
 */
export const createTask = async (userId, description, priority, dueDate = null) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        description,
        priority,
        due_date: dueDate,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating task:', error.message);
    throw error;
  }
};

/**
 * Start a deep work session
 * @param {string} userId - The user's ID
 * @param {string} taskId - Optional associated task ID
 * @param {number} duration - Planned duration in minutes
 * @returns {Promise} - The created session
 */
export const startDeepWorkSession = async (userId, taskId, duration) => {
  try {
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
 * Log a mindfulness check-in
 * @param {string} userId - The user's ID
 * @param {object} response - The mindfulness check-in response
 * @returns {Promise} - The created log
 */
export const logMindfulnessCheckIn = async (userId, response) => {
  try {
    const { data, error } = await supabase
      .from('mindfulness_logs')
      .insert({
        user_id: userId,
        response,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error logging mindfulness check-in:', error.message);
    throw error;
  }
};

/**
 * Create a journal entry
 * @param {string} userId - The user's ID
 * @param {string} content - The journal entry content
 * @returns {Promise} - The created entry
 */
export const createJournalEntry = async (userId, content) => {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userId,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating journal entry:', error.message);
    throw error;
  }
};

/**
 * Create a self-reflection entry
 * @param {string} userId - The user's ID
 * @param {object} emotions - Emotion data
 * @param {number} stressLevel - Stress level (1-10)
 * @param {string} progressNotes - Optional progress notes
 * @returns {Promise} - The created reflection
 */
export const createReflection = async (userId, emotions, stressLevel, progressNotes = null) => {
  try {
    const { data, error } = await supabase
      .from('reflections')
      .insert({
        user_id: userId,
        emotions,
        stress_level: stressLevel,
        progress_notes: progressNotes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating reflection:', error.message);
    throw error;
  }
};

export default {
  startBinauralSession,
  completeBinauralSession,
  createVisualization,
  createTask,
  startDeepWorkSession,
  logMindfulnessCheckIn,
  createJournalEntry,
  createReflection,
}; 