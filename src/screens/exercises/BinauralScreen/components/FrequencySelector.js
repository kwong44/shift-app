import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../../config/theme';
import { FREQUENCIES } from '../constants';
import * as Haptics from 'expo-haptics';

// Debug logging
console.debug('FrequencySelector mounted');

const FrequencySelector = ({ selectedFrequency, onSelectFrequency }) => {
  const handleSelect = async (value) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectFrequency(value);
  };

  return (
    <View style={styles.container}>
      {Object.entries(FREQUENCIES).map(([key, data]) => (
        <Card
          key={key}
          style={[
            styles.card,
            selectedFrequency === key && styles.selectedCard
          ]}
          onPress={() => handleSelect(key)}
        >
          <Card.Content style={styles.cardContent}>
            <View style={styles.headerRow}>
              <Text style={styles.optionTitle}>
                {data.name}
              </Text>
              <Text style={styles.optionFrequency}>
                {data.frequency} Hz
              </Text>
            </View>
            <Text style={styles.optionDescription}>
              {data.description}
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
  selectedCard: {
    backgroundColor: COLORS.primary + '08',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
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
  optionFrequency: {
    color: COLORS.primary,
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
  },
});

export default FrequencySelector; 