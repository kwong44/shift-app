import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';

export const SessionDurationSelector = ({ 
  durations, 
  selectedDuration, 
  onSelectDuration 
}) => {
  // Debug log
  console.debug('SessionDurationSelector rendered', { selectedDuration });

  const handleSelect = async (duration) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectDuration(duration);
  };

  return (
    <View style={styles.container}>
      <View style={styles.optionsContainer}>
        {durations.map((duration) => {
          const isSelected = selectedDuration === duration.value;
          return (
            <Card
              key={duration.value}
              style={[
                styles.card,
                isSelected && styles.selectedCard
              ]}
              onPress={() => handleSelect(duration.value)}
            >
              <Card.Content style={styles.cardContent}>
                <View style={[styles.iconContainer, { backgroundColor: `${duration.color}15` }]}>
                  <MaterialCommunityIcons name={duration.icon} size={28} color={duration.color} />
                </View>
                
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{duration.label}</Text>
                  <Text style={styles.optionDescription}>{duration.description}</Text>
                </View>
                
                {isSelected && (
                  <MaterialCommunityIcons 
                    name="check-circle" 
                    size={22} 
                    color={duration.color} 
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
    backgroundColor: COLORS.primary + '08',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
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