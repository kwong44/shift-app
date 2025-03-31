import { supabase } from '../config/supabase';

export const testSupabaseConnection = async () => {
  try {
    // Test query
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)', { count: 'exact' });
    
    if (error) {
      console.error('Connection test failed:', error.message);
      return false;
    }
    
    console.log('Connection test successful:', data);
    return true;
  } catch (error) {
    console.error('Connection test failed:', error.message);
    return false;
  }
}; 