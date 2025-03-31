import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from '../config/supabase';
import { getSession } from '../api/auth';

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

// Main app screens (placeholder for now)
import HomeScreen from '../screens/app/HomeScreen';

const Stack = createStackNavigator();

const Navigation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userSession, setUserSession] = useState(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    checkSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(session);
      checkOnboardingStatus(session?.user?.id);
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
        await checkOnboardingStatus(session.user.id);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking session:', error);
      setIsLoading(false);
    }
  };

  const checkOnboardingStatus = async (userId) => {
    if (!userId) {
      setHasCompletedOnboarding(false);
      return;
    }

    try {
      // Check if user has completed onboarding by looking for self assessment
      const { data, error } = await supabase
        .from('self_assessments')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking onboarding status:', error);
      }

      setHasCompletedOnboarding(!!data);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    }
  };

  if (isLoading) {
    // Could return a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{
          headerShown: false,
        }}
      >
        {userSession === null ? (
          // Auth Stack
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        ) : hasCompletedOnboarding ? (
          // Main App Stack
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          // Onboarding Stack
          <>
            <Stack.Screen name="OnboardingStart" component={OnboardingStart} />
            <Stack.Screen name="Habits" component={HabitsScreen} />
            <Stack.Screen name="ImprovementAreas" component={ImprovementAreasScreen} />
            <Stack.Screen name="Goals" component={GoalsScreen} />
            <Stack.Screen name="Preferences" component={PreferencesScreen} />
            <Stack.Screen name="OnboardingComplete" component={OnboardingComplete} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation; 