import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';

// Debug logger
const debug = {
  log: (message) => {
    console.log(`[ProgressHeader] ${message}`);
  }
};

const ProgressHeader = () => {
  debug.log('Rendering progress header');
  return (
    <View style={styles.headerSection}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Your Progress</Text>
        <Text style={styles.headerSubtitle}>
          Track your transformation journey, stay consistent!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    marginBottom: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
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
    color: 'rgba(0, 0, 0, 0.6)',
    marginBottom: SPACING.sm,
  },
});

export default ProgressHeader;
