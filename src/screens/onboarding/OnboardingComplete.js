import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { COLORS, FONT, SPACING } from '../../config/theme';
import CustomButton from '../../components/common/CustomButton';
import OnboardingHeader from '../../components/onboarding/OnboardingHeader';
import { supabase } from '../../config/supabase';
import { submitSelfAssessment } from '../../api/selfAssessment';

const OnboardingComplete = ({ navigation, route }) => {
  const { assessmentData } = route.params || { assessmentData: {} };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const validateAssessmentData = () => {
    if (!assessmentData.currentHabits?.length && 
        !assessmentData.improvementAreas?.length && 
        !Object.keys(assessmentData.longTermGoals || {}).length) {
      return 'Please complete at least one section of the assessment';
    }
    
    if (!assessmentData.engagementPrefs?.preferredTime || 
        !assessmentData.engagementPrefs?.sessionLength || 
        !assessmentData.engagementPrefs?.reminderFrequency || 
        !assessmentData.engagementPrefs?.preferredExercises?.length) {
      return 'Please complete your engagement preferences';
    }
    
    return null;
  };
  
  const handleSubmit = async () => {
    const validationError = validateAssessmentData();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not found. Please sign in again.');
      }
      
      // Submit the assessment data
      await submitSelfAssessment(user.id, assessmentData);
      
      // Show success message and navigate to App stack
      Alert.alert(
        'Assessment Complete!',
        'Your personalized transformation roadmap has been created. Let\'s begin your journey!',
        [
          {
            text: 'Start Journey',
            onPress: () => navigation.replace('App')
          }
        ]
      );
    } catch (error) {
      setError(error.message || 'Failed to submit assessment data. Please try again.');
      
      // Show error alert
      Alert.alert(
        'Submission Error',
        error.message || 'Failed to submit assessment data. Please try again.',
        [
          {
            text: 'Try Again',
            onPress: () => setError(null)
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingHeader
          title="Assessment Complete!"
          subtitle="Thank you for sharing your journey with us. We're ready to craft your personalized transformation roadmap."
        />
        
        <View style={styles.content}>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Here's what we've learned about you:</Text>
            
            <View style={styles.summarySection}>
              <Text style={styles.sectionLabel}>Current Habits:</Text>
              <Text style={styles.sectionValue}>
                {assessmentData.currentHabits?.length > 0 
                  ? assessmentData.currentHabits.join(', ')
                  : 'None specified'}
              </Text>
            </View>
            
            <View style={styles.summarySection}>
              <Text style={styles.sectionLabel}>Areas to Improve:</Text>
              <Text style={styles.sectionValue}>
                {assessmentData.improvementAreas?.length > 0
                  ? assessmentData.improvementAreas.join(', ')
                  : 'None specified'}
              </Text>
            </View>
            
            <View style={styles.summarySection}>
              <Text style={styles.sectionLabel}>Long-Term Goals:</Text>
              {assessmentData.longTermGoals && Object.keys(assessmentData.longTermGoals).length > 0 ? (
                Object.entries(assessmentData.longTermGoals).map(([key, value]) => (
                  <Text key={key} style={styles.goalItem}>• {value}</Text>
                ))
              ) : (
                <Text style={styles.sectionValue}>None specified</Text>
              )}
            </View>
            
            <View style={styles.summarySection}>
              <Text style={styles.sectionLabel}>Preferred Engagement:</Text>
              <Text style={styles.sectionValue}>
                {assessmentData.engagementPrefs?.preferredTime || 'Not specified'} for {' '}
                {assessmentData.engagementPrefs?.sessionLength || 'any duration'}
              </Text>
            </View>
          </View>
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          
          <Text style={styles.nextStepsText}>
            Next, we'll use AI to generate your personalized roadmap. This may take a moment as we analyze your responses and create a plan tailored just for you.
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Creating your roadmap...</Text>
          </View>
        ) : (
          <CustomButton
            title="Generate My Roadmap"
            onPress={handleSubmit}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  content: {
    flex: 1,
  },
  summaryContainer: {
    backgroundColor: COLORS.background,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  summaryTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  summarySection: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.medium,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  sectionValue: {
    fontSize: FONT.size.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  goalItem: {
    fontSize: FONT.size.md,
    color: COLORS.text,
    lineHeight: 22,
    marginTop: 2,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT.size.md,
    marginBottom: SPACING.lg,
  },
  nextStepsText: {
    fontSize: FONT.size.md,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: FONT.size.md,
    color: COLORS.primary,
    fontWeight: FONT.weight.medium,
  },
});

export default OnboardingComplete; 