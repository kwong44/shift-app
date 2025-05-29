import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, TextInput, Button, Text, Chip } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export const TaskInput = ({ 
  newTask, 
  setNewTask, 
  selectedPriority, 
  setSelectedPriority, 
  priorityLevels = [],
  onAddTask,
  loading
}) => {
  // Enhanced debug log with better context
  console.debug('📝 TaskInput rendered with cleaned layout', { 
    newTask: newTask?.substring(0, 30) + (newTask?.length > 30 ? '...' : ''),
    selectedPriority, 
    priorityLevelsCount: priorityLevels.length,
    hasValidInput: !!newTask?.trim(),
    loading
  });

  const selectedPriorityData = priorityLevels.find(p => p.value === selectedPriority) || {
    color: COLORS.textLight,
    label: 'Medium',
    description: 'Important but not urgent tasks',
    icon: 'flag'
  };

  // Enhanced add task handler with better feedback
  const handleAddTask = async () => {
    if (!newTask?.trim()) {
      console.debug('⚠️ Attempted to add empty task');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    
    console.debug('✅ Adding new task', { 
      taskPreview: newTask.trim().substring(0, 50),
      priority: selectedPriority 
    });
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddTask();
  };
  
  return (
    <Card style={styles.card} elevation={2}>
      <Card.Content style={styles.content}>
        {/* Enhanced Input Section with Cleaner Layout */}
        <View style={styles.inputSection}>
          <TextInput
            mode="outlined"
            label="What needs to be done?"
            placeholder="e.g., Review project proposal, Call dentist, Buy groceries..."
            value={newTask || ''}
            onChangeText={setNewTask}
            style={styles.input}
            autoCapitalize="sentences"
            multiline={false}
            maxLength={200}
            onSubmitEditing={handleAddTask}
            returnKeyType="done"
            blurOnSubmit={true}
            right={
              newTask?.trim() ? (
                <TextInput.Icon 
                  icon="plus-circle" 
                  onPress={handleAddTask}
                  disabled={loading}
                  color={selectedPriorityData.color}
                />
              ) : null
            }
          />
        </View>
        
        {/* Enhanced Priority Selection - Compact Layout */}
        <View style={styles.prioritySection}>
          <View style={styles.priorityHeader}>
            <Text style={styles.priorityLabel}>Priority:</Text>
            <View style={styles.priorityChips}>
              {priorityLevels.map(priority => (
                <Chip
                  key={priority.value}
                  selected={selectedPriority === priority.value}
                  onPress={() => {
                    console.debug('🎯 Priority changed', { from: selectedPriority, to: priority.value });
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedPriority(priority.value);
                  }}
                  style={[
                    styles.priorityChip,
                    selectedPriority === priority.value ? {
                      backgroundColor: priority.color,
                    } : {
                      backgroundColor: `${priority.color}15`, // Light version of priority color (15% opacity)
                      borderColor: `${priority.color}30`, // Subtle border with priority color
                    }
                  ]}
                  textStyle={[
                    styles.priorityChipText,
                    { 
                      color: selectedPriority === priority.value 
                        ? COLORS.background 
                        : priority.color 
                    }
                  ]}
                  icon={({ size, color }) => (
                    <MaterialCommunityIcons 
                      name={priority.icon} 
                      size={size} 
                      color={selectedPriority === priority.value ? COLORS.background : priority.color}
                    />
                  )}
                  
                  compact
                >
                  {priority.label}
                </Chip>
              ))}
            </View>
          </View>
          
          {/* Priority Description - More Subtle and Compact */}
          <Text style={[
            styles.priorityDescription,
            { color: selectedPriorityData.color }
          ]}>
            {selectedPriorityData.description}
          </Text>
        </View>

        {/* Enhanced Quick Add Button - Cleaner Design */}
        {newTask?.trim() && (
          <Button
            mode="contained"
            onPress={handleAddTask}
            disabled={loading}
            loading={loading}
            style={[styles.addButton, { backgroundColor: selectedPriorityData.color }]}
            labelStyle={styles.addButtonLabel}
            icon="plus"
            contentStyle={styles.addButtonContent}
            compact
          >
            Add {selectedPriority.charAt(0).toUpperCase() + selectedPriority.slice(1)} Priority Task
          </Button>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    ...SHADOWS.medium,
  },
  content: {
    padding: SPACING.md, 
    gap: SPACING.sm, 
  },
  // Enhanced input section with cleaner spacing
  inputSection: {
    marginBottom: SPACING.sm, 
  },
  input: {
    backgroundColor: COLORS.background,
    fontSize: FONT.size.md,
  },
  // Enhanced priority section with cleaned layout
  prioritySection: {
    gap: SPACING.xs,
  },
  priorityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityLabel: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
    fontWeight: FONT.weight.medium,
  },
  priorityChips: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  priorityChip: {
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    height: 30,
  },
  priorityChipText: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.medium,
    paddingBottom: SPACING.md,
  },
  priorityDescription: {
    fontSize: FONT.size.xs,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7, // More subtle
    marginTop: 2, // Small gap from chips
  },
  // Enhanced add button with cleaner styling
  addButton: {
    marginTop: SPACING.xs,
    borderRadius: RADIUS.md,
    elevation: 1, // Subtle elevation
  },
  addButtonContent: {
    paddingVertical: 2, // Compact padding
  },
  addButtonLabel: {
    color: COLORS.background,
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
  },
}); 