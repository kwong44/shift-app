import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

  // Use the indigo gradient color for binaural beats
  const binauralColor = COLORS.indigoGradient.start;

  return (
    <View style={styles.container}>
      {Object.entries(FREQUENCIES).map(([key, data]) => {
        const isSelected = selectedFrequency === key;
        return (
          <Card
            key={key}
            style={[
              styles.card,
              isSelected && styles.selectedCard
            ]}
            onPress={() => handleSelect(key)}
          >
            <Card.Content style={styles.cardContent}>
              <View style={styles.contentWrapper}>
                <View style={styles.headerRow}>
                  <Text style={styles.optionTitle}>
                    {data.name} <Text style={styles.optionFrequency}>{data.frequency} Hz</Text>
                  </Text>
                </View>
                <Text style={styles.optionDescription}>
                  {data.description}
                </Text>
              </View>
              
              {isSelected && (
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={22} 
                  color={binauralColor} 
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
    backgroundColor: `${COLORS.indigoGradient.start}08`,
    borderWidth: 1,
    borderColor: `${COLORS.indigoGradient.start}30`,
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
  optionFrequency: {
    color: COLORS.indigoGradient.start,
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
  },
  checkIcon: {
    marginLeft: SPACING.sm,
  },
});

export default FrequencySelector; 