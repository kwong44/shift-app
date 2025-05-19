import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { COLORS, SPACING, RADIUS } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';
import { createWeeklyGoal } from '../../../../api/exercises/goals';
import { supabase } from '../../../../config/supabase';

/**
 * Component to display AI message with goal action buttons
 */
const GoalActionMessage = ({ message, goals, onGoalAdded }) => {
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalText, setGoalText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle adding a goal
   */
  const handleAddGoal = async () => {
    if (!goalText.trim()) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Create the goal
      await createWeeklyGoal(user.id, goalText.trim());
      
      // Success feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Goal Added',
        'Your goal has been added successfully!',
        [{ text: 'OK' }]
      );
      
      // Reset state
      setGoalText('');
      setIsAddingGoal(false);
      
      // Notify parent
      if (onGoalAdded) {
        onGoalAdded();
      }
    } catch (error) {
      console.error('[GoalActionMessage] Error adding goal:', error);
      
      // Error feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      Alert.alert(
        'Error',
        'Failed to add goal. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
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
   * Render add goal section
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
        <TextInput
          mode="outlined"
          label="Your goal"
          value={goalText}
          onChangeText={setGoalText}
          style={styles.goalInput}
          placeholder="E.g., Run 5 miles every week"
          multiline
        />
        <View style={styles.actionButtons}>
          <Button 
            mode="outlined" 
            onPress={() => setIsAddingGoal(false)} 
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
            disabled={!goalText.trim() || isLoading}
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
});

export default GoalActionMessage; 