import { supabase } from '../config/supabase';
import logger from '../utils/logger';

/**
 * Sign up a new user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {string} fullName - User's full name
 * @returns {Promise} - The user object and session
 */
export const signUp = async (email, password, fullName) => {
  // -- RealityShift Deep-Link Strategy --------------------------------------
  // We explicitly supply the "emailRedirectTo" option so that the verification
  // link in Supabase's confirmation email points back into the mobile app via
  // our custom scheme. The deep-link will look like:
  //   realityshift://onboarding
  // When the user taps the link on their phone they'll be redirected straight
  // into the onboarding flow (Expo Linking will handle the route).
  // ------------------------------------------------------------------------
  const DEEP_LINK_REDIRECT = 'realityshift://onboarding';

  try {
    logger.debug('[auth.signUp] Attempting sign-up', { email });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: DEEP_LINK_REDIRECT, // <-- 🔗 Deep-link redirect
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    logger.info('[auth.signUp] Sign-up successful', { userId: data?.user?.id });
    return data;
  } catch (error) {
    logger.error('[auth.signUp] Error signing up', { message: error.message });
    throw error;
  }
};

/**
 * Sign in a user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise} - The user object and session
 */
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in:', error.message);
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns {Promise} - Void promise
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
};

/**
 * Get the current user session
 * @returns {Promise} - The current session
 */
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting session:', error.message);
    return { session: null };
  }
}; 