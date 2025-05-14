import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
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
  // Debug log
  console.debug('TaskCard rendered', { taskId: task.id, completed: task.completed });
  
  return (
    <Card 
      key={task.id} 
      style={[
        styles.card,
        { borderLeftColor: priority.color },
        task.completed && styles.completedCard
      ]} 
      mode="outlined"
      elevation={task.completed ? 1 : 2}
    >
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggleComplete(task.id, !task.completed);
        }}
        style={styles.content}
      >
        <View style={styles.leftContent}>
          <View style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
            {task.completed && (
              <MaterialCommunityIcons 
                name="check" 
                size={16} 
                color={COLORS.background}
              />
            )}
          </View>
          <View style={styles.taskTextContainer}>
            <Text 
              style={[
                styles.taskText,
                task.completed && styles.completedTaskText
              ]}
            >
              {task.description}
            </Text>
            
            <View style={styles.priorityIndicator}>
              <MaterialCommunityIcons 
                name="flag" 
                size={16} 
                color={priority.color} 
                style={styles.priorityIcon}
              />
              <Text style={[styles.priorityText, { color: priority.color }]}>
                {priority.label}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.rightContent}>
          <Menu
            visible={menuVisible && selectedTaskId === task.id}
            onDismiss={() => {
              setMenuVisible(false);
              setSelectedTaskId(null);
            }}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedTaskId(task.id);
                  setMenuVisible(true);
                }}
              />
            }
          >
            <Menu.Item 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onDeleteTask(task.id);
              }} 
              title="Delete"
              leadingIcon="delete"
            />
          </Menu>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    backgroundColor: COLORS.background,
    ...SHADOWS.small,
    width: '100%',
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: COLORS.surfaceVariant,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    width: '100%',
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.textLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: FONT.size.md,
    color: COLORS.text,
    marginBottom: 4,
    fontWeight: FONT.weight.medium,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  priorityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIcon: {
    marginRight: 4,
  },
  priorityText: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.medium,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 