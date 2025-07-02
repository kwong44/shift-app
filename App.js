import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import Navigation from './src/navigation';
import { paperTheme } from './src/config/theme';
// Removed SubscriptionProvider - using credit-based system instead
import { initializeRevenueCat } from './src/config/revenuecat';
import { registerDeviceForPushAsync } from './src/services/notificationService';
import { useUser } from './src/hooks/useUser';

console.debug('[App] Application starting');

export default function App() {
  const { user } = useUser();
  // Initialize RevenueCat SDK for credit purchases
  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        console.debug('[App] Initializing RevenueCat SDK for credit system');
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

  // Phase 0: Register for push notifications when user logs in
  useEffect(() => {
    if (user?.id) {
      registerDeviceForPushAsync(user.id);
    }
  }, [user?.id]);

  return (
    <PaperProvider theme={paperTheme}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Navigation />
      </SafeAreaProvider>
    </PaperProvider>
  );
}
