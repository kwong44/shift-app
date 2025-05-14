import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';
import { TaskCard } from './TaskCard';
import { CompletedTaskList } from './CompletedTaskList';

export const TaskList = ({ 
  tasks,
  priorityLevels, 
  onToggleComplete, 
  onDeleteTask,
  menuVisible,
  selectedTaskId,
  setMenuVisible,
  setSelectedTaskId
}) => {
  // Debug log
  console.debug('TaskList rendered', { taskCount: tasks.length });
  
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  
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
  
  // Add priority string to each task
  const tasksWithPriorityString = activeTasks.map(task => ({
    ...task,
    priorityString: getPriorityString(task.priority)
  }));
  
  const activeTasksByPriority = {
    high: tasksWithPriorityString.filter(task => task.priorityString === 'high'),
    medium: tasksWithPriorityString.filter(task => task.priorityString === 'medium'),
    low: tasksWithPriorityString.filter(task => task.priorityString === 'low'),
  };
  
  return (
    <View style={styles.container}>
      <Card style={styles.headerCard} elevation={3}>
        <Card.Content style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Active Tasks</Text>
            <Text style={styles.subtitle}>
              {activeTasks.length} tasks to complete
            </Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0)}%
            </Text>
          </View>
        </Card.Content>
      </Card>
      
      <View style={styles.tasksContainer}>
        {activeTasks.length > 0 ? (
          <>
            {Object.entries(activeTasksByPriority).map(([priority, priorityTasks]) => (
              priorityTasks.length > 0 && (
                <View key={priority} style={styles.prioritySection}>
                  <View style={styles.priorityHeader}>
                    <Text style={[
                      styles.priorityTitle,
                      { color: priorityLevels.find(p => p.value === priority).color }
                    ]}>
                      {priorityLevels.find(p => p.value === priority).label} Priority
                    </Text>
                    <Text style={styles.priorityCount}>
                      {priorityTasks.length} {priorityTasks.length === 1 ? 'task' : 'tasks'}
                    </Text>
                  </View>
                  {priorityTasks.map(task => {
                    const priority = priorityLevels.find(p => p.value === task.priorityString);
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
              )
            ))}
          </>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyTitle}>No active tasks</Text>
            <Text style={styles.emptyText}>
              Add your first task above to start organizing your priorities!
            </Text>
          </View>
        )}
        
        <CompletedTaskList
          tasks={completedTasks}
          priorityLevels={priorityLevels}
          onToggleComplete={onToggleComplete}
          onDeleteTask={onDeleteTask}
          menuVisible={menuVisible}
          selectedTaskId={selectedTaskId}
          setMenuVisible={setMenuVisible}
          setSelectedTaskId={setSelectedTaskId}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    ...SHADOWS.medium,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: 60,
    height: 6,
    backgroundColor: `${COLORS.primary}20`,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  progressText: {
    fontSize: FONT.size.xs,
    color: COLORS.textLight,
    fontWeight: FONT.weight.medium,
  },
  tasksContainer: {
    flex: 1,
    width: '100%',
  },
  prioritySection: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  priorityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  priorityTitle: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.semiBold,
  },
  priorityCount: {
    fontSize: FONT.size.xs,
    color: COLORS.textLight,
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
    width: '100%',
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT.size.md,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
}); 