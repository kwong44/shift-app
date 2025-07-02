import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Card, Title, Text, TouchableRipple, IconButton, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';
import { useUser } from '../../../../hooks/useUser';
import useDailyFocusCompletion from '../../../../hooks/useDailyFocusCompletion';
import useAIDailyFocusRecommendations from '../../../../hooks/useAIDailyFocusRecommendations';
import { MASTER_EXERCISE_LIST } from '../../../../constants/masterExerciseList';

console.debug('[DailyFocus] Component mounted/re-rendered with AI-powered recommendations.');

// Helper function to get gradient colors for an exercise
const getExerciseGradientColors = (exercise) => {
  // First, check if exercise already has gradientColors
  if (exercise.gradientColors && Array.isArray(exercise.gradientColors) && exercise.gradientColors.length === 2) {
    console.debug('[DailyFocus] Using exercise gradientColors:', exercise.gradientColors, 'for', exercise.id);
    return exercise.gradientColors;
  }

  // Fallback: look up in master exercise list
  const masterExercise = MASTER_EXERCISE_LIST.find(ex => ex.id === exercise.id);
  if (masterExercise?.gradientColors) {
    console.debug('[DailyFocus] Using master list gradientColors:', masterExercise.gradientColors, 'for', exercise.id);
    return masterExercise.gradientColors;
  }

  // Type-based fallback
  const typeGradients = {
    'Mindfulness': ['#00B894', '#007E66'], // teal
    'Visualization': ['#FF7675', '#FF5D5D'], // coral
    'Deep Work': ['#5AC8FA', '#4B9EF8'], // blue
    'Binaural Beats': ['#7D8CC4', '#5D6CAF'], // indigo
    'Task Planning': ['#6C63FF', '#5F52EE'], // purple
    'Journaling': ['#F368E0', '#D63AC8'], // pink
  };

  if (exercise.type && typeGradients[exercise.type]) {
    console.debug('[DailyFocus] Using type-based gradientColors:', typeGradients[exercise.type], 'for type:', exercise.type);
    return typeGradients[exercise.type];
  }

  // Final fallback
  console.warn('[DailyFocus] No gradientColors found for exercise:', exercise.id, exercise.type, 'using primary/secondary fallback');
  return [COLORS.primary, COLORS.secondary];
};

