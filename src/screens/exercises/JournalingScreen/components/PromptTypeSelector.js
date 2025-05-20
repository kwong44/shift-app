import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../../config/theme';

// Debug logging
console.debug('PromptTypeSelector mounted');

export const PromptTypeSelector = ({ 
  promptTypes, 
  selectedPromptType, 
  onSelectPromptType 
}) => {
  const handleSelect = async (value) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectPromptType(value);
  };

  // Use pink gradient color for journaling
  const journalingColor = COLORS.pinkGradient.start;

  return (
    <View style={styles.container}>
      {promptTypes.map((type) => {
        const isSelected = selectedPromptType.value === type.value;
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
              <View style={styles.contentWrapper}>
                <View style={styles.headerRow}>
                  <Text style={styles.optionTitle}>
                    {type.label}
                  </Text>
                  <Text style={styles.optionHighlight}>
                    {type.duration}
                  </Text>
                </View>
                <Text style={styles.optionDescription} numberOfLines={2}>
                  {type.description}
                </Text>
              </View>
              
              {isSelected && (
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={22} 
                  color={journalingColor} 
                  style={styles.checkIcon}
                />
              )}
            </Card.Content>
          </Card>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    ...SHADOWS.small,
  },
  selectedCard: {
    backgroundColor: `${COLORS.pinkGradient.start}08`,
    borderWidth: 1,
    borderColor: `${COLORS.pinkGradient.start}30`,
  },
  cardContent: {
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  optionTitle: {
    color: COLORS.text,
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
  },
  optionDescription: {
    color: COLORS.textLight,
    fontSize: FONT.size.sm,
    lineHeight: 20,
  },
  optionHighlight: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
    color: COLORS.pinkGradient.start,
  },
  checkIcon: {
    marginLeft: SPACING.sm,
  },
}); 