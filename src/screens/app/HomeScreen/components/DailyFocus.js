import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Card, Title, Text, TouchableRipple, IconButton, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';
import { useUser } from '../../../../hooks/useUser';
import useDailyFocusCompletion from '../../../../hooks/useDailyFocusCompletion';
import { getDailyFocusSuggestions } from '../../../../api/dailyFocus';

console.debug('[DailyFocus] Component mounted/re-rendered.');

const DailyFocus = ({ onExercisePress }) => {
  const { user } = useUser();
  const [suggestedExercises, setSuggestedExercises] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [suggestionsError, setSuggestionsError] = useState(null);

  const exerciseIdsToTrack = useMemo(() => {
    return suggestedExercises.map(ex => ex.id);
  }, [suggestedExercises]);

  const { dailyCompletionStatus, loadingCompletion, completionError, refreshDailyStatus } = 
    useDailyFocusCompletion(exerciseIdsToTrack);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (user?.id) {
        console.debug('[DailyFocus] User found, fetching suggestions for:', user.id);
        setLoadingSuggestions(true);
        setSuggestionsError(null);
        try {
          const suggestions = await getDailyFocusSuggestions(user.id, 3);
          setSuggestedExercises(suggestions);
          console.debug('[DailyFocus] Suggestions fetched:', suggestions.map(s => s.id));
        } catch (err) {
          console.error('[DailyFocus] Error fetching suggestions:', err);
          setSuggestionsError('Failed to load daily focus suggestions.');
          setSuggestedExercises([]);
        } finally {
          setLoadingSuggestions(false);
        }
      } else {
        console.debug('[DailyFocus] No user, or user ID not available yet. Clearing suggestions.');
        setSuggestedExercises([]);
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [user]);

  useEffect(() => {
    if (completionError) {
      console.warn('[DailyFocus] Error loading completion status from hook:', completionError);
    }
  }, [completionError]);

  console.debug('[DailyFocus] Rendering. Suggestions Count:', suggestedExercises.length, 'Loading Suggestions:', loadingSuggestions, 'Loading Completions:', loadingCompletion);
  console.debug('[DailyFocus] Completion Status from hook:', dailyCompletionStatus);

  const handleExercisePress = async (exercise, isCompleted) => {
    if (isCompleted && exercise.id !== 'tasks_planner') {
      console.debug(`[DailyFocus] Exercise ${exercise.id} already completed today and not tasks_planner. No action.`);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    await Haptics.selectionAsync();
    onExercisePress(exercise.route, exercise.defaultSettings || {});
  };

  if (loadingSuggestions) {
    return (
      <Card style={[styles.focusCard, styles.centeredContent]} elevation={2}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingOrErrorText}>Loading your focus for today...</Text>
      </Card>
    );
  }

  if (suggestionsError) {
    return (
      <Card style={[styles.focusCard, styles.centeredContent]} elevation={2}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={styles.loadingOrErrorText}>{suggestionsError}</Text>
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
          <Title style={styles.cardTitle}>Today's Focus</Title>
          <Chip 
            mode="flat"
            style={styles.focusChip}
            textStyle={styles.focusChipText}
            icon="calendar-check-outline"
          >
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Chip>
        </View>
        
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
  }
});

export default DailyFocus; 