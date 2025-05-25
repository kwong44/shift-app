import React, { useState } from 'react';
import { StyleSheet, Animated, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { Snackbar } from 'react-native-paper'; // Snackbar no longer needed
import { COLORS, SPACING } from '../../../config/theme';
import { DashboardHeader, ExerciseCard } from './components';
// import useExercises from './hooks/useExercises'; // useExercises hook is not needed here

// Constants for all available exercises
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

console.debug('[ExercisesDashboard] Mounted. Now displays a static list of all exercises.');

const ExercisesDashboard = ({ navigation }) => {
  const [scrollY] = useState(new Animated.Value(0));
  // const { completedExercises, loading, error, refreshExercises } = useExercises(); // Removed

  // Debug logging for state changes - simplified as no dynamic state from useExercises
  console.debug('[ExercisesDashboard] State: Displaying static list.');

  const handleExercisePress = (exercise) => {
    console.debug('[ExercisesDashboard] Exercise pressed:', exercise.id, 'Navigating to:', exercise.route);
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
          { useNativeDriver: Platform.OS !== 'web' } // useNativeDriver true for non-web
        )}
        scrollEventThrottle={16}
      >
        {EXERCISES.map(exercise => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            // isCompleted={completedExercises[exercise.id]} // Removed isCompleted prop
            onPress={handleExercisePress}
          />
        ))}
      </Animated.ScrollView>

      {/* Snackbar removed as error handling from useExercises is no longer present 
      <Snackbar
        visible={!!error}
        onDismiss={() => {}}
        action={{
          label: 'Retry',
          onPress: () => {},
        }}
        style={styles.snackbar}
      >
        {error || 'An error occurred. Please try again.'}
      </Snackbar>
      */}
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
    // backgroundColor: COLORS.background, // Ensure header background is solid if needed over scrolling content
  },
  scrollContainer: {
    flex: 1, 
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  scrollContent: {
    paddingBottom: SPACING.xl, // Ensure content doesn't hide behind tab bar if any
  },
  /* Snackbar style removed as component is removed
  snackbar: {
    bottom: SPACING.md,
    marginHorizontal: SPACING.md,
  },
  */
});

export default ExercisesDashboard; 