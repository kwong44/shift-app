import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Appbar,
  Portal,
  Dialog,
  Button,
} from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT } from '../../../config/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import CustomDialog from '../../../components/common/CustomDialog';
import { useUser } from '../../../hooks/useUser';
import { supabase } from '../../../config/supabase';
import { updateBinauralSession } from '../../../api/exercises/binaural';

// Import local components and hooks
import PlayerCard from './components/PlayerCard';
import { useBinauralAudio } from './hooks/useBinauralAudio';

// Debug logging
console.debug('BinauralPlayerScreen mounted');

const PlayerScreen = ({ navigation, route }) => {
  const { frequencyData } = route.params;
  const { masterExerciseId, exerciseType, sessionId, originRouteName } = frequencyData;
  const { user } = useUser();
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const { 
    isPlaying,
    progress,
    timeElapsed,
    error,
    handlePlayPause,
    handleStop,
    resetAudio,
  } = useBinauralAudio(frequencyData);

  console.debug('BinauralPlayerScreen props & state:', {
    frequencyData,
    masterExerciseId,
    exerciseType,
    sessionId,
    originRouteName,
    isPlaying,
    progress,
    userId: user?.id
  });

  useEffect(() => {
    if (progress >= 1 && !isCompleted && user?.id) {
      setIsCompleted(true);
      handleStop();
      console.debug(`[BinauralPlayerScreen] Session ended. Progress: ${progress}. Master ID: ${masterExerciseId}. Origin: ${originRouteName}`);

      const plannedDurationSeconds = frequencyData.duration;

      if (sessionId) {
        updateBinauralSession(sessionId, { 
          completed: true, 
          completed_at: new Date().toISOString(),
          actual_duration_seconds: plannedDurationSeconds
        })
        .then(() => console.debug('[BinauralPlayerScreen] Binaural session updated as completed in binaural_sessions.'))
        .catch(err => console.error('[BinauralPlayerScreen] Error updating binaural_sessions:', err.message));
      } else {
        console.warn('[BinauralPlayerScreen] No sessionId, cannot update binaural_sessions.');
      }

      if (masterExerciseId) {
        const dailyLogEntry = {
          user_id: user.id,
          exercise_id: masterExerciseId,
          exercise_type: exerciseType || 'Binaural Beats',
          duration_seconds: plannedDurationSeconds,
          completed_at: new Date().toISOString(), 
          source: 'BinauralPlayer',
          metadata: {
            planned_duration_seconds: plannedDurationSeconds,
            binaural_type: frequencyData.name,
            frequency_hz: frequencyData.frequency,
            base_frequency_hz: frequencyData.baseFrequency,
            waveform: frequencyData.waveform,
            category: frequencyData.category,
          }
        };
        console.debug('[BinauralPlayerScreen] Attempting to insert into daily_exercise_logs:', dailyLogEntry);
        supabase
          .from('daily_exercise_logs')
          .insert(dailyLogEntry)
          .then(({ error: dailyLogError }) => {
            if (dailyLogError) {
              console.error('[BinauralPlayerScreen] Error inserting into daily_exercise_logs:', dailyLogError.message);
            } else {
              console.debug('[BinauralPlayerScreen] Successfully inserted into daily_exercise_logs.');
            }
          });
      } else {
        console.warn('[BinauralPlayerScreen] masterExerciseId not available, cannot log to daily_exercise_logs.');
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowCompletionDialog(true);
    }
  }, [progress, user, isCompleted, frequencyData, masterExerciseId, exerciseType, sessionId, originRouteName, handleStop]);

  const handleDialogFinish = () => {
    setShowCompletionDialog(false);
    const targetRoute = originRouteName || 'ExercisesDashboard';
    console.debug(`[BinauralPlayerScreen] Navigating to ${targetRoute} after completion dialog.`);
    navigation.navigate(targetRoute);
  }

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleStop();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.screenGradient}
        >
          <Appbar.Header style={styles.appbar} statusBarHeight={0}>
            <Appbar.BackAction onPress={handleBack} color={COLORS.background} />
            <View>
              <Text style={styles.appbarTitle}>Binaural Beats</Text>
              <Text style={styles.appbarSubtitle}>{frequencyData.name}</Text>
            </View>
          </Appbar.Header>

          <View style={styles.content}>
            <PlayerCard
              frequency={frequencyData.frequency}
              duration={frequencyData.duration}
              isPlaying={isPlaying}
              progress={progress}
              timeElapsed={timeElapsed}
              onPlayPause={handlePlayPause}
              onStop={handleStop}
              waveform={frequencyData.waveform}
              frequencyCategory={frequencyData.category}
            />
          </View>

          <CustomDialog
            visible={showCompletionDialog}
            onDismiss={handleDialogFinish}
            title="Session Complete"
            content={`Well done! You've completed your ${frequencyData.name || 'Binaural Beats'} session.`}
            confirmText="Great!"
            onConfirm={handleDialogFinish}
            icon="check-circle"
            iconColor={COLORS.success}
          />

          <CustomDialog
            visible={!!error && !showCompletionDialog}
            onDismiss={resetAudio}
            title="Error"
            content={error}
            confirmText="OK"
            onConfirm={resetAudio}
            icon="alert-circle"
            iconColor={COLORS.error}
            iconBackgroundColor="rgba(255,59,48,0.1)"
          />
        </LinearGradient>
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
  screenGradient: {
    flex: 1,
  },
  appbar: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  appbarTitle: {
    color: COLORS.background,
    fontWeight: FONT.weight.bold,
    fontSize: FONT.size.lg,
  },
  appbarSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: FONT.weight.medium,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
});

export default PlayerScreen; 