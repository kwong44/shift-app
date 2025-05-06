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
import MindfulnessScreen from '../screens/exercises/MindfulnessScreen';
import BinauralScreen from '../screens/exercises/BinauralScreen/index';
import VisualizationScreen from '../screens/exercises/VisualizationScreen';
import TaskPlannerScreen from '../screens/exercises/TaskPlannerScreen';
import DeepWorkScreen from '../screens/exercises/DeepWorkScreen';
import JournalingScreen from '../screens/exercises/JournalingScreen';
import SelfReflectionScreen from '../screens/exercises/SelfReflectionScreen';

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

// Define modal transition for specific screens
const modalScreenOptions = {
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

// Define custom modal option for BinauralScreen
const binauralScreenOptions = {
  ...modalScreenOptions,
  cardStyle: { backgroundColor: 'transparent' },
  cardOverlayEnabled: false,
  cardStyleInterpolator: ({ current: { progress } }) => ({
    cardStyle: {
      opacity: progress.interpolate({
        inputRange: [0, 0.5, 0.9, 1],
        outputRange: [0, 0.25, 0.7, 1],
      }),
      transform: [
        {
          translateY: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [1000, 0],
          }),
        },
      ],
    },
    overlayStyle: {
      opacity: progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }),
    },
  }),
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
          <>
            <Stack.Screen 
              name="Welcome" 
              component={WelcomeScreen} 
              options={screenOptions}
            />
            <Stack.Screen 
              name="SignIn" 
              component={SignInScreen} 
              options={modalScreenOptions}
            />
            <Stack.Screen 
              name="SignUp" 
              component={SignUpScreen} 
              options={modalScreenOptions}
            />
          </>
        ) : !hasCompletedOnboarding ? (
          // Onboarding Stack
          <>
            <Stack.Screen 
              name="OnboardingStart" 
              component={OnboardingStart} 
              options={screenOptions}
            />
            <Stack.Screen 
              name="LifeSatisfaction" 
              component={LifeSatisfactionScreen} 
              options={screenOptions}
            />
            <Stack.Screen 
              name="Habits" 
              component={HabitsScreen} 
              options={screenOptions}
            />
            <Stack.Screen 
              name="Preferences" 
              component={PreferencesScreen} 
              options={screenOptions}
            />
            <Stack.Screen 
              name="OnboardingComplete" 
              component={OnboardingComplete} 
              options={screenOptions}
            />
          </>
        ) : (
          // Main App Stack
          <>
            <Stack.Screen 
              name="App" 
              component={BottomTabNavigator}
              options={screenOptions}
            />
            <Stack.Screen 
              name="HomeScreen" 
              component={HomeScreen} 
              options={screenOptions}
            />
            <Stack.Screen 
              name="ExercisesDashboard" 
              component={ExercisesDashboard} 
              options={screenOptions}
            />
            <Stack.Screen 
              name="Mindfulness" 
              component={MindfulnessScreen} 
              options={modalScreenOptions}
            />
            <Stack.Screen 
              name="Binaural" 
              component={BinauralScreen} 
              options={binauralScreenOptions}
            />
            <Stack.Screen 
              name="Visualization" 
              component={VisualizationScreen} 
              options={modalScreenOptions}
            />
            <Stack.Screen 
              name="TaskPlanner" 
              component={TaskPlannerScreen} 
              options={modalScreenOptions}
            />
            <Stack.Screen 
              name="DeepWork" 
              component={DeepWorkScreen} 
              options={modalScreenOptions}
            />
            <Stack.Screen 
              name="Journaling" 
              component={JournalingScreen} 
              options={modalScreenOptions}
            />
            <Stack.Screen 
              name="SelfReflection" 
              component={SelfReflectionScreen} 
              options={modalScreenOptions}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation; 