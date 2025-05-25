import { supabase } from '../config/supabase';

/**
 * Get the current user's profile
 * @returns {Promise} - The user's profile data
 */
export const getProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No user found');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting profile:', error.message);
    throw error;
  }
};

/**
 * Update the current user's profile
 * @param {Object} updates - The profile fields to update
 * @returns {Promise} - The updated profile data
 */
export const updateProfile = async (updates) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No user found');
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating profile:', error.message);
    throw error;
  }
};

/**
 * Update the user's avatar
 * @param {string} filePath - Path to the avatar file
 * @returns {Promise} - The updated profile data
 */
export const updateAvatar = async (filePath) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No user found');
    
    // Upload the file to Supabase Storage
    const fileName = `${user.id}-${Date.now()}`;
    const { data: fileData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, filePath);
    
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    // Update the profile with the new avatar URL
    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating avatar:', error.message);
    throw error;
  }
};

/**
 * Set or unset an exercise as a favorite for a user.
 * @param {string} userId - The user's ID.
 * @param {string} exerciseId - The ID of the exercise (from MASTER_EXERCISE_LIST).
 * @param {boolean} isFavorite - True to mark as favorite, false to unmark.
 * @returns {Promise<object|null>} The updated preference object or null if an error occurs.
 */
export const setExerciseFavorite = async (userId, exerciseId, isFavorite) => {
  if (!userId || !exerciseId) {
    console.error('[setExerciseFavorite] User ID and Exercise ID are required.');
    return null;
  }
  console.debug('[setExerciseFavorite] Setting favorite status:', { userId, exerciseId, isFavorite });
  try {
    const { data, error } = await supabase
      .from('user_exercise_preferences')
      .upsert(
        {
          user_id: userId,
          exercise_id: exerciseId,
          is_favorite: isFavorite,
          // updated_at will be handled by the trigger, created_at on initial insert
        },
        {
          onConflict: 'user_id, exercise_id', // Specify conflict target for upsert
        }
      )
      .select()
      .single();

    if (error) {
      console.error('[setExerciseFavorite] Error setting exercise favorite:', error.message);
      throw error;
    }
    console.debug('[setExerciseFavorite] Successfully set favorite status:', data);
    return data;
  } catch (error) {
    // Catch any other errors, including those re-thrown
    console.error('[setExerciseFavorite] Exception in setExerciseFavorite:', error.message);
    return null; // Or re-throw if the caller should handle it
  }
};

/**
 * Get all favorite exercise IDs for a user.
 * @param {string} userId - The user's ID.
 * @returns {Promise<string[]>} An array of favorite exercise IDs.
 */
export const getFavoriteExerciseIds = async (userId) => {
  if (!userId) {
    console.error('[getFavoriteExerciseIds] User ID is required.');
    return [];
  }
  console.debug('[getFavoriteExerciseIds] Fetching favorite exercise IDs for user:', userId);
  try {
    const { data, error } = await supabase
      .from('user_exercise_preferences')
      .select('exercise_id')
      .eq('user_id', userId)
      .eq('is_favorite', true);

    if (error) {
      console.error('[getFavoriteExerciseIds] Error fetching favorite exercises:', error.message);
      throw error;
    }
    const favoriteIds = data ? data.map(fav => fav.exercise_id) : [];
    console.debug('[getFavoriteExerciseIds] Found favorite IDs:', favoriteIds);
    return favoriteIds;
  } catch (error) {
    console.error('[getFavoriteExerciseIds] Exception in getFavoriteExerciseIds:', error.message);
    return [];
  }
};

/**
 * Get all exercise preferences for a user.
 * Useful for displaying current favorite status on a list of all exercises.
 * @param {string} userId - The user's ID.
 * @returns {Promise<object[]>} An array of preference objects, or an empty array on error.
 */
export const getAllExercisePreferences = async (userId) => {
  if (!userId) {
    console.error('[getAllExercisePreferences] User ID is required.');
    return [];
  }
  console.debug('[getAllExercisePreferences] Fetching all exercise preferences for user:', userId);
  try {
    const { data, error } = await supabase
      .from('user_exercise_preferences')
      .select('*') // Select all fields for now
      .eq('user_id', userId);

    if (error) {
      console.error('[getAllExercisePreferences] Error fetching all preferences:', error.message);
      throw error;
    }
    console.debug('[getAllExercisePreferences] Found preferences:', data || []);
    return data || [];
  } catch (error) {
    console.error('[getAllExercisePreferences] Exception in getAllExercisePreferences:', error.message);
    return [];
  }
}; 