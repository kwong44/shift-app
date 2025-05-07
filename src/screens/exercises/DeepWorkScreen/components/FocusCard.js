import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';

export const FocusCard = ({ 
  taskDescription,
  selectedDurationData
}) => {
  // Debug log
  console.debug('FocusCard rendered', { 
    taskLength: taskDescription.length,
    duration: selectedDurationData.label
  });

  return (
    <Card style={styles.card} elevation={3}>
      <Card.Content>
        <View style={styles.focusHeader}>
          <View style={[styles.focusIconContainer, { backgroundColor: `${selectedDurationData.color}20` }]}>
            <MaterialCommunityIcons name="target" size={24} color={selectedDurationData.color} />
          </View>
          <Text style={styles.focusLabel}>Your Focus Goal</Text>
        </View>
        
        <Text style={styles.taskDescription}>
          {taskDescription}
        </Text>
        
        <View style={styles.durationTag}>
          <MaterialCommunityIcons 
            name={selectedDurationData.icon} 
            size={16} 
            color={COLORS.text}
            style={styles.durationIcon} 
          />
          <Text style={styles.durationText}>
            {selectedDurationData.label} {selectedDurationData.description}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: SPACING.xl,
    borderRadius: RADIUS.lg,
    ...SHADOWS.medium,
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  focusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    ...SHADOWS.small,
  },
  focusLabel: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
  },
  taskDescription: {
    fontSize: FONT.size.md,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  durationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.xl,
    alignSelf: 'flex-start',
  },
  durationIcon: {
    marginRight: SPACING.xs,
  },
  durationText: {
    fontSize: FONT.size.sm,
    color: COLORS.text,
  },
}); 