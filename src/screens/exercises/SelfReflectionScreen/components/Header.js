import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, COLORS, RADIUS } from '../../../../config/theme';

export const Header = () => {
  // Debug log
  console.debug('SelfReflection Header rendered');

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      <Text style={styles.headerTitle}>Self-Reflection Exercise</Text>
      <Text style={styles.headerSubtitle}>
        Deepen your self-awareness and personal insights
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
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
    marginBottom: SPACING.sm,
  },
}); 