import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
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

  const handleSelect = async (typeValue) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectType(typeValue);
  };

  // Use the teal gradient color for mindfulness
  const mindfulnessColor = COLORS.tealGradient.start;

  return (
    <View style={styles.container}>
      <View style={styles.optionsContainer}>
        {mindfulnessTypes.map((type) => {
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
                    color={mindfulnessColor} 
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
  optionsContainer: {
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    ...SHADOWS.small,
  },
  selectedCard: {
    backgroundColor: `${COLORS.tealGradient.start}08`,
    borderWidth: 1,
    borderColor: `${COLORS.tealGradient.start}30`,
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