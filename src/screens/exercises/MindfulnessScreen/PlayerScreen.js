import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, Dimensions } from 'react-native';
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
import { Audio } from 'expo-av';
import { logMindfulnessSession } from '../../../api/exercises';
import { useUser } from '../../../hooks/useUser';
import { supabase } from '../../../config/supabase';
import { getExerciseById } from '../../../constants/masterExerciseList';
import { getFavoriteExerciseIds } from '../../../api/profile';
import useExerciseFavorites from '../../../hooks/useExerciseFavorites';

// Import local components
import Timer from '../../../components/exercises/Timer';
import { SessionCard } from './components/SessionCard';
import CustomDialog from '../../../components/common/CustomDialog';

// Debug logging
console.debug('MindfulnessPlayerScreen mounted');

const { width, height } = Dimensions.get('window');

const PlayerScreen = ({ navigation, route }) => {
  const { mindfulnessType, selectedEmotions, typeData, masterExerciseId, exerciseType, originRouteName } = route.params;
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [sound, setSound] = useState();

  // Favorites functionality
  const { 
    toggleFavorite, 
    getFavoriteStatus, 
    getLoadingStatus, 
    setInitialFavoriteStatus 
  } = useExerciseFavorites(user?.id);

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

  // Load initial favorite status
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (user?.id && masterExerciseId) {
        console.debug('[MindfulnessPlayerScreen] Loading favorite status for exercise:', masterExerciseId);
        try {
          const favoriteIds = await getFavoriteExerciseIds(user.id);
          const isFavorite = favoriteIds.includes(masterExerciseId);
          setInitialFavoriteStatus(masterExerciseId, isFavorite);
          console.debug('[MindfulnessPlayerScreen] Initial favorite status loaded:', isFavorite);
        } catch (error) {
          console.error('[MindfulnessPlayerScreen] Error loading favorite status:', error);
        }
      }
    };

    loadFavoriteStatus();
  }, [user?.id, masterExerciseId, setInitialFavoriteStatus]);

  // Load and unload sound
  useEffect(() => {
    return sound
      ? () => {
          console.debug('[MindfulnessPlayerScreen] Unloading sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const handleFavoriteToggle = async () => {
    if (!masterExerciseId) {
      console.warn('[MindfulnessPlayerScreen] No masterExerciseId available for favorite toggle');
      return;
    }

    const currentStatus = getFavoriteStatus(masterExerciseId, false);
    console.debug('[MindfulnessPlayerScreen] Toggling favorite for exercise:', masterExerciseId, 'Current status:', currentStatus);
    
    const newStatus = await toggleFavorite(masterExerciseId, currentStatus);
    
    // Show feedback message
    const message = newStatus ? 'Added to favorites!' : 'Removed from favorites';
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleComplete = async (actualDurationSpent) => {
    if (!user) {
      console.error('[MindfulnessPlayerScreen] User not found, cannot log session.');
      setSnackbarMessage('User not identified. Cannot save session.');
      setSnackbarVisible(true);
      return;
    }

    // Play completion sound
    console.debug('[MindfulnessPlayerScreen] Playing completion sound');
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
         require('../../../../assets/audio/mindfulness/finish-gong.mp3')
      );
      setSound(newSound); // Store the sound object in state, so it can be unloaded later
      await newSound.playAsync();
      console.debug('[MindfulnessPlayerScreen] Completion sound played successfully.');
    } catch (error) {
      console.error('[MindfulnessPlayerScreen] Error playing completion sound:', error);
      // Optionally, show a snackbar message if the sound fails to play
      // setSnackbarMessage('Error playing completion sound.');
      // setSnackbarVisible(true);
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Clean, focused gradient background */}
      <LinearGradient
        colors={[
          COLORS.tealGradient.start,
          COLORS.tealGradient.end,
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
                <Text style={styles.appbarTitle}>Mindfulness</Text>
                <Text style={styles.appbarSubtitle}>{typeData.label}</Text>
              </View>
            </Appbar.Header>
          </View>

          {/* Timer-focused content layout */}
          <View style={styles.content}>
            {/* Timer gets the majority of the space */}
            <View style={styles.timerSection}>
              <Timer
                duration={typeData.duration}
                onComplete={handleComplete}
                onCancel={handleSessionCancel}
                color={COLORS.tealGradient.start}
              />
            </View>
            
            {/* Compact session info at bottom */}
            <View style={styles.sessionCardSection}>
              <SessionCard
                selectedType={typeData}
                selectedEmotions={selectedEmotions}
              />
            </View>
          </View>
        </SafeAreaView>

        {/* Enhanced completion dialog */}
        <CustomDialog
          visible={showDialog}
          onDismiss={handleFinish}
          title="Practice Complete"
          content="Well done! Regular mindfulness practice can help reduce stress, improve focus, and enhance emotional well-being. Try to incorporate these moments of awareness throughout your day."
          icon="check-circle-outline"
          confirmText="Done"
          onConfirm={handleFinish}
          iconColor={COLORS.primary}
          iconBackgroundColor={`${COLORS.primary}15`}
          showFavoriteButton={!!masterExerciseId}
          isFavorite={getFavoriteStatus(masterExerciseId, false)}
          onFavoriteToggle={handleFavoriteToggle}
          favoriteLoading={getLoadingStatus(masterExerciseId)}
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
  sessionCardSection: {
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

export default PlayerScreen; 