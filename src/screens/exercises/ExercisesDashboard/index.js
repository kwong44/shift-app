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
    duration: '5-10 min',
    defaultDurationText: '5-10 min',
    type: 'Writing',
    route: 'Journaling',  
    gradientColors: COLORS.journalingGradients?.gratitude || ['#F368E0', '#D63AC8'], // pinkGradient
  },
   {
    id: 'tasks',
    title: 'Task Planner',
    description: 'Break down your goals into actionable tasks',
    icon: 'checkbox-marked-outline',
    duration: 'Flexible',
    defaultDurationText: 'Flexible',
    type: 'Planning',
    route: 'TaskPlanner',
    gradientColors: COLORS.purpleGradient ? [COLORS.purpleGradient.start, COLORS.purpleGradient.end] : ['#6A1B9A', '#4A148C'],
  },
  {
    id: 'binaural',
    title: 'Binaural Beats',
    description: 'Enhance focus and relaxation through audio entrainment',
    icon: 'headphones',
    duration: '10-20 min',
    defaultDurationText: '10-20 min',
    type: 'Audio',
    route: 'BinauralSetup',
    gradientColors: COLORS.binauralGradients?.focus || ['#7D8CC4', '#5D6CAF'], // indigoGradient
  },
  {
    id: 'visualization',
    title: 'Visualization',
    description: 'Strengthen your mindset through guided visualization',
    icon: 'eye',
    duration: '5-10 min',
    defaultDurationText: '5-10 min',
    type: 'Mental',
    route: 'VisualizationSetup',
    gradientColors: COLORS.visualizationGradients?.goals || ['#FF7675', '#FF5D5D'], // coralGradient
  },
  {
    id: 'deepwork',
    title: 'Deep Work',
    description: 'Focus intensely on important tasks without distractions',
    icon: 'timer-outline',
    duration: '25-50 min',
    defaultDurationText: '25-50 min',
    type: 'Focus',
    route: 'DeepWorkSetup',
    gradientColors: COLORS.deepWorkGradients?.pomodoro || ['#5AC8FA', '#4B9EF8'], // blueGradient
  },
  {
    id: 'mindfulness',
    title: 'Mindfulness',
    description: 'Practice presence and emotional awareness',
    icon: 'meditation',
    duration: '5-10 min',
    defaultDurationText: '5-10 min',
    type: 'Meditation',
    route: 'MindfulnessSetup',
    gradientColors: COLORS.mindfulnessGradients?.breath || ['#00B894', '#007E66'], // tealGradient
  }
];

console.debug('[ExercisesDashboard] Mounted with enhanced exercise data structure', {
  exerciseCount: EXERCISES.length,
  exerciseTypes: EXERCISES.map(ex => ({ id: ex.id, type: ex.type })),
  colorMapping: {
    journaling: 'pinkGradient',
    tasks: 'purpleGradient', 
    binaural: 'indigoGradient',
    visualization: 'coralGradient',
    deepwork: 'blueGradient',
    mindfulness: 'tealGradient'
  }
});

const ExercisesDashboard = ({ navigation }) => {
  const [scrollY] = useState(new Animated.Value(0));

  console.debug('[ExercisesDashboard] Initializing with modern ExerciseCard design');
  console.debug('[ExercisesDashboard] Displaying', EXERCISES.length, 'exercise categories');

  const handleExercisePress = (categoryItem) => {
    console.debug('[ExercisesDashboard] Category pressed:', categoryItem.id, 'Type:', categoryItem.type, 'Navigating to:', categoryItem.route);
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
        bounces={true}
        decelerationRate="normal"
      >
        {EXERCISES.map((category, index) => { // Iterate over local EXERCISES array
          console.debug('[ExercisesDashboard] Rendering card for:', category.title, 'Type:', category.type);
          return (
            <ExerciseCard
              key={category.id}
              exercise={category} // Pass the category item as 'exercise' prop for ExerciseCard
              onPress={() => handleExercisePress(category)} // Pass category to handler
              style={index === EXERCISES.length - 1 ? styles.lastCard : null} // Add special styling for last card
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
  lastCard: {
    marginBottom: SPACING.xl,
  },
});

export default ExercisesDashboard; 