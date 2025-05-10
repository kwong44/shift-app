import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TouchableRipple, Text } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';
import { FREQUENCIES } from '../constants';
import * as Haptics from 'expo-haptics';

// Debug logging
console.debug('FrequencySelector mounted');

const FrequencySelector = ({ selectedFrequency, onSelectFrequency }) => {
  const handleSelect = async (value) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectFrequency(value);
  };

  return (
    <View style={styles.container}>
      {Object.entries(FREQUENCIES).map(([key, data]) => (
        <TouchableRipple
          key={key}
          onPress={() => handleSelect(key)}
          style={[
            styles.option,
            selectedFrequency === key && styles.selectedOption
          ]}
        >
          <View style={styles.optionContent}>
            <Text style={[
              styles.optionTitle,
              selectedFrequency === key && styles.selectedText
            ]}>
              {data.name}
            </Text>
            <Text style={[
              styles.optionDescription,
              selectedFrequency === key && styles.selectedText
            ]}>
              {data.description}
            </Text>
            <Text style={[
              styles.optionFrequency,
              selectedFrequency === key && styles.selectedText
            ]}>
              {data.frequency} Hz
            </Text>
          </View>
        </TouchableRipple>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  option: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  selectedOption: {
    backgroundColor: COLORS.background,
  },
  optionContent: {
    padding: SPACING.md,
  },
  optionTitle: {
    color: COLORS.background,
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    marginBottom: SPACING.xs,
  },
  optionDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONT.size.sm,
    marginBottom: SPACING.xs,
  },
  optionFrequency: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
  },
  selectedText: {
    color: COLORS.primary,
  },
});

export default FrequencySelector; 