const DailyFocus = ({ onExercisePress }) => {
  const { user } = useUser();

  // Use AI-powered recommendations hook with smart caching and auto-refresh
  const {
    recommendations: suggestedExercises,
    loading: loadingSuggestions,
    error: suggestionsError,
    aiPowered,
    focusTheme,
    refresh: refreshRecommendations,
    getExplanation,
    isAIPowered
  } = useAIDailyFocusRecommendations({
    count: 3,
    autoRefresh: true,
    cacheTimeout: 30 * 60 * 1000 // 30 minutes cache
  });

  const exerciseIdsToTrack = useMemo(() => {
    return suggestedExercises.map(ex => ex.id);
  }, [suggestedExercises]);

  const { dailyCompletionStatus, loadingCompletion, completionError, refreshDailyStatus } = 
    useDailyFocusCompletion(exerciseIdsToTrack);

  // Log AI-powered status and focus theme for debugging
  useEffect(() => {
    if (aiPowered) {
      console.debug('[DailyFocus] Using AI-powered recommendations');
      if (focusTheme) {
        console.debug('[DailyFocus] Daily focus theme:', focusTheme);
      }
    } else {
      console.debug('[DailyFocus] Using fallback recommendations');
    }
  }, [aiPowered, focusTheme]);

  useEffect(() => {
    if (completionError) {
      console.warn('[DailyFocus] Error loading completion status from hook:', completionError);
    }
  }, [completionError]);

  // Refresh completion status when suggestions change
  useEffect(() => {
    if (suggestedExercises.length > 0) {
      console.debug('[DailyFocus] Suggestions updated, refreshing completion status.');
      refreshDailyStatus();
    }
  }, [suggestedExercises, refreshDailyStatus]);

  console.debug('[DailyFocus] Rendering. Suggestions Count:', suggestedExercises.length, 'Loading Suggestions:', loadingSuggestions, 'Loading Completions:', loadingCompletion);
  console.debug('[DailyFocus] Completion Status from hook:', dailyCompletionStatus);

  const handleExercisePress = async (exercise, isCompleted) => {
    if (isCompleted && exercise.id !== 'tasks_planner') {
      console.debug(`[DailyFocus] Exercise ${exercise.id} already completed today and not tasks_planner. No action.`);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    await Haptics.selectionAsync();
    
    // Prepare params, ensuring masterExerciseId is included
    const navigationParams = {
      ...(exercise.defaultSettings || {}),
      masterExerciseId: exercise.id, // Add the master exercise ID here
      // Optionally, pass exerciseType if Player screens can't easily derive it
      // exerciseType: exercise.type 
    };
    
    console.debug(`[DailyFocus] Calling onExercisePress. Route: ${exercise.route}, Params:`, navigationParams);
    onExercisePress(exercise.route, navigationParams);
  };

  if (loadingSuggestions) {
    return (
      <Card style={[styles.focusCard, styles.centeredContent]} elevation={2}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingOrErrorText}>
          {aiPowered ? 'AI is personalizing your focus...' : 'Loading your focus for today...'}
        </Text>
      </Card>
    );
  }

  if (suggestionsError) {
    return (
      <Card style={[styles.focusCard, styles.centeredContent]} elevation={2}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={styles.loadingOrErrorText}>
          {suggestionsError}
        </Text>
        <TouchableRipple
          onPress={refreshRecommendations}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableRipple>
      </Card>
    );
  }

  if (suggestedExercises.length === 0) {
    return (
      <Card style={[styles.focusCard, styles.centeredContent]} elevation={2}>
        <MaterialCommunityIcons name="coffee-outline" size={48} color={COLORS.textLight} />
        <Text style={styles.loadingOrErrorText}>No focus exercises suggested for today.</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.focusCard} elevation={2}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Title style={styles.cardTitle}>Today's Focus</Title>
            {aiPowered && (
              <Chip 
                mode="flat"
                style={styles.aiChip}
                textStyle={styles.aiChipText}
                icon="brain"
                compact
              >
                AI
              </Chip>
            )}
          </View>
          <Chip 
            mode="flat"
            style={styles.focusChip}
            textStyle={styles.focusChipText}
          >
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Chip>
        </View>
        
        <View style={styles.exerciseList}>
          {suggestedExercises.map((exercise) => {
            const isCompleted = exercise.id ? (dailyCompletionStatus[exercise.id] || false) : false;
            const isDisabled = isCompleted && exercise.id !== 'tasks_planner';
            
            // Debug log to see what gradientColors are being used
            console.debug('[DailyFocus] Rendering exercise:', {
              id: exercise.id,
              title: exercise.title,
              type: exercise.type,
              hasGradientColors: !!exercise.gradientColors,
              gradientColors: exercise.gradientColors,
              resolvedColors: getExerciseGradientColors(exercise)
            });

            return (
              <TouchableRipple
                key={exercise.id}
                onPress={() => handleExercisePress(exercise, isCompleted)}
                style={[styles.exerciseButton, isDisabled && styles.disabledExerciseButton]}
                disabled={isDisabled}
                accessible={true}
                accessibilityLabel={`Start ${exercise.title} exercise. ${isCompleted ? 'Completed today.' : 'Not yet completed.'}`}
                accessibilityHint={`${exercise.defaultDurationText || 'Varies'} exercise to ${exercise.description || 'improve well-being'}`}
              >
                <LinearGradient
                  colors={isDisabled ? [COLORS.greyLight, COLORS.greyMedium] : getExerciseGradientColors(exercise)}
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
                          color={(exercise.id === 'tasks_planner' && isDisabled) ? COLORS.textOnColor : COLORS.success}
                        />
                      ) : (
                        <MaterialCommunityIcons 
                          name={exercise.icon || 'lightbulb-on-outline'} 
                          size={24} 
                          color={COLORS.textOnColor} 
                        />
                      )}
                    </View>
                    <View style={styles.exerciseContent}>
                      <Text style={[styles.exerciseTitle, isDisabled && styles.disabledText]}>{exercise.title || 'Unnamed Exercise'}</Text>
                      <Text style={[styles.exerciseDescription, isDisabled && styles.disabledText]} numberOfLines={2}>
                        {exercise.defaultDurationText || 'Varies'} • {exercise.description || 'Tap to start'}
                      </Text>
                    </View>
                    <IconButton 
                      icon="chevron-right" 
                      iconColor={isDisabled ? COLORS.greyDark : COLORS.textOnColor} 
                      size={20}
                      style={styles.exerciseArrow}
                      animated={true}
                    />
                  </View>
                </LinearGradient>
              </TouchableRipple>
            );
          })}
        </View>
        {(loadingCompletion && suggestedExercises.length > 0) && 
          <Text style={styles.loadingOrErrorText}>Checking focus completion...</Text>}
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
  centeredContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    minHeight: 200,
  },
  loadingOrErrorText: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: FONT.size.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  retryButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
  },
  retryText: {
    color: COLORS.primary,
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  aiChip: {
    backgroundColor: '#e3f2fd',
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.xs,
  },
  aiChipText: {
    color: '#1976d2',
    fontWeight: FONT.weight.bold,
    fontSize: FONT.size.xs,
  },
  focusChip: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.md,
  },
  focusChipText: {
    color: COLORS.textLight,
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
  }
});

export default DailyFocus; 