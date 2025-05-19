import React from 'react';
import { StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS, FONT, SHADOWS } from '../../../../config/theme';

// Debug logging
console.debug('ExerciseCard mounted');

// Custom icon mappings with enhanced visuals and matching gradients
const ENHANCED_ICONS = {
  'headphones': {
    icon: 'headphones-bluetooth',
    gradient: [COLORS.indigoGradient.start, COLORS.indigoGradient.end]
  },
  'eye': {
    icon: 'eye-plus-outline',
    gradient: [COLORS.coralGradient.start, COLORS.coralGradient.end]
  },
  'checkbox-marked-outline': {
    icon: 'format-list-checks',
    gradient: [COLORS.purpleGradient.start, COLORS.purpleGradient.end]
  },
  'timer-outline': {
    icon: 'timer-sand',
    gradient: [COLORS.blueGradient.start, COLORS.blueGradient.end]
  },
  'meditation': {
    icon: 'head-heart-outline',
    gradient: [COLORS.tealGradient.start, COLORS.tealGradient.end]
  },
  'book-outline': {
    icon: 'notebook-outline',
    gradient: [COLORS.pinkGradient.start, COLORS.pinkGradient.end]
  }
};

const ExerciseCard = ({ exercise, isCompleted, onPress, style }) => {
  // Animation for card press
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  // Get enhanced icon data
  const enhancedIcon = ENHANCED_ICONS[exercise.icon] || { 
    icon: exercise.icon, 
    gradient: [COLORS.purpleGradient.start, COLORS.purpleGradient.end] 
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 7,
      tension: 40,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true
    }).start();
  };

  const handlePress = async () => {
    await Haptics.selectionAsync();
    onPress(exercise);
  };

  return (
    <Animated.View style={[
      styles.container, 
      style, 
      { transform: [{ scale: scaleAnim }] }
    ]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        accessible={true}
        accessibilityLabel={`${exercise.title} exercise`}
        accessibilityHint={`Takes ${exercise.duration} to complete`}
        style={styles.touchable}
      >
        <View style={[styles.card, { borderColor: `${enhancedIcon.gradient[0]}30` }]}>
          <LinearGradient
            colors={enhancedIcon.gradient}
            style={styles.iconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons 
              name={enhancedIcon.icon} 
              size={26} 
              color="#FFFFFF"
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
          </LinearGradient>
          
          <View style={styles.contentContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {exercise.title}
              </Text>
              <Text style={styles.description} numberOfLines={2}>
                {exercise.description}
              </Text>
            </View>
            
            <View style={styles.durationContainer}>
              <MaterialCommunityIcons 
                name="clock-outline" 
                size={14} 
                color={COLORS.textLight} 
                style={styles.durationIcon}
              />
              <Text style={styles.duration}>
                {exercise.duration}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  touchable: {
    width: '100%',
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.small,
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
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: SPACING.xxs,
    paddingHorizontal: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  durationIcon: {
    marginRight: 4,
  },
  duration: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
  },
});

export default ExerciseCard; 