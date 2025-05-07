import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';

export const VisualizationTypeSelector = ({ 
  visualizationTypes, 
  selectedType, 
  onSelectType 
}) => {
  // Debug log
  console.debug('VisualizationTypeSelector rendered', { selectedType: selectedType.value });

  const renderVisualizationTypeOption = (type) => {
    const isSelected = selectedType.value === type.value;
    
    return (
      <TouchableRipple
        key={type.value}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSelectType(type.value);
        }}
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
              <Text style={styles.optionDescription}>{type.description}</Text>
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
      {visualizationTypes.map(renderVisualizationTypeOption)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SPACING.md,
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
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
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