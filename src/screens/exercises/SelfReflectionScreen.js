import React, { useState, useEffect } from 'react';
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
  ProgressBar,
  List,
  Chip
} from 'react-native-paper';
import { SPACING } from '../../config/theme';
import EmotionPicker from '../../components/exercises/EmotionPicker';
import { supabase } from '../../config/supabase';

const REFLECTION_AREAS = [
  { value: 'progress', label: 'Goal Progress', icon: 'target' },
  { value: 'challenges', label: 'Challenges', icon: 'mountain' },
  { value: 'insights', label: 'Key Insights', icon: 'lightbulb-on' },
];

const REFLECTION_PROMPTS = {
  progress: [
    "Rate your progress on your goals (1-5):",
    "What specific steps have you taken toward your goals?",
    "What resources or support have helped you progress?",
    "How have your goals evolved or changed?",
  ],
  challenges: [
    "What obstacles are you currently facing?",
    "How are you working to overcome these challenges?",
    "What have you learned from recent setbacks?",
    "What support do you need to move forward?",
  ],
  insights: [
    "What patterns have you noticed in your behavior?",
    "What new strengths have you discovered?",
    "How have your perspectives changed?",
    "What habits would you like to develop or change?",
  ],
};

const SelfReflectionScreen = ({ navigation }) => {
  const [reflectionArea, setReflectionArea] = useState('progress');
  const [responses, setResponses] = useState({});
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [progressRating, setProgressRating] = useState(3);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    // Initialize responses object with empty strings
    const initialResponses = {};
    Object.keys(REFLECTION_PROMPTS).forEach(area => {
      initialResponses[area] = REFLECTION_PROMPTS[area].map(() => '');
    });
    setResponses(initialResponses);
  }, []);

  const handleSaveReflection = async () => {
    const currentResponses = responses[reflectionArea];
    if (currentResponses.some(response => !response.trim())) {
      setError('Please answer all prompts before saving');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Save reflection
      const { error: reflectionError } = await supabase
        .from('reflections')
        .insert({
          user_id: user.id,
          area: reflectionArea,
          responses: responses[reflectionArea],
          emotions: selectedEmotions,
          progress_rating: reflectionArea === 'progress' ? progressRating : null,
        });

      if (reflectionError) throw reflectionError;

      // Update progress log
      const { error: progressError } = await supabase
        .from('progress_logs')
        .insert({
          user_id: user.id,
          exercise_type: 'self-reflection',
          details: {
            area: reflectionArea,
            emotions: selectedEmotions,
            progress_rating: reflectionArea === 'progress' ? progressRating : null,
          },
        });

      if (progressError) throw progressError;

      setShowDialog(true);
    } catch (error) {
      console.error('Error saving reflection:', error);
      setError(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (index, value) => {
    setResponses(prev => ({
      ...prev,
      [reflectionArea]: prev[reflectionArea].map((response, i) => 
        i === index ? value : response
      ),
    }));
  };

  const handleFinish = () => {
    setShowDialog(false);
    navigation.goBack();
  };

  const renderPrompts = () => {
    const prompts = REFLECTION_PROMPTS[reflectionArea];
    return prompts.map((prompt, index) => (
      <Card key={index} style={styles.promptCard} mode="outlined">
        <Card.Content>
          <Text variant="bodyLarge" style={styles.prompt}>
            {prompt}
          </Text>
          {prompt.includes('Rate your progress') ? (
            <View style={styles.ratingContainer}>
              <ProgressBar
                progress={progressRating / 5}
                style={styles.progressBar}
              />
              <View style={styles.ratingButtons}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    mode={progressRating === rating ? 'contained' : 'outlined'}
                    onPress={() => setProgressRating(rating)}
                    style={styles.ratingButton}
                  >
                    {rating}
                  </Button>
                ))}
              </View>
            </View>
          ) : (
            <TextInput
              mode="outlined"
              value={responses[reflectionArea][index]}
              onChangeText={(value) => handleResponseChange(index, value)}
              multiline
              numberOfLines={3}
              style={styles.input}
              placeholder="Type your response here..."
            />
          )}
        </Card.Content>
      </Card>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Self-Reflection" />
      </Appbar.Header>

      <Surface style={styles.content} elevation={0}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.instructionCard} mode="outlined">
            <Card.Content>
              <Text variant="titleMedium">Weekly Self-Reflection</Text>
              <Text 
                variant="bodyMedium" 
                style={[styles.instruction, { color: theme.colors.onSurfaceVariant }]}
              >
                Take time to reflect deeply on your journey. Choose an area of focus and answer the prompts thoughtfully.
              </Text>
            </Card.Content>
          </Card>

          <SegmentedButtons
            value={reflectionArea}
            onValueChange={setReflectionArea}
            buttons={REFLECTION_AREAS.map(area => ({
              value: area.value,
              label: area.label,
              icon: area.icon,
            }))}
            style={styles.areaButtons}
          />

          {renderPrompts()}

          <Text variant="titleMedium" style={styles.emotionsTitle}>
            Current Emotional State
          </Text>

          <EmotionPicker
            selectedEmotions={selectedEmotions}
            onSelectEmotion={setSelectedEmotions}
            maxSelections={3}
            helperText="Select up to 3 emotions that describe how you feel about your progress"
          />

          <Button
            mode="contained"
            onPress={handleSaveReflection}
            style={styles.saveButton}
            loading={loading}
          >
            Save Reflection
          </Button>
        </ScrollView>
      </Surface>

      <Portal>
        <Dialog visible={showDialog} onDismiss={handleFinish}>
          <Dialog.Title>Reflection Saved</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Excellent work on your self-reflection! Regular reflection helps you stay aligned with your goals, learn from experiences, and maintain personal growth momentum.
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
  areaButtons: {
    marginBottom: SPACING.lg,
  },
  promptCard: {
    marginBottom: SPACING.md,
  },
  prompt: {
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  input: {
    marginTop: SPACING.xs,
  },
  ratingContainer: {
    marginTop: SPACING.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  ratingButton: {
    flex: 1,
  },
  emotionsTitle: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  saveButton: {
    marginTop: SPACING.xl,
  },
});

export default SelfReflectionScreen; 