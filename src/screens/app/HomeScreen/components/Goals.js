import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Card, Title, Text, IconButton, Chip, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';
import CircularProgress from '../../../../components/common/CircularProgress';
import GoalDetails from './GoalDetails';
import * as Haptics from 'expo-haptics';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'personal', label: 'Personal' },
  { id: 'professional', label: 'Professional' },
  { id: 'health', label: 'Health' },
  { id: 'tasks', label: 'Daily Tasks' },
];

const Goals = ({ goals = [], onViewAll, onUpdateGoal }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  console.debug('Goals component rendered with', goals.length, 'goals');

  // Calculate progress stats
  const stats = useCallback(() => {
    const activeGoals = goals.filter(goal => goal.status !== 'completed').length;
    const completedGoals = goals.filter(goal => goal.status === 'completed').length;
    const overallProgress = goals.length > 0 
      ? (completedGoals / goals.length) * 100 
      : 0;
    
    return { activeGoals, completedGoals, overallProgress };
  }, [goals]);

  const { activeGoals, completedGoals, overallProgress } = stats();

  // Filter goals based on selected category
  const filteredGoals = goals.filter(goal => 
    selectedCategory === 'all' || goal.category === selectedCategory
  );

  const handleCategoryPress = async (categoryId) => {
    await Haptics.selectionAsync();
    setSelectedCategory(categoryId);
    console.debug('Category selected:', categoryId);
  };

  const handleFilterPress = async () => {
    await Haptics.selectionAsync();
    console.debug('Filter pressed - Advanced filtering to be implemented');
  };

  const handleGoalPress = async (goal) => {
    await Haptics.selectionAsync();
    setSelectedGoal(goal);
    setShowDetails(true);
    console.debug('Goal pressed:', goal.id);
  };

  const handleStatusChange = async (goalId, newStatus) => {
    console.debug('Updating goal status:', { goalId, newStatus });
    onUpdateGoal?.(goalId, { status: newStatus });
  };

  const handleDismissDetails = () => {
    setShowDetails(false);
    setSelectedGoal(null);
  };

  const renderGoal = (goal) => {
    console.debug('Rendering goal:', { id: goal.id, priority: goal.priority, status: goal.status });
    
    const gradientColors = getGradientColors(goal.category);
    
    return (
      <Pressable 
        key={goal.id}
        style={styles.goalItem}
        onPress={() => handleGoalPress(goal)}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.goalCard}
        >
          <View style={styles.goalHeader}>
            <View style={styles.goalIconContainer}>
              <MaterialCommunityIcons 
                name={getCategoryIcon(goal.category)} 
                size={20} 
                color={COLORS.textOnColor}
              />
            </View>
            <View style={styles.goalHeaderRight}>
              <Chip 
                mode="outlined"
                style={styles.statusChip}
                textStyle={styles.statusChipText}
              >
                {goal.status || "pending"}
              </Chip>
              <IconButton 
                icon={getPriorityIcon(goal.priority)}
                size={20}
                iconColor={COLORS.textOnColor}
                style={styles.priorityIcon}
              />
            </View>
          </View>
          <Text style={styles.goalText}>
            {goal.description || goal.title || "Untitled Goal"}
          </Text>
          {goal.timeline?.targetDate && (
            <Text style={styles.timelineText}>
              Due: {formatDate(goal.timeline.targetDate)}
            </Text>
          )}
        </LinearGradient>
      </Pressable>
    );
  };

  if (!goals.length) {
    console.debug('No goals available');
    return null;
  }

  return (
    <>
      <Card style={styles.goalsCard} elevation={2}>
        <Card.Content>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Title style={styles.cardTitle}>Goals & Progress</Title>
            <IconButton 
              icon="filter-variant" 
              size={24}
              onPress={handleFilterPress}
              accessibilityLabel="Filter goals"
            />
          </View>

          {/* Progress Overview */}
          <Surface style={styles.progressSection} elevation={0}>
            <CircularProgress 
              percentage={overallProgress} 
              size={80}
              strokeWidth={8}
            />
            <View style={styles.progressStats}>
              <Text style={styles.statsText}>Active Goals: {activeGoals}</Text>
              <Text style={styles.statsText}>Completed: {completedGoals}</Text>
            </View>
          </Surface>

          {/* Categories */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {CATEGORIES.map((category) => (
              <Chip
                key={category.id}
                selected={selectedCategory === category.id}
                onPress={() => handleCategoryPress(category.id)}
                style={styles.categoryChip}
                mode="outlined"
              >
                {category.label}
              </Chip>
            ))}
          </ScrollView>

          {/* Goals List */}
          <View style={styles.goalsList}>
            {filteredGoals.slice(0, 3).map(renderGoal)}
          </View>
        </Card.Content>
      </Card>

      <GoalDetails
        visible={showDetails}
        goal={selectedGoal}
        onDismiss={handleDismissDetails}
        onStatusChange={handleStatusChange}
      />
    </>
  );
};

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return '#e8f5e9'; // Light green
    case 'in progress':
      return '#e3f2fd'; // Light blue
    case 'pending':
    default:
      return '#e9e6ff'; // Default purple
  }
};

