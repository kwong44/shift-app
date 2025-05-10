import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';

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
      {DURATION_OPTIONS.map((option) => (
        <TouchableRipple
          key={option.value}
          style={[
            styles.option,
            (value === option.value || (!value && defaultDuration === option.value)) && styles.optionSelected
          ]}
          onPress={() => handleSelect(option.value)}
        >
          <Text style={[
            styles.optionText,
            (value === option.value || (!value && defaultDuration === option.value)) && styles.optionTextSelected
          ]}>
            {option.label}
          </Text>
        </TouchableRipple>
      ))}
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minWidth: 80,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: COLORS.background,
  },
  optionText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: FONT.weight.semiBold,
  },
});

export default DurationPicker; 