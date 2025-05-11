import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Portal, Dialog, Button, Snackbar, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../config/theme';
import { supabase } from '../../../config/supabase';
import * as Haptics from 'expo-haptics';

// Import local components
import Timer from '../../../components/exercises/Timer';
import SessionCard from './components/SessionCard';
import { VISUALIZATION_TYPES } from './constants';

// Debug logging
console.debug('VisualizationPlayerScreen mounted');

const PlayerScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);

  const { visualizationType, affirmation, selectedEmotions, duration } = route.params;
  const selectedType = VISUALIZATION_TYPES.find(t => t.value === visualizationType);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Save visualization session
      const { error: sessionError } = await supabase
        .from('visualizations')
        .insert({
          user_id: user.id,
          type: visualizationType,
          affirmation: affirmation.trim(),
          emotions: selectedEmotions,
          duration: duration,
          completed: true
        });

      if (sessionError) throw sessionError;

      // Update progress log
      const { error: progressError } = await supabase
        .from('progress_logs')
        .insert({
          user_id: user.id,
          exercise_type: 'visualization',
          details: {
            type: visualizationType,
            emotions: selectedEmotions,
            duration: duration
          },
        });

      if (progressError) throw progressError;

      console.debug('Visualization session saved successfully');
      setShowDialog(true);
    } catch (error) {
      console.error('Error saving visualization session:', error);
      setError(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionCancel = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleFinish = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDialog(false);
    navigation.navigate('ExercisesDashboard');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[`${selectedType.color}30`, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.7 }}
        style={styles.gradient}
      >
        <Timer
          duration={duration}
          onComplete={handleComplete}
          onCancel={handleSessionCancel}
          color={selectedType.color}
        />
        
        <SessionCard 
          visualizationType={selectedType}
          affirmation={affirmation}
          selectedEmotions={selectedEmotions}
        />
      </LinearGradient>

      <Portal>
        <Dialog visible={showDialog} onDismiss={handleFinish}>
          <LinearGradient
            colors={[`${selectedType.color}15`, `${selectedType.color}05`]}
            style={styles.dialogGradient}
          >
            <Dialog.Title style={styles.dialogTitle}>Visualization Complete</Dialog.Title>
            <Dialog.Content>
              <View style={styles.dialogContent}>
                <MaterialCommunityIcons 
                  name="check-circle-outline" 
                  size={48} 
                  color={selectedType.color} 
                  style={styles.dialogIcon} 
                />
                <Text style={styles.dialogText}>
                  Excellent work! Regular visualization practice can help strengthen your mindset and bring you closer to your goals. Remember to carry this positive energy throughout your day.
                </Text>
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button 
                onPress={handleFinish} 
                mode="contained" 
                buttonColor={selectedType.color}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
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
  },
  snackbar: {
    bottom: SPACING.md,
  },
});

export default PlayerScreen; 