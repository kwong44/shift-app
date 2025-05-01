import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';

// Debug logging
console.debug('ExerciseCard mounted');

const ExerciseCard = ({ exercise, isCompleted, onPress }) => {
  const handlePress = async () => {
    await Haptics.selectionAsync();
    onPress(exercise);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.container}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={`${exercise.title} exercise`}
      accessibilityHint={`Takes ${exercise.duration} to complete`}
    >
      <View style={[styles.card, { borderColor: `${exercise.color}30` }]}>
        <View style={[styles.iconContainer, { backgroundColor: `${exercise.color}15` }]}>
          <MaterialCommunityIcons 
            name={exercise.icon} 
            size={24} 
            color={exercise.color} 
          />
          {isCompleted && (
            <View style={styles.completedBadge}>
              <MaterialCommunityIcons 
                name="check" 
                size={12} 
                color={COLORS.background} 
              />
            </View>
          )}
        </View>
        
        <Text style={styles.title} numberOfLines={1}>
          {exercise.title}
        </Text>
        
        <Text style={styles.duration} numberOfLines={1}>
          {exercise.duration}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  completedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.round,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  title: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xxs,
    textAlign: 'center',
  },
  duration: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default ExerciseCard; 