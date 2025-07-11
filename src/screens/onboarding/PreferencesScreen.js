import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Text, 
  Chip,
  HelperText,
  RadioButton,
  List,
  useTheme
} from 'react-native-paper';
import { OnboardingLayout, OnboardingCard } from '../../components/onboarding';
import { SPACING } from '../../config/theme';

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

const EXERCISE_PREFERENCES = [
  'Mindfulness',
  'Binaural Beats',
  'Visualization',
  'Task Planning',
  'Deep Work',
  'Journaling'
];

const PreferencesScreen = ({ navigation, route }) => {
  const [preferredTime, setPreferredTime] = useState('');
  const [sessionLength, setSessionLength] = useState('');
  const [reminderFrequency, setReminderFrequency] = useState('');
  const [preferredExercises, setPreferredExercises] = useState([]);
  const theme = useTheme();

  const toggleExercise = (exercise) => {
    setPreferredExercises(prev => 
      prev.includes(exercise)
        ? prev.filter(e => e !== exercise)
        : [...prev, exercise]
    );
  };

  const isFormValid = () => {
    return (
      preferredTime &&
      sessionLength &&
      reminderFrequency &&
      preferredExercises.length >= 3
    );
  };

  const handleContinue = () => {
    // Debug log of preferences collected on this screen
    const currentScreenPreferences = {
      preferredTime,
      sessionLength,
      reminderFrequency,
      preferredExercises
    };
    console.log('[PreferencesScreen] User preferences collected:', currentScreenPreferences);

    // Get the data passed from previous screens
    const { satisfactionBaseline, selectedGrowthAreas, definedLTAs } = route.params || {};
    
    // Construct the complete data object for OnboardingComplete
    // Note: We are creating a new engagementPrefs object here with the data from this screen.
    // The one from route.params (if any) is effectively overridden, which is usually the intent for a preferences screen.
    const allOnboardingData = {
      satisfactionBaseline, // From LifeSatisfactionScreen
      selectedGrowthAreas,  // From AreasForGrowthScreen, passed through Aspirations & BenefitsIntro
      definedLTAs,          // From AspirationsScreen, passed through BenefitsIntro
      engagementPrefs: currentScreenPreferences // Newly defined on this screen
    };

    console.log('[PreferencesScreen] Proceeding to OnboardingComplete with all data:', allOnboardingData);
    navigation.navigate('NotificationPermission', allOnboardingData); // Changed to NotificationPermissionScreen
  };

  return (
    <OnboardingLayout
      title="Your Preferences"
      subtitle="Help us personalize your experience"
      currentStep={9}
      totalSteps={12}
      onBack={() => navigation.goBack()}
      onNext={handleContinue}
      nextDisabled={!isFormValid()}
    >
      <ScrollView style={styles.scrollContent}>
        <OnboardingCard>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Best Time for Engagement
          </Text>
          <RadioButton.Group onValueChange={setPreferredTime} value={preferredTime}>
            {engagementTimeOptions.map((time) => (
              <List.Item
                key={time}
                title={time}
                onPress={() => setPreferredTime(time)}
                left={() => (
                  <RadioButton.Android value={time} />
                )}
              />
            ))}
          </RadioButton.Group>
        </OnboardingCard>

        <OnboardingCard>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Preferred Session Length
          </Text>
          <RadioButton.Group onValueChange={setSessionLength} value={sessionLength}>
            {sessionLengthOptions.map((length) => (
              <List.Item
                key={length}
                title={length}
                onPress={() => setSessionLength(length)}
                left={() => (
                  <RadioButton.Android value={length} />
                )}
              />
            ))}
          </RadioButton.Group>
        </OnboardingCard>

        <OnboardingCard>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Reminder Frequency
          </Text>
          <RadioButton.Group onValueChange={setReminderFrequency} value={reminderFrequency}>
            {reminderFrequencyOptions.map((frequency) => (
              <List.Item
                key={frequency}
                title={frequency}
                onPress={() => setReminderFrequency(frequency)}
                left={() => (
                  <RadioButton.Android value={frequency} />
                )}
              />
            ))}
          </RadioButton.Group>
        </OnboardingCard>

        <OnboardingCard>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Preferred Exercise Types
          </Text>
          <Text 
            variant="bodyMedium" 
            style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Select at least 3 types of exercises you'd enjoy
          </Text>
          
          <View style={styles.chipContainer}>
            {EXERCISE_PREFERENCES.map((exercise) => (
              <Chip
                key={exercise}
                selected={preferredExercises.includes(exercise)}
                onPress={() => toggleExercise(exercise)}
                style={styles.chip}
                showSelectedOverlay
              >
                {exercise}
              </Chip>
            ))}
          </View>

          {preferredExercises.length > 0 && preferredExercises.length < 3 && (
            <HelperText type="warning" style={styles.warningText}>
              Please select at least 3 exercise types
            </HelperText>
          )}
        </OnboardingCard>
      </ScrollView>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    marginBottom: SPACING.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chip: {
    marginBottom: SPACING.xs,
  },
  warningText: {
    marginTop: SPACING.sm,
  },
});

export default PreferencesScreen; 