import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';

export const SessionDurationSelector = ({ 
  durations, 
  selectedDuration, 
  onSelectDuration 
}) => {
  // Debug log
  console.debug('SessionDurationSelector rendered', { selectedDuration });

  const renderDurationOption = (duration) => {
    const isSelected = selectedDuration === duration.value;
    
    return (
      <TouchableRipple
        key={duration.value}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSelectDuration(duration.value);
        }}
      >
        <Card 
          style={[
            styles.durationOption,
            isSelected && { 
              borderColor: duration.color,
              borderWidth: 2
            }
          ]} 
          elevation={isSelected ? 4 : 2}
        >
          <View style={styles.durationContent}>
            <View style={[styles.durationIconContainer, { backgroundColor: `${duration.color}20` }]}>
              <MaterialCommunityIcons name={duration.icon} size={24} color={duration.color} />
            </View>
            <View style={styles.durationTextContainer}>
              <Text style={styles.durationLabel}>{duration.label}</Text>
              <Text style={styles.durationDescription}>{duration.description}</Text>
            </View>
            {isSelected && (
              <MaterialCommunityIcons name="check-circle" size={22} color={duration.color} />
            )}
          </View>
        </Card>
      </TouchableRipple>
    );
  };

  return (
    <View style={styles.container}>
      {durations.map(renderDurationOption)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  durationOption: {
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  durationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  durationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.small,
  },
  durationTextContainer: {
    flex: 1,
  },
  durationLabel: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginBottom: 2,
  },
  durationDescription: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
  },
}); 