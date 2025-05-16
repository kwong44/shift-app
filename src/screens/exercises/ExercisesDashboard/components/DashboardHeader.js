import React from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT, SHADOWS } from '../../../../config/theme';

// Debug logging
console.debug('DashboardHeader mounted');

// Helper function to get greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours();
  
  // Debug the current hour
  console.debug('Current hour:', hour);
  
  if (hour < 12) {
    return "Morning Routine";
  } else if (hour < 18) {
    return "Afternoon Practices";
  } else {
    return "Evening Habits";
  }
};

const DashboardHeader = ({ scrollY }) => {
  // Calculate header opacity for scroll effect
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  // Calculate header scale for scroll effect
  const headerScale = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.98],
    extrapolate: 'clamp',
  });

  // Get greeting message
  const greeting = getGreeting();

  return (
    <Animated.View 
      style={[
        styles.headerContainer, 
        { 
          opacity: headerOpacity,
          transform: [{ scale: headerScale }]
        }
      ]}
    >
      <LinearGradient
        colors={[COLORS.primary + '20', COLORS.backgroundLight]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>{greeting}</Text>
          </View>
          
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>Daily Exercises</Text>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="lightning-bolt" size={24} color={COLORS.accent} />
            </View>
          </View>
          <Text style={styles.headerSubtitle}>
            Develop habits that transform your life
          </Text>
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
    ...SHADOWS.small,
    height: 'auto',
  },
  gradient: {
    width: '100%',
  },
  headerContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  greetingContainer: {
    marginBottom: SPACING.sm,
  },
  greetingText: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT.size.md,
    color: COLORS.textLight,
    marginBottom: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
});

export default DashboardHeader; 