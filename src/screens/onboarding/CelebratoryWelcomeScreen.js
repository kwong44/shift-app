import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { OnboardingLayout } from '../../components/onboarding';
import { SPACING, FONT, COLORS } from '../../config/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[CelebratoryWelcomeScreen] ${message}`, data);
  }
};

const CelebratoryWelcomeScreen = ({ navigation }) => {
  debug.log('Screen loaded');

  const handleContinue = () => {
    debug.log('Navigating to ScienceIntroNeuroscienceScreen');
    navigation.navigate('ScienceIntroNeuroscience'); 
  };

  return (
    <OnboardingLayout
      title="You've Taken the First Step!"
      subtitle="You have two lives. The second begins when you realize you only have one."
      hideBackButton={true}
      hideProgress={true} // No progress bar on this very first screen
      onNext={handleContinue}
      nextButtonLabel="Let's Begin!"
      currentStep={1}
      totalSteps={12}
    >
      <View style={styles.contentContainer}>
        <MaterialCommunityIcons 
          name="party-popper" 
          size={100} 
          color={COLORS.primary} 
          style={styles.icon} 
        />
        <Text variant="headlineMedium" style={styles.mainMessage}>
          Welcome to RealityShift™!
        </Text>
        <Text variant="bodyLarge" style={styles.subMessage}>
          We're thrilled to have you on board. Get ready for an incredible journey of transformation.
        </Text>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl * 2, // Extra padding at the bottom
  },
  icon: {
    marginBottom: SPACING.xl,
  },
  mainMessage: {
    textAlign: 'center',
    fontWeight: FONT.weight.bold,
    color: COLORS.textHeader,
    marginBottom: SPACING.md,
  },
  subMessage: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    lineHeight: FONT.size.lg * 1.5,
  }
});

export default CelebratoryWelcomeScreen; 