import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, ScrollView, TextInput, LayoutAnimation, Platform, UIManager, Alert } from 'react-native';
import { Text, TouchableRipple, ProgressBar, Button, IconButton, Dialog, Portal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../../config/theme';
import { updateWeeklyGoal, deleteWeeklyGoal } from '../../../../api/exercises';
import { createWeeklyGoalForLongTermGoal } from '../../../../api/exercises/goals';
import { deleteLongTermGoal, createLongTermGoal } from '../../../../api/longTermGoals';
import { supabase } from '../../../../config/supabase';
import * as Haptics from 'expo-haptics';
import CustomDialog from '../../../../components/common/CustomDialog';

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

  // State for new long-term goal creation - Rule: Always add debug logs and comments
  const [showAddLongTermGoal, setShowAddLongTermGoal] = useState(false);
  const [newLongTermGoalTitle, setNewLongTermGoalTitle] = useState('');
  
  // State for delete confirmation dialog
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);

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

  // Calculate true roadmap progress based on weekly goals completion
  const calculateRoadmapProgress = () => {
    let totalWeeklyGoals = 0;
    let completedWeeklyGoals = 0;

    // Count goals from new long-term goals system
    longTermGoals.forEach(ltg => {
      if (ltg.weekly_goals && ltg.weekly_goals.length > 0) {
        totalWeeklyGoals += ltg.weekly_goals.length;
        completedWeeklyGoals += ltg.weekly_goals.filter(wg => wg.completed).length;
      }
    });

    // Count standalone/AI Coach goals (not linked to long-term goals)
    const standaloneGoals = allUserWeeklyGoals.filter(wg => !wg.long_term_goal_id);
    totalWeeklyGoals += standaloneGoals.length;
    completedWeeklyGoals += standaloneGoals.filter(wg => wg.completed).length;

    const progress = totalWeeklyGoals > 0 ? completedWeeklyGoals / totalWeeklyGoals : 0;
    debug.log(`Calculated TRUE roadmap progress: ${completedWeeklyGoals}/${totalWeeklyGoals} = ${progress} (${Math.round(progress * 100)}%)`);
    
    return progress;
  };

  const roadmapProgress = calculateRoadmapProgress();

  useEffect(() => {
    // Use actual roadmap progress instead of daily task progress
    debug.log(`Animating roadmap progress bar to: ${roadmapProgress}`);
    Animated.timing(animatedProgress, {
      toValue: roadmapProgress,
      duration: 1000,
      useNativeDriver: false
    }).start();
  }, [roadmapProgress, allUserWeeklyGoals, longTermGoals]);

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
    if (!roadmap || !roadmap.current_phase || !roadmap.phases || roadmap.phases.length === 0) {
      debug.log('No roadmap, current_phase, or phases array to render phase indicator.');
      return <Text style={styles.infoText}>Loading roadmap phase...</Text>;
    }

    const currentPhaseNumber = roadmap.current_phase;
    const currentPhaseData = roadmap.phases.find(p => p.number === currentPhaseNumber);

    if (!currentPhaseData) {
      debug.error(`Could not find phase data for phase number: ${currentPhaseNumber}`);
      return <Text style={styles.infoText}>Error loading current phase details.</Text>;
    }

    // Find next phase for advancement summary, if not the last phase
    let nextPhaseAdvancementSummary = currentPhaseData.advancement_summary || "You are in the latest phase!";
    if (currentPhaseNumber < roadmap.phases.length) {
        const nextPhaseData = roadmap.phases.find(p => p.number === currentPhaseNumber + 1);
        if (nextPhaseData && nextPhaseData.advancement_summary) {
            // This is a bit redundant if currentPhaseData.advancement_summary is already forward-looking
            // But good if we want to explicitly state "To reach Phase X..."
            // For now, assuming currentPhaseData.advancement_summary IS the text for how to get to next phase.
        } else if (nextPhaseData) {
            // If next phase exists but has no summary, use a generic message for it.
            nextPhaseAdvancementSummary = `Continue consistent effort to progress beyond ${currentPhaseData.name}.`;
        } 
        // If currentPhaseData.advancement_summary is already set, it will be used.
    } else {
        nextPhaseAdvancementSummary = currentPhaseData.advancement_summary || "You've reached the pinnacle of your current roadmap! Continue practicing consistently.";
    }


    const pendingMilestones = roadmap.milestones?.filter(m => m.status === 'pending');
    const nextConcreteMilestone = pendingMilestones?.length > 0 ? pendingMilestones[0].description : 'Continue making progress on your goals!';

    return (
    <View style={styles.phaseContainer}>
      <View style={styles.phaseHeader}>
        <MaterialCommunityIcons name="map-marker-path" size={24} color={COLORS.text} />
        <Text style={styles.phaseTitle}>Current Phase: {currentPhaseData.name || 'Unnamed Phase'}</Text>
      </View>
      <View style={styles.phaseDetails}>
        <Text style={styles.phaseDescription}>{currentPhaseData.description || 'No description available.'}</Text>
        
        <View style={styles.nextMilestone}> 
          <MaterialCommunityIcons name="stairs-up" size={16} color={COLORS.accentBlue} />
          <Text style={styles.milestoneText}>{nextPhaseAdvancementSummary}</Text>
        </View>

        {/* We can re-introduce concrete milestones if they are added back to roadmap structure */}
        {/* <View style={styles.nextMilestone}> 
          <MaterialCommunityIcons name="flag" size={16} color={COLORS.text} />
          <Text style={styles.milestoneText}>Next Concrete Step: {nextConcreteMilestone}</Text>
        </View> */}
      </View>
    </View>
    );
  };

  const renderNewLongTermGoals = () => {
    debug.log(`Rendering long-term goals section. Count: ${longTermGoals?.length || 0}`);

    return (
      <View>
        {/* Add New Long-Term Goal Section - Rule: Always add debug logs and comments */}
        <View style={styles.addLongTermGoalContainer}>
          {!showAddLongTermGoal ? (
            <TouchableRipple
              onPress={() => {
                debug.log('Opening add new long-term goal form');
                setShowAddLongTermGoal(true);
              }}
              style={styles.addLongTermGoalButton}
              disabled={isLoading}
            >
              <View style={styles.addLongTermGoalButtonContent}>
                <MaterialCommunityIcons 
                  name="plus-circle-outline" 
                  size={24} 
                  color={COLORS.primary} 
                />
                <Text style={styles.addLongTermGoalButtonText}>Add New Long-Term Goal</Text>
              </View>
            </TouchableRipple>
          ) : (
            <View style={styles.addLongTermGoalForm}>
              <Text style={styles.addLongTermGoalFormTitle}>Create New Long-Term Goal</Text>
              
              <TextInput
                style={styles.longTermGoalInput}
                value={newLongTermGoalTitle}
                onChangeText={setNewLongTermGoalTitle}
                placeholder="What do you want to achieve long-term?"
                placeholderTextColor={COLORS.textSecondary}
                editable={!isLoading}
                multiline={false}
              />
              
              <View style={styles.addLongTermGoalFormButtons}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    debug.log('Canceling add new long-term goal');
                    setShowAddLongTermGoal(false);
                    setNewLongTermGoalTitle('');
                  }}
                  disabled={isLoading}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleCreateLongTermGoal}
                  disabled={!newLongTermGoalTitle.trim() || isLoading}
                  loading={isLoading}
                  style={styles.createButton}
                >
                  Create Goal
                </Button>
              </View>
            </View>
          )}
        </View>

        {/* Existing Long-Term Goals */}
        {(!longTermGoals || longTermGoals.length === 0) ? (
          <View style={styles.emptyGoalsSection}>
            <Text style={styles.infoText}>
              {showAddLongTermGoal 
                ? "Create your first long-term goal above to start tracking progress!"
                : "Create long-term goals to track your progress!"
              }
            </Text>
          </View>
        ) : (
          longTermGoals.map((longTermGoal) => {
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
                    
                    {/* Delete button for long-term goal - Rule: Always add debug logs and comments */}
                    <IconButton
                      icon="delete-outline"
                      size={20}
                      color={COLORS.textSecondary}
                      onPress={() => confirmDeleteLongTermGoal(longTermGoal)}
                      style={styles.deleteLongTermGoalButton}
                      disabled={isLoading}
                    />
                    
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
          })
        )}
      </View>
    );
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
          These are goals not linked to specific long-term goals
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

  /**
   * Create a new long-term goal from the roadmap interface
   * Rule: Always add debug logs and comments for tracking user actions
   */
  const handleCreateLongTermGoal = async () => {
    const title = newLongTermGoalTitle.trim();
    
    if (!title) {
      debug.log('Cannot create long-term goal: title is required');
      Alert.alert('Title Required', 'Please enter a title for your long-term goal.');
      return;
    }

    setIsLoading(true);
    try {
      debug.log(`Creating new long-term goal: "${title}"`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated for creating goal');

      // Create the long-term goal using the API - FIXED: Use valid source value
      const goalData = {
        title,
        // Removed description field per user request - it was causing constraint violation
        category: 'user_created', // Category for goals created from roadmap
        priority: 5, // Medium priority for user-created goals
        source: 'user', // FIXED: Use valid constraint value instead of 'roadmap_interface'
        target_date: null // User can set this later
      };

      const createdGoal = await createLongTermGoal(user.id, goalData);
      debug.log('Long-term goal created successfully:', createdGoal.id);

      // Clear the form
      setNewLongTermGoalTitle('');
      setShowAddLongTermGoal(false);

      // Notify parent to refresh data
      if (onUpdateRoadmapData) {
        await onUpdateRoadmapData();
      }

      // Success feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Goal Created!', 
        `Your long-term goal "${title}" has been created successfully.`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      debug.error('Error creating long-term goal:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Creation Failed', 
        `Failed to create goal: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Show confirmation dialog before deleting a long-term goal
   * Rule: Always confirm destructive actions with users
   */
  const confirmDeleteLongTermGoal = (longTermGoal) => {
    debug.log(`Showing delete confirmation for long-term goal: ${longTermGoal.id} (${longTermGoal.title})`);
    setGoalToDelete(longTermGoal);
    setDeleteDialogVisible(true);
  };

  /**
   * Delete a long-term goal after user confirmation
   * This will also delete all associated weekly goals via cascade
   */
  const handleDeleteLongTermGoal = async () => {
    if (!goalToDelete) {
      debug.error('No goal selected for deletion');
      return;
    }

    setIsLoading(true);
    try {
      debug.log(`Deleting long-term goal: ${goalToDelete.id} (${goalToDelete.title})`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated for deleting goal');

      // Delete the long-term goal using the API
      await deleteLongTermGoal(user.id, goalToDelete.id);
      debug.log('Long-term goal deleted successfully');

      // Close dialog and clear state
      setDeleteDialogVisible(false);
      setGoalToDelete(null);

      // Notify parent to refresh data
      if (onUpdateRoadmapData) {
        await onUpdateRoadmapData();
      }

      // Success feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Goal Deleted', 
        `"${goalToDelete.title}" and all its weekly goals have been removed.`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      debug.error('Error deleting long-term goal:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Deletion Failed', 
        `Failed to delete goal: ${error.message}`,
        [{ text: 'OK' }]
      );
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
            <Text style={styles.progressCircleText}>{Math.round(roadmapProgress * 100)}%</Text>
          </View>
        </View>

        {renderPhaseIndicator()}
        {renderNewLongTermGoals()}
        {renderAICoachGoals()}
      </ScrollView>

      {/* Delete Confirmation Dialog - Rule: Always add debug logs and comments */}
      <Portal>
        <CustomDialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
          title="Delete Long-Term Goal?"
          content={`Are you sure you want to delete "${goalToDelete?.title}"? This will also remove all associated weekly goals. This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteLongTermGoal}
          onCancel={() => setDeleteDialogVisible(false)}
          confirmMode="contained"
          icon="delete-alert"
          iconColor={COLORS.error}
          showIcon={true}
        />
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundLight,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  scrollContainer: {
    paddingHorizontal: SPACING.lg,
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
    backgroundColor: COLORS.backgroundLight,
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
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.xs,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.xs,
  },
  milestoneText: {
    color: COLORS.textLight,
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
    backgroundColor: COLORS.primary,
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
  deleteLongTermGoalButton: {
    margin: 0,
    padding: 2,
  },
  addLongTermGoalContainer: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  addLongTermGoalButton: {
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  addLongTermGoalButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addLongTermGoalButtonText: {
    color: COLORS.primary,
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.semiBold,
    marginLeft: SPACING.sm,
  },
  addLongTermGoalForm: {
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  addLongTermGoalFormTitle: {
    color: COLORS.textHeader,
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    marginBottom: SPACING.sm,
  },
  longTermGoalInput: {
    padding: SPACING.xs,
    color: COLORS.textInput,
    fontSize: FONT.size.xs,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.backgroundInput,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addLongTermGoalFormButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xs,
  },
  createButton: {
    padding: SPACING.xs,
  },
});

export default GrowthRoadmap; 