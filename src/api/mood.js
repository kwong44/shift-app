import { supabase } from '../config/supabase';

// Debug flag
const DEBUG = true;

export const saveMood = async (userId, emotion) => {
  if (DEBUG) console.debug('[API] Saving emotion:', { userId, emotion });

  try {
    const { data, error } = await supabase
      .from('moods')
      .insert([
        {
          user_id: userId,
          mood_type: emotion.id,
          mood_icon: emotion.icon,
          mood_label: emotion.label,
          mood_color: emotion.color
        }
      ]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[API] Error saving emotion:', error.message);
    throw error;
  }
};

export const getWeekMoodHistory = async (userId) => {
  if (DEBUG) console.debug('[API] Fetching week emotion history for user:', userId);

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
    console.error('[API] Error fetching emotion history:', error.message);
    throw error;
  }
}; 