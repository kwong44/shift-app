import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
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
  
  if (tasks.length === 0) return null;
  
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
        />
      </Card.Content>
      
      {isExpanded && (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {tasks.map(task => {
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
        </ScrollView>
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
  scrollView: {
    maxHeight: 300,
  },
  scrollContent: {
    padding: SPACING.sm,
    paddingTop: 0,
  },
}); 