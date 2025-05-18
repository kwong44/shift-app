import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Snackbar, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../config/theme';
import * as Haptics from 'expo-haptics';
import { createVisualization, completeVisualization } from '../../../api/exercises';
import { useUser } from '../../../hooks/useUser';
import CustomDialog from '../../../components/common/CustomDialog';

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
  const [visualizationId, setVisualizationId] = useState(null);
  const { user } = useUser();

  const { visualizationType, affirmation, selectedEmotions, duration } = route.params;
  const selectedType = VISUALIZATION_TYPES.find(t => t.value === visualizationType);

  // Start visualization session when component mounts
  React.useEffect(() => {
    const startVisualization = async () => {
      try {
        const visualization = await createVisualization(user.id, {
          type: visualizationType,
          affirmation: affirmation.trim(),
          emotions: selectedEmotions,
          duration: duration,
          completed: false
        });
        setVisualizationId(visualization.id);
        console.debug('Visualization session started:', visualization.id);
      } catch (error) {
        console.error('Error starting visualization:', error);
        setError(error.message);
        setSnackbarVisible(true);
      }
    };

    startVisualization();
  }, []);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (visualizationId) {
        await completeVisualization(visualizationId);
        console.debug('Visualization session completed successfully');
      }

      setShowDialog(true);
    } catch (error) {
      console.error('Error completing visualization session:', error);
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

      <CustomDialog
        visible={showDialog}
        onDismiss={handleFinish}
        title="Visualization Complete"
        content="Excellent work! Regular visualization practice can help strengthen your mindset and bring you closer to your goals. Remember to carry this positive energy throughout your day."
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