import React, { useState, useEffect } from 'react';
import { StyleSheet, Animated, View, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { COLORS, SPACING } from '../../../config/theme';
import { DashboardHeader, ExerciseCard } from './components';

// Constants for all available exercises (categories)
const EXERCISES = [
  {
    id: 'journaling',
    title: 'Journaling',
    description: 'Process thoughts and emotions through writing',
    icon: 'book-outline',
    duration: '5-10 min', // This is display text, actual duration set in setup screen
    route: 'Journaling',  
    gradientColors: COLORS.journalingGradients?.gratitude || ['#4C63B6', '#3F51B5'], // Example gradient
  },
   {
    id: 'tasks',
    title: 'Task Planner',
    description: 'Break down your goals into actionable tasks',
    icon: 'checkbox-marked-outline',
    duration: 'Flexible',
    route: 'TaskPlanner',
    gradientColors: COLORS.purpleGradient ? [COLORS.purpleGradient.start, COLORS.purpleGradient.end] : ['#6A1B9A', '#4A148C'],
  },
  {
    id: 'binaural',
    title: 'Binaural Beats',
    description: 'Enhance focus and relaxation through audio entrainment',
    icon: 'headphones',
    duration: '10-20 min',
    route: 'BinauralSetup',
    gradientColors: COLORS.binauralGradients?.focus || ['#1E88E5', '#1565C0'],
  },
  {
    id: 'visualization',
    title: 'Visualization',
    description: 'Strengthen your mindset through guided visualization',
    icon: 'eye',
    duration: '5-10 min',
    route: 'VisualizationSetup',
    gradientColors: COLORS.visualizationGradients?.goals || ['#4C63B6', '#3F51B5'],
  },
  {
    id: 'deepwork',
    title: 'Deep Work',
    description: 'Focus intensely on important tasks without distractions',
    icon: 'timer-outline',
    duration: '25-50 min',
    route: 'DeepWorkSetup',
    gradientColors: COLORS.deepWorkGradients?.pomodoro || ['#4C63B6', '#3F51B5'],
  },
  {
    id: 'mindfulness',
    title: 'Mindfulness',
    description: 'Practice presence and emotional awareness',
    icon: 'meditation',
    duration: '5-10 min',
    route: 'MindfulnessSetup',
    gradientColors: COLORS.mindfulnessGradients?.breath || ['#4C63B6', '#3949AB'],
  }
];

console.debug('[ExercisesDashboard] Mounted. Now displays exercise categories.');

const ExercisesDashboard = ({ navigation }) => {
  const [scrollY] = useState(new Animated.Value(0));

  console.debug('[ExercisesDashboard] Initializing. Displaying categories.');

  const handleExercisePress = (categoryItem) => {
    console.debug('[ExercisesDashboard] Category pressed:', categoryItem.id, 'Navigating to:', categoryItem.route);
    navigation.navigate(categoryItem.route, { originRouteName: 'Exercises' }); // Pass only originRouteName
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerArea} edges={['top']}>
        <DashboardHeader scrollY={scrollY} />
      </SafeAreaView>
      
      <Animated.ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: Platform.OS !== 'web' }
        )}
        scrollEventThrottle={16}
      >
        {EXERCISES.map(category => { // Iterate over local EXERCISES array
          return (
            <ExerciseCard
              key={category.id}
              exercise={category} // Pass the category item as 'exercise' prop for ExerciseCard
              onPress={() => handleExercisePress(category)} // Pass category to handler
            />
          );
        })}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerArea: {
    zIndex: 1,
  },
  scrollContainer: {
    flex: 1, 
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  messageText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.textLight,
  },
});

export default ExercisesDashboard; 