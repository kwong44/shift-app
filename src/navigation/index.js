import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import { supabase } from '../config/supabase';
import { getSession } from '../api/auth';
import { hasCompletedAssessment } from '../api/selfAssessment';

// Auth screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

// Onboarding screens
import OnboardingStart from '../screens/onboarding/OnboardingStart';
import HabitsScreen from '../screens/onboarding/HabitsScreen';
import ImprovementAreasScreen from '../screens/onboarding/ImprovementAreasScreen';
import GoalsScreen from '../screens/onboarding/GoalsScreen';
import PreferencesScreen from '../screens/onboarding/PreferencesScreen';
import OnboardingComplete from '../screens/onboarding/OnboardingComplete';

// Main app screens
import HomeScreen from '../screens/app/HomeScreen';

// Exercise screens
import ExercisesDashboard from '../screens/exercises/ExercisesDashboard';
import MindfulnessScreen from '../screens/exercises/MindfulnessScreen';
import BinauralScreen from '../screens/exercises/BinauralScreen';
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

const Navigation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userSession, setUserSession] = useState(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    checkSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUserSession(session);
      if (session?.user) {
        const completed = await hasCompletedAssessment(session.user.id);
        setHasCompletedOnboarding(completed);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { session } = await getSession();
      setUserSession(session);
      if (session?.user) {
        const completed = await hasCompletedAssessment(session.user.id);
        setHasCompletedOnboarding(completed);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking session:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // Or return a loading screen
  }

  return (
    <NavigationContainer theme={{
      colors: {
        background: 'white',
        card: 'white',
        text: theme.colors.text,
        border: theme.colors.border,
        primary: theme.colors.primary,
      },
    }}>
      <Stack.Navigator screenOptions={{
        cardStyle: { backgroundColor: 'white' },
      }}>
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
              name="Habits" 
              component={HabitsScreen}
              options={screenOptions}
            />
            <Stack.Screen 
              name="ImprovementAreas" 
              component={ImprovementAreasScreen}
              options={screenOptions}
            />
            <Stack.Screen 
              name="Goals" 
              component={GoalsScreen}
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
              options={modalScreenOptions}
            />
          </>
        ) : (
          // Main App Stack
          <>
            <Stack.Screen 
              name="HomeScreen" 
              component={HomeScreen}
              options={screenOptions}
            />
            
            {/* Exercise Stack */}
            <Stack.Screen 
              name="Exercises" 
              component={ExercisesDashboard}
              options={screenOptions}
            />
            <Stack.Screen 
              name="Mindfulness" 
              component={MindfulnessScreen}
              options={modalScreenOptions}
            />
            <Stack.Screen 
              name="BinauralBeats" 
              component={BinauralScreen}
              options={modalScreenOptions}
            />
            <Stack.Screen 
              name="Visualization" 
              component={VisualizationScreen}
              options={modalScreenOptions}
            />
            <Stack.Screen 
              name="TaskPlanner" 
              component={TaskPlannerScreen}
              options={screenOptions}
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