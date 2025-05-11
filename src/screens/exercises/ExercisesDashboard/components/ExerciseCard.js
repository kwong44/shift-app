import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';

// Debug logging
console.debug('ExerciseCard mounted');

const ExerciseCard = ({ exercise, isCompleted, onPress, style }) => {
  const handlePress = async () => {
    await Haptics.selectionAsync();
    onPress(exercise);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.container, style]}
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
        
        <View style={styles.contentContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {exercise.title}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {exercise.description}
            </Text>
          </View>
          
          <Text style={styles.duration}>
            {exercise.duration}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    flexDirection: 'row',
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
    marginRight: SPACING.md,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING.md,
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
  },
  description: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
  },
  duration: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
    paddingLeft: SPACING.sm,
  },
});

export default ExerciseCard; 