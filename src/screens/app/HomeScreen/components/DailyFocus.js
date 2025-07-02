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

console.debug('[DailyFocus] Component mounted/re-rendered with AI-powered recommendations.');

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
        <Text style={styles.loadingOrErrorText}>No focus exercises suggested for today. Perhaps take a break?</Text>
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
            icon="calendar-check-outline"
          >
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Chip>
        </View>
        
        {focusTheme && (
          <Text style={styles.focusTheme} numberOfLines={2}>
            🎯 {focusTheme}
          </Text>
        )}
        
        <View style={styles.exerciseList}>
          {suggestedExercises.map((exercise) => {
            const isCompleted = exercise.id ? (dailyCompletionStatus[exercise.id] || false) : false;
            const isDisabled = isCompleted && exercise.id !== 'tasks_planner';

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
                  colors={isDisabled ? [COLORS.greyLight, COLORS.greyMedium] : (exercise.gradientColors || [COLORS.primary, COLORS.secondary])}
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
    backgroundColor: '#e9e6ff',
    borderRadius: RADIUS.md,
  },
  focusChipText: {
    color: '#6C63FF',
    fontWeight: FONT.weight.medium,
    fontSize: FONT.size.xs,
  },
  focusTheme: {
    color: COLORS.textMedium,
    fontSize: FONT.size.sm,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
    lineHeight: 20,
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