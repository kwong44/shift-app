import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Debug log
  console.debug('[useUser] Hook initialized');

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.debug('[useUser] Initial session:', session?.user?.id);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('[useUser] Error getting initial session:', error.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.debug('[useUser] Auth state changed, user:', session?.user?.id);
      setUser(session?.user ?? null);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return { user, loading };
}; 