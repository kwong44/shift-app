import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT, SPACING, SHADOWS, RADIUS, GRADIENTS } from '../../config/theme';

const OptionSelector = ({
  options,
  selectedOptions,
  onSelect,
  multiple = false,
  label,
  colorScheme = 'default', // 'default', 'blue', 'pink', 'teal', 'coral'
  renderOption = null, // Custom render function for option content
  optionStyle,
  containerStyle,
}) => {
  // Debug log when selection changes
  console.debug("Selected options:", multiple ? selectedOptions : [selectedOptions]);

  const getGradientColors = (option, index) => {
    // Use predefined gradient colors based on the colorScheme
    switch (colorScheme) {
      case 'blue':
        return [COLORS.blueGradient.start, COLORS.blueGradient.end];
      case 'pink':
        return [COLORS.yellowGradient.start, COLORS.yellowGradient.end];
      case 'teal':
        return [COLORS.tealGradient.start, COLORS.tealGradient.end];
      case 'coral':
        return [COLORS.coralGradient.start, COLORS.coralGradient.end];
      default:
        return [COLORS.purpleGradient.start, COLORS.purpleGradient.end];
    }
  };

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

  const renderOptionContent = (option, isSelected, index) => {
    // If custom render function is provided, use it
    if (renderOption) {
      return renderOption(option, isSelected, index);
    }

    // Default rendering with just text
    return (
      <Text 
        style={[
          styles.optionText,
          isSelected && styles.selectedOptionText,
        ]}
      >
        {option}
      </Text>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
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
                styles.optionWrapper,
                optionStyle,
              ]}
              onPress={() => handleSelect(option)}
              activeOpacity={0.7}
            >
              {isSelected ? (
                <LinearGradient
                  colors={getGradientColors(option, index)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={[styles.option, styles.selectedOption]}
                >
                  {renderOptionContent(option, isSelected, index)}
                </LinearGradient>
              ) : (
                <View style={[styles.option]}>
                  {renderOptionContent(option, isSelected, index)}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  optionWrapper: {
    margin: SPACING.xs,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  option: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedOption: {
    backgroundColor: 'transparent', // The gradient will provide the background
    borderRadius: RADIUS.md,
  },
  optionText: {
    color: COLORS.text,
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.medium,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: COLORS.textOnColor,
    fontWeight: FONT.weight.semiBold,
  },
});

export default OptionSelector; 