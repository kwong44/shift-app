import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, TextInput, SegmentedButtons, Button } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export const TaskInput = ({ 
  newTask, 
  setNewTask, 
  selectedPriority, 
  setSelectedPriority, 
  priorityLevels,
  onAddTask,
  loading
}) => {
  // Debug log
  console.debug('TaskInput rendered', { newTask, selectedPriority });
  
  return (
    <Card style={styles.card} elevation={4}>
      <Card.Content style={styles.content}>
        <View style={styles.inputRow}>
          <TextInput
            mode="outlined"
            label="New Task"
            placeholder="What do you want to accomplish?"
            value={newTask}
            onChangeText={setNewTask}
            style={styles.input}
            autoCapitalize="sentences"
            right={
              <TextInput.Icon 
                icon="plus-circle" 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onAddTask();
                }}
                disabled={!newTask.trim() || loading}
                color={newTask.trim() ? priorityLevels.find(p => p.value === selectedPriority).color : COLORS.textLight}
              />
            }
          />
        </View>
        
        <View style={styles.priorityContainer}>
          <Text style={styles.priorityLabel}>Priority:</Text>
          <View style={styles.buttonsContainer}>
            {priorityLevels.map(priority => (
              <Button
                key={priority.value}
                mode={selectedPriority === priority.value ? "contained" : "outlined"}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedPriority(priority.value);
                }}
                style={[
                  styles.priorityButton,
                  { 
                    backgroundColor: selectedPriority === priority.value ? priority.color : 'transparent',
                    borderColor: priority.color
                  }
                ]}
                labelStyle={[
                  styles.priorityButtonLabel,
                  { color: selectedPriority === priority.value ? COLORS.background : priority.color }
                ]}
                icon={priority.icon}
                compact
              >
                {priority.label}
              </Button>
            ))}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

// Helper component for the priority label
const Text = ({ style, children }) => (
  <View style={[styles.textContainer, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    ...SHADOWS.medium,
  },
  content: {
    padding: SPACING.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  priorityContainer: {
    marginTop: SPACING.md,
  },
  textContainer: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
    fontWeight: FONT.weight.medium,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: RADIUS.sm,
  },
  priorityButtonLabel: {
    fontSize: FONT.size.xs,
    marginVertical: 0,
  },
}); 