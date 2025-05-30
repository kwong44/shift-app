import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, ScrollView, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Text, TouchableRipple, ProgressBar, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../../config/theme';
import { updateWeeklyGoal, deleteWeeklyGoal } from '../../../../api/exercises';
import { createWeeklyGoalForLongTermGoal } from '../../../../api/exercises/goals';
import { supabase } from '../../../../config/supabase';
import * as Haptics from 'expo-haptics';

// Debug logger for tracking component lifecycle and user interactions
const debug = {
  log: (message) => {
    console.log(`[GrowthRoadmap] ${message}`);
  },
  error: (message) => {
    console.error(`[GrowthRoadmap] ${message}`);
  }
};

// Debug: Confirm SHADOWS import is working
debug.log('SHADOWS import successful:', typeof SHADOWS);

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
  debug.log('LayoutAnimation enabled for Android.');
}

const GrowthRoadmap = ({ 
  dailyProgress, 
  streak, 
  currentMood, 
  onMoodPress,
  emotions, // Updated from MOODS to emotions
  // New props for roadmap features
  roadmap, // Old prop: the user's roadmap object from Supabase (contains LTAs, current phase) - DEPRECATED
  allUserWeeklyGoals = [], // All weekly goals for the user (includes both old and new system)
  longTermGoals = [], // NEW: Long-term goals with linked weekly goals from new system
  onUpdateRoadmapData, // Callback to notify parent of data changes
}) => {
  const [animatedProgress] = React.useState(new Animated.Value(0));
  const [expandedLtaId, setExpandedLtaId] = useState(null);
  const [newGoalTexts, setNewGoalTexts] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Debug current mood state
  useEffect(() => {
    debug.log(`Current mood updated: ${currentMood}`);
    if (emotions) {
        debug.log(`Available emotions: ${JSON.stringify(emotions.map(e => e.id))}`);
    } else {
        debug.log('Emotions not available yet.');
    }
  }, [currentMood, emotions]);

  useEffect(() => {
    debug.log(`Roadmap data: ${roadmap ? `Phase: ${roadmap.current_phase?.name}, LTAs: ${roadmap.goals?.length}` : 'No roadmap'}`);
    debug.log(`All user weekly goals received: ${allUserWeeklyGoals.length}`);
    debug.log(`Long-term goals (NEW SYSTEM) received: ${longTermGoals.length}`);
  }, [roadmap, allUserWeeklyGoals, longTermGoals]);

  useEffect(() => {
    const progressToAnimate = dailyProgress || (roadmap?.progress?.total_goals ? (roadmap.progress.completed_goals / roadmap.progress.total_goals) : 0);
    debug.log(`Animating overall progress bar to: ${progressToAnimate}`);
    Animated.timing(animatedProgress, {
      toValue: progressToAnimate,
      duration: 1000,
      useNativeDriver: false
    }).start();
  }, [dailyProgress, roadmap]);

  const toggleLtaSection = (ltaId) => {
    debug.log(`Toggling LTA section: ${ltaId}`);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedLtaId(expandedLtaId === ltaId ? null : ltaId);
  };

  const handleNewGoalTextChange = (ltaId, text) => {
    setNewGoalTexts(prev => ({ ...prev, [ltaId]: text }));
  };

  // Get current emotion display data
  const getCurrentEmotion = () => {
    if (!currentMood || !emotions) return null;
    
    const foundEmotion = emotions.find(e => e.id === currentMood);
    debug.log(`Found emotion for ${currentMood}: ${JSON.stringify(foundEmotion)}`);
    return foundEmotion;
  };

  /**
   * @deprecated - Use addWeeklyGoalToLongTermGoal instead
   * Old function for adding weekly goals to roadmap LTAs - no longer supported
   */
  const addWeeklyGoal = async (ltaId) => {
    console.warn('[GrowthRoadmap] DEPRECATED: addWeeklyGoal function is deprecated. Database columns removed.');
    debug.log('ERROR: Attempted to use deprecated addWeeklyGoal function');
    alert('This feature has been updated. Please use the new long-term goals system.');
    return;
  };

  const toggleGoalCompletion = async (goalId, isCompleted) => {
    try {
      setIsLoading(true);
      debug.log(`Toggling completion for weekly goal: ${goalId} to ${!isCompleted}`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated for toggling goal');
      
      await updateWeeklyGoal(user.id, goalId, { completed: !isCompleted });
      
      debug.log(`Successfully toggled weekly goal ${goalId}. Triggering data refresh.`);
      if (onUpdateRoadmapData) onUpdateRoadmapData();
    } catch (error) {
      console.error('Failed to toggle goal completion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeGoal = async (goalId) => {
    try {
      setIsLoading(true);
      debug.log(`Removing weekly goal: ${goalId}`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated for removing goal');
      
      await deleteWeeklyGoal(user.id, goalId);
      
      debug.log(`Successfully removed weekly goal ${goalId}. Triggering data refresh.`);
      if (onUpdateRoadmapData) onUpdateRoadmapData();
    } catch (error) {
      console.error('Failed to remove weekly goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPhaseIndicator = () => {
    if (!roadmap || !roadmap.current_phase) {
      debug.log('No roadmap or current phase data to render phase indicator.');
      return <Text style={styles.infoText}>Loading roadmap phase...</Text>;
    }

    const pendingMilestones = roadmap.milestones?.filter(m => m.status === 'pending');
    const nextConcreteMilestone = pendingMilestones?.length > 0 ? pendingMilestones[0].description : 'Continue making progress!';

    return (
    <View style={styles.phaseContainer}>
      <View style={styles.phaseHeader}>
        <MaterialCommunityIcons name="map-marker-path" size={24} color={COLORS.text} />
        <Text style={styles.phaseTitle}>Current Phase: {roadmap.current_phase.name || 'Getting Started'}</Text>
      </View>
      <View style={styles.phaseDetails}>
        <Text style={styles.phaseDescription}>{roadmap.current_phase.description}</Text>
        <View style={styles.nextMilestone}>
          <MaterialCommunityIcons name="flag" size={16} color={COLORS.text} />
          <Text style={styles.milestoneText}>Next Up: {nextConcreteMilestone}</Text>
        </View>
      </View>
    </View>
    );
  };

  const renderNewLongTermGoals = () => {
    if (!longTermGoals || longTermGoals.length === 0) {
      debug.log('No long-term goals (NEW SYSTEM) to render.');
      return (
        <View style={styles.emptyGoalsSection}>
          <Text style={styles.infoText}>
            Create long-term goals through the AI Coach to track your progress!
          </Text>
        </View>
      );
    }

    debug.log(`Rendering ${longTermGoals.length} long-term goals from NEW SYSTEM`);

    return longTermGoals.map((longTermGoal) => {
      const weeklyGoals = longTermGoal.weekly_goals || [];
      const completedWeeklyGoals = weeklyGoals.filter(wg => wg.completed).length;
      const goalProgress = weeklyGoals.length > 0 ? completedWeeklyGoals / weeklyGoals.length : 0;

      debug.log(`Rendering Long-term Goal: ${longTermGoal.id} (${longTermGoal.title}). Progress: ${goalProgress}. Weekly Goals: ${weeklyGoals.length}`);

      return (
        <View key={longTermGoal.id} style={styles.ltaContainer}>
          <TouchableRipple onPress={() => toggleLtaSection(longTermGoal.id)} style={styles.ltaHeaderTouchable}>
            <View style={styles.ltaHeader}>
              <MaterialCommunityIcons 
                name={longTermGoal.source === 'ai_coach' ? 'robot-outline' : 'bullseye-arrow'} 
                size={20} 
                color={longTermGoal.source === 'ai_coach' ? COLORS.accent : COLORS.primary} 
              />
              <Text style={styles.ltaTitle}>{longTermGoal.title}</Text>
              {longTermGoal.source === 'ai_coach' && (
                <Text style={styles.aiCoachBadge}>AI</Text>
              )}
              <MaterialCommunityIcons 
                name={expandedLtaId === longTermGoal.id ? "chevron-up" : "chevron-down"} 
                size={24} 
                color={COLORS.text} 
              />
            </View>
          </TouchableRipple>
          <ProgressBar progress={goalProgress} color={COLORS.accent} style={styles.ltaProgress} />

          {expandedLtaId === longTermGoal.id && (
            <View style={styles.ltaDetails}>
              {longTermGoal.description && (
                <Text style={styles.goalDescription}>{longTermGoal.description}</Text>
              )}
              
              <View style={styles.addGoalContainer}>
                <TextInput
                  style={styles.goalInput}
                  value={newGoalTexts[longTermGoal.id] || ''}
                  onChangeText={(text) => handleNewGoalTextChange(longTermGoal.id, text)}
                  placeholder="Add a new weekly goal for this long-term goal..."
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  editable={!isLoading}
                />
                <IconButton
                  icon="plus-circle"
                  size={24}
                  color={COLORS.primary}
                  onPress={() => addWeeklyGoalToLongTermGoal(longTermGoal.id)}
                  disabled={!(newGoalTexts[longTermGoal.id]?.trim()) || isLoading}
                />
              </View>
              
              {weeklyGoals.length > 0 ? weeklyGoals.map((goal) => (
                <View key={goal.id} style={styles.goalItem}>
                  <TouchableRipple
                    onPress={() => toggleGoalCompletion(goal.id, goal.completed)}
                    style={styles.goalCheckbox}
                    disabled={isLoading}
                  >
                    <MaterialCommunityIcons 
                      name={goal.completed ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
                      size={16} 
                      color={COLORS.text} 
                    />
                  </TouchableRipple>
                  <Text style={[styles.goalText, goal.completed && styles.completedGoalText]}>
                    {goal.text}
                  </Text>
                  <IconButton
                    icon="close-circle"
                    size={16}
                    color="rgba(0, 0, 0, 0.5)"
                    onPress={() => removeGoal(goal.id)}
                    style={styles.removeGoalButton}
                    disabled={isLoading}
                  />
                </View>
              )) : (
                <Text style={styles.emptyGoalsText}>
                  Break down this long-term goal into weekly action steps!
                </Text>
              )}
            </View>
          )}
        </View>
      );
    });
  };

  const renderAICoachGoals = () => {
    // Filter goals that were created by AI Coach or standalone (no long-term goal linkage)
    const aiCoachGoals = allUserWeeklyGoals.filter(wg => !wg.long_term_goal_id);
    
    if (aiCoachGoals.length === 0) {
      debug.log('No standalone/AI Coach goals to display');
      return null;
    }

    debug.log(`Rendering ${aiCoachGoals.length} standalone/AI Coach goals`);

    return (
      <View style={styles.aiCoachContainer}>
        <View style={styles.aiCoachHeader}>
          <MaterialCommunityIcons name="robot-outline" size={20} color={COLORS.accent} />
          <Text style={styles.aiCoachTitle}>Standalone Goals</Text>
        </View>
        <Text style={styles.aiCoachDescription}>
          Weekly goals not linked to specific long-term goals
        </Text>
        
        {aiCoachGoals.map((goal) => (
          <View key={goal.id} style={styles.goalItem}>
            <TouchableRipple
              onPress={() => toggleGoalCompletion(goal.id, goal.completed)}
              style={styles.goalCheckbox}
              disabled={isLoading}
            >
              <MaterialCommunityIcons 
                name={goal.completed ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
                size={16} 
                color={COLORS.text} 
              />
            </TouchableRipple>
            <Text style={[styles.goalText, goal.completed && styles.completedGoalText]}>
              {goal.text}
            </Text>
            <IconButton
              icon="close-circle"
              size={16}
              color="rgba(0, 0, 0, 0.5)"
              onPress={() => removeGoal(goal.id)}
              style={styles.removeGoalButton}
              disabled={isLoading}
            />
          </View>
        ))}
      </View>
    );
  };

  // Get the current emotion object
  const currentEmotionData = getCurrentEmotion();

  // Calculate overall progress from roadmap or daily progress - Rule: Always add debug logs  
  const overallProgressValue = roadmap?.progress?.total_goals 
    ? (roadmap.progress.completed_goals / roadmap.progress.total_goals) 
    : 0;
    
  debug.log(`Calculated overall progress value for top bar: ${overallProgressValue}`);

  const addWeeklyGoalToLongTermGoal = async (longTermGoalId) => {
    const goalText = newGoalTexts[longTermGoalId]?.trim();
    if (!goalText) return;

    setIsLoading(true);
    try {
      debug.log(`Adding weekly goal to long-term goal ${longTermGoalId}: ${goalText}`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Use the static import (FIXED: removed dynamic import)
      const newGoal = await createWeeklyGoalForLongTermGoal(user.id, longTermGoalId, goalText);

      debug.log('Weekly goal added to long-term goal successfully:', newGoal);

      // Clear the input
      setNewGoalTexts(prev => ({
        ...prev,
        [longTermGoalId]: ''
      }));

      // Notify parent to refresh data
      if (onUpdateRoadmapData) {
        await onUpdateRoadmapData();
      }

      // Success feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    } catch (error) {
      debug.error('Error adding weekly goal to long-term goal:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert(`Failed to add goal: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.headerContent}>
          <TouchableRipple style={styles.streakContainer}>
            <View style={styles.streakBadge}>
              <MaterialCommunityIcons name="fire" size={18} color={COLORS.textOnColor} />
              <Text style={styles.streakText}>{streak || 0} day streak</Text>
            </View>
          </TouchableRipple>
          
          <TouchableRipple 
            onPress={onMoodPress} 
            style={styles.moodButton}
            accessible={true}
            accessibilityLabel="Set your mood"
            accessibilityHint="Opens mood selection dialog"
          >
            <View style={styles.moodContent}>
              {currentEmotionData ? (
                <>
                  <MaterialCommunityIcons 
                    name={currentEmotionData.icon} 
                    size={22} 
                    color={currentEmotionData.color}
                    style={styles.moodIcon}
                  />
                  <Text style={[
                    styles.moodLabel,
                    { color: currentEmotionData.color }
                  ]}>
                    {currentEmotionData.label}
                  </Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons 
                    name="emoticon-happy-outline" 
                    size={22} 
                    color={COLORS.text}
                    style={styles.moodIcon}
                  />
                  <Text style={styles.moodLabel}>Add Mood</Text>
                </>
              )}
            </View>
          </TouchableRipple>
        </View>

        <View style={styles.overallProgress}>
          <Text style={styles.progressTitle}>Your Growth Roadmap Progress</Text>
          <View style={styles.progressBarContainer}>
            <Animated.View 
              style={[
                styles.progressBarFill,
                {
                  width: animatedProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]}
            />
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressCircleText}>{Math.round((dailyProgress || overallProgressValue || 0) * 100)}%</Text>
          </View>
        </View>

        {renderPhaseIndicator()}
        {renderNewLongTermGoals()}
        {renderAICoachGoals()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.xl,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  scrollContainer: {
    paddingHorizontal: SPACING.md,
  },
  scrollContentContainer: {
    paddingBottom: SPACING.lg,
  },
  infoText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: SPACING.md,
    fontSize: FONT.size.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingTop: SPACING.sm,
  },
  streakContainer: {
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.orange,
    ...SHADOWS.small,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    color: COLORS.textOnColor,
    fontWeight: FONT.weight.semiBold,
    fontSize: FONT.size.sm,
    marginLeft: SPACING.xxs,
  },
  moodButton: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  moodContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  moodIcon: {
    marginRight: SPACING.xs,
  },
  moodLabel: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.semiBold,
    color: COLORS.text,
  },
  overallProgress: {
    position: 'relative',
    marginVertical: SPACING.lg,
  },
  progressTitle: {
    color: COLORS.textHeader || COLORS.text,
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    marginBottom: SPACING.sm,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.mediumGray,
    borderRadius: 4,
    marginTop: SPACING.md,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  progressCircle: {
    position: 'absolute',
    right: 0,
    top: '20%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  progressCircleText: {
    color: COLORS.primary,
    fontWeight: FONT.weight.bold,
    fontSize: FONT.size.xs,
  },
  phaseContainer: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginVertical: SPACING.xs,
    ...SHADOWS.small,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phaseTitle: {
    color: COLORS.text,
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semiBold,
    marginLeft: SPACING.sm,
  },
  phaseDetails: {
    marginTop: SPACING.xs,
  },
  phaseDescription: {
    color: COLORS.textSecondary,
    fontSize: FONT.size.xs,
    lineHeight: FONT.size.xs * 1.4,
  },
  nextMilestone: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: SPACING.xs,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.xs,
  },
  milestoneText: {
    color: COLORS.text,
    fontSize: FONT.size.xs,
    marginLeft: SPACING.xs,
  },
  ltaContainer: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginVertical: SPACING.xs,
    ...SHADOWS.small,
  },
  ltaHeaderTouchable: {
    borderRadius: RADIUS.md,
  },
  ltaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  ltaTitle: {
    color: COLORS.textHeader,
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.semiBold,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  ltaProgress: {
    height: 4,
    borderRadius: 2,
    marginVertical: SPACING.xs,
    backgroundColor: COLORS.mediumGray,
  },
  ltaDetails: {
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.sm,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xxs,
    paddingVertical: SPACING.xxs,
  },
  goalCheckbox: {
    padding: SPACING.xxs,
    marginRight: SPACING.xs,
  },
  goalText: {
    color: COLORS.text,
    fontSize: FONT.size.xs,
    marginLeft: SPACING.xs,
    flex: 1,
    lineHeight: FONT.size.xs * 1.4,
  },
  completedGoalText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
    color: COLORS.textSecondary,
  },
  removeGoalButton: {
    margin: 0,
    padding: 2,
  },
  addGoalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.backgroundInput,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
  },
  goalInput: {
    flex: 1,
    paddingVertical: SPACING.xs,
    color: COLORS.textInput,
    fontSize: FONT.size.xs,
  },
  emptyGoalsText: {
    color: COLORS.textSecondary,
    fontSize: FONT.size.xs,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: SPACING.xs,
    paddingBottom: SPACING.xs,
  },
  aiCoachContainer: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginVertical: SPACING.xs,
    ...SHADOWS.small,
  },
  aiCoachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  aiCoachTitle: {
    color: COLORS.textHeader,
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.semiBold,
    marginLeft: SPACING.sm,
  },
  aiCoachDescription: {
    color: COLORS.textSecondary,
    fontSize: FONT.size.xs,
    lineHeight: FONT.size.xs * 1.4,
  },
  aiCoachBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xxs,
    marginLeft: SPACING.xs,
    color: COLORS.textOnColor,
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.semiBold,
  },
  goalDescription: {
    color: COLORS.textSecondary,
    fontSize: FONT.size.xs,
    lineHeight: FONT.size.xs * 1.4,
    marginBottom: SPACING.sm,
  },
  emptyGoalsSection: {
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.sm,
  },
});

export default GrowthRoadmap; 