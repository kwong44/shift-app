import React from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS, SPACING } from '../../../../config/theme';

// Debug logging
console.debug('DashboardHeader mounted');

const DashboardHeader = ({ scrollY }) => {
  // Calculate header opacity for scroll effect
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Daily Exercises</Text>
        <Text style={styles.headerSubtitle}>
          Develop habits that transform your life
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5', // Light gray color
  },
  headerContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.6)', // Slightly transparent dark text
    marginBottom: SPACING.sm,
  },
});

export default DashboardHeader; 