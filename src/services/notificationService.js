/**
 * Notification Service (Phase 0)
 * ---------------------------------------------
 * Handles:
 * 1. Requesting push permission from the user
 * 2. Registering & caching the Expo push token
 * 3. Saving / updating the token in Supabase `user_devices`
 *
 * NOTE: Future phases will extend this service with helpers to
 * manage scheduled local notifications, unsubscribe logic, etc.
 */

import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase';
import logger from '../utils/logger';

// Configure the notification handler – let notifications show when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Request permissions and register device for push notifications.
 * If successful, the Expo push token is stored in Supabase along with platform info.
 * @param {string} userId - The authenticated user's UUID
 */
export const registerDeviceForPushAsync = async (userId) => {
  try {
    logger.debug('[notificationService] Starting push registration', { userId });

    // Do nothing if we cannot identify the user yet.
    if (!userId) {
      logger.warn('[notificationService] No userId provided, skipping registration');
      return;
    }

    // Check for physical device in production; Expo Go also supports push in dev.
    if (!Constants.isDevice) {
      logger.info('[notificationService] Push notifications only work on physical devices');
      return;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      logger.warn('[notificationService] Push permission not granted');
      return;
    }

    // Get Expo push token
    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId: Constants?.expoConfig?.extra?.eas?.projectId,
    });
    const expoPushToken = tokenResponse?.data;
    logger.debug('[notificationService] Obtained Expo push token', { expoPushToken });

    // Save to Supabase (upsert)
    const { error } = await supabase.from('user_devices').upsert(
      {
        user_id: userId,
        expo_push_token: expoPushToken,
        platform: Platform.OS,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'expo_push_token' }
    );

    if (error) throw error;

    logger.info('[notificationService] Device registered for push notifications');
  } catch (err) {
    logger.error('[notificationService] Failed to register for push', { message: err.message });
  }
}; 