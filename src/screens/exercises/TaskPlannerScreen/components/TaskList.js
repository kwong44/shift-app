import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';
import { TaskCard } from './TaskCard';
import { CompletedTaskList } from './CompletedTaskList';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  // Enhanced debug log with better insights
  console.debug('📋 TaskList rendered with cleaned layout', { 
    taskCount: tasks.length,
    activeTasks: tasks.filter(t => !t.completed).length,
    completedTasks: tasks.filter(t => !t.completed).length,
    priorities: tasks.reduce((acc, task) => {
      const priority = task.priority === 1 ? 'high' : task.priority === 2 ? 'medium' : 'low';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {})
  });
  
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
  
  // Enhanced task organization with better sorting
  const activeTasksByPriority = {
    high: tasksWithPriorityString.filter(task => task.priorityString === 'high'),
    medium: tasksWithPriorityString.filter(task => task.priorityString === 'medium'),
    low: tasksWithPriorityString.filter(task => task.priorityString === 'low'),
  };

  // Quick stats for better UX
  const getQuickStats = () => {
    const totalActive = activeTasks.length;
    const highPriority = activeTasksByPriority.high.length;
    const mediumPriority = activeTasksByPriority.medium.length;
    const lowPriority = activeTasksByPriority.low.length;
    
    return { totalActive, highPriority, mediumPriority, lowPriority };
  };

  const stats = getQuickStats();
  
  return (
    <View style={styles.container}>
      {/* Enhanced Header with Clean Layout - Removed problematic stat chips */}
      {activeTasks.length > 0 && (
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>Active Tasks</Text>
              <Text style={styles.subtitle}>
                {stats.totalActive} task{stats.totalActive !== 1 ? 's' : ''} remaining
                {stats.highPriority > 0 && ` • ${stats.highPriority} high priority`}
                {stats.mediumPriority > 0 && ` • ${stats.mediumPriority} medium priority`}
                {stats.lowPriority > 0 && ` • ${stats.lowPriority} low priority`}
              </Text>
            </View>
          </View>
        </View>
      )}
      
      <View style={styles.tasksContainer}>
        {activeTasks.length > 0 ? (
          <>
            {/* Enhanced Priority Sections with Cleaned Spacing */}
            {Object.entries(activeTasksByPriority).map(([priority, priorityTasks]) => (
              priorityTasks.length > 0 && (
                <View key={priority} style={styles.prioritySection}>
                  {/* Compact Priority Header */}
                  <View style={styles.priorityHeader}>
                    <View style={styles.priorityTitleRow}>
                      <MaterialCommunityIcons 
                        name={priorityLevels.find(p => p.value === priority)?.icon || 'flag'} 
                        size={14} 
                        color={priorityLevels.find(p => p.value === priority)?.color} 
                      />
                      <Text style={[
                        styles.priorityTitle,
                        { color: priorityLevels.find(p => p.value === priority)?.color }
                      ]}>
                        {priorityLevels.find(p => p.value === priority)?.label} Priority
                      </Text>
                      <View style={[
                        styles.priorityBadge, 
                        { backgroundColor: `${priorityLevels.find(p => p.value === priority)?.color}12` }
                      ]}>
                        <Text style={[
                          styles.priorityBadgeText,
                          { color: priorityLevels.find(p => p.value === priority)?.color }
                        ]}>
                          {priorityTasks.length}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Task Cards with Cleaned Spacing */}
                  <View style={styles.taskCardsContainer}>
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
                </View>
              )
            ))}
          </>
        ) : (
          /* Enhanced Empty State with Better Spacing */
          <Card style={styles.emptyStateCard} elevation={1}>
            <Card.Content style={styles.emptyStateContainer}>
              <MaterialCommunityIcons 
                name="check-circle-outline" 
                size={40} 
                color={COLORS.primary} 
                style={styles.emptyStateIcon}
              />
              <Text style={styles.emptyTitle}>All caught up! 🎉</Text>
              <Text style={styles.emptyText}>
                {completedTasks.length > 0 
                  ? `Great job completing ${completedTasks.length} task${completedTasks.length !== 1 ? 's' : ''}! Add a new task above to keep the momentum going.`
                  : 'Add your first task above to start organizing your priorities and boost your productivity!'
                }
              </Text>
            </Card.Content>
          </Card>
        )}
        
        {/* Enhanced Completed Tasks Section with Better Spacing */}
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
  // Enhanced header styles for cleaner layout
  headerSection: {
    marginBottom: SPACING.sm, // Reduced margin for tighter layout
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2, // Minimal padding
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginBottom: 1, // Tighter spacing
  },
  subtitle: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
  },
  tasksContainer: {
    flex: 1,
  },
  // Enhanced priority section styles with cleaned spacing
  prioritySection: {
    marginBottom: SPACING.md, 
  },
  priorityHeader: {
    marginBottom: SPACING.sm, 
  },
  priorityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: 4,
  },
  priorityTitle: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.semiBold,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 6, // Smaller padding
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    minWidth: 20, // Smaller minimum width
    alignItems: 'center',
  },
  priorityBadgeText: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.bold,
  },
  taskCardsContainer: {
    // No extra spacing needed - TaskCard handles its own margins
  },
  // Enhanced empty state with cleaned spacing
  emptyStateCard: {
    marginVertical: SPACING.md, // Reduced margin
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    ...SHADOWS.small,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg, // Reduced padding
    paddingHorizontal: SPACING.md,
  },
  emptyStateIcon: {
    marginBottom: SPACING.sm,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs, // Tighter spacing
    textAlign: 'center',
  },
  emptyText: {
    fontSize: FONT.size.md,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20, // Tighter line height
    maxWidth: 260, // Slightly smaller max width
  },
}); 