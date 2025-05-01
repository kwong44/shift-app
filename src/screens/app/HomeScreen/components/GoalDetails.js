import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Portal, Modal, Text, Button, Chip, IconButton, Surface, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';

const GoalDetails = ({ visible, goal, onDismiss, onStatusChange }) => {
  console.debug('Rendering GoalDetails for goal:', goal?.id);

  const handleStatusChange = async (newStatus) => {
    await Haptics.selectionAsync();
    onStatusChange?.(goal.id, newStatus);
  };

  if (!goal) return null;

  const gradientColors = getGradientColors(goal.category);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <IconButton 
              icon="close" 
              size={24}
              iconColor={COLORS.textOnColor}
              onPress={onDismiss}
              style={styles.closeButton}
            />
            <View style={styles.headerContent}>
              <View style={styles.categoryIconContainer}>
                <MaterialCommunityIcons 
                  name={getCategoryIcon(goal.category)} 
                  size={24} 
                  color={COLORS.textOnColor}
                />
              </View>
              <Text style={styles.headerTitle}>Goal Details</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollView}>
          {/* Status Section */}
          <Surface style={styles.section} elevation={1}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.statusContainer}>
              {['pending', 'in progress', 'completed'].map((status) => (
                <Chip
                  key={status}
                  selected={goal.status === status}
                  onPress={() => handleStatusChange(status)}
                  style={[
                    styles.statusChip,
                    goal.status === status && styles.selectedStatusChip
                  ]}
                  textStyle={[
                    styles.statusChipText,
                    goal.status === status && styles.selectedStatusChipText
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Chip>
              ))}
            </View>
          </Surface>

          {/* Details Section */}
          <Surface style={styles.section} elevation={1}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category:</Text>
              <Chip 
                compact 
                mode="outlined"
                icon={() => (
                  <MaterialCommunityIcons 
                    name={getCategoryIcon(goal.category)} 
                    size={16} 
                    color={COLORS.primary}
                  />
                )}
              >
                {goal.category || 'Uncategorized'}
              </Chip>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Priority:</Text>
              <Chip 
                compact 
                mode="outlined"
                icon={() => (
                  <MaterialCommunityIcons 
                    name={getPriorityIcon(goal.priority)} 
                    size={16} 
                    color={COLORS.primary}
                  />
                )}
              >
                {goal.priority || 'None'}
              </Chip>
            </View>
            {goal.timeline?.targetDate && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Due Date:</Text>
                <Text style={styles.detailValue}>
                  {new Date(goal.timeline.targetDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            )}
          </Surface>

          {/* Description Section */}
          <Surface style={styles.section} elevation={1}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {goal.description || goal.title || 'No description provided'}
            </Text>
          </Surface>

          {/* Progress Section */}
          {goal.subTasks && goal.subTasks.length > 0 && (
            <Surface style={styles.section} elevation={1}>
              <Text style={styles.sectionTitle}>Progress</Text>
              <View style={styles.progressContainer}>
                <ProgressBar
                  progress={goal.subTasks.filter(task => task.completed).length / goal.subTasks.length}
                  color={COLORS.primary}
                  style={styles.progressBar}
                />
                <Text style={styles.progressText}>
                  {goal.subTasks.filter(task => task.completed).length} of {goal.subTasks.length} tasks completed
                </Text>
              </View>
              <View style={styles.subTasksList}>
                {goal.subTasks.map(task => (
                  <View key={task.id} style={styles.subTaskItem}>
                    <IconButton
                      icon={task.completed ? 'checkbox-marked' : 'checkbox-blank-outline'}
                      onPress={() => console.debug('Toggle subtask:', task.id)}
                      size={20}
                      iconColor={COLORS.primary}
                    />
                    <Text style={[
                      styles.subTaskText,
                      task.completed && styles.completedSubTask
                    ]}>
                      {task.title}
                    </Text>
                  </View>
                ))}
              </View>
            </Surface>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <Surface style={styles.footer} elevation={2}>
          <Button 
            mode="outlined" 
            onPress={onDismiss}
            style={styles.footerButton}
          >
            Close
          </Button>
          <Button 
            mode="contained"
            onPress={() => console.debug('Edit goal:', goal.id)}
            style={styles.footerButton}
          >
            Edit Goal
          </Button>
        </Surface>
      </Modal>
    </Portal>
  );
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
  modalContainer: {
    backgroundColor: COLORS.background,
    margin: SPACING.lg,
    borderRadius: RADIUS.lg,
    height: '90%',
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: SPACING.md,
  },
  header: {
    flexDirection: 'column',
    padding: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  categoryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  closeButton: {
    margin: 0,
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.textOnColor,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  sectionTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semiBold,
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statusChip: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedStatusChip: {
    backgroundColor: COLORS.primary,
  },
  statusChipText: {
    color: COLORS.text,
  },
  selectedStatusChipText: {
    color: COLORS.textOnColor,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailLabel: {
    fontSize: FONT.size.md,
    marginRight: SPACING.sm,
    width: 80,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: FONT.size.md,
    flex: 1,
    color: COLORS.text,
  },
  description: {
    fontSize: FONT.size.md,
    lineHeight: 24,
    color: COLORS.text,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  subTasksList: {
    gap: SPACING.xs,
  },
  subTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subTaskText: {
    fontSize: FONT.size.md,
    flex: 1,
    color: COLORS.text,
  },
  completedSubTask: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  footerButton: {
    minWidth: 100,
  },
});

export default GoalDetails; 