// Helper function to get priority icon
const getPriorityIcon = (priority) => {
  console.debug('Getting priority icon for:', priority);
  
  if (!priority) {
    return 'flag-variant-outline'; // Default icon
  }

  const priorityStr = String(priority).toLowerCase();
  switch (priorityStr) {
    case 'high':
      return 'flag';
    case 'medium':
      return 'flag-outline';
    case 'low':
      return 'flag-variant-outline';
    default:
      console.debug('Unknown priority value:', priority);
      return 'flag-variant-outline';
  }
};

// Helper function to format date
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to get category icon
const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case 'personal':
      return 'account';
    case 'professional':
      return 'briefcase';
    case 'health':
      return 'heart';
    case 'tasks':
      return 'checkbox-marked';
    default:
      return 'star';
  }
};

// Helper function to get gradient colors
const getGradientColors = (category) => {
  switch (category?.toLowerCase()) {
    case 'personal':
      return [COLORS.tealGradient.start, COLORS.tealGradient.end];
    case 'professional':
      return [COLORS.purpleGradient.start, COLORS.purpleGradient.end];
    case 'health':
      return [COLORS.coralGradient.start, COLORS.coralGradient.end];
    case 'tasks':
      return [COLORS.blueGradient.start, COLORS.blueGradient.end];
    default:
      return [COLORS.purpleGradient.start, COLORS.purpleGradient.end];
  }
};

const styles = StyleSheet.create({
  goalsCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  headerSection: {
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
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceVariant,
  },
  progressStats: {
    marginLeft: SPACING.lg,
    flex: 1,
  },
  statsText: {
    fontSize: FONT.size.md,
    marginBottom: SPACING.xs,
    color: COLORS.textSecondary,
  },
  categoriesContainer: {
    marginBottom: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  goalsList: {
    gap: SPACING.sm,
  },
  goalItem: {
    marginBottom: SPACING.sm,
  },
  goalCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  goalIconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    height: 28,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginRight: SPACING.xs,
  },
  statusChipText: {
    color: COLORS.textOnColor,
    fontSize: FONT.size.xs,
  },
  priorityIcon: {
    margin: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    height: 28,
    width: 28,
  },
  goalText: {
    fontSize: FONT.size.md,
    color: COLORS.textOnColor,
    fontWeight: FONT.weight.semiBold,
    marginBottom: SPACING.xs,
  },
  timelineText: {
    fontSize: FONT.size.sm,
    color: COLORS.textOnColor,
    opacity: 0.8,
  },
  categoriesContent: {
    paddingRight: SPACING.lg,
  },
});

export default Goals; 