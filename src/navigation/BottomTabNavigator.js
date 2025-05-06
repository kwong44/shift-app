import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import screens
import HomeScreen from '../screens/app/HomeScreen';
import ExercisesDashboard from '../screens/exercises/ExercisesDashboard';
import ProgressScreen from '../screens/app/ProgressScreen';

const Tab = createBottomTabNavigator();

// Debug logging for tab navigation
const logTabPress = (tabName) => {
  console.debug(`Tab pressed: ${tabName}`);
};

const BottomTabNavigator = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Debug logging for safe area insets
  console.debug('Safe area insets:', insets);

  return (
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
        name="Progress"
        component={ProgressScreen}
        listeners={{
          tabPress: () => logTabPress('Progress'),
        }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator; 