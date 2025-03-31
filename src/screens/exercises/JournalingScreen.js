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
  IconButton,
  Chip
} from 'react-native-paper';
import { SPACING } from '../../config/theme';
import EmotionPicker from '../../components/exercises/EmotionPicker';
import { supabase } from '../../config/supabase';

const JOURNAL_PROMPTS = {
  gratitude: [
    "What are three things you're grateful for today?",
    "Who made a positive impact on your day and why?",
    "What opportunity or challenge are you thankful for?",
  ],
  reflection: [
    "What was the most meaningful part of your day?",
    "What did you learn about yourself today?",
    "How did you handle challenges that arose?",
  ],
  growth: [
    "What progress did you make toward your goals today?",
    "What would you like to improve or do differently tomorrow?",
    "What new insight or skill did you gain today?",
  ],
};

const PROMPT_TYPES = [
  { value: 'gratitude', label: 'Gratitude', icon: 'heart' },
  { value: 'reflection', label: 'Reflection', icon: 'thought-bubble' },
  { value: 'growth', label: 'Growth', icon: 'sprout' },
];

const JournalingScreen = ({ navigation }) => {
  const [promptType, setPromptType] = useState('gratitude');
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [entry, setEntry] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    // Reset entry when prompt type changes
    setEntry('');
    setCurrentPrompt(0);
  }, [promptType]);

  const handleSaveEntry = async () => {
    if (!entry.trim()) {
      setError('Please write something in your journal');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Save journal entry
      const { error: entryError } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          content: entry.trim(),
          prompt_type: promptType,
          prompt: JOURNAL_PROMPTS[promptType][currentPrompt],
          emotions: selectedEmotions,
        });

      if (entryError) throw entryError;

      // Update progress log
      const { error: progressError } = await supabase
        .from('progress_logs')
        .insert({
          user_id: user.id,
          exercise_type: 'journaling',
          details: {
            prompt_type: promptType,
            emotions: selectedEmotions,
          },
        });

      if (progressError) throw progressError;

      setShowDialog(true);
    } catch (error) {
      console.error('Error saving journal entry:', error);
      setError(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPrompt = () => {
    if (currentPrompt < JOURNAL_PROMPTS[promptType].length - 1) {
      setCurrentPrompt(prev => prev + 1);
      setEntry('');
    }
  };

  const handlePreviousPrompt = () => {
    if (currentPrompt > 0) {
      setCurrentPrompt(prev => prev - 1);
      setEntry('');
    }
  };

  const handleFinish = () => {
    setShowDialog(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Journaling" />
      </Appbar.Header>

      <Surface style={styles.content} elevation={0}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.instructionCard} mode="outlined">
            <Card.Content>
              <Text variant="titleMedium">Daily Journal</Text>
              <Text 
                variant="bodyMedium" 
                style={[styles.instruction, { color: theme.colors.onSurfaceVariant }]}
              >
                Take a moment to reflect on your experiences and feelings. Choose a focus area and follow the prompts.
              </Text>
            </Card.Content>
          </Card>

          <SegmentedButtons
            value={promptType}
            onValueChange={setPromptType}
            buttons={PROMPT_TYPES.map(type => ({
              value: type.value,
              label: type.label,
              icon: type.icon,
            }))}
            style={styles.promptTypeButtons}
          />

          <Card style={styles.promptCard} mode="outlined">
            <Card.Content>
              <View style={styles.promptHeader}>
                <IconButton
                  icon="chevron-left"
                  onPress={handlePreviousPrompt}
                  disabled={currentPrompt === 0}
                />
                <Text variant="titleMedium" style={styles.promptCount}>
                  Prompt {currentPrompt + 1} of {JOURNAL_PROMPTS[promptType].length}
                </Text>
                <IconButton
                  icon="chevron-right"
                  onPress={handleNextPrompt}
                  disabled={currentPrompt === JOURNAL_PROMPTS[promptType].length - 1}
                />
              </View>
              
              <Text variant="bodyLarge" style={styles.prompt}>
                {JOURNAL_PROMPTS[promptType][currentPrompt]}
              </Text>

              <TextInput
                mode="outlined"
                placeholder="Write your thoughts here..."
                value={entry}
                onChangeText={setEntry}
                multiline
                numberOfLines={6}
                style={styles.journalInput}
              />
            </Card.Content>
          </Card>

          <Text variant="titleMedium" style={styles.emotionsTitle}>
            How are you feeling?
          </Text>

          <EmotionPicker
            selectedEmotions={selectedEmotions}
            onSelectEmotion={setSelectedEmotions}
            maxSelections={3}
            helperText="Select up to 3 emotions that reflect your current state"
          />

          <Button
            mode="contained"
            onPress={handleSaveEntry}
            style={styles.saveButton}
            loading={loading}
          >
            Save Entry
          </Button>
        </ScrollView>
      </Surface>

      <Portal>
        <Dialog visible={showDialog} onDismiss={handleFinish}>
          <Dialog.Title>Journal Entry Saved</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Great work on your reflection! Regular journaling can help you process emotions, track growth, and maintain mindfulness in your daily life.
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
  promptTypeButtons: {
    marginBottom: SPACING.lg,
  },
  promptCard: {
    marginBottom: SPACING.xl,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  promptCount: {
    textAlign: 'center',
  },
  prompt: {
    marginBottom: SPACING.lg,
    fontStyle: 'italic',
  },
  journalInput: {
    marginTop: SPACING.sm,
  },
  emotionsTitle: {
    marginBottom: SPACING.md,
  },
  saveButton: {
    marginTop: SPACING.xl,
  },
});

export default JournalingScreen; 