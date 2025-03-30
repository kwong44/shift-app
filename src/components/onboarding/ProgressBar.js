import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../config/theme';

const ProgressBar = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <View style={styles.container}>
      <View style={styles.background}>
        <View style={[styles.fill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  background: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
});

export default ProgressBar; 