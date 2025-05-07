import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';

export const SessionCard = ({ 
  selectedType,
  selectedEmotions
}) => {
  // Debug log
  console.debug('SessionCard rendered', { 
    type: selectedType.value,
    emotionsCount: selectedEmotions.length
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Session</Text>
      
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          {selectedType.instructions}
        </Text>
      </View>
      
      <View style={styles.emotionsRow}>
        <Text style={styles.emotionsLabel}>Your emotions:</Text>
        {selectedEmotions.map(emotion => (
          <Chip 
            key={emotion} 
            style={styles.emotionChip}
            textStyle={styles.emotionChipText}
          >
            {emotion}
          </Chip>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
    ...SHADOWS.large,
  },
  title: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  instructionsContainer: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  instructionsText: {
    fontSize: FONT.size.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  emotionsLabel: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
    marginRight: SPACING.sm,
  },
  emotionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  emotionChip: {
    margin: 3,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  emotionChipText: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.medium,
    color: COLORS.textLight,
  },
}); 