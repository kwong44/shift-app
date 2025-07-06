import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import { supabase } from '../config/supabase';
import { getSession } from '../api/auth';
import { hasCompletedAssessment } from '../api/selfAssessment';
// Removed subscription context import - using credit-based system instead

// Import BottomTabNavigator
import BottomTabNavigator from './BottomTabNavigator';

// Auth screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

// Onboarding screens
import CelebratoryWelcomeScreen from '../screens/onboarding/CelebratoryWelcomeScreen';
import ScienceIntroNeuroscienceScreen from '../screens/onboarding/ScienceIntroNeuroscienceScreen';
import ScienceIntroTechniquesScreen from '../screens/onboarding/ScienceIntroTechniquesScreen';
import ScienceIntroTransformationScreen from '../screens/onboarding/ScienceIntroTransformationScreen';
import ScienceIntroThinkersScreen from '../screens/onboarding/ScienceIntroThinkersScreen';
import LifeSatisfactionScreen from '../screens/onboarding/LifeSatisfactionScreen';
import AreasForGrowthScreen from '../screens/onboarding/AreasForGrowthScreen';
import AspirationsScreen from '../screens/onboarding/AspirationsScreen';
import BenefitsIntroScreen from '../screens/onboarding/BenefitsIntroScreen';
import PreferencesScreen from '../screens/onboarding/PreferencesScreen';
import NotificationPermissionScreen from '../screens/onboarding/NotificationPermissionScreen';
import OnboardingComplete from '../screens/onboarding/OnboardingComplete';

// Main app screens
import HomeScreen from '../screens/app/HomeScreen';

// Exercise screens
import ExercisesDashboard from '../screens/exercises/ExercisesDashboard';
import MindfulnessSetupScreen from '../screens/exercises/MindfulnessScreen/SetupScreen';
import MindfulnessPlayerScreen from '../screens/exercises/MindfulnessScreen/PlayerScreen';
import BinauralSetupScreen from '../screens/exercises/BinauralScreen/SetupScreen';
import BinauralPlayerScreen from '../screens/exercises/BinauralScreen/PlayerScreen';
import VisualizationSetupScreen from '../screens/exercises/VisualizationScreen/SetupScreen';
import VisualizationPlayerScreen from '../screens/exercises/VisualizationScreen/PlayerScreen';
import TaskPlannerScreen from '../screens/exercises/TaskPlannerScreen/index';
import DeepWorkSetupScreen from '../screens/exercises/DeepWorkScreen/SetupScreen';
import { PlayerScreen as DeepWorkPlayerScreen } from '../screens/exercises/DeepWorkScreen/PlayerScreen';
import JournalingSetupScreen from '../screens/exercises/JournalingScreen/JournalingSetupScreen';
import JournalingEntry from '../screens/exercises/JournalingScreen/JournalingEntry';
import JournalingHistoryScreen from '../screens/exercises/JournalingScreen/JournalingHistoryScreen';
import AICoachScreen from '../screens/app/AICoachScreen';
import CreditsPurchaseScreen from '../screens/CreditsPurchaseScreen';
import PaywallScreen from '../screens/PaywallScreen';
import SubscriptionSettingsScreen from '../screens/SubscriptionSettingsScreen';
import { View, ActivityIndicator } from 'react-native';
import { setNavigationRefForNotifications } from '../services/notificationService';

const Stack = createStackNavigator();

