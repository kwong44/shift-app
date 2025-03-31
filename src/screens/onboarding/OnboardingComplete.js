import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { 
  Text, 
  Button, 
  useTheme,
  Surface,
  Card,
  Divider,
  ActivityIndicator,
  Portal,
  Dialog,
  List
} from 'react-native-paper';
import { SPACING } from '../../config/theme';
import { supabase } from '../../config/supabase';
import { submitSelfAssessment } from '../../api/selfAssessment';
import { createRoadmap } from '../../api/roadmap';

const OnboardingComplete = ({ navigation, route }) => {
  const { assessmentData } = route.params || { assessmentData: {} };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const theme = useTheme();
  
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not found. Please sign in again.');
      }
      
      await submitSelfAssessment(user.id, assessmentData);
      await createRoadmap(user.id, assessmentData);
      
      setShowDialog(true);
    } catch (error) {
      setError(error.message || 'Failed to submit assessment data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDialogConfirm = () => {
    setShowDialog(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeScreen' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.content} elevation={0}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.title}>
              Assessment Complete!
            </Text>
            <Text 
              variant="titleMedium" 
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Thank you for sharing your journey with us. We're ready to craft your personalized transformation roadmap.
            </Text>
          </View>
          
          <Card style={styles.summaryCard} mode="outlined">
            <Card.Content>
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

                <List.Subheader>Long-Term Goals</List.Subheader>
                {assessmentData.longTermGoals && Object.keys(assessmentData.longTermGoals).length > 0 ? (
                  Object.entries(assessmentData.longTermGoals).map(([key, value]) => (
                    <Text key={key} variant="bodyLarge" style={styles.goalItem}>
                      • {value}
                    </Text>
                  ))
                ) : (
                  <Text variant="bodyLarge" style={styles.sectionValue}>
                    None specified
                  </Text>
                )}

                <List.Subheader>Preferred Engagement</List.Subheader>
                <Text variant="bodyLarge" style={styles.sectionValue}>
                  {assessmentData.engagementPrefs?.preferredTime || 'Not specified'} for {' '}
                  {assessmentData.engagementPrefs?.sessionLength || 'any duration'}
                </Text>
              </List.Section>
            </Card.Content>
          </Card>
          
          {error && (
            <Card style={[styles.errorCard, { backgroundColor: theme.colors.errorContainer }]}>
              <Card.Content>
                <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
                  {error}
                </Text>
              </Card.Content>
            </Card>
          )}
          
          <Card style={styles.infoCard} mode="outlined">
            <Card.Content>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                Next, we'll use AI to generate your personalized roadmap. This may take a moment as we analyze your responses and create a plan tailored just for you.
              </Text>
            </Card.Content>
          </Card>
        </ScrollView>
      </Surface>
      
      <Surface style={styles.footer} elevation={1}>
        <Divider />
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text 
              variant="bodyLarge"
              style={[styles.loadingText, { color: theme.colors.primary }]}
            >
              Creating your roadmap...
            </Text>
          </View>
        ) : (
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Generate My Roadmap
          </Button>
        )}
      </Surface>

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
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    marginBottom: SPACING.sm,
  },
  summaryCard: {
    marginBottom: SPACING.lg,
  },
  summaryTitle: {
    marginBottom: SPACING.md,
  },
  sectionValue: {
    marginBottom: SPACING.md,
  },
  goalItem: {
    marginTop: SPACING.xs,
  },
  errorCard: {
    marginBottom: SPACING.lg,
  },
  infoCard: {
    marginBottom: SPACING.lg,
  },
  footer: {
    width: '100%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  loadingText: {
    marginTop: SPACING.sm,
  },
  button: {
    marginTop: SPACING.md,
  },
  buttonContent: {
    paddingVertical: SPACING.xs,
  },
});

export default OnboardingComplete; 