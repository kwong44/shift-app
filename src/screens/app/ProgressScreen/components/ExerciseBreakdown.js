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
    <Card style={styles.contentCard} mode="elevated">
      <Card.Content>
        <View style={styles.cardHeaderContainer}>
          <MaterialCommunityIcons 
            name="format-list-bulleted-type" 
            size={24} 
            color={COLORS.accent} 
          />
          <Text style={styles.contentCardTitle}>Exercise Breakdown</Text>
        </View>
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
    elevation: 2,
  },
  cardHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  contentCardTitle: {
    fontFamily: FONT.family.heading,
    fontWeight: FONT.weight.semiBold,
    fontSize: FONT.size.lg,
    marginLeft: SPACING.sm,
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
