import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Portal, Dialog, Button, Snackbar, Text, Appbar, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../config/theme';
import * as Haptics from 'expo-haptics';
import { endDeepWorkSession } from '../../../api/exercises';
import { useUser } from '../../../hooks/useUser';
import { supabase } from '../../../config/supabase';

// Import local components
import Timer from '../../../components/exercises/Timer';
import { FocusCard } from './components/FocusCard';
import CustomDialog from '../../../components/common/CustomDialog';

// Debug logging
console.debug('DeepWorkPlayerScreen mounted');

const { width, height } = Dimensions.get('window');

export const PlayerScreen = ({ navigation, route }) => {
  const { 
    taskDescription, 
    duration, 
    durationData, 
    sessionId, 
    startTime, 
    masterExerciseId,
    exerciseType,
    originRouteName
  } = route.params;
  
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Debug logging for props
  console.debug('DeepWorkPlayerScreen props:', {
    taskLength: taskDescription?.length,
    duration,
    durationLabel: durationData?.label,
    sessionId,
    startTime,
    masterExerciseId,
    exerciseType,
    originRouteName,
    userId: user?.id
  });

  useEffect(() => {
    if (!sessionId) {
      console.error('DeepWorkPlayerScreen: No sessionId provided on mount. This is an error.');
      setSnackbarMessage('Session information is missing. Please go back and try again.');
      setSnackbarVisible(true);
    }
  }, [sessionId, navigation]);

  const handleComplete = async (actualDurationSpent) => {
    if (!sessionId) {
      console.error('DeepWorkPlayerScreen: handleComplete: No sessionId available.');
      setSnackbarMessage('Cannot complete session: Session ID missing.');
      setSnackbarVisible(true);
      return;
    }
    if (!user?.id) {
      console.error('DeepWorkPlayerScreen: handleComplete: No user ID available.');
      setSnackbarMessage('Cannot complete session: User information missing.');
      setSnackbarVisible(true);
      return;
    }
    setLoading(true);
    try {
      console.debug(`DeepWorkPlayerScreen: Session timer completed. SessionId: ${sessionId}, Actual Duration: ${actualDurationSpent}s. Master ID: ${masterExerciseId}`);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await endDeepWorkSession(sessionId, actualDurationSpent);
      console.debug(`DeepWorkPlayerScreen: Deep work session ${sessionId} ended successfully in DB.`);

      if (masterExerciseId) {
        const dailyLogEntry = {
          user_id: user.id,
          exercise_id: masterExerciseId,
          exercise_type: exerciseType || 'Deep Work',
          duration_seconds: actualDurationSpent,
          completed_at: new Date().toISOString(),
          source: 'DeepWorkPlayer',
          metadata: { 
            task_description_length: taskDescription?.length || 0,
            planned_duration_seconds: duration,
          }
        };
        console.debug('[DeepWorkPlayerScreen] Attempting to insert into daily_exercise_logs:', dailyLogEntry);
        supabase.from('daily_exercise_logs').insert(dailyLogEntry)
          .then(({ error: dailyErr }) => {
            if (dailyErr) console.error('[DeepWorkPlayerScreen] Error inserting to daily_exercise_logs:', dailyErr.message);
            else console.debug('[DeepWorkPlayerScreen] Inserted to daily_exercise_logs.');
          });
      } else {
        console.warn('[DeepWorkPlayerScreen] masterExerciseId not available, cannot log to daily_exercise_logs.');
      }

      setShowDialog(true);
    } catch (error) {
      console.error(`DeepWorkPlayerScreen: Error completing deep work session ${sessionId}:`, error.message);
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionCancel = async (actualDurationSpent) => {
    if (!sessionId) {
      console.warn('DeepWorkPlayerScreen: handleSessionCancel: No sessionId available. Navigating back.');
      navigation.goBack();
      return;
    }
    console.debug(`DeepWorkPlayerScreen: Session cancel requested. SessionId: ${sessionId}, Actual Duration: ${actualDurationSpent}s`);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setLoading(true);
    try {
      await endDeepWorkSession(sessionId);
      console.debug(`DeepWorkPlayerScreen: Deep work session ${sessionId} cancelled (ended) successfully.`);
    } catch (error) {
      console.error(`DeepWorkPlayerScreen: Error cancelling (ending) deep work session ${sessionId}:`, error.message);
      setSnackbarMessage(`Error ending session: ${error.message}`);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      navigation.goBack();
    }
  };

  const handleFinish = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDialog(false);
    const targetRoute = originRouteName || 'ExercisesDashboard';
    console.debug(`[DeepWorkPlayerScreen] Navigating to ${targetRoute} after session completion dialog.`);
    navigation.navigate(targetRoute);
  };

  if (!sessionId) {
    return (
      <View style={styles.container_loading}>
        <Appbar.Header style={styles.appbar_loading}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Loading Session..." />
        </Appbar.Header>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.errorText}>Session details not found. Please try starting the session again.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Clean, focused blue gradient background */}
      <LinearGradient
        colors={[
          COLORS.blueGradient.start,
          COLORS.blueGradient.end,
        ]}
        style={styles.screenGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Minimal header */}
          <View style={styles.headerContainer}>
            <Appbar.Header style={styles.appbar} statusBarHeight={0}>
              <Appbar.BackAction 
                onPress={() => handleSessionCancel(0)}
                color="#FFFFFF"
                style={styles.backButton}
              />
              <View style={styles.headerTextContainer}>
                <Text style={styles.appbarTitle}>Deep Work</Text>
                <Text style={styles.appbarSubtitle}>{durationData.description}</Text>
              </View>
            </Appbar.Header>
          </View>

          {/* Timer-focused content layout */}
          <View style={styles.content}>
            {/* Timer gets the majority of the space */}
            <View style={styles.timerSection}>
              <Timer
                duration={duration}
                onComplete={handleComplete}
                onCancel={handleSessionCancel}
                color={COLORS.blueGradient.start}
              />
            </View>
            
            {/* Compact focus info at bottom */}
            <View style={styles.focusCardSection}>
              <FocusCard 
                taskDescription={taskDescription}
                selectedDurationData={durationData}
              />
            </View>
          </View>
        </SafeAreaView>

        {/* Enhanced completion dialog */}
        <CustomDialog
          visible={showDialog}
          onDismiss={handleFinish}
          title="Session Complete!"
          content="Excellent work! You've successfully completed a focused deep work session. Regular deep work will help build your concentration and productivity."
          icon="check-circle-outline"
          confirmText="Done"
          onConfirm={handleFinish}
          iconColor={COLORS.primary}
          iconBackgroundColor={`${COLORS.primary}15`}
        />

        {/* Enhanced snackbar */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbar}
          action={{
            label: 'OK',
            onPress: () => setSnackbarVisible(false),
            textColor: '#FFFFFF',
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
  appbar_loading: {
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
  headerContainer: {
    // Removed background and border for cleaner look
  },
  appbar: {
    backgroundColor: 'transparent',
    elevation: 0,
    paddingHorizontal: SPACING.md,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  appbarTitle: {
    color: '#FFFFFF',
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
  },
  appbarSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.medium,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  timerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.lg, // Reduced padding to give timer more space
    paddingBottom: SPACING.md,
  },
  focusCardSection: {
    // Minimal space at bottom
    paddingBottom: SPACING.lg,
  },
  snackbar: {
    bottom: SPACING.lg,
    marginHorizontal: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: RADIUS.md,
  },
}); 