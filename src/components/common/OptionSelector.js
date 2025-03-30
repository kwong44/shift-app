import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SPACING, SHADOWS } from '../../config/theme';

const OptionSelector = ({
  options,
  selectedOptions,
  onSelect,
  multiple = false,
  label,
}) => {
  const handleSelect = (option) => {
    if (multiple) {
      if (selectedOptions.includes(option)) {
        onSelect(selectedOptions.filter(item => item !== option));
      } else {
        onSelect([...selectedOptions, option]);
      }
    } else {
      onSelect(option);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const isSelected = multiple 
            ? selectedOptions.includes(option)
            : selectedOptions === option;
            
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                isSelected && styles.selectedOption,
              ]}
              onPress={() => handleSelect(option)}
            >
              <Text 
                style={[
                  styles.optionText,
                  isSelected && styles.selectedOptionText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  option: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    margin: SPACING.xs,
    ...SHADOWS.small,
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    color: COLORS.text,
    fontSize: FONT.size.md,
  },
  selectedOptionText: {
    color: COLORS.background,
    fontWeight: FONT.weight.medium,
  },
});

export default OptionSelector; 