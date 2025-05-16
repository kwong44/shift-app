import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import { supabase } from '../config/supabase';
import { getSession } from '../api/auth';
import { hasCompletedAssessment } from '../api/selfAssessment';

// Import BottomTabNavigator
import BottomTabNavigator from './BottomTabNavigator';

// Auth screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

// Onboarding screens
import OnboardingStart from '../screens/onboarding/OnboardingStart';
import LifeSatisfactionScreen from '../screens/onboarding/LifeSatisfactionScreen';
import HabitsScreen from '../screens/onboarding/HabitsScreen';
import PreferencesScreen from '../screens/onboarding/PreferencesScreen';
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
import AICoachScreen from '../screens/app/AICoachScreen';

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

  const checkOnboardingStatus = useCallback(async (userId) => {
    try {
      const completed = await hasCompletedAssessment(userId);
      console.debug('Onboarding status check:', { userId, completed });
      setHasCompletedOnboarding(completed);
      return completed;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    checkSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.debug('Auth state changed:', { event: _event, hasUser: !!session?.user });
      setUserSession(session);
      
      if (session?.user) {
        await checkOnboardingStatus(session.user.id);
      } else {
        setHasCompletedOnboarding(false);
      }
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
      
      if (session?.user) {
        await checkOnboardingStatus(session.user.id);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      // Reset states on error
      setUserSession(null);
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Add debug logging for state changes
  useEffect(() => {
    console.debug('Navigation state updated:', {
      isLoading,
      hasSession: !!userSession,
      hasCompletedOnboarding
    });
  }, [isLoading, userSession, hasCompletedOnboarding]);

  if (isLoading) {
    return null; // Or return a loading screen
  }

  return (
    <NavigationContainer
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
          // Onboarding Stack
          <Stack.Group screenOptions={screenOptions}>
            <Stack.Screen name="OnboardingStart" component={OnboardingStart} />
            <Stack.Screen name="LifeSatisfaction" component={LifeSatisfactionScreen} />
            <Stack.Screen name="Habits" component={HabitsScreen} />
            <Stack.Screen name="Preferences" component={PreferencesScreen} />
            <Stack.Screen name="OnboardingComplete" component={OnboardingComplete} />
          </Stack.Group>
        ) : (
          // Main App Stack
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
            <Stack.Screen 
              name="AICoachChat"
              component={AICoachScreen}
              options={{
                title: 'AI Coach',
                headerShadowVisible: false,
                headerStyle: {
                  backgroundColor: theme.colors.background,
                },
                presentation: 'modal',
                cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
              }}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation; 