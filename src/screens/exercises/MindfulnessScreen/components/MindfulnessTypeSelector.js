import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';

export const MindfulnessTypeSelector = ({ 
  mindfulnessTypes, 
  selectedType, 
  onSelectType 
}) => {
  // Debug log
  console.debug('MindfulnessTypeSelector rendered', { selectedType: selectedType.value });

  const handleTypeSelect = async (typeValue) => {
    await Haptics.selectionAsync();
    onSelectType(typeValue);
  };

  return (
    <View style={styles.container}>
      {mindfulnessTypes.map(type => (
        <TouchableOpacity
          key={type.value}
          style={[
            styles.option,
            selectedType.value === type.value && styles.optionSelected
          ]}
          onPress={() => handleTypeSelect(type.value)}
        >
          <MaterialCommunityIcons 
            name={type.icon} 
            size={28} 
            color={selectedType.value === type.value ? COLORS.background : 'rgba(255,255,255,0.8)'} 
          />
          <Text style={[
            styles.label,
            selectedType.value === type.value && styles.labelSelected
          ]}>
            {type.label}
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
    marginBottom: SPACING.lg,
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
    textAlign: 'center',
  },
  labelSelected: {
    color: COLORS.background,
    fontWeight: FONT.weight.semiBold,
  },
}); 