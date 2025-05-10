import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
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
  
  const activeTasksByPriority = {
    high: activeTasks.filter(task => task.priority === 'high'),
    medium: activeTasks.filter(task => task.priority === 'medium'),
    low: activeTasks.filter(task => task.priority === 'low'),
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
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={activeTasks.length === 0 ? styles.emptyScrollContent : styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
                    const priority = priorityLevels.find(p => p.value === task.priority);
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
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  emptyScrollContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  prioritySection: {
    marginBottom: SPACING.md,
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