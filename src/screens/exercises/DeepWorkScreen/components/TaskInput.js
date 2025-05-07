import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, TextInput } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';

export const TaskInput = ({ 
  taskDescription, 
  setTaskDescription,
  textInputHeight,
  setTextInputHeight
}) => {
  // Debug log
  console.debug('TaskInput rendered', { taskLength: taskDescription.length });

  return (
    <Card style={styles.card} elevation={3}>
      <Card.Content>
        <TextInput
          mode="outlined"
          placeholder="Describe your task or goal for this session..."
          value={taskDescription}
          onChangeText={setTaskDescription}
          multiline
          style={[styles.taskInput, {height: Math.max(80, textInputHeight)}]}
          onContentSizeChange={(e) => setTextInputHeight(e.nativeEvent.contentSize.height)}
          outlineColor={COLORS.primary + '50'}
          activeOutlineColor={COLORS.primary}
          placeholderTextColor={COLORS.textLight + '80'}
        />
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  taskInput: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    minHeight: 80,
    fontSize: FONT.size.md,
  },
}); 