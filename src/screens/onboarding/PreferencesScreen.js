import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { COLORS, FONT, SPACING } from '../../config/theme';
import CustomButton from '../../components/common/CustomButton';
import OnboardingHeader from '../../components/onboarding/OnboardingHeader';
import ProgressBar from '../../components/onboarding/ProgressBar';
import OptionSelector from '../../components/common/OptionSelector';

const engagementTimeOptions = [
  'Morning (5am-9am)',
  'Mid-Morning (9am-12pm)',
  'Afternoon (12pm-5pm)',
  'Evening (5pm-9pm)',
  'Night (9pm-12am)',
];

const sessionLengthOptions = [
  '5-10 minutes',
  '10-20 minutes',
  '20-30 minutes',
  '30+ minutes',
];

const reminderFrequencyOptions = [
  'Once daily',
  'Twice daily',
  'Several times a day',
  'Only when I open the app',
];

const exerciseTypeOptions = [
  'Guided Meditation',
  'Journaling Prompts',
  'Deep Work Sessions',
  'Visualization Exercises',
  'Binaural Beats',
  'Task Planning',
  'Self-Reflection',
];

const PreferencesScreen = ({ navigation, route }) => {
  const { currentHabits, improvementAreas, longTermGoals } = route.params || {
    currentHabits: [],
    improvementAreas: [],
    longTermGoals: {}
  };
  
  const [preferredTime, setPreferredTime] = useState('');
  const [sessionLength, setSessionLength] = useState('');
  const [reminderFrequency, setReminderFrequency] = useState('');
  const [preferredExercises, setPreferredExercises] = useState([]);
  
  const handleContinue = () => {
    const engagementPrefs = {
      preferredTime,
      sessionLength,
      reminderFrequency,
      preferredExercises
    };
    
    // Combine all the assessment data
    const assessmentData = {
      currentHabits,
      improvementAreas,
      longTermGoals,
      engagementPrefs
    };
    
    navigation.navigate('OnboardingComplete', { assessmentData });
  };
  
  const isFormValid = () => {
    return (
      preferredTime && 
      sessionLength && 
      reminderFrequency && 
      preferredExercises.length > 0
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProgressBar currentStep={4} totalSteps={4} />
        
        <OnboardingHeader
          title="Your Preferences"
          subtitle="Let us know how you'd like to engage with your transformation journey."
        />
        
        <View style={styles.content}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Best Time for Engagement</Text>
            <OptionSelector
              options={engagementTimeOptions}
              selectedOptions={preferredTime}
              onSelect={setPreferredTime}
              multiple={false}
            />
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Preferred Session Length</Text>
            <OptionSelector
              options={sessionLengthOptions}
              selectedOptions={sessionLength}
              onSelect={setSessionLength}
              multiple={false}
            />
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Reminder Frequency</Text>
            <OptionSelector
              options={reminderFrequencyOptions}
              selectedOptions={reminderFrequency}
              onSelect={setReminderFrequency}
              multiple={false}
            />
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Preferred Exercise Types</Text>
            <Text style={styles.sectionSubtitle}>
              Select at least 3 types of exercises you'd enjoy
            </Text>
            <OptionSelector
              options={exerciseTypeOptions}
              selectedOptions={preferredExercises}
              onSelect={setPreferredExercises}
              multiple={true}
            />
            
            {preferredExercises.length > 0 && preferredExercises.length < 3 && (
              <Text style={styles.warningText}>
                Please select at least 3 exercise types
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Back"
            onPress={() => navigation.goBack()}
            type="secondary"
            style={styles.backButton}
          />
          <CustomButton
            title="Continue"
            onPress={handleContinue}
            disabled={!isFormValid() || preferredExercises.length < 3}
          />
        </View>
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
  sectionContainer: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  warningText: {
    color: COLORS.accent,
    fontSize: FONT.size.sm,
    marginTop: SPACING.sm,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: SPACING.md,
  },
});

export default PreferencesScreen; 