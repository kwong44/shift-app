import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Appbar,
  Button,
  Snackbar
} from 'react-native-paper';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../config/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { logMindfulnessSession } from '../../../api/exercises';
import { useUser } from '../../../hooks/useUser';
import { supabase } from '../../../config/supabase';
import { getExerciseById } from '../../../constants/masterExerciseList';

// Import local components
import Timer from '../../../components/exercises/Timer';
import { SessionCard } from './components/SessionCard';
import CustomDialog from '../../../components/common/CustomDialog';

// Debug logging
console.debug('MindfulnessPlayerScreen mounted');

const PlayerScreen = ({ navigation, route }) => {
  const { mindfulnessType, selectedEmotions, typeData, masterExerciseId, exerciseType, originRouteName } = route.params;
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Debug logging for props
  console.debug('MindfulnessPlayerScreen props:', {
    type: mindfulnessType,
    emotionsCount: selectedEmotions.length,
    userId: user?.id,
    masterExerciseId: masterExerciseId,
    exerciseType: exerciseType,
    originRouteName: originRouteName,
    plannedDuration: typeData?.duration
  });

  const handleComplete = async (actualDurationSpent) => {
    if (!user) {
      console.error('MindfulnessPlayerScreen] User not found, cannot log session.');
      setSnackbarMessage('User not identified. Cannot save session.');
      setSnackbarVisible(true);
      return;
    }
    // Ensure actualDurationSpent is a valid number, default to planned duration if undefined
    const durationToLog = typeof actualDurationSpent === 'number' ? actualDurationSpent : typeData?.duration;
    console.debug(`[MindfulnessPlayerScreen] Session complete. Actual duration received: ${actualDurationSpent}, Duration to log: ${durationToLog}s. Planned: ${typeData?.duration}s. Master ID: ${masterExerciseId}`);

    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const sessionLogData = {
        duration_seconds: durationToLog,
        completed: true,
        emotions: selectedEmotions,
        fullResponse: {
          type: mindfulnessType,
          planned_duration_seconds: typeData?.duration,
          emotions_before: selectedEmotions,
          guidance_type: typeData?.guidance,
          audio_url: typeData?.audioUrl || null
        }
      };

      await logMindfulnessSession(user.id, sessionLogData);
      console.debug('[MindfulnessPlayerScreen] Mindfulness session logged successfully to mindfulness_logs.');

      if (masterExerciseId) {
        const dailyLogEntry = {
          user_id: user.id,
          exercise_id: masterExerciseId,
          exercise_type: exerciseType || 'Mindfulness',
          duration_seconds: durationToLog,
          completed_at: new Date().toISOString(),
          source: 'MindfulnessPlayer',
          metadata: {
            planned_duration_seconds: typeData?.duration,
            mindfulness_type: mindfulnessType,
            emotions_before: selectedEmotions?.length > 0 ? selectedEmotions : null,
          }
        };
        console.debug('[MindfulnessPlayerScreen] Attempting to insert into daily_exercise_logs:', dailyLogEntry);
        const { error: dailyLogError } = await supabase
          .from('daily_exercise_logs')
          .insert(dailyLogEntry);

        if (dailyLogError) {
          console.error('[MindfulnessPlayerScreen] Error inserting into daily_exercise_logs:', dailyLogError.message);
          setSnackbarMessage('Error saving to daily summary. Progress still saved.');
          setSnackbarVisible(true);
        } else {
          console.debug('[MindfulnessPlayerScreen] Successfully inserted into daily_exercise_logs.');
        }
      } else {
        console.warn('[MindfulnessPlayerScreen] masterExerciseId not available, cannot log to daily_exercise_logs.');
      }

      setShowDialog(true);
    } catch (error) {
      console.error('[MindfulnessPlayerScreen] Error logging completed mindfulness session:', error.message);
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionCancel = async (actualDurationSpent) => {
    // Ensure actualDurationSpent is a valid number, default to 0 if undefined
    const durationToLog = typeof actualDurationSpent === 'number' ? actualDurationSpent : 0;
    console.debug(`[MindfulnessPlayerScreen] Session cancelled by user. Actual duration received: ${actualDurationSpent}, Duration to log for cancelled session: ${durationToLog}s. Planned duration was ${typeData?.duration}s`);
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (user && durationToLog > 0) { // Only log if user exists and some time was spent
      setLoading(true);
      try {
        const sessionLogData = {
          duration_seconds: durationToLog,
          completed: false,
          emotions: selectedEmotions,
          fullResponse: {
            type: mindfulnessType,
            planned_duration_seconds: typeData?.duration,
            emotions_before: selectedEmotions,
            cancelled_at_seconds: durationToLog
          }
        };
        await logMindfulnessSession(user.id, sessionLogData);
        console.debug('[MindfulnessPlayerScreen] Mindfulness session logged successfully (cancelled).');
      } catch (error) {
        console.error('[MindfulnessPlayerScreen] Error logging cancelled mindfulness session:', error.message);
        setSnackbarMessage(`Could not log cancelled session: ${error.message}`);
        setSnackbarVisible(true);
      } finally {
        setLoading(false);
      }
    }
    navigation.goBack();
  };

  const handleFinish = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDialog(false);
    const targetRoute = originRouteName || 'ExercisesDashboard';
    console.debug(`[MindfulnessPlayerScreen] Navigating to ${targetRoute} after completion/dismissal.`);
    navigation.navigate(targetRoute);
  };

  if (!user) {
    return (
      <View style={styles.container_loading}>
        <Appbar.Header style={styles.appbar_transparent}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Loading..." />
        </Appbar.Header>
        <Text style={styles.errorText}>User information not available. Please restart.</Text>
      </View>
    );
  }

  if (!typeData) {
    console.error("[MindfulnessPlayerScreen] typeData is undefined. Cannot render player.");
    return (
      <View style={styles.container_loading}>
        <Appbar.Header style={styles.appbar_transparent}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
        </Appbar.Header>
        <Text style={styles.errorText}>Exercise data missing. Please go back and try again.</Text>
      </View>
    );
  }

  // Use the teal color for background and timer
  const screenBackgroundColor = COLORS.tealGradient.start;
  const timerColor = COLORS.tealGradient.start; // Same color for the timer

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[screenBackgroundColor, screenBackgroundColor]} // Static teal background
        style={styles.screenGradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <Appbar.Header style={styles.appbar} statusBarHeight={0}>
            <Appbar.BackAction 
              onPress={() => handleSessionCancel(0)} // Pass 0 as duration if cancelled from appbar
              color={COLORS.white} // Ensure icon is visible on teal
            />
            <View>
              <Text style={styles.appbarTitle}>Mindfulness</Text>
              <Text style={styles.appbarSubtitle}>{typeData.label}</Text>
            </View>
          </Appbar.Header>

          <View style={styles.content}>
            <Timer
              duration={typeData.duration} // This duration should be correctly set by SetupScreen
              onComplete={handleComplete}
              onCancel={handleSessionCancel}
              color={timerColor} // Pass the static teal color to Timer
            />
            
            <SessionCard
              selectedType={typeData}
              selectedEmotions={selectedEmotions}
            />
          </View>
        </SafeAreaView>

        <CustomDialog
          visible={showDialog}
          onDismiss={handleFinish}
          title="Practice Complete"
          content="Well done! Regular mindfulness practice can help reduce stress, improve focus, and enhance emotional well-being. Try to incorporate these moments of awareness throughout your day."
          icon="check-circle-outline"
          confirmText="Done"
          onConfirm={handleFinish}
          iconColor={COLORS.primary} // Keep dialog icon color as primary or change if needed
          iconBackgroundColor={`${COLORS.primary}15`}
        />

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
          {snackbarMessage || 'An error occurred. Please try again.'}
        </Snackbar>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container_loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  appbar_transparent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  errorText: {
    marginTop: SPACING.md,
    color: COLORS.error,
    textAlign: 'center',
  },
  screenGradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  appbar: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  appbarTitle: {
    color: COLORS.white,
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
  },
  appbarSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FONT.size.sm,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  dialogGradient: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  dialogTitle: {
    textAlign: 'center',
    color: COLORS.text,
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
  },
  dialogContent: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  dialogIcon: {
    marginBottom: SPACING.sm,
  },
  dialogText: {
    textAlign: 'center',
    color: COLORS.textLight,
    lineHeight: 22,
  },
  dialogButton: {
    marginTop: SPACING.md,
  },
  snackbar: {
    bottom: SPACING.md,
  },
});

export default PlayerScreen; 