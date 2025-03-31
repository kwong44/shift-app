import React, { useState } from 'react';
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
  TextInput,
  Chip
} from 'react-native-paper';
import { SPACING } from '../../config/theme';
import Timer from '../../components/exercises/Timer';
import { supabase } from '../../config/supabase';

const SESSION_DURATIONS = [
  { value: 1500, label: '25 min', description: 'Classic Pomodoro' },
  { value: 2700, label: '45 min', description: 'Extended Focus' },
  { value: 3000, label: '50 min', description: 'Deep Work' },
];

const DeepWorkScreen = ({ navigation }) => {
  const [selectedDuration, setSelectedDuration] = useState(1500);
  const [taskDescription, setTaskDescription] = useState('');
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Save deep work session
      const { error: sessionError } = await supabase
        .from('deep_work_sessions')
        .insert({
          user_id: user.id,
          task_description: taskDescription.trim(),
          duration: selectedDuration,
          completed: true
        });

      if (sessionError) throw sessionError;

      // Update progress log
      const { error: progressError } = await supabase
        .from('progress_logs')
        .insert({
          user_id: user.id,
          exercise_type: 'deep-work',
          details: {
            duration: selectedDuration,
            task: taskDescription.trim()
          },
        });

      if (progressError) throw progressError;

      setShowDialog(true);
    } catch (error) {
      console.error('Error saving deep work session:', error);
      setError(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (!taskDescription.trim()) {
      setError('Please describe your task');
      setSnackbarVisible(true);
      return;
    }
    setIsSessionStarted(true);
  };

  const handleSessionCancel = () => {
    setIsSessionStarted(false);
  };

  const handleFinish = () => {
    setShowDialog(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Deep Work Session" />
      </Appbar.Header>

      <Surface style={styles.content} elevation={0}>
        {!isSessionStarted ? (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Card style={styles.instructionCard} mode="outlined">
              <Card.Content>
                <Text variant="titleMedium">Plan Your Deep Work Session</Text>
                <Text 
                  variant="bodyMedium" 
                  style={[styles.instruction, { color: theme.colors.onSurfaceVariant }]}
                >
                  Describe your task and choose a focused work duration. Remove all distractions before starting.
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.taskCard} mode="outlined">
              <Card.Content>
                <TextInput
                  mode="outlined"
                  label="What will you work on?"
                  placeholder="E.g., Write project proposal, Code review, Study chapter 3..."
                  value={taskDescription}
                  onChangeText={setTaskDescription}
                  multiline
                  numberOfLines={2}
                  style={styles.taskInput}
                />
              </Card.Content>
            </Card>

            <Text 
              variant="titleMedium" 
              style={styles.durationTitle}
            >
              Session Duration
            </Text>

            <View style={styles.durationContainer}>
              {SESSION_DURATIONS.map((duration) => (
                <Chip
                  key={duration.value}
                  selected={selectedDuration === duration.value}
                  onPress={() => setSelectedDuration(duration.value)}
                  style={styles.durationChip}
                  showSelectedOverlay
                >
                  {duration.label}
                </Chip>
              ))}
            </View>

            <Text
              variant="bodyMedium"
              style={[styles.durationDescription, { color: theme.colors.onSurfaceVariant }]}
            >
              {SESSION_DURATIONS.find(d => d.value === selectedDuration)?.description}
            </Text>

            <Button
              mode="contained"
              onPress={handleStart}
              style={styles.startButton}
            >
              Start Session
            </Button>
          </ScrollView>
        ) : (
          <View style={styles.timerContainer}>
            <Timer
              duration={selectedDuration}
              onComplete={handleComplete}
              onCancel={handleSessionCancel}
            />
            <Text 
              variant="bodyMedium" 
              style={[styles.timerText, { color: theme.colors.onSurfaceVariant }]}
            >
              Focus on: {taskDescription}
            </Text>
          </View>
        )}
      </Surface>

      <Portal>
        <Dialog visible={showDialog} onDismiss={handleFinish}>
          <Dialog.Title>Session Complete!</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Excellent work! You've completed a focused deep work session. Regular practice will help build your concentration and productivity.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleFinish}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  instructionCard: {
    marginBottom: SPACING.lg,
  },
  instruction: {
    marginTop: SPACING.sm,
  },
  taskCard: {
    marginBottom: SPACING.xl,
  },
  taskInput: {
    marginTop: SPACING.xs,
  },
  durationTitle: {
    marginBottom: SPACING.md,
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  durationChip: {
    minWidth: 100,
  },
  durationDescription: {
    marginBottom: SPACING.xl,
  },
  startButton: {
    marginTop: SPACING.md,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  timerText: {
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});

export default DeepWorkScreen; 