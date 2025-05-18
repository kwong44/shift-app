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
    <LinearGradient
      colors={[COLORS.primary + '20', COLORS.backgroundLight]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.View 
        style={[
          styles.headerContainer, 
          { 
            opacity: headerOpacity,
            transform: [{ scale: headerScale }]
          }
        ]}
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
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerContainer: {
    width: '100%',
  },
  headerContent: {
    padding: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  greetingContainer: {
    marginBottom: SPACING.xs,
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