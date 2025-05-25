import { supabase } from '../../config/supabase';

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
    console.debug('[startBinauralSession] Starting session:', { userId, duration, purpose });
    
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