import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
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

const Stack = createStackNavigator();

// Create separate stacks for better organization
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="SignIn" component={SignInScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
);

const OnboardingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="OnboardingStart" component={OnboardingStart} />
    <Stack.Screen name="Habits" component={HabitsScreen} />
    <Stack.Screen name="ImprovementAreas" component={ImprovementAreasScreen} />
    <Stack.Screen name="Goals" component={GoalsScreen} />
    <Stack.Screen name="Preferences" component={PreferencesScreen} />
    <Stack.Screen name="OnboardingComplete" component={OnboardingComplete} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
  </Stack.Navigator>
);

const Navigation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userSession, setUserSession] = useState(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

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
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!userSession ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : !hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingStack} />
        ) : (
          <Stack.Screen name="App" component={AppStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation; 