import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  useTheme, 
  Surface,
  Appbar,
  Divider,
  Card
} from 'react-native-paper';
import { SPACING } from '../../config/theme';
import ExerciseCard from '../../components/exercises/ExerciseCard';
import { supabase } from '../../config/supabase';

const EXERCISES = [
  {
    id: 'binaural',
    title: 'Binaural Beats Session',
    description: 'Enhance focus and relaxation with scientifically designed audio frequencies',
    icon: 'headphones',
    duration: '10-20 min',
  },
  {
    id: 'visualization',
    title: 'Visualization Exercise',
    description: 'Strengthen your mindset through guided visualization and affirmations',
    icon: 'eye',
    duration: '5-10 min',
  },
  {
    id: 'tasks',
    title: 'Task Planner',
    description: 'Plan and prioritize your daily tasks for maximum productivity',
    icon: 'checkbox-marked-outline',
    duration: '5-15 min',
  },
  {
    id: 'deep-work',
    title: 'Deep Work Session',
    description: 'Focus intensely on important tasks without distractions',
    icon: 'timer-outline',
    duration: '25-50 min',
  },
  {
    id: 'mindfulness',
    title: 'Mindfulness Check-In',
    description: 'Check in with your current emotional and mental state',
    icon: 'meditation',
    duration: '2-5 min',
  },
  {
    id: 'journal',
    title: 'Journaling',
    description: 'Record your thoughts and receive AI-powered insights',
    icon: 'book-edit',
    duration: '10-15 min',
  },
  {
    id: 'reflection',
    title: 'Self-Reflection',
    description: 'Reflect on your progress and identify areas for growth',
    icon: 'mirror',
    duration: '5-10 min',
  },
];

const ExercisesDashboard = ({ navigation }) => {
  const [completedExercises, setCompletedExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    loadCompletedExercises();
  }, []);

  const loadCompletedExercises = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Get today's completed exercises
      const today = new Date().toISOString().split('T')[0];
      const { data: completed, error } = await supabase
        .from('progress_logs')
        .select('exercise_type')
        .eq('user_id', user.id)
        .gte('created_at', today);

      if (error) throw error;
      
      setCompletedExercises(completed.map(log => log.exercise_type));
    } catch (error) {
      console.error('Error loading completed exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExercisePress = (exerciseId) => {
    // Navigate to the specific exercise screen
    navigation.navigate(exerciseId.charAt(0).toUpperCase() + exerciseId.slice(1));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Daily Exercises" />
      </Appbar.Header>

      <Surface style={styles.content} elevation={0}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.summaryCard} mode="outlined">
            <Card.Content>
              <Text variant="titleMedium">Today's Progress</Text>
              <Text 
                variant="bodyMedium" 
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {completedExercises.length} of {EXERCISES.length} exercises completed
              </Text>
            </Card.Content>
          </Card>

          <Divider style={styles.divider} />

          <View style={styles.exercisesContainer}>
            {EXERCISES.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                title={exercise.title}
                description={exercise.description}
                icon={exercise.icon}
                duration={exercise.duration}
                completed={completedExercises.includes(exercise.id)}
                onPress={() => handleExercisePress(exercise.id)}
              />
            ))}
          </View>
        </ScrollView>
      </Surface>
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
  divider: {
    marginBottom: SPACING.lg,
  },
  exercisesContainer: {
    gap: SPACING.md,
  },
});

export default ExercisesDashboard; 