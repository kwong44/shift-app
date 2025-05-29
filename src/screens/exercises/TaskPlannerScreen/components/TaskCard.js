import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import { Card, Text, IconButton, Menu } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export const TaskCard = ({ 
  task, 
  priority, 
  onToggleComplete, 
  onDeleteTask,
  menuVisible,
  selectedTaskId,
  setMenuVisible,
  setSelectedTaskId
}) => {
  // Simplified animations - removed swipe functionality
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkboxScale = useRef(new Animated.Value(task.completed ? 1 : 0.8)).current;
  const completionOpacity = useRef(new Animated.Value(task.completed ? 0.7 : 1)).current;
  
  // Enhanced debug log - removed swipe references
  console.debug('🃏 TaskCard rendered with simplified tap interactions', { 
    taskId: task.id, 
    completed: task.completed,
    priority: priority?.value,
    description: task.description?.substring(0, 30) + '...'
  });

  // Animate task completion/incompletion changes
  useEffect(() => {
    Animated.parallel([
      Animated.spring(checkboxScale, {
        toValue: task.completed ? 1 : 0.8,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(completionOpacity, {
        toValue: task.completed ? 0.7 : 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, [task.completed]);

  // Enhanced press animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      tension: 150,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 150,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  // Enhanced priority colors and styling
  const getPriorityStyle = () => {
    if (!priority) return { backgroundColor: COLORS.surfaceVariant };
    
    return {
      backgroundColor: `${priority.color}06`,
      borderLeftColor: priority.color,
      borderLeftWidth: 3,
    };
  };

  // Time-based styling (example: urgent if high priority)
  const getUrgencyIndicator = () => {
    if (priority?.value === 'high' && !task.completed) {
      return (
        <MaterialCommunityIcons 
          name="fire" 
          size={12} 
          color={priority.color}
          style={{ marginLeft: 4 }}
        />
      );
    }
    return null;
  };

  return (
    <Animated.View 
      style={[
        styles.cardContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: completionOpacity
        }
      ]}
    >
      <Card 
        style={[
          styles.card,
          getPriorityStyle(),
          task.completed && styles.completedCard
        ]} 
        mode="outlined"
        elevation={task.completed ? 1 : 2}
      >
        <TouchableOpacity
          onPress={() => {
            console.debug('🔄 Task toggle initiated via tap', { taskId: task.id, currentState: task.completed });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggleComplete(task.id, !task.completed);
          }}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.content}
          activeOpacity={0.8}
        >
          <View style={styles.leftContent}>
            {/* Enhanced Checkbox with animation */}
            <Animated.View style={[
              styles.checkbox, 
              task.completed && styles.checkboxChecked,
              { transform: [{ scale: checkboxScale }] }
            ]}>
              {task.completed && (
                <MaterialCommunityIcons 
                  name="check" 
                  size={14} 
                  color={COLORS.background}
                />
              )}
            </Animated.View>
            
            <View style={styles.taskTextContainer}>
              <Text 
                style={[
                  styles.taskText,
                  task.completed && styles.completedTaskText
                ]}
                numberOfLines={2}
              >
                {task.description}
                {getUrgencyIndicator()}
              </Text>
              
              {/* Completely Redesigned Metadata Section */}
              <View style={styles.taskMetadata}>
                <View style={styles.prioritySection}>
                  <View style={[
                    styles.priorityIndicator, 
                    { backgroundColor: priority?.color || COLORS.textLight }
                  ]} />
                  <Text style={[
                    styles.priorityText,
                    { color: priority?.color || COLORS.textLight }
                  ]}>
                    {priority?.label || 'Medium'}
                  </Text>
                </View>
                
                {task.created_at && (
                  <Text style={styles.createdDate}>
                    {new Date(task.created_at).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.rightContent}>
            {/* Quick action button for high priority tasks */}
            {priority?.value === 'high' && !task.completed && (
              <View style={styles.quickActionButton}>
                <MaterialCommunityIcons 
                  name="lightning-bolt" 
                  size={14} 
                  color={priority.color}
                />
              </View>
            )}
            
            <Menu
              visible={menuVisible && selectedTaskId === task.id}
              onDismiss={() => {
                setMenuVisible(false);
                setSelectedTaskId(null);
              }}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={18}
                  iconColor={COLORS.textLight}
                  onPress={() => {
                    console.debug('📱 Menu button pressed', { taskId: task.id });
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedTaskId(task.id);
                    setMenuVisible(true);
                  }}
                />
              }
            >
              <Menu.Item 
                onPress={() => {
                  console.debug('🗑️ Delete task initiated', { taskId: task.id });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onDeleteTask(task.id);
                }} 
                title="Delete Task"
                leadingIcon="delete"
              />
              <Menu.Item 
                onPress={() => {
                  console.debug('✏️ Edit task initiated - future feature', { taskId: task.id });
                  setMenuVisible(false);
                  setSelectedTaskId(null);
                }} 
                title="Edit Task"
                leadingIcon="pencil"
              />
            </Menu>
          </View>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: SPACING.xs, // Tighter spacing between cards
  },
  card: {
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    ...SHADOWS.small,
    overflow: 'hidden',
  },
  completedCard: {
    backgroundColor: COLORS.surfaceVariant,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm, // Reduced from md for tighter spacing
    paddingHorizontal: SPACING.md,
    minHeight: 60, // Ensure minimum height for proper layout
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm, // Reduced gap for tighter layout
    paddingRight: SPACING.xs, // Ensure content doesn't touch right side
  },
  checkbox: {
    width: 20, // Slightly smaller checkbox
    height: 20,
    borderRadius: RADIUS.xs,
    borderWidth: 2,
    borderColor: COLORS.textLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1, // Better alignment with text
  },
  checkboxChecked: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  taskTextContainer: {
    flex: 1,
    gap: 4, // Tighter gap for better layout
  },
  taskText: {
    flex: 1,
    fontSize: FONT.size.md,
    color: COLORS.text,
    fontWeight: FONT.weight.medium,
    lineHeight: 18, // Tighter line height
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: COLORS.textLight,
  },
  taskMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6, // Optimal gap from text
    paddingHorizontal: 1, // Minimal padding to prevent edge issues
  },
  prioritySection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  priorityText: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.semiBold,
  },
  createdDate: {
    fontSize: FONT.size.xs,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2, // Tighter gap
  },
  quickActionButton: {
    padding: 3, // Smaller padding
    borderRadius: RADIUS.xs,
    backgroundColor: 'rgba(255, 193, 7, 0.08)',
  },
}); 