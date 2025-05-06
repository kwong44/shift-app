import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';
import { FREQUENCIES } from '../constants';

export const FrequencySelector = ({ selectedFrequency, onFrequencyChange, loading }) => {
  const handleFrequencySelect = async (frequencyValue) => {
    await Haptics.selectionAsync();
    onFrequencyChange(frequencyValue);
  };

  return (
    <View style={styles.container}>
      {FREQUENCIES.map(freq => (
        <TouchableOpacity
          key={freq.value}
          style={[
            styles.option,
            selectedFrequency === freq.value && styles.optionSelected
          ]}
          onPress={() => handleFrequencySelect(freq.value)}
          disabled={loading}
        >
          <MaterialCommunityIcons 
            name={freq.icon} 
            size={28} 
            color={selectedFrequency === freq.value ? COLORS.background : COLORS.textLight} 
          />
          <Text style={[
            styles.label,
            selectedFrequency === freq.value && styles.labelSelected
          ]}>
            {freq.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.xs,
  },
  optionSelected: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  label: {
    fontSize: FONT.size.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
    fontWeight: FONT.weight.medium,
  },
  labelSelected: {
    color: COLORS.background,
    fontWeight: FONT.weight.semiBold,
  },
}); 