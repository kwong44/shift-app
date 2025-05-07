import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';

export const InstructionCard = () => {
  // Debug log
  console.debug('InstructionCard rendered');

  return (
    <Card style={styles.card} elevation={3}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Mindful Awareness</Text>
          <IconButton 
            icon="meditation" 
            size={24} 
            iconColor={COLORS.accent}
            style={styles.headerIcon}
          />
        </View>
        <Text style={styles.instruction}>
          Choose a mindfulness practice, select your current emotions, and begin your session. Mindfulness helps reduce stress and improve mental clarity.
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
  },
  headerIcon: {
    backgroundColor: COLORS.accent + '20',
    borderRadius: RADIUS.sm,
  },
  instruction: {
    color: COLORS.textLight,
    lineHeight: 20,
    fontSize: FONT.size.sm,
  },
}); 