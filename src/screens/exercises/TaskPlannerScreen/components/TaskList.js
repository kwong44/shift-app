import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';
import { TaskCard } from './TaskCard';

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
  
  const completedCount = tasks.filter(task => task.completed).length;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Tasks</Text>
        <Text style={styles.subtitle}>
          {completedCount} of {tasks.length} completed
        </Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={tasks.length === 0 ? styles.emptyScrollContent : styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {tasks.length > 0 ? (
          tasks.map(task => {
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
          })
        ) : (
          <Text style={styles.emptyText}>
            No tasks yet. Add your first task above!
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  title: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
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
  emptyText: {
    fontSize: FONT.size.md,
    color: COLORS.textLight,
    textAlign: 'center',
  },
}); 