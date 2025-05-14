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
 * @param {object} entryData - The journal entry data
 * @param {string} entryData.content - The journal entry content
 * @param {string} entryData.insights - AI-generated insights about the entry
 * @param {object} entryData.aiMetadata - Metadata about the AI processing
 * @param {string} entryData.aiMetadata.model - The AI model used
 * @param {number} entryData.aiMetadata.tokensUsed - Number of tokens used
 * @param {number} entryData.aiMetadata.processingTimeMs - Processing time in milliseconds
 * @param {number} entryData.aiMetadata.confidenceScore - AI confidence score
 * @param {object} entryData.aiMetadata.promptInfo - Information about the prompt used
 * @param {string[]} entryData.aiMetadata.emotions - Detected emotions
 * @returns {Promise} - The created entry
 */
export const createJournalEntry = async (userId, entryData) => {
  try {
    // Input validation
    if (!userId) throw new Error('User ID is required');
    if (!entryData?.content?.trim()) throw new Error('Entry content is required');

    // Debug log
    console.debug('[createJournalEntry] Creating entry:', { 
      userId,
      contentLength: entryData.content.length,
      hasInsights: Boolean(entryData.insights),
      hasAiMetadata: Boolean(entryData.aiMetadata)
    });

    // Prepare AI metadata
    const aiMetadata = entryData.aiMetadata ? {
      model: entryData.aiMetadata.model,
      tokens_used: entryData.aiMetadata.tokensUsed,
      processing_time_ms: entryData.aiMetadata.processingTimeMs,
      confidence_score: entryData.aiMetadata.confidenceScore,
      prompt_info: entryData.aiMetadata.promptInfo,
      emotions: entryData.aiMetadata.emotions,
      analysis_timestamp: new Date().toISOString()
    } : null;

    // Create entry
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userId,
        content: entryData.content.trim(),
        insights: entryData.insights,
        ai_metadata: aiMetadata,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[createJournalEntry] Database error:', error);
      throw error;
    }

    console.debug('[createJournalEntry] Entry created successfully:', { 
      entryId: data.id,
      hasAiMetadata: Boolean(data.ai_metadata)
    });
    
    return data;
  } catch (error) {
    console.error('[createJournalEntry] Error:', error.message);
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

/**
 * Update a task
 * @param {string} taskId - The task ID
 * @param {object} updates - The updates to apply
 * @returns {Promise} - The updated task
 */
export const updateTask = async (taskId, updates) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating task:', error.message);
    throw error;
  }
};

/**
 * Delete a task
 * @param {string} taskId - The task ID
 * @returns {Promise} - The deletion result
 */
export const deleteTask = async (taskId) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting task:', error.message);
    throw error;
  }
};

/**
 * Get user's tasks
 * @param {string} userId - The user's ID
 * @param {boolean} includeCompleted - Whether to include completed tasks
 * @returns {Promise} - Array of tasks
 */
export const getTasks = async (userId, includeCompleted = false) => {
  try {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (!includeCompleted) {
      query = query.eq('completed', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching tasks:', error.message);
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

/**
 * Update a journal entry with insights
 * @param {string} entryId - The entry ID
 * @param {string} insights - The insights to add
 * @returns {Promise} - The updated entry
 */
export const updateJournalEntry = async (entryId, insights) => {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .update({ insights })
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating journal entry:', error.message);
    throw error;
  }
};

/**
 * Get journal entries
 * @param {string} userId - The user's ID
 * @param {number} limit - Number of entries to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise} - Array of entries
 */
export const getJournalEntries = async (userId, limit = 10, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching journal entries:', error.message);
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

/**
 * Get recent journal insights
 * @param {string} userId - The user's ID
 * @param {number} limit - Maximum number of insights to fetch (default: 1)
 * @returns {Promise} Array of journal entries with insights
 */
export const getRecentJournalInsights = async (userId, limit = 1) => {
  try {
    // Debug log
    console.debug('[getRecentJournalInsights] Fetching insights:', { userId, limit });

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .not('insights', 'is', null) // Only entries with insights
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[getRecentJournalInsights] Error:', error);
      throw error;
    }

    console.debug('[getRecentJournalInsights] Found insights:', { 
      count: data?.length,
      latestDate: data?.[0]?.created_at 
    });

    return data;
  } catch (error) {
    console.error('Error fetching journal insights:', error.message);
    throw error;
  }
};

export default {
  startBinauralSession,
  completeBinauralSession,
  createVisualization,
  completeVisualization,
  getVisualizations,
  createTask,
  updateTask,
  deleteTask,
  getTasks,
  startDeepWorkSession,
  endDeepWorkSession,
  getDeepWorkSessions,
  logMindfulnessCheckIn,
  createJournalEntry,
  updateJournalEntry,
  getJournalEntries,
  createReflection,
  getRecentJournalInsights,
}; 