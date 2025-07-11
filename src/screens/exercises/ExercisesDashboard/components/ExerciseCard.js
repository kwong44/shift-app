import React from 'react';
import { StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS, FONT, SHADOWS } from '../../../../config/theme';

// Debug logging
console.debug('[ExerciseCard] Component loaded with modern design');

// Enhanced icon mappings with improved gradients matching our theme
const ENHANCED_ICONS = {
  'headphones': {
    icon: 'headphones-bluetooth',
    gradient: ['#7D8CC4', '#5D6CAF'] // Indigo gradient for binaural beats
  },
  'eye': {
    icon: 'eye-plus-outline',
    gradient: ['#FF7675', '#FF5D5D'] // Coral gradient for visualization
  },
  'checkbox-marked-outline': {
    icon: 'format-list-checks',
    gradient: ['#6C63FF', '#5F52EE'] // Purple gradient for tasks
  },
  'timer-outline': {
    icon: 'timer-sand',
    gradient: ['#5AC8FA', '#4B9EF8'] // Blue gradient for deep work
  },
  'meditation': {
    icon: 'head-heart-outline',
    gradient: ['#00B894', '#007E66'] // Teal gradient for mindfulness
  },
  'book-outline': {
    icon: 'notebook-outline',
    gradient: ['#FFD700', '#FFA500'] // Yellow gradient for journaling
  },
  'weather-windy': {
    icon: 'weather-windy',
    gradient: ['#00B894', '#007E66'] // Teal for breath focus
  },
  'human': {
    icon: 'human',
    gradient: ['#00B894', '#007E66'] // Teal for body scan
  },
  'target': {
    icon: 'target',
    gradient: ['#FF7675', '#FF5D5D'] // Coral for goals visualization
  },
  'brain': {
    icon: 'brain',
    gradient: ['#7D8CC4', '#5D6CAF'] // Indigo for focus beats
  }
};

const ExerciseCard = ({ exercise, isCompleted, onPress, style, isFavorite, onToggleFavorite }) => {
  // Animation for card press
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const favoriteAnim = React.useRef(new Animated.Value(1)).current;
  
  console.debug('[ExerciseCard] Rendering card for:', exercise.title, { 
    isCompleted, 
    isFavorite, 
    type: exercise.type,
    shadowApplied: 'SHADOWS.medium on container'
  });
  
  // Get enhanced icon data
  const enhancedIcon = ENHANCED_ICONS[exercise.icon] || { 
    icon: exercise.icon, 
    gradient: ['#6C63FF', '#5F52EE'] // Default purple gradient
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 8,
      tension: 100,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 100,
      useNativeDriver: true
    }).start();
  };

  const handlePress = async () => {
    await Haptics.selectionAsync();
    console.debug('[ExerciseCard] Exercise pressed:', exercise.title);
    onPress(exercise);
  };

  const handleFavoritePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animate favorite button
    Animated.sequence([
      Animated.spring(favoriteAnim, {
        toValue: 1.3,
        friction: 4,
        tension: 100,
        useNativeDriver: true
      }),
      Animated.spring(favoriteAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true
      })
    ]).start();
    
    if (onToggleFavorite) {
      console.debug('[ExerciseCard] Toggling favorite for:', exercise.title, 'Current state:', isFavorite);
      onToggleFavorite(exercise.id, isFavorite);
    } else {
      console.debug('[ExerciseCard] onToggleFavorite not provided, favorite action skipped.');
    }
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
        accessibilityHint={`Takes ${exercise.defaultDurationText || exercise.duration} to complete`}
        style={styles.touchable}
      >
        <View style={styles.card}>
          {/* Icon with gradient background */}
          <LinearGradient
            colors={enhancedIcon.gradient}
            style={styles.iconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons 
              name={enhancedIcon.icon} 
              size={28} 
              color={COLORS.white}
            />
            {isCompleted && (
              <View style={styles.completedBadge}>
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={20} 
                  color={COLORS.success} 
                />
              </View>
            )}
          </LinearGradient>
          
          {/* Content section */}
          <View style={styles.contentContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {exercise.title}
              </Text>
              <Text style={styles.description} numberOfLines={2}>
                {exercise.description}
              </Text>
              
              {/* Duration and type info */}
              <View style={styles.metaContainer}>
                <View style={styles.durationChip}>
                  <MaterialCommunityIcons 
                    name="clock-outline" 
                    size={14} 
                    color={COLORS.textLight}
                  />
                  <Text style={[styles.durationText]}>
                    {exercise.defaultDurationText || exercise.duration}
                  </Text>
                </View>
                
                <View style={styles.typeChip}>
                  <Text style={styles.typeText}>
                    {exercise.type}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Favorite button */}
            {onToggleFavorite && (
              <Animated.View style={[
                styles.favoriteContainer,
                { transform: [{ scale: favoriteAnim }] }
              ]}>
                <TouchableOpacity
                  onPress={handleFavoritePress}
                  style={[
                    styles.favoriteButton,
                    isFavorite && styles.favoriteButtonActive
                  ]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialCommunityIcons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isFavorite ? COLORS.white : COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
          
          {/* Subtle accent line */}
          <LinearGradient
            colors={[...enhancedIcon.gradient, 'transparent']}
            style={styles.accentLine}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
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
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
    position: 'relative',
    ...SHADOWS.small,
  },
  completedBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
  title: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: FONT.size.lg * 1.2,
  },
  description: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    lineHeight: FONT.size.sm * 1.4,
    marginBottom: SPACING.sm,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  durationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    gap: SPACING.xs,
  },
  durationText: {
    color: COLORS.textLight,
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.medium,
  },
  typeChip: {
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  typeText: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.medium,
    color: COLORS.textLight,
  },
  favoriteContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  favoriteButtonActive: {
    backgroundColor: COLORS.accent,
  },
  accentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});

export default ExerciseCard; 