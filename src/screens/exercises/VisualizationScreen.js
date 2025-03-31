import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  useTheme, 
  Surface,
  Appbar,
  Card,
  Button,
  Portal,
  Dialog,
  Snackbar,
  TextInput,
  SegmentedButtons,
  Chip
} from 'react-native-paper';
import { SPACING } from '../../config/theme';
import Timer from '../../components/exercises/Timer';
import EmotionPicker from '../../components/exercises/EmotionPicker';
import { supabase } from '../../config/supabase';

const VISUALIZATION_TYPES = [
  { value: 'goals', label: 'Goal Achievement', description: 'Visualize successfully achieving your goals' },
  { value: 'confidence', label: 'Self-Confidence', description: 'Build confidence and positive self-image' },
  { value: 'calm', label: 'Inner Peace', description: 'Find calmness and emotional balance' },
];

const SESSION_DURATION = 300; // 5 minutes

const VisualizationScreen = ({ navigation }) => {
  const [visualizationType, setVisualizationType] = useState('goals');
  const [affirmation, setAffirmation] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Save visualization session
      const { error: sessionError } = await supabase
        .from('visualizations')
        .insert({
          user_id: user.id,
          type: visualizationType,
          affirmation: affirmation.trim(),
          emotions: selectedEmotions,
          duration: SESSION_DURATION,
          completed: true
        });

      if (sessionError) throw sessionError;

      // Update progress log
      const { error: progressError } = await supabase
        .from('progress_logs')
        .insert({
          user_id: user.id,
          exercise_type: 'visualization',
          details: {
            type: visualizationType,
            emotions: selectedEmotions,
            duration: SESSION_DURATION
          },
        });

      if (progressError) throw progressError;

      setShowDialog(true);
    } catch (error) {
      console.error('Error saving visualization session:', error);
      setError(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (!affirmation.trim()) {
      setError('Please enter an affirmation');
      setSnackbarVisible(true);
      return;
    }
    if (selectedEmotions.length === 0) {
      setError('Please select at least one emotion');
      setSnackbarVisible(true);
      return;
    }
    setIsSessionStarted(true);
  };

  const handleSessionCancel = () => {
    setIsSessionStarted(false);
  };

  const handleFinish = () => {
    setShowDialog(false);
    navigation.goBack();
  };

  const selectedType = VISUALIZATION_TYPES.find(t => t.value === visualizationType);

  const getAffirmationPlaceholder = () => {
    switch (visualizationType) {
      case 'goals':
        return 'E.g., I am confidently working towards my goals and achieving success';
      case 'confidence':
        return 'E.g., I am capable, confident, and worthy of success';
      case 'calm':
        return 'E.g., I am calm, centered, and at peace with myself';
      default:
        return 'Enter your positive affirmation';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Visualization Exercise" />
      </Appbar.Header>

      <Surface style={styles.content} elevation={0}>
        {!isSessionStarted ? (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Card style={styles.instructionCard} mode="outlined">
              <Card.Content>
                <Text variant="titleMedium">Create Your Visualization</Text>
                <Text 
                  variant="bodyMedium" 
                  style={[styles.instruction, { color: theme.colors.onSurfaceVariant }]}
                >
                  Choose a focus area, write an affirmation, and select emotions you want to cultivate.
                </Text>
              </Card.Content>
            </Card>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Focus Area
            </Text>

            <SegmentedButtons
              value={visualizationType}
              onValueChange={setVisualizationType}
              buttons={VISUALIZATION_TYPES.map(type => ({
                value: type.value,
                label: type.label,
              }))}
              style={styles.segmentedButtons}
            />

            <Text
              variant="bodyMedium"
              style={[styles.typeDescription, { color: theme.colors.onSurfaceVariant }]}
            >
              {selectedType.description}
            </Text>

            <Card style={styles.affirmationCard} mode="outlined">
              <Card.Content>
                <TextInput
                  mode="outlined"
                  label="Your Affirmation"
                  placeholder={getAffirmationPlaceholder()}
                  value={affirmation}
                  onChangeText={setAffirmation}
                  multiline
                  numberOfLines={3}
                  style={styles.affirmationInput}
                />
              </Card.Content>
            </Card>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Emotions to Cultivate
            </Text>

            <EmotionPicker
              selectedEmotions={selectedEmotions}
              onSelectEmotion={setSelectedEmotions}
              maxSelections={3}
              helperText="Select up to 3 emotions you want to embody"
            />

            <Button
              mode="contained"
              onPress={handleStart}
              style={styles.startButton}
            >
              Start Session
            </Button>
          </ScrollView>
        ) : (
          <View style={styles.timerContainer}>
            <Timer
              duration={SESSION_DURATION}
              onComplete={handleComplete}
              onCancel={handleSessionCancel}
            />
            <Card style={styles.affirmationDisplay} mode="outlined">
              <Card.Content>
                <Text 
                  variant="bodyLarge" 
                  style={styles.affirmationText}
                >
                  {affirmation}
                </Text>
              </Card.Content>
            </Card>
          </View>
        )}
      </Surface>

      <Portal>
        <Dialog visible={showDialog} onDismiss={handleFinish}>
          <Dialog.Title>Visualization Complete</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Excellent work! Regular visualization practice can help strengthen your mindset and bring you closer to your goals. Remember to carry this positive energy throughout your day.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleFinish}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {error || 'An error occurred. Please try again.'}
      </Snackbar>
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
  instructionCard: {
    marginBottom: SPACING.lg,
  },
  instruction: {
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  segmentedButtons: {
    marginBottom: SPACING.sm,
  },
  typeDescription: {
    marginBottom: SPACING.lg,
  },
  affirmationCard: {
    marginBottom: SPACING.xl,
  },
  affirmationInput: {
    marginTop: SPACING.xs,
  },
  startButton: {
    marginTop: SPACING.xl,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  affirmationDisplay: {
    marginTop: SPACING.xl,
  },
  affirmationText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default VisualizationScreen; 