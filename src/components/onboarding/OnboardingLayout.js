import React from 'react';
import { StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Surface } from 'react-native-paper';
import { SPACING } from '../../config/theme';
import OnboardingHeader from './OnboardingHeader';
import OnboardingFooter from './OnboardingFooter';

// Debug logger
const debug = {
  log: (message) => {
    console.log(`[OnboardingLayout] ${message}`);
  }
};

const OnboardingLayout = ({ 
  children,
  title,
  subtitle,
  currentStep,
  totalSteps,
  showProgress = true,
  onBack,
  onNext,
  nextLabel = 'Continue',
  backLabel = 'Back',
  nextDisabled = false,
  hideBackButton = false,
}) => {
  debug.log(`Rendering layout with step ${currentStep}/${totalSteps}`);
  
  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader
        title={title}
        subtitle={subtitle}
        currentStep={currentStep}
        totalSteps={totalSteps}
        showProgress={showProgress}
      />
      
      <Surface style={styles.content} elevation={0}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </Surface>

      <OnboardingFooter
        onBack={onBack}
        onNext={onNext}
        nextLabel={nextLabel}
        backLabel={backLabel}
        nextDisabled={nextDisabled}
        hideBackButton={hideBackButton}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
});

export default OnboardingLayout; 