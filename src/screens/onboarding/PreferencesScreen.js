import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { 
  Text, 
  Button, 
  useTheme,
  Surface,
  Card,
  Divider,
  Chip,
  ProgressBar,
  HelperText,
  RadioButton,
  List
} from 'react-native-paper';
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
  const theme = useTheme();
  
  const handleContinue = () => {
    const engagementPrefs = {
      preferredTime,
      sessionLength,
      reminderFrequency,
      preferredExercises
    };
    
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
      preferredExercises.length >= 3
    );
  };

  const toggleExercise = (exercise) => {
    setPreferredExercises(prev => 
      prev.includes(exercise)
        ? prev.filter(e => e !== exercise)
        : [...prev, exercise]
    );
  };

  const progress = 1; // 4/4 steps

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.content} elevation={0}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ProgressBar progress={progress} style={styles.progressBar} />
          
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.title}>
              Your Preferences
            </Text>
            <Text 
              variant="titleMedium" 
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Let us know how you'd like to engage with your transformation journey.
            </Text>
          </View>
          
          <Card style={styles.preferencesCard} mode="outlined">
            <Card.Content>
              <List.Section>
                <List.Subheader>Best Time for Engagement</List.Subheader>
                <RadioButton.Group 
                  onValueChange={value => setPreferredTime(value)} 
                  value={preferredTime}
                >
                  {engagementTimeOptions.map((time) => (
                    <RadioButton.Item
                      key={time}
                      label={time}
                      value={time}
                      labelStyle={{ color: theme.colors.onSurface }}
                    />
                  ))}
                </RadioButton.Group>

                <List.Subheader>Preferred Session Length</List.Subheader>
                <RadioButton.Group 
                  onValueChange={value => setSessionLength(value)} 
                  value={sessionLength}
                >
                  {sessionLengthOptions.map((length) => (
                    <RadioButton.Item
                      key={length}
                      label={length}
                      value={length}
                      labelStyle={{ color: theme.colors.onSurface }}
                    />
                  ))}
                </RadioButton.Group>

                <List.Subheader>Reminder Frequency</List.Subheader>
                <RadioButton.Group 
                  onValueChange={value => setReminderFrequency(value)} 
                  value={reminderFrequency}
                >
                  {reminderFrequencyOptions.map((frequency) => (
                    <RadioButton.Item
                      key={frequency}
                      label={frequency}
                      value={frequency}
                      labelStyle={{ color: theme.colors.onSurface }}
                    />
                  ))}
                </RadioButton.Group>
              </List.Section>
            </Card.Content>
          </Card>
          
          <Card style={styles.exercisesCard} mode="outlined">
            <Card.Content>
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
                {exerciseTypeOptions.map((exercise) => (
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
            </Card.Content>
          </Card>
        </ScrollView>
      </Surface>
      
      <Surface style={styles.footer} elevation={1}>
        <Divider />
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={[styles.button, styles.backButton]}
            contentStyle={styles.buttonContent}
          >
            Back
          </Button>
          <Button
            mode="contained"
            onPress={handleContinue}
            disabled={!isFormValid()}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Continue
          </Button>
        </View>
      </Surface>
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
  progressBar: {
    marginBottom: SPACING.lg,
    height: 8,
    borderRadius: 4,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    marginBottom: SPACING.sm,
  },
  preferencesCard: {
    marginBottom: SPACING.lg,
  },
  exercisesCard: {
    marginBottom: SPACING.lg,
  },
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
  footer: {
    width: '100%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  button: {
    flex: 1,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  buttonContent: {
    paddingVertical: SPACING.xs,
  },
});

export default PreferencesScreen; 