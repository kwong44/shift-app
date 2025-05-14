import React, { useState } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Portal, Dialog, Button, Snackbar, Text, Appbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../config/theme';
import * as Haptics from 'expo-haptics';
import { startDeepWorkSession, endDeepWorkSession } from '../../../api/exercises';
import { useUser } from '../../../hooks/useUser';

// Import local components
import Timer from '../../../components/exercises/Timer';
import { FocusCard } from './components/FocusCard';

// Debug logging
console.debug('DeepWorkPlayerScreen mounted');

export const PlayerScreen = ({ navigation, route }) => {
  const { taskDescription, duration, durationData } = route.params;
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // Debug logging for props
  console.debug('DeepWorkPlayerScreen props:', {
    taskLength: taskDescription?.length,
    duration,
    durationLabel: durationData?.label,
    sessionId
  });

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Provide haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // End the deep work session
      if (sessionId) {
        await endDeepWorkSession(sessionId);
        console.debug('Deep work session completed successfully');
      }

      setShowDialog(true);
    } catch (error) {
      console.error('Error completing deep work session:', error);
      setError(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const startSession = async () => {
    try {
      // Start a new deep work session
      const session = await startDeepWorkSession(
        user.id,
        null, // No task ID for now, we'll implement task management later
        duration / 60 // Convert seconds to minutes
      );
      setSessionId(session.id);
      console.debug('Deep work session started:', session.id);
    } catch (error) {
      console.error('Error starting deep work session:', error);
      setError(error.message);
      setSnackbarVisible(true);
    }
  };

  // Start the session when the screen mounts
  React.useEffect(() => {
    startSession();
  }, []);

  const handleSessionCancel = async () => {
    // Provide haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // End the session if it exists
    if (sessionId) {
      try {
        await endDeepWorkSession(sessionId);
        console.debug('Deep work session cancelled');
      } catch (error) {
        console.error('Error cancelling deep work session:', error);
      }
    }
    
    navigation.goBack();
  };

  const handleFinish = async () => {
    // Provide haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDialog(false);
    navigation.navigate('ExercisesDashboard');
  };

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

      <Portal>
        <Dialog visible={showDialog} onDismiss={handleFinish}>
          <LinearGradient
            colors={[`${COLORS.primary}10`, `${COLORS.secondary}05`]}
            style={styles.dialogGradient}
          >
            <Dialog.Title style={styles.dialogTitle}>Session Complete!</Dialog.Title>
            <Dialog.Content>
              <View style={styles.dialogContent}>
                <MaterialCommunityIcons 
                  name="check-circle-outline" 
                  size={48} 
                  color={COLORS.primary} 
                  style={styles.dialogIcon} 
                />
                <Text style={styles.dialogText}>
                  Excellent work! You've successfully completed a focused deep work session. 
                  Regular deep work will help build your concentration and productivity.
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
        duration={3000}
        style={styles.snackbar}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {error || 'An error occurred. Please try again.'}
      </Snackbar>
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