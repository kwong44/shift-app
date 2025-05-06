import React, { useState } from 'react';
import { StyleSheet, Animated, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Snackbar } from 'react-native-paper';
import { COLORS, SPACING } from '../../../config/theme';
import { DashboardHeader, ExerciseCard } from './components';
import useExercises from './hooks/useExercises';

// Constants
const EXERCISES = [
  {
    id: 'binaural',
    title: 'Binaural Beats',
    description: 'Enhance focus and relaxation through audio entrainment',
    icon: 'headphones',
    duration: '10-15 min',
    route: 'Binaural',
    color: '#7D8CC4'
  },
  {
    id: 'visualization',
    title: 'Visualization',
    description: 'Strengthen your mindset through guided visualization',
    icon: 'eye',
    duration: '5 min',
    route: 'Visualization',
    color: '#6A8EAE'
  },
  {
    id: 'tasks',
    title: 'Task Planner',
    description: 'Break down your goals into actionable tasks',
    icon: 'checkbox-marked-outline',
    duration: '5-10 min',
    route: 'TaskPlanner',
    color: '#5C5C8E'
  },
  {
    id: 'deepwork',
    title: 'Deep Work',
    description: 'Focus intensely on important tasks without distractions',
    icon: 'timer-outline',
    duration: '25-50 min',
    route: 'DeepWork',
    color: '#9067C6'
  },
  {
    id: 'mindfulness',
    title: 'Mindfulness',
    description: 'Practice presence and emotional awareness',
    icon: 'meditation',
    duration: '5-10 min',
    route: 'Mindfulness',
    color: '#4C63B6'
  },
  {
    id: 'journaling',
    title: 'Journaling',
    description: 'Process thoughts and emotions through writing',
    icon: 'book-outline',
    duration: '10-15 min',
    route: 'Journaling',
    color: '#5C96AE'
  },
  {
    id: 'reflection',
    title: 'Self-Reflection',
    description: 'Review progress and gain deeper insights',
    icon: 'lightbulb-outline',
    duration: '15-20 min',
    route: 'SelfReflection',
    color: '#7D8CC4'
  },
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

  const renderExerciseRow = (rowExercises) => (
    <View style={styles.row}>
      {rowExercises.map(exercise => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          isCompleted={completedExercises[exercise.id]}
          onPress={handleExercisePress}
        />
      ))}
      {/* Add empty placeholder if row is not complete */}
      {rowExercises.length === 1 && <View style={styles.container} />}
    </View>
  );

  const exerciseRows = [];
  for (let i = 0; i < EXERCISES.length; i += 2) {
    exerciseRows.push(EXERCISES.slice(i, i + 2));
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        <DashboardHeader scrollY={scrollY} />
        
        <View style={styles.exercisesContainer}>
          {exerciseRows.map((row, index) => (
            <View key={index}>
              {renderExerciseRow(row)}
            </View>
          ))}
        </View>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  exercisesContainer: {
    paddingHorizontal: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  snackbar: {
    bottom: SPACING.md,
  },
});

export default ExercisesDashboard; 