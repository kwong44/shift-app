import { supabase } from '../../config/supabase';

/**
 * Log a mindfulness session (previously check-in)
 * @param {string} userId - The user's ID
 * @param {object} sessionData - Data about the mindfulness session
 * @param {number} sessionData.duration_seconds - Duration of the session in seconds.
 * @param {boolean} sessionData.completed - Whether the session was completed.
 * @param {string[]} [sessionData.emotions] - Optional array of emotions recorded.
 * @param {object} [sessionData.fullResponse] - The full original response object for detailed logging.
 * @returns {Promise<object>} - The created log entry.
 */
export const logMindfulnessSession = async (userId, sessionData) => {
  try {
    // Validate required fields
    if (!userId) throw new Error('User ID is required for logging mindfulness session.');
    if (sessionData.duration_seconds === undefined || sessionData.duration_seconds === null) {
      throw new Error('duration_seconds is required for logging mindfulness session.');
    }
    if (sessionData.completed === undefined || sessionData.completed === null) {
      throw new Error('completed status is required for logging mindfulness session.');
    }

    console.debug('[logMindfulnessSession] Logging session:', { 
      userId, 
      duration: sessionData.duration_seconds, 
      completed: sessionData.completed,
      hasEmotions: !!sessionData.emotions?.length,
      hasFullResponse: !!sessionData.fullResponse
    });
    
    const insertPayload = {
      user_id: userId,
      duration_seconds: sessionData.duration_seconds,
      completed: sessionData.completed,
      // Set completed_at timestamp only if the session is marked as completed
      completed_at: sessionData.completed ? new Date().toISOString() : null,
      // Save the raw response if provided, for any extra details
      response: sessionData.fullResponse || {},
      // If emotions are passed directly and we have a dedicated column (added via migration)
      emotions: sessionData.emotions || null, 
      created_at: new Date().toISOString(), // Explicitly set created_at for consistency
    };

    const { data, error } = await supabase
      .from('mindfulness_logs')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('[logMindfulnessSession] Database error:', error);
      throw error;
    }

    console.debug('[logMindfulnessSession] Mindfulness session logged successfully:', data);
    return data;
  } catch (error) {
    console.error('[logMindfulnessSession] Error:', error.message);
    throw error;
  }
};

// Renaming the export to reflect it's a session log now, not just a check-in
// Keeping the old name for a moment in case other parts of the app use it, then will remove.
// export const logMindfulnessCheckIn = logMindfulnessSession; 
// Actually, let's just replace it to avoid confusion if it's not used elsewhere yet or can be updated. 