import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';
import { LinearGradient } from 'expo-linear-gradient';

const ProgressSection = ({ 
  dailyProgress, 
  streak, 
  currentMood, 
  onMoodPress, 
  MOODS 
}) => {
  const [animatedProgress] = React.useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: dailyProgress || 0,
      duration: 1000,
      useNativeDriver: false
    }).start();
  }, [dailyProgress]);

  return (
    <LinearGradient
      colors={[COLORS.purpleGradient.start, COLORS.purpleGradient.end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.headerGradient}
    >
      <View style={styles.headerContent}>
        <TouchableRipple style={styles.streakContainer}>
          <View style={styles.streakBadge}>
            <MaterialCommunityIcons name="fire" size={20} color={COLORS.textOnColor} />
            <Text style={styles.streakText}>{streak} day streak</Text>
          </View>
        </TouchableRipple>
        
        <TouchableRipple 
          onPress={onMoodPress} 
          style={styles.moodButton}
          accessible={true}
          accessibilityLabel="Set your mood"
          accessibilityHint="Opens mood selection dialog"
        >
          <View style={styles.moodContent}>
            <Text style={styles.moodEmoji}>
              {currentMood ? MOODS.find(m => m.id === currentMood)?.icon || '😊' : '😶'}
            </Text>
            <Text style={styles.moodLabel}>
              {currentMood ? MOODS.find(m => m.id === currentMood)?.label : 'Add Mood'}
            </Text>
          </View>
        </TouchableRipple>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>Daily Progress</Text>
        <View style={styles.progressBarContainer}>
          <Animated.View 
            style={[
              styles.progressBarFill,
              {
                width: animatedProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }
            ]}
          />
        </View>
        <View style={styles.progressCircle}>
          <Text style={styles.progressCircleText}>{Math.round((dailyProgress || 0) * 100)}%</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    padding: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  streakContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: RADIUS.md,
    padding: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    color: COLORS.textOnColor,
    fontWeight: FONT.weight.medium,
    fontSize: FONT.size.sm,
    marginLeft: 4,
  },
  moodButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: RADIUS.md,
    padding: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  moodContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  moodEmoji: {
    fontSize: 22,
    marginRight: SPACING.xs,
  },
  moodLabel: {
    color: COLORS.textOnColor,
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
  },
  progressSection: {
    position: 'relative',
    marginTop: SPACING.sm,
  },
  progressTitle: {
    color: COLORS.textOnColor,
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semiBold,
    marginBottom: SPACING.xs,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginRight: 46,
    marginTop: SPACING.md,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  progressCircle: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleText: {
    color: COLORS.textOnColor,
    fontWeight: FONT.weight.bold,
    fontSize: FONT.size.xs,
  },
});

export default ProgressSection; 