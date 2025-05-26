import { supabase } from '../../config/supabase';

console.debug('[api/exercises/binaural.js] File loaded.');

/**
 * Start a binaural beats session
 * @param {string} userId - The user's ID
 * @param {string} audioUrl - URL to the audio file
 * @param {number} duration - Duration in minutes
 * @param {string} purpose - Purpose of the session
 * @returns {Promise} - The created session
 */
export const startBinauralSession = async (userId, audioUrl, duration, purpose) => {
  console.debug('[startBinauralSession] Attempting to start session:', { userId, audioUrl, duration, purpose });
  try {
    const { data, error } = await supabase
      .from('binaural_sessions')
      .insert([{
        user_id: userId,
        audio_url: audioUrl,
        duration: duration, // This is planned duration in minutes from original design
        purpose: purpose,
        completed: false, // Initialize as not completed
        created_at: new Date().toISOString(),
      }])
      .select()
      .single(); // Use single to get the created record back

    if (error) {
      console.error('[startBinauralSession] Error starting session:', error.message);
      throw error;
    }
    console.debug('[startBinauralSession] Session started successfully:', data);
    return data;
  } catch (err) {
    console.error('[startBinauralSession] Catch block error:', err.message);
    throw err;
  }
};

/**
 * Complete a binaural beats session
 * @param {string} sessionId - The session ID
 * @param {number} actualDurationInSeconds - The actual duration the user listened in seconds.
 * @returns {Promise} - The updated session
 */
export const completeBinauralSession = async (sessionId, actualDurationInSeconds) => {
  try {
    console.debug('[completeBinauralSession] Completing session:', { sessionId, actualDurationInSeconds });
    
    const updatePayload = {
      completed: true,
      completed_at: new Date().toISOString(),
      actual_duration_seconds: actualDurationInSeconds,
      // The 'duration' column still stores the intended duration in minutes.
    };

    const { data, error } = await supabase
      .from('binaural_sessions')
      .update(updatePayload)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    console.debug('[completeBinauralSession] Session completed successfully:', data);
    return data;
  } catch (error) {
    console.error('Error completing binaural session:', error.message);
    throw error;
  }
};

// Function to update an existing binaural session (e.g., mark as complete)
export const updateBinauralSession = async (sessionId, updates) => {
  console.debug('[updateBinauralSession] Attempting to update session:', { sessionId, updates });
  if (!sessionId) {
    console.error('[updateBinauralSession] Session ID is required.');
    throw new Error('Session ID is required for updating.');
  }
  try {
    const { data, error } = await supabase
      .from('binaural_sessions')
      .update({
        ...updates,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('[updateBinauralSession] Error updating session:', error.message);
      throw error;
    }
    console.debug('[updateBinauralSession] Session updated successfully:', data);
    return data;
  } catch (err) {
    console.error('[updateBinauralSession] Catch block error:', err.message);
    throw err;
  }
};

// Function to get all binaural sessions for a user (example, not used by player directly)
export const getBinauralSessions = async (userId) => {
  console.debug('[getBinauralSessions] Fetching sessions for user:', userId);
  try {
    const { data, error } = await supabase
      .from('binaural_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getBinauralSessions] Error fetching sessions:', error.message);
      throw error;
    }
    console.debug('[getBinauralSessions] Sessions fetched successfully:', data.length);
    return data;
  } catch (err) {
    console.error('[getBinauralSessions] Catch block error:', err.message);
    throw err;
  }
}; 