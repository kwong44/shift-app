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
      {/* Minimal, subtle card design */}
      <View style={styles.cardContent}>
        {/* Compact instructions section */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            {selectedType.instructions}
          </Text>
        </View>
        
        {/* Compact emotions section - only show if emotions exist */}
        {selectedEmotions.length > 0 && (
          <View style={styles.emotionsSection}>
            <Text style={styles.emotionsLabel}>Your emotions: </Text>
            <View style={styles.emotionsRow}>
              {selectedEmotions.map((emotion, index) => (
                <Text key={emotion} style={styles.emotionText}>
                  {emotion}{index < selectedEmotions.length - 1 ? ', ' : ''}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: SPACING.lg, // Reduced from xl
  },
  cardContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  instructionsContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)', // Much more subtle
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', // Very subtle border
  },
  instructionsText: {
    fontSize: FONT.size.sm,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18, // Tighter line height
    fontWeight: FONT.weight.regular,
    textAlign: 'center',
  },
  emotionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  emotionsLabel: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.medium,
    color: 'rgba(255,255,255,0.7)',
  },
  emotionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emotionText: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.medium,
    color: 'rgba(255,255,255,0.8)',
  },
}); 