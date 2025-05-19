import React, { useState } from 'react';
import { StyleSheet, Animated, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Snackbar } from 'react-native-paper';
import { COLORS, SPACING } from '../../../config/theme';
import { DashboardHeader, ExerciseCard } from './components';
import useExercises from './hooks/useExercises';

// Constants
const EXERCISES = [
  {
    id: 'journaling',
    title: 'Journaling',
    description: 'Process thoughts and emotions through writing',
    icon: 'book-outline',
    duration: '10-15 min',
    route: 'Journaling',  
  },
   {
    id: 'tasks',
    title: 'Task Planner',
    description: 'Break down your goals into actionable tasks',
    icon: 'checkbox-marked-outline',
    duration: '5-10 min',
    route: 'TaskPlanner',
  },
  {
    id: 'binaural',
    title: 'Binaural Beats',
    description: 'Enhance focus and relaxation through audio entrainment',
    icon: 'headphones',
    duration: '10-15 min',
    route: 'BinauralSetup',
  },
  {
    id: 'visualization',
    title: 'Visualization',
    description: 'Strengthen your mindset through guided visualization',
    icon: 'eye',
    duration: '5 min',
    route: 'VisualizationSetup',
  },
  {
    id: 'deepwork',
    title: 'Deep Work',
    description: 'Focus intensely on important tasks without distractions',
    icon: 'timer-outline',
    duration: '25-50 min',
    route: 'DeepWorkSetup',
  },
  {
    id: 'mindfulness',
    title: 'Mindfulness',
    description: 'Practice presence and emotional awareness',
    icon: 'meditation',
    duration: '5-10 min',
    route: 'MindfulnessSetup',
  }
];

// Debug logging
console.debug('ExercisesDashboard mounted');

const ExercisesDashboard = ({ navigation }) => {
  const [scrollY] = useState(new Animated.Value(0));
  const { completedExercises, loading, error, refreshExercises } = useExercises();

  // Debug logging for state changes
  console.debug('ExercisesDashboard state:', { 
    completedCount: Object.keys(completedExercises).length,
    loading,
    error 
  });

  const handleExercisePress = (exercise) => {
    console.debug('Exercise pressed:', exercise.id);
    navigation.navigate(exercise.route);
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
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {EXERCISES.map(exercise => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            isCompleted={completedExercises[exercise.id]}
            onPress={handleExercisePress}
          />
        ))}
      </Animated.ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => refreshExercises()}
        action={{
          label: 'Retry',
          onPress: refreshExercises,
        }}
        style={styles.snackbar}
      >
        {error || 'An error occurred. Please try again.'}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerArea: {
    backgroundColor: COLORS.primary + '20', // Match header gradient start color
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
  snackbar: {
    bottom: SPACING.md,
  },
});

export default ExercisesDashboard; 