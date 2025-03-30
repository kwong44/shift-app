import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT, SPACING } from '../../config/theme';

const OnboardingHeader = ({ title, subtitle }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT.size.md,
    color: COLORS.textLight,
    lineHeight: 22,
  },
});

export default OnboardingHeader; 