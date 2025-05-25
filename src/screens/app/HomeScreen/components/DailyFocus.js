import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Text, TouchableRipple, IconButton, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';
import useDailyFocusCompletion from '../../../../hooks/useDailyFocusCompletion';

const DAILY_EXERCISES = [
  {
    id: 'mindfulness',
    title: 'Mindfulness',
    icon: 'meditation',
    duration: '5-10 min',
    route: 'MindfulnessSetup',
    benefit: 'Reduce stress and improve focus',
    gradientColors: [COLORS.tealGradient.start, COLORS.tealGradient.end]
  },
  {
    id: 'visualization',
    title: 'Visualization',
    icon: 'eye-outline',
    duration: '5 min',
    route: 'VisualizationSetup',
    benefit: 'Strengthen your goal achievement mindset',
    gradientColors: [COLORS.coralGradient.start, COLORS.coralGradient.end]
  },
  {
    id: 'tasks',
    title: 'Task Planning',
    icon: 'checkbox-marked-outline',
    duration: '10 min',
    route: 'TaskPlanner',
    benefit: 'Stay organized and productive',
    gradientColors: [COLORS.purpleGradient.start, COLORS.purpleGradient.end]
  },
  {
    id: 'deepwork',
    title: 'Deep Work',
    icon: 'timer-outline',
    duration: '25-50 min',
    route: 'DeepWorkSetup',
    benefit: 'Focus intensely on important tasks',
    gradientColors: [COLORS.blueGradient.start, COLORS.blueGradient.end]
  }
];

// Extract IDs from DAILY_EXERCISES to pass to the hook
const dailyExerciseIdsToTrack = DAILY_EXERCISES.map(ex => ex.id);

const DailyFocus = ({ onExercisePress }) => {
  const { dailyCompletionStatus, loadingCompletion, completionError, refreshDailyStatus } = useDailyFocusCompletion(dailyExerciseIdsToTrack);

  useEffect(() => {
    if (completionError) {
      console.warn('[DailyFocus] Error loading completion status:', completionError);
    }
  }, [completionError]);

  console.debug('[DailyFocus] Rendering with completion status:', dailyCompletionStatus, 'Loading:', loadingCompletion);

  const handleExercisePress = async (exercise, isCompleted) => {
    if (isCompleted && exercise.id !== 'tasks') {
      console.debug(`[DailyFocus] Exercise ${exercise.id} already completed today and not tasks. No action.`);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    await Haptics.selectionAsync();
    onExercisePress(exercise.route);
  };

  return (
    <Card style={styles.focusCard} elevation={2}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title style={styles.cardTitle}>Today's Focus</Title>
          <Chip 
            mode="flat"
            style={styles.focusChip}
            textStyle={styles.focusChipText}
          >
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Chip>
        </View>
        
        <View style={styles.exerciseList}>
          {DAILY_EXERCISES.map((exercise) => {
            const isCompleted = dailyCompletionStatus[exercise.id] || false;
            const isDisabled = isCompleted && exercise.id !== 'tasks';

            return (
              <TouchableRipple
                key={exercise.id}
                onPress={() => handleExercisePress(exercise, isCompleted)}
                style={[styles.exerciseButton, isDisabled && styles.disabledExerciseButton]}
                disabled={isDisabled}
                accessible={true}
                accessibilityLabel={`Start ${exercise.title} exercise. ${isCompleted ? 'Completed today.' : 'Not yet completed.'}`}
                accessibilityHint={`${exercise.duration} exercise to ${exercise.benefit}`}
              >
                <LinearGradient
                  colors={isDisabled ? [COLORS.greyLight, COLORS.greyMedium] : exercise.gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.exerciseGradient}
                >
                  <View style={styles.exerciseItemContainer}>
                    <View style={[styles.exerciseIconContainer, isDisabled && styles.disabledIconContainer]}>
                      {isCompleted ? (
                        <MaterialCommunityIcons 
                          name="check-circle"
                          size={28} 
                          color={exercise.id === 'tasks' && isDisabled ? COLORS.textOnColor : COLORS.success}
                        />
                      ) : (
                        <MaterialCommunityIcons 
                          name={exercise.icon} 
                          size={24} 
                          color={COLORS.textOnColor} 
                        />
                      )}
                    </View>
                    <View style={styles.exerciseContent}>
                      <Text style={[styles.exerciseTitle, isDisabled && styles.disabledText]}>{exercise.title}</Text>
                      <Text style={[styles.exerciseDescription, isDisabled && styles.disabledText]}>
                        {exercise.duration} • {exercise.benefit}
                      </Text>
                    </View>
                    <IconButton 
                      icon="chevron-right" 
                      iconColor={isDisabled ? COLORS.greyDark : COLORS.textOnColor} 
                      size={20}
                      style={styles.exerciseArrow}
                    />
                  </View>
                </LinearGradient>
              </TouchableRipple>
            );
          })}
        </View>
        {loadingCompletion && <Text style={styles.loadingText}>Checking focus completion...</Text>}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  focusCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
  },
  focusChip: {
    backgroundColor: '#e9e6ff',
    borderRadius: RADIUS.md,
  },
  focusChipText: {
    color: '#6C63FF',
    fontWeight: FONT.weight.medium,
    fontSize: FONT.size.xs,
  },
  exerciseList: {
    marginTop: SPACING.md,
  },
  exerciseButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  disabledExerciseButton: {
    // Optionally, add more specific styles if just opacity isn't enough
  },
  disabledIconContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  disabledText: {
    color: COLORS.greyDark,
    textDecorationLine: 'line-through',
  },
  exerciseGradient: {
    borderRadius: RADIUS.lg,
  },
  exerciseItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  exerciseIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseTitle: {
    fontWeight: FONT.weight.semiBold,
    color: COLORS.textOnColor,
    fontSize: FONT.size.md,
  },
  exerciseDescription: {
    color: COLORS.textOnColor,
    marginTop: 2,
    fontSize: FONT.size.sm,
    opacity: 0.8,
  },
  exerciseArrow: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    margin: 0,
    height: 28,
    width: 28,
  },
  loadingText: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: FONT.size.sm,
    paddingVertical: SPACING.sm,
  }
});

export default DailyFocus; 