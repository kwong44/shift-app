import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  useTheme, 
  Surface,
  Appbar,
  Card,
  Button,
  Portal,
  Dialog,
  Snackbar,
} from 'react-native-paper';
import { SPACING } from '../../config/theme';
import ExerciseCard from '../../components/exercises/ExerciseCard';
import { supabase } from '../../config/supabase';

const EXERCISES = [
  {
    id: 'binaural',
    title: 'Binaural Beats',
    description: 'Enhance focus and relaxation through audio entrainment',
    icon: 'headphones',
    duration: '10-15 min',
    route: 'BinauralBeats'
  },
  {
    id: 'visualization',
    title: 'Visualization',
    description: 'Strengthen your mindset through guided visualization',
    icon: 'eye',
    duration: '5 min',
    route: 'Visualization'
  },
  {
    id: 'tasks',
    title: 'Task Planner',
    description: 'Break down your goals into actionable tasks',
    icon: 'checkbox-marked-outline',
    duration: '5-10 min',
    route: 'TaskPlanner'
  },
  {
    id: 'deepwork',
    title: 'Deep Work',
    description: 'Focus intensely on important tasks without distractions',
    icon: 'timer-outline',
    duration: '25-50 min',
    route: 'DeepWork'
  },
  {
    id: 'mindfulness',
    title: 'Mindfulness',
    description: 'Practice presence and emotional awareness',
    icon: 'meditation',
    duration: '5-10 min',
    route: 'Mindfulness'
  },
  {
    id: 'journaling',
    title: 'Journaling',
    description: 'Process thoughts and emotions through writing',
    icon: 'book-outline',
    duration: '10-15 min',
    route: 'Journaling'
  },
  {
    id: 'reflection',
    title: 'Self-Reflection',
    description: 'Review progress and gain deeper insights',
    icon: 'lightbulb-outline',
    duration: '15-20 min',
    route: 'SelfReflection'
  },
];

const ExercisesDashboard = ({ navigation }) => {
  const [completedExercises, setCompletedExercises] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    loadCompletedExercises();
  }, []);

  const loadCompletedExercises = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get today's progress logs
      const { data: logs, error } = await supabase
        .from('progress_logs')
        .select('exercise_type')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString());

      if (error) throw error;

      // Create a map of completed exercises
      const completed = {};
      logs.forEach(log => {
        completed[log.exercise_type] = true;
      });

      setCompletedExercises(completed);
    } catch (error) {
      console.error('Error loading completed exercises:', error);
      setError(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleExercisePress = (exercise) => {
    navigation.navigate(exercise.route);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Daily Exercises" />
      </Appbar.Header>

      <Surface style={styles.content} elevation={0}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.summaryCard} mode="outlined">
            <Card.Content>
              <Text variant="titleMedium">Daily Progress</Text>
              <Text 
                variant="bodyMedium" 
                style={[styles.summaryText, { color: theme.colors.onSurfaceVariant }]}
              >
                {Object.keys(completedExercises).length} of {EXERCISES.length} exercises completed today
              </Text>
            </Card.Content>
          </Card>

          {EXERCISES.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              title={exercise.title}
              description={exercise.description}
              icon={exercise.icon}
              duration={exercise.duration}
              completed={completedExercises[exercise.id]}
              onPress={() => handleExercisePress(exercise)}
            />
          ))}
        </ScrollView>
      </Surface>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {error || 'An error occurred. Please try again.'}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  summaryCard: {
    marginBottom: SPACING.lg,
  },
  summaryText: {
    marginTop: SPACING.xs,
  },
});

export default ExercisesDashboard; 