import React, { useState } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Portal, Dialog, Button, Snackbar, Text, Appbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../config/theme';
import { supabase } from '../../../config/supabase';
import * as Haptics from 'expo-haptics';

// Import local components
import Timer from '../../../components/exercises/Timer';
import { FocusCard } from './components/FocusCard';

// Debug logging
console.debug('DeepWorkPlayerScreen mounted');

export const PlayerScreen = ({ navigation, route }) => {
  const { taskDescription, duration, durationData } = route.params;
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);

  // Debug logging for props
  console.debug('DeepWorkPlayerScreen props:', {
    taskLength: taskDescription?.length,
    duration,
    durationLabel: durationData?.label
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
          task_description: taskDescription,
          duration: duration,
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
            duration: duration,
            task: taskDescription
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

  const handleSessionCancel = async () => {
    // Provide haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    fontWeight: FONT.weight.medium,
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