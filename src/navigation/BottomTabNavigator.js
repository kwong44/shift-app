import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FAB, Portal } from 'react-native-paper';
import { COLORS, SPACING } from '../config/theme';
import { useNavigation, useIsFocused, useNavigationState } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

// Import screens
import HomeScreen from '../screens/app/HomeScreen';
import ExercisesDashboard from '../screens/exercises/ExercisesDashboard';
import ProfileScreen from '../screens/app/ProgressScreen';

const Tab = createBottomTabNavigator();

// Debug logging for tab navigation
const logTabPress = (tabName) => {
  console.debug(`Tab pressed: ${tabName}`);
};

const BottomTabNavigator = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const navigationState = useNavigationState(state => state);
  
  // Check if the AI Coach screen is currently visible
  const isAICoachVisible = React.useMemo(() => {
    if (!navigationState || !navigationState.routes) return false;
    
    // Check if any route in the stack is the AICoachChat screen
    for (const route of navigationState.routes) {
      if (route.name === 'AICoachChat') {
        return true;
      }
      
      // Check nested routes if they exist
      if (route.state && route.state.routes) {
        for (const nestedRoute of route.state.routes) {
          if (nestedRoute.name === 'AICoachChat') {
            return true;
          }
        }
      }
    }
    
    return false;
  }, [navigationState]);

  // Debug logging
  useEffect(() => {
    console.debug('[BottomTabNavigator] AI Coach visibility:', isAICoachVisible);
  }, [isAICoachVisible]);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.disabled,
          tabBarStyle: {
            height: 60 + insets.bottom, // Add bottom inset to height
            paddingBottom: 4 + insets.bottom, // Add bottom inset to padding
            paddingTop: 8,
            backgroundColor: 'white',
            borderTopWidth: .5,
            borderTopColor: theme.colors.disabled,
          },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Roadmap"
          component={HomeScreen}
          listeners={{
            tabPress: () => logTabPress('Roadmap'),
          }}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Exercises"
          component={ExercisesDashboard}
          listeners={{
            tabPress: () => logTabPress('Exercises'),
          }}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="fitness-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          listeners={{
            tabPress: () => logTabPress('Profile'),
          }}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      
      {isFocused && !isAICoachVisible && (
        <Portal>
          <FAB
            icon="chat"
            label="Accountability Coach"
            style={{
              ...styles.fab,
              backgroundColor: COLORS.accent,
            }}
            onPress={() => navigation.navigate('AICoachChat')}
            color="white"
            labelStyle={{ color: 'white' }}
            theme={{ colors: { surfaceVariant: COLORS.accent } }}
          />
        </Portal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 80,
    backgroundColor: COLORS.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default BottomTabNavigator; 