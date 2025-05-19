import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';

const VisualizationTypeSelector = ({ 
  visualizationTypes, 
  selectedType, 
  onSelectType 
}) => {
  // Debug logging
  console.debug('VisualizationTypeSelector rendered', { 
    selectedType: selectedType.value,
    typesCount: visualizationTypes.length 
  });

  const handleSelect = async (type) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectType(type);
  };

  // Use the coral gradient color for visualization
  const visualizationColor = COLORS.coralGradient.start;

  return (
    <View style={styles.container}>
      <View style={styles.optionsContainer}>
        {visualizationTypes.map((type) => {
          const isSelected = selectedType.value === type.value;
          return (
            <Card
              key={type.value}
              style={[
                styles.card,
                isSelected && styles.selectedCard
              ]}
              onPress={() => handleSelect(type.value)}
            >
              <Card.Content style={styles.cardContent}>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{type.label}</Text>
                  <Text style={styles.optionDescription}>{type.description}</Text>
                </View>
                
                {isSelected && (
                  <MaterialCommunityIcons 
                    name="check-circle" 
                    size={22} 
                    color={visualizationColor} 
                    style={styles.checkIcon}
                  />
                )}
              </Card.Content>
            </Card>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
  },
  optionsContainer: {
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    ...SHADOWS.small,
  },
  selectedCard: {
    backgroundColor: `${COLORS.coralGradient.start}08`,
    borderWidth: 1,
    borderColor: `${COLORS.coralGradient.start}30`,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    color: COLORS.text,
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    marginBottom: 2,
  },
  optionDescription: {
    color: COLORS.textLight,
    fontSize: FONT.size.sm,
    lineHeight: 20,
  },
  checkIcon: {
    marginLeft: SPACING.sm,
  },
});

export default VisualizationTypeSelector; 