// Define transition configurations
const screenOptions = {
  headerShown: false,
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  transitionSpec: {
    open: {
      animation: 'spring',
      config: {
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
    close: {
      animation: 'spring',
      config: {
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
  },
  cardStyle: { backgroundColor: 'white' },
  gestureEnabled: true,
  gestureDirection: 'horizontal',
};

// Define modal transition for auth screens only
const authModalOptions = {
  headerShown: false,
  cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
  transitionSpec: {
    open: {
      animation: 'spring',
      config: {
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
    close: {
      animation: 'spring',
      config: {
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      },
    },
  },
  cardStyle: { backgroundColor: 'white' },
  gestureEnabled: true,
  gestureDirection: 'vertical',
  presentation: 'modal',
  detachPreviousScreen: true,
};

const Navigation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userSession, setUserSession] = useState(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const theme = useTheme();
  const navigationRef = React.useRef();
  
  // Credit-based system - no hard paywall, users can access main app after onboarding
  console.debug('[Navigation] Using credit-based system - no subscription paywall');

  const checkOnboardingStatus = useCallback(async (userId) => {
    try {
      // Attempt to get onboarding status
      console.debug(`[checkOnboardingStatus] Attempting to fetch onboarding status for user: ${userId}`);
      const completed = await hasCompletedAssessment(userId);
      console.debug('[checkOnboardingStatus] Onboarding status fetched:', { userId, completed });
      setHasCompletedOnboarding(completed); // Update state on success
      return completed;
    } catch (error) {
      console.error('[checkOnboardingStatus] Error checking onboarding status:', error);
      // Ensure onboarding status is set to false on error to prevent incorrect state
      setHasCompletedOnboarding(false);
      return false; // Return false as before
    }
  }, []); // Keep dependencies empty as setHasCompletedOnboarding is stable

  // Add a function to update onboarding status
  const updateOnboardingStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const completed = await hasCompletedAssessment(user.id);
        console.debug('Manually updating onboarding status:', { userId: user.id, completed });
        setHasCompletedOnboarding(completed);
        return completed;
      }
      return false;
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      return false;
    }
  }, []);

  // Export the update function to the global space so it can be called from screens
  React.useEffect(() => {
    // @ts-ignore
    global.updateOnboardingStatus = updateOnboardingStatus;
    return () => {
      // @ts-ignore
      delete global.updateOnboardingStatus;
    };
  }, [updateOnboardingStatus]);

  useEffect(() => {
    checkSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.debug('Auth state changed:', { event: _event, hasUser: !!session?.user });
      setUserSession(session);
      
      if (session?.user) {
        // Do NOT await → avoid blocking the UI on potentially slow network I/O.
        // The onboarding status will update state when it resolves.
        checkOnboardingStatus(session.user.id);
      } else {
        setHasCompletedOnboarding(false);
      }

      // SAFETY: In some edge cases `checkSession` may hang (e.g. network
      // latency), leaving `isLoading` stuck at `true` which blocks rendering.
      // We explicitly clear the loading flag here once we have *any*
      // auth-state information.
      setIsLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [checkOnboardingStatus]);

  const checkSession = async () => {
    try {
      const { session } = await getSession();
      console.debug('Session check:', { hasSession: !!session, hasUser: !!session?.user });
      setUserSession(session);
      // IMPORTANT: Do not block the UI while checking onboarding. We fire-and-forget to avoid white screen hangs.
      if (session?.user) {
        checkOnboardingStatus(session.user.id); // No await – let it resolve in the background
      }
    } catch (error) {
      console.error('Error checking session:', error);
      // Reset states on error
      setUserSession(null);
      setHasCompletedOnboarding(false);
    } finally {
      // Ensure we always remove the loading state, even if Supabase/network is slow.
      setIsLoading(false);
    }
  };

  // Add debug logging for state changes
  useEffect(() => {
    console.debug('Navigation state updated:', {
      isLoading,
      hasSession: !!userSession,
      hasCompletedOnboarding,
    });
  }, [isLoading, userSession, hasCompletedOnboarding]);

  useEffect(() => {
    if (navigationRef.current) {
      setNavigationRefForNotifications(navigationRef.current);
    }
  }, [navigationRef.current]);

  if (isLoading) {
    // Display a branded loading screen instead of returning null to prevent blank white screen.
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={{
        colors: {
          background: 'white',
          card: 'white',
          text: theme.colors.text,
          border: theme.colors.border,
          primary: theme.colors.primary,
        },
      }}
      onStateChange={(state) => {
        console.debug('Navigation State:', state);
      }}
    >
      <Stack.Navigator
        screenOptions={{
          cardStyle: { backgroundColor: 'white' },
        }}
      >
        {!userSession ? (
          // Auth Stack
          <Stack.Group screenOptions={authModalOptions}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </Stack.Group>
        ) : !hasCompletedOnboarding ? (
          // Onboarding Stack - Include main app screens to enable reset navigation
          <>
            <Stack.Group screenOptions={screenOptions}>
              <Stack.Screen name="CelebratoryWelcome" component={CelebratoryWelcomeScreen} />
              <Stack.Screen name="ScienceIntroNeuroscience" component={ScienceIntroNeuroscienceScreen} />
              <Stack.Screen name="ScienceIntroTechniques" component={ScienceIntroTechniquesScreen} />
              <Stack.Screen name="ScienceIntroTransformation" component={ScienceIntroTransformationScreen} />
              <Stack.Screen name="ScienceIntroThinkers" component={ScienceIntroThinkersScreen} />
              <Stack.Screen name="LifeSatisfaction" component={LifeSatisfactionScreen} />
              <Stack.Screen name="AreasForGrowth" component={AreasForGrowthScreen} />
              <Stack.Screen name="Aspirations" component={AspirationsScreen} />
              <Stack.Screen name="BenefitsIntro" component={BenefitsIntroScreen} />
              <Stack.Screen name="Preferences" component={PreferencesScreen} />
              <Stack.Screen name="NotificationPermission" component={NotificationPermissionScreen} />
              <Stack.Screen name="OnboardingComplete" component={OnboardingComplete} />
            </Stack.Group>
            
            {/* Include main app screens to enable direct navigation after onboarding */}
            <Stack.Group screenOptions={{...screenOptions, presentation: 'containedModal'}}>
              <Stack.Screen name="HomeScreen" component={HomeScreen} />
              <Stack.Screen name="App" component={BottomTabNavigator} />
            </Stack.Group>
          </>
        ) : (
          // Main App Stack - Credit-based system allows access after onboarding
          <Stack.Group screenOptions={screenOptions}>
            <Stack.Screen name="App" component={BottomTabNavigator} />
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="ExercisesDashboard" component={ExercisesDashboard} />
            <Stack.Screen name="MindfulnessSetup" component={MindfulnessSetupScreen} />
            <Stack.Screen name="MindfulnessPlayer" component={MindfulnessPlayerScreen} />
            <Stack.Screen name="BinauralSetup" component={BinauralSetupScreen} />
            <Stack.Screen name="BinauralPlayer" component={BinauralPlayerScreen} />
            <Stack.Screen name="VisualizationSetup" component={VisualizationSetupScreen} />
            <Stack.Screen name="VisualizationPlayer" component={VisualizationPlayerScreen} />
            <Stack.Screen name="TaskPlanner" component={TaskPlannerScreen} />
            <Stack.Screen name="DeepWorkSetup" component={DeepWorkSetupScreen} />
            <Stack.Screen name="DeepWorkPlayer" component={DeepWorkPlayerScreen} />
            <Stack.Screen name="Journaling" component={JournalingSetupScreen} />
            <Stack.Screen name="JournalingEntry" component={JournalingEntry} />
            <Stack.Screen name="JournalingHistoryScreen" component={JournalingHistoryScreen} />
            <Stack.Screen 
              name="AICoachChat"
              component={AICoachScreen}
              options={{
                headerShown: true,
                headerBackVisible: true,
                presentation: 'card',
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
              }}
            />
            <Stack.Screen 
              name="CreditsPurchase" 
              component={CreditsPurchaseScreen}
              options={{
                headerShown: false,
                presentation: 'modal',
                cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation; 