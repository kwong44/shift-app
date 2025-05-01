import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, COLORS, RADIUS } from '../../config/theme';

// Debug logger
const debug = {
  log: (message) => {
    console.log(`[OnboardingFooter] ${message}`);
  }
};

const OnboardingFooter = ({ 
  onBack, 
  onNext, 
  nextLabel = 'Continue',
  backLabel = 'Back',
  nextDisabled = false,
  hideBackButton = false
}) => {
  debug.log(`Rendering footer with nextDisabled: ${nextDisabled}`);
  
  return (
    <View style={styles.footerContainer}>
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.95)', 'rgba(255,255,255,1)']}
        style={styles.gradient}
        pointerEvents="none"
      />
      <Surface style={styles.footer} elevation={0}>
        <View style={styles.buttonContainer}>
          {!hideBackButton && (
            <Button
              mode="outlined"
              onPress={onBack}
              style={[styles.button, styles.backButton]}
              contentStyle={styles.buttonContent}
            >
              {backLabel}
            </Button>
          )}
          <Button
            mode="contained"
            onPress={onNext}
            disabled={nextDisabled}
            style={[
              styles.button,
              hideBackButton && styles.fullWidthButton
            ]}
            contentStyle={styles.buttonContent}
          >
            {nextLabel}
          </Button>
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    width: '100%',
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    height: 40, // Adjust this value to control how far up the gradient extends
  },
  footer: {
    width: '100%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.xs,
  },
  button: {
    flex: 1,
    borderRadius: RADIUS.md,
  },
  fullWidthButton: {
    flex: undefined,
    width: '100%',
  },
  backButton: {
    marginRight: SPACING.md,
  },
  buttonContent: {
    paddingVertical: SPACING.sm,
  },
});

export default OnboardingFooter; 