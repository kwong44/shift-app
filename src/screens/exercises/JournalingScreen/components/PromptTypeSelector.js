import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Card, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';

export const PromptTypeSelector = ({ 
  promptTypes, 
  selectedPromptType, 
  onSelectPromptType 
}) => {
  // Debug log
  console.debug('PromptTypeSelector rendered', { selectedPromptType: selectedPromptType.value });

  const renderPromptTypeOption = (type) => {
    const isSelected = selectedPromptType.value === type.value;
    
    return (
      <TouchableRipple
        key={type.value}
        onPress={() => onSelectPromptType(type.value)}
        style={styles.typeOptionWrapper}
      >
        <Card 
          style={[
            styles.typeOption,
            isSelected && { 
              borderColor: type.color,
              borderWidth: 2
            }
          ]} 
          elevation={isSelected ? 4 : 2}
        >
          <LinearGradient
            colors={[`${type.color}15`, `${type.color}05`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.optionGradient}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${type.color}25` }]}>
              <MaterialCommunityIcons name={type.icon} size={28} color={type.color} />
            </View>
            
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{type.label}</Text>
              <Text style={styles.optionDescription}>
                {type.description}
              </Text>
            </View>
            
            {isSelected && (
              <MaterialCommunityIcons name="check-circle" size={22} color={type.color} />
            )}
          </LinearGradient>
        </Card>
      </TouchableRipple>
    );
  };

  return (
    <View style={styles.container}>
      {promptTypes.map(renderPromptTypeOption)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  typeOptionWrapper: {
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  typeOption: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.small,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginBottom: 2,
  },
  optionDescription: {
    color: COLORS.textLight,
    fontSize: FONT.size.sm,
  },
}); 