import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';

export const PracticeInstructions = ({ 
  selectedType 
}) => {
  // Debug log
  console.debug('PracticeInstructions rendered', { type: selectedType.value });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialCommunityIcons 
          name="information-outline" 
          size={24} 
          color={COLORS.background} 
        />
        <Text style={styles.title}>How to Practice</Text>
      </View>
      <Text style={styles.instructionsText}>
        {selectedType.instructions}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    color: COLORS.background,
    marginLeft: SPACING.sm,
  },
  instructionsText: {
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    fontSize: FONT.size.sm,
  },
}); 