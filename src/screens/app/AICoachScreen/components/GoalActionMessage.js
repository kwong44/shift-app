import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, TextInput, Menu, Divider } from 'react-native-paper';
import { COLORS, SPACING, RADIUS } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';
import { createSimpleWeeklyGoal, createWeeklyGoalForLongTermGoal } from '../../../../api/exercises/goals';
import { getLongTermGoals, createAICoachLongTermGoal } from '../../../../api/longTermGoals';
import { supabase } from '../../../../config/supabase';

/**
 * Component to display AI message with goal action buttons
 */
const GoalActionMessage = ({ message, goals, onGoalAdded }) => {
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalText, setGoalText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [longTermGoals, setLongTermGoals] = useState([]);
  const [selectedLongTermGoal, setSelectedLongTermGoal] = useState(null);
  const [showGoalMenu, setShowGoalMenu] = useState(false);
  const [newLongTermGoalTitle, setNewLongTermGoalTitle] = useState('');
  const [isCreatingNewLongTermGoal, setIsCreatingNewLongTermGoal] = useState(false);

  useEffect(() => {
    const fetchLongTermGoals = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const goals = await getLongTermGoals(user.id);
          setLongTermGoals(goals);
        }
      } catch (error) {
        console.error('[GoalActionMessage] Error fetching long-term goals:', error);
      }
    };

    fetchLongTermGoals();
  }, []);

  /**
   * Handle adding a goal - NEW ENHANCED VERSION
   */
  const handleAddGoal = async () => {
    if (!goalText.trim()) {
      console.debug('[GoalActionMessage] No goal text entered, returning early');
      return;
    }
    
    console.debug('[GoalActionMessage] Starting enhanced goal creation process', {
      goalText: goalText.trim(),
      selectedLongTermGoal: selectedLongTermGoal?.id,
      isCreatingNewLongTermGoal,
      newLongTermGoalTitle: newLongTermGoalTitle.trim()
    });
    
    setIsLoading(true);
    try {
      // Get user ID
      console.debug('[GoalActionMessage] Getting user from Supabase auth');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('[GoalActionMessage] User not authenticated');
        throw new Error('User not authenticated');
      }
      
      let targetLongTermGoalId = selectedLongTermGoal?.id;
      
      // Create new long-term goal if needed
      if (isCreatingNewLongTermGoal && newLongTermGoalTitle.trim()) {
        console.debug('[GoalActionMessage] Creating new long-term goal from AI Coach suggestion');
        const newLongTermGoal = await createAICoachLongTermGoal(
          user.id, 
          newLongTermGoalTitle.trim(),
          'ai_suggested' // Category for AI-suggested goals
        );
        targetLongTermGoalId = newLongTermGoal.id;
        
        // Update the local list
        setLongTermGoals(prev => [...prev, newLongTermGoal]);
        console.debug('[GoalActionMessage] New long-term goal created:', newLongTermGoal.id);
      }
      
      let createdGoal;
      
      if (targetLongTermGoalId) {
        // Create weekly goal linked to long-term goal (NEW SYSTEM)
        console.debug('[GoalActionMessage] Creating weekly goal linked to long-term goal:', targetLongTermGoalId);
        createdGoal = await createWeeklyGoalForLongTermGoal(user.id, targetLongTermGoalId, goalText.trim());
      } else {
        // Create standalone weekly goal (OLD SYSTEM for backwards compatibility)
        console.debug('[GoalActionMessage] Creating standalone weekly goal (no long-term goal selected)');
        createdGoal = await createSimpleWeeklyGoal(user.id, goalText.trim());
      }
      
      console.debug('[GoalActionMessage] Goal created successfully', {
        goalId: createdGoal.id,
        createdAt: createdGoal.created_at,
        longTermGoalId: createdGoal.long_term_goal_id,
        isLinked: !!createdGoal.long_term_goal_id
      });
      
      // Success feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Goal Added Successfully!',
        targetLongTermGoalId 
          ? `Your weekly goal "${goalText.trim()}" has been linked to your long-term goal "${selectedLongTermGoal?.title || newLongTermGoalTitle}".`
          : `Your weekly goal "${goalText.trim()}" has been added.`,
        [{ text: 'OK' }]
      );
      
      // Reset state
      setGoalText('');
      setSelectedLongTermGoal(null);
      setNewLongTermGoalTitle('');
      setIsCreatingNewLongTermGoal(false);
      setIsAddingGoal(false);
      
      // Notify parent to refresh goals
      if (onGoalAdded) {
        console.debug('[GoalActionMessage] Notifying parent component of goal addition');
        onGoalAdded();
      }
    } catch (error) {
      console.error('[GoalActionMessage] Error adding goal:', error);
      console.error('[GoalActionMessage] Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Error feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      Alert.alert(
        'Error',
        'Failed to add goal. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      console.debug('[GoalActionMessage] Goal creation process completed, setting loading to false');
      setIsLoading(false);
    }
  };

  /**
   * Show the add goal interface
   */
  const showAddGoal = () => {
    setIsAddingGoal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  /**
   * Render goals section if there are goals
   */
  const renderGoalsSection = () => {
    if (!goals || goals.length === 0) return null;
    
    return (
      <View style={styles.goalsSection}>
        <Text style={styles.goalsSectionTitle}>Your Weekly Goals:</Text>
        {goals.map((goal, index) => (
          <View key={goal.id || index} style={styles.goalItem}>
            <Text style={styles.goalText}>• {goal.text}</Text>
          </View>
        ))}
      </View>
    );
  };

  /**
   * Render add goal section - ENHANCED VERSION
   */
  const renderAddGoalSection = () => {
    if (!isAddingGoal) {
      return (
        <TouchableOpacity style={styles.addGoalPrompt} onPress={showAddGoal}>
          <Text style={styles.addGoalPromptText}>
            + Add a goal that I can help you with
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.addGoalSection}>
        {/* Weekly Goal Text Input */}
        <TextInput
          mode="outlined"
          label="Your weekly goal"
          value={goalText}
          onChangeText={setGoalText}
          style={styles.goalInput}
          placeholder="E.g., Run 5 miles this week"
          multiline
        />
        
        {/* Long-term Goal Selection */}
        <View style={styles.longTermGoalSection}>
          <Text style={styles.sectionLabel}>Link to a Long-term Goal (Optional)</Text>
          
          {longTermGoals.length > 0 && (
            <Menu
              visible={showGoalMenu}
              onDismiss={() => setShowGoalMenu(false)}
              anchor={
                <TouchableOpacity 
                  style={styles.goalMenuButton} 
                  onPress={() => setShowGoalMenu(true)}
                  disabled={isLoading}
                >
                  <Text style={styles.goalMenuText}>
                    {selectedLongTermGoal ? selectedLongTermGoal.title : 'Select existing goal...'}
                  </Text>
                </TouchableOpacity>
              }
            >
              <Menu.Item
                onPress={() => {
                  setSelectedLongTermGoal(null);
                  setIsCreatingNewLongTermGoal(false);
                  setShowGoalMenu(false);
                }}
                title="No long-term goal (standalone)"
              />
              <Divider />
              {longTermGoals.map((goal) => (
                <Menu.Item
                  key={goal.id}
                  onPress={() => {
                    setSelectedLongTermGoal(goal);
                    setIsCreatingNewLongTermGoal(false);
                    setShowGoalMenu(false);
                  }}
                  title={goal.title}
                />
              ))}
              <Divider />
              <Menu.Item
                onPress={() => {
                  setSelectedLongTermGoal(null);
                  setIsCreatingNewLongTermGoal(true);
                  setShowGoalMenu(false);
                }}
                title="+ Create new long-term goal"
              />
            </Menu>
          )}
          
          {/* Create New Long-term Goal Input */}
          {isCreatingNewLongTermGoal && (
            <TextInput
              mode="outlined"
              label="New long-term goal title"
              value={newLongTermGoalTitle}
              onChangeText={setNewLongTermGoalTitle}
              style={[styles.goalInput, styles.newGoalInput]}
              placeholder="E.g., Improve physical fitness"
            />
          )}
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button 
            mode="outlined" 
            onPress={() => {
              setIsAddingGoal(false);
              setSelectedLongTermGoal(null);
              setNewLongTermGoalTitle('');
              setIsCreatingNewLongTermGoal(false);
            }} 
            style={styles.cancelButton}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            mode="contained" 
            onPress={handleAddGoal} 
            style={styles.addButton}
            loading={isLoading}
            disabled={!goalText.trim() || isLoading || (isCreatingNewLongTermGoal && !newLongTermGoalTitle.trim())}
          >
            Add Goal
          </Button>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.messageText}>{message}</Text>
      
      {renderGoalsSection()}
      {renderAddGoalSection()}
      
      <Text style={styles.tokenUsageText}>
        {/* Token usage info can be added here if needed */}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    padding: SPACING.sm,
    marginVertical: SPACING.xs,
    borderRadius: RADIUS.lg,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.background,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.text,
    fontWeight: '500',
  },
  goalsSection: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.md,
  },
  goalsSectionTitle: {
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  goalItem: {
    marginVertical: SPACING.xs / 2,
  },
  goalText: {
    color: COLORS.text,
  },
  addGoalPrompt: {
    marginTop: SPACING.md,
    padding: SPACING.xs,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
  },
  addGoalPromptText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  addGoalSection: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  goalInput: {
    backgroundColor: COLORS.surface,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.sm,
  },
  cancelButton: {
    marginRight: SPACING.sm,
  },
  addButton: {
    backgroundColor: COLORS.accent,
  },
  tokenUsageText: {
    fontSize: 10,
    color: COLORS.textLight,
    alignSelf: 'flex-end',
    marginTop: SPACING.xs,
  },
  longTermGoalSection: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.md,
  },
  sectionLabel: {
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  goalMenuButton: {
    padding: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
  },
  goalMenuText: {
    color: COLORS.text,
  },
  newGoalInput: {
    marginTop: SPACING.md,
  },
});

export default GoalActionMessage; 