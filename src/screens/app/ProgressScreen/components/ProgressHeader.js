import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[ProgressHeader] ${message}`, data);
  }
};

const ProgressHeader = () => {
  debug.log('Rendering progress header');
  return (
    <View style={styles.headerSection}>
      <Text style={styles.headerTitle}>Your Progress</Text>
      <Text style={styles.headerSubtitle}>
        Track your transformation journey, stay consistent!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontFamily: FONT.family.heading,
    fontWeight: FONT.weight.bold,
    fontSize: FONT.size.xxxl,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontFamily: FONT.family.base,
    fontWeight: FONT.weight.regular,
    fontSize: FONT.size.md,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default ProgressHeader;
