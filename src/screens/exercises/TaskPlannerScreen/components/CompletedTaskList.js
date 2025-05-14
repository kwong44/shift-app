import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';
import { TaskCard } from './TaskCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const CompletedTaskList = ({ 
  tasks,
  priorityLevels, 
  onToggleComplete, 
  onDeleteTask,
  menuVisible,
  selectedTaskId,
  setMenuVisible,
  setSelectedTaskId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Debug log
  console.debug('CompletedTaskList rendered', { completedTaskCount: tasks.length, isExpanded });
  
  // Map numeric priority to string values
  const getPriorityString = (priority) => {
    // If already a string that matches our values, return it
    if (typeof priority === 'string' && ['high', 'medium', 'low'].includes(priority)) {
      return priority;
    }
    
    // Handle numeric priorities
    if (priority === 1) return 'high';
    if (priority === 2) return 'medium';
    return 'low';
  };
  
  return (
    <Card style={styles.container} elevation={1}>
      <Card.Content style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons 
            name="check-circle-outline" 
            size={20} 
            color={COLORS.success}
          />
          <Text style={styles.title}>Completed Tasks</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{tasks.length}</Text>
          </View>
        </View>
        <IconButton
          icon={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          onPress={() => setIsExpanded(!isExpanded)}
          disabled={tasks.length === 0}
        />
      </Card.Content>
      
      {isExpanded && (
        <View style={styles.expandedContent}>
          {tasks.length > 0 ? (
            <View style={styles.tasksContainer}>
              {tasks.map(task => {
                const priorityString = getPriorityString(task.priority);
                const priority = priorityLevels.find(p => p.value === priorityString);
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    priority={priority}
                    onToggleComplete={onToggleComplete}
                    onDeleteTask={onDeleteTask}
                    menuVisible={menuVisible}
                    selectedTaskId={selectedTaskId}
                    setMenuVisible={setMenuVisible}
                    setSelectedTaskId={setSelectedTaskId}
                  />
                );
              })}
            </View>
          ) : (
            <Card.Content style={styles.emptyContent}>
              <Text style={styles.emptyText}>No completed tasks yet</Text>
            </Card.Content>
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    ...SHADOWS.small,
    width: '100%',
    marginBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.medium,
    color: COLORS.text,
  },
  badge: {
    backgroundColor: `${COLORS.success}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: FONT.size.xs,
    color: COLORS.success,
    fontWeight: FONT.weight.bold,
  },
  expandedContent: {
    width: '100%',
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  tasksContainer: {
    width: '100%',
  },
  emptyContent: {
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  emptyText: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
}); 