import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, ScrollView, TextInput } from 'react-native';
import { Text, TouchableRipple, ProgressBar, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';
import { createWeeklyGoal, updateWeeklyGoal, deleteWeeklyGoal } from '../../../../api/exercises';
import { supabase } from '../../../../config/supabase';

// Debug logger for tracking component lifecycle and user interactions
const debug = {
  log: (message) => {
    console.log(`[ProgressSection] ${message}`);
  }
};

const GrowthRoadmap = ({ 
  dailyProgress, 
  streak, 
  currentMood, 
  onMoodPress,
  MOODS,
  // New props for roadmap features
  currentPhase,
  focusAreas = [],
  weeklyGoals = [],
  nextMilestone,
  overallProgress,
  onUpdate
}) => {
  const [animatedProgress] = React.useState(new Animated.Value(0));
  const [expandedSection, setExpandedSection] = useState(null);
  const [newGoalText, setNewGoalText] = useState('');
  const [localWeeklyGoals, setLocalWeeklyGoals] = useState(weeklyGoals || []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    debug.log('Animating progress bar');
    Animated.timing(animatedProgress, {
      toValue: dailyProgress || 0,
      duration: 1000,
      useNativeDriver: false
    }).start();
  }, [dailyProgress]);

  // Initialize local goals when props change
  useEffect(() => {
    if (weeklyGoals) {
      setLocalWeeklyGoals(weeklyGoals);
    }
  }, [weeklyGoals]);

  const toggleSection = (section) => {
    debug.log(`Toggling section: ${section}`);
    setExpandedSection(expandedSection === section ? null : section);
  };

  const addWeeklyGoal = async () => {
    if (newGoalText.trim() === '') return;
    
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Create goal in database
      const newGoal = await createWeeklyGoal(user.id, newGoalText);
      
      // Update local state
      setLocalWeeklyGoals(prev => [...prev, newGoal]);
      setNewGoalText('');
      
      // Expand the goals section when adding a new goal
      if (expandedSection !== 'goals') {
        setExpandedSection('goals');
      }
      
      debug.log(`Added new weekly goal: ${newGoalText}`);
    } catch (error) {
      console.error('Failed to add weekly goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGoalCompletion = async (goalId, isCompleted) => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Update goal in database
      await updateWeeklyGoal(user.id, goalId, { completed: !isCompleted });
      
      // Update local state
      setLocalWeeklyGoals(prev => 
        prev.map(goal => 
          goal.id === goalId 
            ? { ...goal, completed: !goal.completed } 
            : goal
        )
      );
      
      debug.log(`Toggled completion for goal: ${goalId}`);
    } catch (error) {
      console.error('Failed to toggle goal completion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeGoal = async (goalId) => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Delete goal from database
      await deleteWeeklyGoal(user.id, goalId);
      
      // Update local state
      setLocalWeeklyGoals(prev => prev.filter(goal => goal.id !== goalId));
      
      debug.log(`Removed goal: ${goalId}`);
    } catch (error) {
      console.error('Failed to remove goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPhaseIndicator = () => (
    <TouchableRipple 
      onPress={() => toggleSection('phase')}
      style={styles.phaseContainer}
    >
      <View>
        <View style={styles.phaseHeader}>
          <MaterialCommunityIcons name="map-marker-path" size={24} color={COLORS.text} />
          <Text style={styles.phaseTitle}>Current Phase: {currentPhase?.name || 'Getting Started'}</Text>
        </View>
        {expandedSection === 'phase' && (
          <View style={styles.phaseDetails}>
            <Text style={styles.phaseDescription}>{currentPhase?.description}</Text>
            <View style={styles.nextMilestone}>
              <MaterialCommunityIcons name="flag" size={16} color={COLORS.text} />
              <Text style={styles.milestoneText}>Next: {nextMilestone}</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableRipple>
  );

  const renderFocusAreas = () => (
    <TouchableRipple 
      onPress={() => toggleSection('focus')}
      style={styles.focusContainer}
    >
      <View>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="target" size={20} color={COLORS.text} />
          <Text style={styles.sectionTitle}>Focus Areas</Text>
        </View>
        {expandedSection === 'focus' && (
          <View style={styles.focusGrid}>
            {focusAreas.map((area, index) => (
              <View key={index} style={styles.focusArea}>
                <Text style={styles.focusLabel}>{area.name}</Text>
                <ProgressBar 
                  progress={area.progress} 
                  color={COLORS.primary}
                  style={styles.focusProgress} 
                />
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableRipple>
  );

  const renderWeeklyGoals = () => (
    <TouchableRipple 
      onPress={() => toggleSection('goals')}
      style={styles.goalsContainer}
    >
      <View>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={20} color={COLORS.text} />
          <Text style={styles.sectionTitle}>Weekly Goals</Text>
        </View>
        {expandedSection === 'goals' && (
          <View style={styles.goalsList}>
            {/* Input for adding new goals */}
            <View style={styles.addGoalContainer}>
              <TextInput
                style={styles.goalInput}
                value={newGoalText}
                onChangeText={setNewGoalText}
                placeholder="Add a new weekly goal..."
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
                editable={!isLoading}
              />
              <IconButton
                icon="plus-circle"
                size={24}
                color={COLORS.primary}
                onPress={addWeeklyGoal}
                disabled={!newGoalText.trim() || isLoading}
              />
            </View>
            
            {/* List of goals */}
            {localWeeklyGoals.map((goal) => (
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
                <Text 
                  style={[
                    styles.goalText, 
                    goal.completed && styles.completedGoalText
                  ]}
                >
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
            
            {localWeeklyGoals.length === 0 && (
              <Text style={styles.emptyGoalsText}>
                No weekly goals yet. Add some above!
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableRipple>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.headerContent}>
          <TouchableRipple style={styles.streakContainer}>
            <View style={styles.streakBadge}>
              <MaterialCommunityIcons name="fire" size={20} color={COLORS.accent} />
              <Text style={styles.streakText}>{streak} day streak</Text>
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
              <Text style={styles.moodEmoji}>
                {currentMood ? MOODS.find(m => m.id === currentMood)?.icon || '😊' : '😶'}
              </Text>
              <Text style={styles.moodLabel}>
                {currentMood ? MOODS.find(m => m.id === currentMood)?.label : 'Add Mood'}
              </Text>
            </View>
          </TouchableRipple>
        </View>

        <View style={styles.overallProgress}>
          <Text style={styles.progressTitle}>Your Growth Roadmap</Text>
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
            <Text style={styles.progressCircleText}>{Math.round((overallProgress || 0) * 100)}%</Text>
          </View>
        </View>

        {renderPhaseIndicator()}
        {renderFocusAreas()}
        {renderWeeklyGoals()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5', // Light gray background matching DashboardHeader
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  scrollContainer: {
    maxHeight: 500,
    padding: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  streakContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: RADIUS.md,
    padding: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    color: COLORS.text,
    fontWeight: FONT.weight.medium,
    fontSize: FONT.size.sm,
    marginLeft: 4,
  },
  moodButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: RADIUS.md,
    padding: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  moodContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  moodEmoji: {
    fontSize: 22,
    marginRight: SPACING.xs,
  },
  moodLabel: {
    color: COLORS.text,
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
  },
  overallProgress: {
    position: 'relative',
    marginVertical: SPACING.md,
  },
  progressTitle: {
    color: COLORS.text,
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semiBold,
    marginBottom: SPACING.xs,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    marginRight: 46,
    marginTop: SPACING.md,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  progressCircle: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleText: {
    color: COLORS.text,
    fontWeight: FONT.weight.bold,
    fontSize: FONT.size.xs,
  },
  phaseContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
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
    marginTop: SPACING.sm,
  },
  phaseDescription: {
    color: COLORS.text,
    fontSize: FONT.size.sm,
    marginBottom: SPACING.sm,
  },
  nextMilestone: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  milestoneText: {
    color: COLORS.text,
    fontSize: FONT.size.sm,
    marginLeft: SPACING.xs,
  },
  focusContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semiBold,
    marginLeft: SPACING.sm,
  },
  focusGrid: {
    marginTop: SPACING.sm,
  },
  focusArea: {
    marginVertical: SPACING.xs,
  },
  focusLabel: {
    color: COLORS.text,
    fontSize: FONT.size.sm,
    marginBottom: SPACING.xxs,
  },
  focusProgress: {
    height: 4,
    borderRadius: 2,
  },
  goalsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  goalsList: {
    marginTop: SPACING.sm,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  goalCheckbox: {
    padding: SPACING.xxs,
  },
  goalText: {
    color: COLORS.text,
    fontSize: FONT.size.sm,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  completedGoalText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  addGoalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.xs,
  },
  goalInput: {
    flex: 1,
    height: 40,
    color: COLORS.text,
    fontSize: FONT.size.sm,
  },
  removeGoalButton: {
    margin: 0,
    padding: 0,
  },
  emptyGoalsText: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: SPACING.sm,
  }
});

export default GrowthRoadmap; 