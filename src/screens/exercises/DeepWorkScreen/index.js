import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  useTheme,
  Surface,
  Appbar,
  Button,
  Portal,
  Dialog,
  Snackbar
} from 'react-native-paper';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../config/theme';
import { supabase } from '../../../config/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Import local components and constants
import { Header } from './components/Header';
import { InstructionCard } from './components/InstructionCard';
import { SessionDurationSelector } from './components/SessionDurationSelector';
import { TaskInput } from './components/TaskInput';
import { FocusCard } from './components/FocusCard';
import Timer from '../../../components/exercises/Timer';
import { SESSION_DURATIONS } from './constants';

// Debug logging
console.debug('DeepWorkScreen mounted');

const DeepWorkScreen = ({ navigation }) => {
  const [selectedDuration, setSelectedDuration] = useState(1500);
  const [taskDescription, setTaskDescription] = useState('');
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);
  const [textInputHeight, setTextInputHeight] = useState(80);
  const theme = useTheme();

  // Get the selected duration data
  const selectedDurationData = SESSION_DURATIONS.find(d => d.value === selectedDuration);
  
  // Debug logging for state changes
  console.debug('DeepWorkScreen state:', {
    selectedDuration,
    taskLength: taskDescription.length,
    isSessionStarted
  });

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Provide haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
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

      console.debug('Deep work session saved successfully');
      setShowDialog(true);
    } catch (error) {
      console.error('Error saving deep work session:', error);
      setError(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!taskDescription.trim()) {
      setError('Please describe your task');
      setSnackbarVisible(true);
      return;
    }
    
    // Provide haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSessionStarted(true);
  };

  const handleSessionCancel = async () => {
    // Provide haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSessionStarted(false);
  };

  const handleFinish = async () => {
    // Provide haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDialog(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header style={styles.appbar} elevated>
        <Appbar.BackAction 
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }} 
          color={COLORS.primary} 
        />
        <Appbar.Content title="Deep Work Session" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <Surface style={styles.content} elevation={0}>
        {!isSessionStarted ? (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Header />
            
            <InstructionCard />

            <Text style={styles.sectionTitle}>What will you work on?</Text>
            
            <TaskInput 
              taskDescription={taskDescription}
              setTaskDescription={setTaskDescription}
              textInputHeight={textInputHeight}
              setTextInputHeight={setTextInputHeight}
            />

            <Text style={styles.sectionTitle}>Session Duration</Text>
            
            <View style={styles.durationContainer}>
              <SessionDurationSelector 
                durations={SESSION_DURATIONS}
                selectedDuration={selectedDuration}
                onSelectDuration={setSelectedDuration}
              />
            </View>

            <Button
              mode="contained"
              onPress={handleStart}
              style={styles.startButton}
              labelStyle={styles.startButtonLabel}
              icon="clock-start"
              loading={loading}
            >
              Start Deep Work Session
            </Button>
          </ScrollView>
        ) : (
          <LinearGradient
            colors={[`${selectedDurationData.color}30`, COLORS.background]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.7 }}
            style={styles.timerContainer}
          >
            <Timer
              duration={selectedDuration}
              onComplete={handleComplete}
              onCancel={handleSessionCancel}
              color={selectedDurationData.color}
            />
            
            <FocusCard 
              taskDescription={taskDescription}
              selectedDurationData={selectedDurationData}
            />
          </LinearGradient>
        )}
      </Surface>

      <Portal>
        <Dialog visible={showDialog} onDismiss={handleFinish}>
          <LinearGradient
            colors={[`${COLORS.primary}10`, `${COLORS.secondary}05`]}
            style={styles.dialogGradient}
          >
            <Dialog.Title style={styles.dialogTitle}>Session Complete!</Dialog.Title>
            <Dialog.Content>
              <View style={styles.dialogContent}>
                <MaterialCommunityIcons name="check-circle-outline" size={48} color={COLORS.primary} style={styles.dialogIcon} />
                <Text style={styles.dialogText}>
                  Excellent work! You've successfully completed a focused deep work session. Regular deep work will help build your concentration and productivity.
                </Text>
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button 
                onPress={handleFinish} 
                mode="contained" 
                style={styles.dialogButton}
              >
                Done
              </Button>
            </Dialog.Actions>
          </LinearGradient>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
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
  appbar: {
    backgroundColor: COLORS.background,
  },
  appbarTitle: {
    color: COLORS.primary,
    fontWeight: FONT.weight.bold,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  durationContainer: {
    marginHorizontal: SPACING.lg,
  },
  startButton: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 4,
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  startButtonLabel: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  dialogGradient: {
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
  },
  dialogTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    textAlign: 'center',
  },
  dialogContent: {
    alignItems: 'center',
  },
  dialogIcon: {
    marginBottom: SPACING.md,
  },
  dialogText: {
    textAlign: 'center',
    lineHeight: 22,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  dialogButton: {
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  snackbar: {
    bottom: SPACING.md,
  },
});

export default DeepWorkScreen; 