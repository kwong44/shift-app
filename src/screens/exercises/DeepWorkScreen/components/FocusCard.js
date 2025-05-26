import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
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
    <View style={styles.container}>
      {/* Minimal, subtle card design */}
      <View style={styles.cardContent}>
        {/* Compact task description */}
        <View style={styles.taskContainer}>
          <Text style={styles.taskDescription}>
            {taskDescription}
          </Text>
        </View>
        
        {/* Compact duration info */}
        <View style={styles.durationSection}>
          <MaterialCommunityIcons 
            name={selectedDurationData.icon} 
            size={14} 
            color="rgba(255,255,255,0.8)"
            style={styles.durationIcon} 
          />
          <Text style={styles.durationText}>
            {selectedDurationData.label} • {selectedDurationData.description}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: SPACING.lg, // Reduced from xl
  },
  cardContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  taskContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)', // Much more subtle
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', // Very subtle border
  },
  taskDescription: {
    fontSize: FONT.size.sm,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18, // Tighter line height
    fontWeight: FONT.weight.regular,
    textAlign: 'center',
  },
  durationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xs,
  },
  durationIcon: {
    marginRight: SPACING.xs,
  },
  durationText: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.medium,
    color: 'rgba(255,255,255,0.8)',
  },
}); 