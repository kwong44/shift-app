import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
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
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          placeholder="What would you like to focus on during this session?"
          value={taskDescription}
          onChangeText={setTaskDescription}
          multiline
          style={[styles.input, { height: Math.max(120, textInputHeight) }]}
          onContentSizeChange={(e) => setTextInputHeight(e.nativeEvent.contentSize.height)}
          autoCapitalize="sentences"
          outlineColor={`${COLORS.blueGradient.start}30`}
          activeOutlineColor={COLORS.blueGradient.start}
          placeholderTextColor={COLORS.textLight + '80'}
          textColor={COLORS.text}
          theme={{
            colors: {
              background: COLORS.background,
            },
          }}
        />
      </View>
      <Text style={styles.hint}>
        Be specific about what you want to accomplish to maintain better focus
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
  },
  inputContainer: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    ...SHADOWS.small,
  },
  input: {
    minHeight: 120,
    backgroundColor: COLORS.background,
    fontSize: FONT.size.md,
    lineHeight: 24,
  },
  hint: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  }
}); 