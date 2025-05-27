import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, ScrollView, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Text, TouchableRipple, ProgressBar, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../../config/theme';
import { createWeeklyGoal, updateWeeklyGoal, deleteWeeklyGoal } from '../../../../api/exercises';
import { supabase } from '../../../../config/supabase';

// Debug logger for tracking component lifecycle and user interactions
const debug = {
  log: (message) => {
    console.log(`[GrowthRoadmap] ${message}`);
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
  roadmap, // New prop: the user's roadmap object from Supabase (contains LTAs, current phase)
  allUserWeeklyGoals = [], // New prop: all weekly goals for the user
  onUpdateRoadmapData, // New prop: callback to notify parent of data changes (e.g., after adding/updating WG)
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
  }, [roadmap, allUserWeeklyGoals]);

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

  const addWeeklyGoal = async (ltaId) => {
    const goalText = newGoalTexts[ltaId]?.trim();
    if (!goalText || !roadmap || !roadmap.id) {
      debug.log('Cannot add weekly goal: missing text, roadmap, or roadmap ID.');
      return;
    }
    
    try {
      setIsLoading(true);
      debug.log(`Attempting to add weekly goal "${goalText}" for LTA ${ltaId} in roadmap ${roadmap.id}`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated for adding weekly goal');
      
      await createWeeklyGoal(user.id, roadmap.id, ltaId, goalText);
      
      setNewGoalTexts(prev => ({ ...prev, [ltaId]: '' }));
      
      debug.log(`Successfully added weekly goal for LTA: ${ltaId}. Triggering data refresh.`);
      if (onUpdateRoadmapData) onUpdateRoadmapData();

    } catch (error) {
      console.error('Failed to add weekly goal:', error);
    } finally {
      setIsLoading(false);
    }
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

  const renderLongTermAspirations = () => {
    if (!roadmap || !roadmap.goals || roadmap.goals.length === 0) {
      debug.log('No Long-Term Aspirations (LTAs) to render.');
      return <Text style={styles.infoText}>Define your aspirations during onboarding!</Text>;
    }

    return roadmap.goals.map((lta) => {
      const associatedWGs = allUserWeeklyGoals.filter(wg => wg.lta_id_ref === lta.id && wg.roadmap_id === roadmap.id);
      const completedWGs = associatedWGs.filter(wg => wg.completed).length;
      const ltaProgress = associatedWGs.length > 0 ? completedWGs / associatedWGs.length : 0;

      debug.log(`Rendering LTA: ${lta.id} (${lta.text}). Progress: ${ltaProgress}. WGs: ${associatedWGs.length}`);

      return (
        <View key={lta.id} style={styles.ltaContainer}>
          <TouchableRipple onPress={() => toggleLtaSection(lta.id)} style={styles.ltaHeaderTouchable}>
            <View style={styles.ltaHeader}>
              <MaterialCommunityIcons name="bullseye-arrow" size={20} color={COLORS.primary} />
              <Text style={styles.ltaTitle}>{lta.text}</Text>
              <MaterialCommunityIcons 
                name={expandedLtaId === lta.id ? "chevron-up" : "chevron-down"} 
                size={24} 
                color={COLORS.text} 
              />
            </View>
          </TouchableRipple>
          <ProgressBar progress={ltaProgress} color={COLORS.accent} style={styles.ltaProgress} />

          {expandedLtaId === lta.id && (
            <View style={styles.ltaDetails}>
              <View style={styles.addGoalContainer}>
                <TextInput
                  style={styles.goalInput}
                  value={newGoalTexts[lta.id] || ''}
                  onChangeText={(text) => handleNewGoalTextChange(lta.id, text)}
                  placeholder="Add a new weekly goal for this aspiration..."
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  editable={!isLoading}
                />
                <IconButton
                  icon="plus-circle"
                  size={24}
                  color={COLORS.primary}
                  onPress={() => addWeeklyGoal(lta.id)}
                  disabled={!(newGoalTexts[lta.id]?.trim()) || isLoading}
                />
              </View>
              
              {associatedWGs.length > 0 ? associatedWGs.map((goal) => (
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
                <Text style={styles.emptyGoalsText}>Break down this aspiration into weekly goals!</Text>
              )}
            </View>
          )}
        </View>
      );
    });
  };

  // Get the current emotion object
  const currentEmotionData = getCurrentEmotion();

  // Calculate overall progress for the main progress bar (example: based on LTAs)
  const overallProgressValue = roadmap?.goals?.length > 0 
    ? roadmap.goals.reduce((acc, lta) => {
        const associatedWGs = allUserWeeklyGoals.filter(wg => wg.lta_id_ref === lta.id && wg.roadmap_id === roadmap.id);
        const completedWGs = associatedWGs.filter(wg => wg.completed).length;
        return acc + (associatedWGs.length > 0 ? (completedWGs / associatedWGs.length) : 0);
      }, 0) / roadmap.goals.length
    : 0;
  
  debug.log(`Calculated overall progress value for top bar: ${overallProgressValue}`);

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
        {renderLongTermAspirations()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.xl,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  scrollContainer: {
    paddingHorizontal: SPACING.lg,
  },
  scrollContentContainer: {
    paddingBottom: SPACING.xxl, 
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
});

export default GrowthRoadmap; 