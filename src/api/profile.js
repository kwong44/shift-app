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