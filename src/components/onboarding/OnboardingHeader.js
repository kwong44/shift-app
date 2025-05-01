import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { SPACING, COLORS, FONT } from '../../config/theme';

// Debug logger
const debug = {
  log: (message) => {
    console.log(`[OnboardingHeader] ${message}`);
  }
};

const OnboardingHeader = ({ 
  title = "Self Assessment",
  subtitle, 
  currentStep,
  totalSteps = 5,
  showProgress = true
}) => {
  debug.log(`Rendering header with step ${currentStep}/${totalSteps}`);
  
  const progress = currentStep / totalSteps;
  
  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.headerSubtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      
      {showProgress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progress * 100}%` }
              ]} 
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundLight,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    marginBottom: SPACING.md,
  },
  headerTitle: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontWeight: FONT.weight.bold,
  },
  headerSubtitle: {
    color: COLORS.textLight,
    fontSize: FONT.size.md,
    lineHeight: 22,
  },
  progressContainer: {
    marginTop: SPACING.xs,
  },
  progressBackground: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
});

export default OnboardingHeader; 