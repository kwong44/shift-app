import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import Navigation from './src/navigation';
import { paperTheme } from './src/config/theme';
// Initialize RevenueCat SDK for subscription paywall
import { initializeRevenueCat } from './src/config/revenuecat';
import { registerDeviceForPushAsync } from './src/services/notificationService';
import { useUser } from './src/hooks/useUser';
import { DailyFocusProvider } from './src/contexts/DailyFocusContext';
import { SubscriptionProvider } from './src/contexts/SubscriptionContext';
import Purchases from 'react-native-purchases';

console.debug('[App] Application starting');

export default function App() {
  const { user } = useUser();
  // Initialize RevenueCat SDK for subscription paywall
  console.debug('[App] Initializing RevenueCat SDK for subscription paywall');
  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        console.debug('[App] Initializing RevenueCat SDK for subscription paywall');
        await initializeRevenueCat();
        console.debug('[App] RevenueCat SDK initialized successfully');
      } catch (error) {
        console.error('[App] Failed to initialize RevenueCat:', error);
        // Continue app loading even if RevenueCat fails
        // Credit purchase screens will show appropriate error messages
      }
    };

    initRevenueCat();
  }, []);

  // 2) Once the Supabase user is known, log them into RevenueCat so they appear by UID
  useEffect(() => {
    const logInToRevenueCat = async () => {
      if (!user?.id) return; // Wait until we have a real user ID

      try {
        const currentId = await Purchases.getAppUserID();

        if (currentId !== user.id) {
          console.debug('[App] Logging user into RevenueCat:', { prevId: currentId, newId: user.id });
          await Purchases.logIn(user.id);
          console.debug('[App] RevenueCat user login successful');
        } else {
          console.debug('[App] RevenueCat already using correct AppUserID');
        }
      } catch (error) {
        console.error('[App] Failed to log in user to RevenueCat:', error);
      }
    };

    logInToRevenueCat();
  }, [user?.id]);

  // Phase 0: Register for push notifications when user logs in
  useEffect(() => {
    if (user?.id) {
      registerDeviceForPushAsync(user.id);
    }
  }, [user?.id]);

  return (
    <SubscriptionProvider>
      <PaperProvider theme={paperTheme}>
        <DailyFocusProvider>
          <SafeAreaProvider>
            <StatusBar style="auto" />
            <Navigation />
          </SafeAreaProvider>
        </DailyFocusProvider>
      </PaperProvider>
    </SubscriptionProvider>
  );
}
