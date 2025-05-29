import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS, FONT } from '../../../../config/theme';

/**
 * Component to display pattern-based exercise recommendations
 * Based on user's journaling patterns and exercise history
 */
const PatternRecommendationCard = ({ 
  patternAnalysis, 
  onNavigateToExercise, 
  onDismiss,
  visible = true 
}) => {
  const [dismissed, setDismissed] = useState(false);

  console.debug('[PatternRecommendationCard] Rendering with pattern analysis:', patternAnalysis);

  // Don't show if dismissed or no pattern detected
  if (dismissed || !visible || !patternAnalysis?.pattern_detected) {
    return null;
  }

  const { pattern_description, recommendation } = patternAnalysis;

  const handleNavigateToExercise = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.debug('[PatternRecommendationCard] Navigating to exercise:', recommendation.exercise_id);
      
      if (onNavigateToExercise) {
        onNavigateToExercise(recommendation);
      } else {
        Alert.alert(
          'Exercise Recommendation',
          `We recommend trying: ${recommendation.exercise_type}\n\n${recommendation.reasoning}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('[PatternRecommendationCard] Error navigating to exercise:', error);
    }
  };

  const handleDismiss = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setDismissed(true);
      if (onDismiss) {
        onDismiss();
      }
    } catch (error) {
      console.error('[PatternRecommendationCard] Error dismissing recommendation:', error);
    }
  };

  // Get exercise type icon
  const getExerciseIcon = (exerciseType) => {
    switch (exerciseType) {
      case 'Mindfulness':
        return 'meditation';
      case 'Visualization':
        return 'eye';
      case 'Deep Work':
        return 'brain';
      case 'Task Planning':
        return 'clipboard-list-outline';
      default:
        return 'lightbulb-outline';
    }
  };

  return (
    <Card style={styles.card} elevation={2}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons 
            name="chart-line" 
            size={20} 
            color={COLORS.primary} 
            style={styles.patternIcon}
          />
          <Text style={styles.title}>Pattern Detected</Text>
        </View>
        <IconButton
          icon="close"
          size={18}
          iconColor={COLORS.textLight}
          onPress={handleDismiss}
          style={styles.dismissButton}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.patternDescription}>
          {pattern_description}
        </Text>

        <View style={styles.recommendationSection}>
          <Text style={styles.recommendationLabel}>Recommended Exercise:</Text>
          
          <View style={styles.exerciseInfo}>
            <MaterialCommunityIcons 
              name={getExerciseIcon(recommendation.exercise_type)} 
              size={24} 
              color={COLORS.accent} 
              style={styles.exerciseIcon}
            />
            <View style={styles.exerciseDetails}>
              <Text style={styles.exerciseType}>{recommendation.exercise_type}</Text>
              <Text style={styles.exerciseTrigger}>{recommendation.trigger}</Text>
            </View>
          </View>

          <Text style={styles.reasoning}>
            {recommendation.reasoning}
          </Text>

          {recommendation.personalization && (
            <View style={styles.personalizationBox}>
              <MaterialCommunityIcons 
                name="account-heart" 
                size={16} 
                color={COLORS.primary} 
                style={styles.personalizationIcon}
              />
              <Text style={styles.personalization}>
                {recommendation.personalization}
              </Text>
            </View>
          )}
        </View>

        <Button
          mode="contained"
          onPress={handleNavigateToExercise}
          style={styles.tryButton}
          contentStyle={styles.tryButtonContent}
          labelStyle={styles.tryButtonLabel}
        >
          Try This Exercise
        </Button>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patternIcon: {
    marginRight: SPACING.xs,
  },
  title: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
  },
  dismissButton: {
    margin: 0,
  },
  content: {
    padding: SPACING.md,
    paddingTop: SPACING.xs,
  },
  patternDescription: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  recommendationSection: {
    marginBottom: SPACING.md,
  },
  recommendationLabel: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  exerciseIcon: {
    marginRight: SPACING.sm,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseType: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semiBold,
    color: COLORS.text,
  },
  exerciseTrigger: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
    marginTop: 2,
  },
  reasoning: {
    fontSize: FONT.size.sm,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  personalizationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${COLORS.primary}10`,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  personalizationIcon: {
    marginRight: SPACING.xs,
    marginTop: 2,
  },
  personalization: {
    flex: 1,
    fontSize: FONT.size.sm,
    color: COLORS.text,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  tryButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
  },
  tryButtonContent: {
    paddingVertical: SPACING.xs,
  },
  tryButtonLabel: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semiBold,
    color: COLORS.surface,
  },
});

export default PatternRecommendationCard; 