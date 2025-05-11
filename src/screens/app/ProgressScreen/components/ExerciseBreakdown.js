import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';
import { formatExerciseType, getExerciseIcon } from '../helpers/exerciseIcons';

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[ExerciseBreakdown] ${message}`, data);
  }
};

const ExerciseBreakdown = ({ exerciseBreakdown }) => {
  debug.log('Rendering exercise breakdown:', exerciseBreakdown);
  const theme = useTheme();

  return (
    <Card 
      style={[
        styles.contentCard,
        {
          borderColor: `${COLORS.accent}30`,
          shadowColor: COLORS.text,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        }
      ]} 
      mode="outlined"
    >
      <Card.Content>
        <Text style={styles.contentCardTitle}>Exercise Breakdown</Text>
        {Object.keys(exerciseBreakdown).length > 0 ? (
          Object.entries(exerciseBreakdown).map(([type, count]) => (
            <View key={type} style={styles.exerciseItem}>
              <View style={styles.exerciseInfo}>
                <MaterialCommunityIcons 
                  name={getExerciseIcon(type)} 
                  size={28} 
                  color={theme.colors.onSurfaceVariant} 
                  style={styles.exerciseIcon}
                />
                <Text style={styles.exerciseTypeText}>{formatExerciseType(type)}</Text>
              </View>
              <Text style={styles.exerciseCountText}>{count} sessions</Text>
            </View>
          ))
        ) : (
          <Text style={styles.placeholderText}>No exercises logged yet.</Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  contentCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.background,
    borderWidth: 1,
  },
  contentCardTitle: {
    fontFamily: FONT.family.heading,
    fontWeight: FONT.weight.semiBold,
    fontSize: FONT.size.lg,
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseIcon: {
    marginRight: SPACING.md,
  },
  exerciseTypeText: {
    fontFamily: FONT.family.base,
    fontWeight: FONT.weight.regular,
    fontSize: FONT.size.md,
    color: COLORS.text,
  },
  exerciseCountText: {
    fontFamily: FONT.family.base,
    fontWeight: FONT.weight.medium,
    fontSize: FONT.size.md,
    color: COLORS.textLight,
  },
  placeholderText: {
    fontFamily: FONT.family.base,
    fontWeight: FONT.weight.regular,
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
});

export default ExerciseBreakdown;
