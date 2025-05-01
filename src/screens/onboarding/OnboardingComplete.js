import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  Text, 
  useTheme,
  ActivityIndicator,
  Portal,
  Dialog,
  List,
  Button
} from 'react-native-paper';
import { CommonActions } from '@react-navigation/native';
import { SPACING } from '../../config/theme';
import { supabase } from '../../config/supabase';
import { submitSelfAssessment } from '../../api/selfAssessment';
import { createRoadmap } from '../../api/roadmap';
import { OnboardingLayout, OnboardingCard } from '../../components/onboarding';

// Debug logger
const debug = {
  log: (message) => {
    console.log(`[OnboardingComplete] ${message}`);
  }
};

const OnboardingComplete = ({ navigation, route }) => {
  const { assessmentData } = route.params || { assessmentData: {} };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const theme = useTheme();
  
  const validateAssessmentData = () => {
    debug.log('Validating assessment data');
    if (!assessmentData.currentHabits?.length) {
      return 'Please complete the habits section of the assessment';
    }
    
    if (!assessmentData.engagementPrefs?.preferredTime || 
        !assessmentData.engagementPrefs?.sessionLength || 
        !assessmentData.engagementPrefs?.reminderFrequency || 
        !assessmentData.engagementPrefs?.preferredExercises?.length) {
      return 'Please complete your engagement preferences';
    }
    
    return null;
  };
  
  const handleComplete = async () => {
    debug.log('Starting completion process');
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      debug.log('Submitting assessment data');
      await submitSelfAssessment(user.id, assessmentData);

      debug.log('Creating initial roadmap');
      await createRoadmap(user.id, assessmentData);

      debug.log('Navigating to HomeScreen');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'HomeScreen' }],
        })
      );
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setError(error.message);
      setShowDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogConfirm = () => {
    debug.log('Confirming dialog');
    setShowDialog(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeScreen' }],
    });
  };

  return (
    <OnboardingLayout
      title="Assessment Complete!"
      subtitle="Thank you for sharing your journey with us. We're ready to craft your personalized transformation roadmap."
      currentStep={5}
      totalSteps={5}
      onNext={handleComplete}
      nextLabel={loading ? "Creating..." : "Generate My Roadmap"}
      nextDisabled={loading}
      hideBackButton
    >
      <OnboardingCard>
        <Text variant="titleLarge" style={styles.summaryTitle}>
          Here's what we've learned about you:
        </Text>
        
        <List.Section>
          <List.Subheader>Current Habits</List.Subheader>
          <Text variant="bodyLarge" style={styles.sectionValue}>
            {assessmentData.currentHabits?.length > 0 
              ? assessmentData.currentHabits.join(', ')
              : 'None specified'}
          </Text>

          <List.Subheader>Areas to Improve</List.Subheader>
          <Text variant="bodyLarge" style={styles.sectionValue}>
            {assessmentData.improvementAreas?.length > 0
              ? assessmentData.improvementAreas.join(', ')
              : 'None specified'}
          </Text>

          <List.Subheader>Preferred Engagement</List.Subheader>
          <Text variant="bodyLarge" style={styles.sectionValue}>
            {assessmentData.engagementPrefs?.preferredTime || 'Not specified'} for {' '}
            {assessmentData.engagementPrefs?.sessionLength || 'any duration'}
          </Text>
        </List.Section>
      </OnboardingCard>
      
      {error && (
        <OnboardingCard style={{ backgroundColor: theme.colors.errorContainer }}>
          <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
            {error}
          </Text>
        </OnboardingCard>
      )}
      
      <OnboardingCard>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          Next, we'll use AI to generate your personalized roadmap. This may take a moment as we analyze your responses and create a plan tailored just for you.
        </Text>
      </OnboardingCard>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text 
            variant="bodyLarge"
            style={[styles.loadingText, { color: theme.colors.primary }]}
          >
            Creating your roadmap...
          </Text>
        </View>
      )}

      <Portal>
        <Dialog visible={showDialog} onDismiss={handleDialogConfirm}>
          <Dialog.Title>Assessment Complete!</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Your personalized transformation roadmap has been created. Let's begin your journey!
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleDialogConfirm}>Start Journey</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  summaryTitle: {
    marginBottom: SPACING.md,
  },
  sectionValue: {
    marginBottom: SPACING.md,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  loadingText: {
    marginTop: SPACING.sm,
  },
});

export default OnboardingComplete; 