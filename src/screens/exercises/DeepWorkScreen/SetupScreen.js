import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Appbar,
  Card,
  IconButton,
  Snackbar,
  ActivityIndicator
} from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../config/theme';
import * as Haptics from 'expo-haptics';

// Import local components and constants
import { SessionDurationSelector } from './components/SessionDurationSelector';
import { TaskInput } from './components/TaskInput';
import { SESSION_DURATIONS } from './constants';
import SetupScreenButton from '../../../components/common/SetupScreenButton';
import SetupScreenButtonContainer from '../../../components/common/SetupScreenButtonContainer';

// Import API and hooks
import { startDeepWorkSession } from '../../../api/exercises/deepWork';
import { useUser } from '../../../hooks/useUser';
import { getExerciseById } from '../../../constants/masterExerciseList'; // Import helper

// Debug logging
console.debug('[DeepWorkSetupScreen] File loaded.');

const SetupScreen = ({ navigation, route }) => {
  const params = route.params || {};
  const { masterExerciseId, originRouteName } = params; // Added originRouteName
  const { user } = useUser();

  // Initial state from masterExerciseId or params or defaults
  const initialExerciseDetails = masterExerciseId ? getExerciseById(masterExerciseId) : null;
  // SESSION_DURATIONS is an array like [{label: '25 min', value: 1500}, ...], find default or use 1500
  const defaultInitialDuration = initialExerciseDetails?.defaultSettings?.duration || 1500; 

  const [selectedDuration, setSelectedDuration] = useState(
    params.duration || defaultInitialDuration
  );
  const [taskDescription, setTaskDescription] = useState('');
  const [textInputHeight, setTextInputHeight] = useState(80);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.debug('[DeepWorkSetupScreen] Received params on mount/update:', params);
    if (params.masterExerciseId) {
        console.debug('[DeepWorkSetupScreen] Master Exercise ID received:', params.masterExerciseId);
    }
    if (params.originRouteName) { // Log originRouteName
        console.debug('[DeepWorkSetupScreen] Origin route name received:', params.originRouteName);
    }
    if (params.duration && params.duration !== selectedDuration) {
      setSelectedDuration(params.duration);
    }
    // taskDescription is not set from params as it's always user-input for deep work.
  }, [params]);

  // Get the selected duration data
  const selectedDurationData = SESSION_DURATIONS.find(d => d.value === selectedDuration);
  
  // Debug logging for state changes
  console.debug('[DeepWorkSetupScreen] State:', {
    initialParams: params,
    currentSelectedDurationSeconds: selectedDuration,
    taskLength: taskDescription.length,
    userId: user?.id
  });

  const handleStart = async () => {
    if (!user) {
      console.error('[DeepWorkSetupScreen] User not found, cannot start session.');
      setSnackbarMessage('User not identified. Please restart the app.');
      setSnackbarVisible(true);
      return;
    }

    const trimmedTask = taskDescription.trim();
    if (!trimmedTask) {
      setSnackbarMessage('Please describe your task for the deep work session.');
      setSnackbarVisible(true);
      return;
    }
    
    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const durationInSeconds = selectedDuration;
    const durationInMinutes = Math.floor(durationInSeconds / 60);

    try {
      console.debug('[DeepWorkSetupScreen] Attempting to start deep work session with:', {
        userId: user.id,
        taskId: null,
        duration: durationInMinutes,
        taskDescription: trimmedTask,
      });

      const session = await startDeepWorkSession(user.id, null, durationInMinutes);

      if (session && session.id) {
        console.debug('[DeepWorkSetupScreen] Deep work session started successfully in DB:', session);
        const exerciseDetailsForPlayer = masterExerciseId ? getExerciseById(masterExerciseId) : null;
        const exerciseTypeForPlayer = exerciseDetailsForPlayer?.type || 'Deep Work';

        const playerParams = {
          sessionId: session.id,
          taskDescription: trimmedTask,
          duration: durationInSeconds,
          durationData: selectedDurationData, // This is from local SESSION_DURATIONS
          startTime: session.start_time,
          // Pass masterExerciseId and exerciseType to PlayerScreen
          masterExerciseId: masterExerciseId,
          exerciseType: exerciseTypeForPlayer,
          originRouteName: originRouteName // Pass originRouteName
        };
        console.debug('[DeepWorkSetupScreen] Navigating to DeepWorkPlayer with params (including masterId/type/origin):', playerParams);
        navigation.navigate('DeepWorkPlayer', playerParams);
      } else {
        console.error('[DeepWorkSetupScreen] Failed to start deep work session or session ID missing from API response.');
        setSnackbarMessage('Could not start session. Please try again.');
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('[DeepWorkSetupScreen] Error starting deep work session:', error.message);
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Appbar.Header style={styles.appbar} statusBarHeight={0}>
          <Appbar.BackAction 
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }} 
            color={COLORS.text} 
          />
          <Appbar.Content 
            title="Deep Work Session" 
            titleStyle={styles.appbarTitle}
            subtitle="Focus & Productivity"
            subtitleStyle={styles.appbarSubtitle}
          />
          <IconButton
            icon="information"
            iconColor={COLORS.text}
            size={24}
            onPress={() => {
              // TODO: Show info modal about deep work
            }}
          />
        </Appbar.Header>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
        </ScrollView>

        <SetupScreenButtonContainer>
          <SetupScreenButton
            label="Start Deep Work Session"
            onPress={handleStart}
            icon="clock-start"
            backgroundColor={COLORS.blueGradient.start}
            disabled={isLoading}
            loading={isLoading}
          />
        </SetupScreenButtonContainer>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbar}
          action={{
            label: 'OK',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  appbar: {
    backgroundColor: COLORS.background,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  appbarTitle: {
    color: COLORS.text,
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
  },
  appbarSubtitle: {
    color: COLORS.textLight,
    fontSize: FONT.size.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl + 80,
  },
  sectionTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  durationContainer: {
    marginHorizontal: SPACING.lg,
  },
  snackbar: {
    bottom: SPACING.md,
  },
});

export default SetupScreen; 