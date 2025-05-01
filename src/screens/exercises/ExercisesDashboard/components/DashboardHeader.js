import React from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../../../../config/theme';

// Debug logging
console.debug('DashboardHeader mounted');

const DashboardHeader = ({ completedCount, totalExercises, progressAnimation, scrollY }) => {
  const progressPercentage = (completedCount / totalExercises) * 100;
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>Daily Exercises</Text>
        <Text style={styles.headerSubtitle}>
          Develop habits that transform your life
        </Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {completedCount} of {totalExercises} completed
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <Animated.View 
              style={[
                styles.progressBarFill, 
                { 
                  width: progressAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  }) 
                }
              ]} 
            />
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.lg,
  },
  progressContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressText: {
    color: COLORS.background,
    fontWeight: '600',
    fontSize: 16,
  },
  progressPercentage: {
    color: COLORS.background,
    fontWeight: '700',
    fontSize: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
});

export default DashboardHeader; 