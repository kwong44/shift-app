import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';

// Debug logging
console.debug('DurationPicker mounted');

const DURATION_OPTIONS = [
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
  { label: '20 min', value: 1200 },
  { label: '30 min', value: 1800 },
];

const DurationPicker = ({ defaultDuration, value, onDurationChange }) => {
  // Debug logging
  console.debug('DurationPicker props:', { defaultDuration, value });

  const handleSelect = async (duration) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDurationChange(duration);
  };

  return (
    <View style={styles.container}>
      {DURATION_OPTIONS.map((option) => {
        const isSelected = value === option.value || (!value && defaultDuration === option.value);
        return (
          <Button
            key={option.value}
            mode={isSelected ? "contained" : "outlined"}
            onPress={() => handleSelect(option.value)}
            style={[
              styles.option,
              isSelected && styles.optionSelected
            ]}
            labelStyle={[
              styles.optionText,
              isSelected && styles.optionTextSelected
            ]}
            contentStyle={styles.buttonContent}
          >
            {option.label}
          </Button>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  option: {
    borderRadius: RADIUS.md,
    borderColor: COLORS.indigoGradient.start + '30',
    backgroundColor: COLORS.background,
    ...SHADOWS.small,
  },
  optionSelected: {
    backgroundColor: COLORS.indigoGradient.start,
  },
  buttonContent: {
    height: 40,
    minWidth: 80,
  },
  optionText: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
    color: COLORS.indigoGradient.start,
  },
  optionTextSelected: {
    color: COLORS.background,
    fontWeight: FONT.weight.semiBold,
  },
});

export default DurationPicker; 