import { supabase } from '../config/supabase';

// Debug flag
const DEBUG = true;

export const saveMood = async (userId, mood) => {
  if (DEBUG) console.debug('[API] Saving mood:', { userId, mood });

  try {
    const { data, error } = await supabase
      .from('moods')
      .insert([
        {
          user_id: userId,
          mood_type: mood.id,
          mood_icon: mood.icon,
          mood_label: mood.label,
        }
      ]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[API] Error saving mood:', error.message);
    throw error;
  }
};

export const getWeekMoodHistory = async (userId) => {
  if (DEBUG) console.debug('[API] Fetching week mood history for user:', userId);

  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('moods')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', oneWeekAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[API] Error fetching mood history:', error.message);
    throw error;
  }
}; 