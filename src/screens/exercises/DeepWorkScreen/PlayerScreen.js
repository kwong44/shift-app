import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Portal, Dialog, Button, Snackbar, Text, Appbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../config/theme';
import * as Haptics from 'expo-haptics';
import { endDeepWorkSession } from '../../../api/exercises';

// Import local components
import Timer from '../../../components/exercises/Timer';
import { FocusCard } from './components/FocusCard';
import CustomDialog from '../../../components/common/CustomDialog';

// Debug logging
console.debug('DeepWorkPlayerScreen mounted');

export const PlayerScreen = ({ navigation, route }) => {
  const { taskDescription, duration, durationData, sessionId, startTime } = route.params;
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
    setLoading(true);
    try {
      console.debug(`DeepWorkPlayerScreen: Session timer completed. SessionId: ${sessionId}, Actual Duration: ${actualDurationSpent}s`);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await endDeepWorkSession(sessionId);
      console.debug(`DeepWorkPlayerScreen: Deep work session ${sessionId} ended successfully in DB.`);

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
    console.debug('DeepWorkPlayerScreen: Navigating to ExercisesDashboard after session completion dialog.');
    navigation.navigate('ExercisesDashboard');
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
      <StatusBar barStyle="light-content" backgroundColor={durationData.color} />
      <LinearGradient
        colors={[`${durationData.color}30`, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.7 }}
        style={styles.content}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <Appbar.Header style={styles.appbar} statusBarHeight={0}>
            <Appbar.BackAction 
              onPress={handleSessionCancel} 
              color={durationData.color} 
            />
            <View>
              <Text style={[styles.appbarTitle, { color: durationData.color }]}>Deep Work</Text>
              <Text style={[styles.appbarSubtitle, { color: `${durationData.color}CC` }]}>
                {durationData.description}
              </Text>
            </View>
          </Appbar.Header>

          <Timer
            duration={duration}
            onComplete={handleComplete}
            onCancel={handleSessionCancel}
            color={durationData.color}
          />
          
          <FocusCard 
            taskDescription={taskDescription}
            selectedDurationData={durationData}
          />
        </SafeAreaView>
      </LinearGradient>

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
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  appbar: {
    backgroundColor: 'transparent',
    elevation: 0,
    marginBottom: SPACING.lg,
  },
  appbarTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
  },
  appbarSubtitle: {
    fontSize: FONT.size.sm,
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