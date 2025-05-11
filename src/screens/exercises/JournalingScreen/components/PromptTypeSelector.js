import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
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

  return (
    <View style={styles.container}>
      {promptTypes.map((type) => (
        <Card
          key={type.value}
          style={[
            styles.card,
            selectedPromptType.value === type.value && {
              backgroundColor: `${type.color}08`,
              borderWidth: 1,
              borderColor: `${type.color}30`,
            }
          ]}
          onPress={() => handleSelect(type.value)}
        >
          <Card.Content style={styles.cardContent}>
            <View style={styles.headerRow}>
              <Text style={styles.optionTitle}>
                {type.label}
              </Text>
              <Text 
                style={[
                  styles.optionHighlight,
                  { color: type.color }
                ]}
              >
                {type.duration}
              </Text>
            </View>
            <Text style={styles.optionDescription} numberOfLines={2}>
              {type.description}
            </Text>
          </Card.Content>
        </Card>
      ))}
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
  cardContent: {
    padding: SPACING.sm,
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
  },
}); 