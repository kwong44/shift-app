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
  TextInput,
  Portal,
  Dialog,
  Snackbar
} from 'react-native-paper';
import { SPACING } from '../../config/theme';
import EmotionPicker from '../../components/exercises/EmotionPicker';
import { supabase } from '../../config/supabase';

const MindfulnessScreen = ({ navigation }) => {
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();

  const handleSubmit = async () => {
    if (selectedEmotions.length === 0) {
      setError('Please select at least one emotion');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Save mindfulness log
      const { error: logError } = await supabase
        .from('mindfulness_logs')
        .insert({
          user_id: user.id,
          emotions: selectedEmotions,
          notes: notes.trim(),
        });

      if (logError) throw logError;

      // Update progress log
      const { error: progressError } = await supabase
        .from('progress_logs')
        .insert({
          user_id: user.id,
          exercise_type: 'mindfulness',
          details: {
            emotions: selectedEmotions,
            has_notes: notes.trim().length > 0,
          },
        });

      if (progressError) throw progressError;

      setShowDialog(true);
    } catch (error) {
      console.error('Error saving mindfulness check-in:', error);
      setError(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    setShowDialog(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Mindfulness Check-In" />
      </Appbar.Header>

      <Surface style={styles.content} elevation={0}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.instructionCard} mode="outlined">
            <Card.Content>
              <Text variant="titleMedium">How are you feeling right now?</Text>
              <Text 
                variant="bodyMedium" 
                style={[styles.instruction, { color: theme.colors.onSurfaceVariant }]}
              >
                Take a moment to check in with yourself. Select the emotions that best describe your current state.
              </Text>
            </Card.Content>
          </Card>

          <EmotionPicker
            selectedEmotions={selectedEmotions}
            onSelectEmotion={setSelectedEmotions}
            maxSelections={3}
            helperText="Select up to 3 emotions that reflect your current state"
          />

          <Card style={styles.notesCard} mode="outlined">
            <Card.Content>
              <TextInput
                mode="outlined"
                label="Additional Notes (Optional)"
                placeholder="Add any thoughts or reflections..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                style={styles.notesInput}
              />
            </Card.Content>
          </Card>
        </ScrollView>

        <Surface style={styles.footer} elevation={1}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
          >
            Complete Check-In
          </Button>
        </Surface>
      </Surface>

      <Portal>
        <Dialog visible={showDialog} onDismiss={handleComplete}>
          <Dialog.Title>Check-In Complete</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Great job taking a moment to check in with yourself! Your mindfulness practice helps build self-awareness and emotional intelligence.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleComplete}>Done</Button>
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
    marginBottom: SPACING.xl,
  },
  instruction: {
    marginTop: SPACING.sm,
  },
  notesCard: {
    marginTop: SPACING.xl,
  },
  notesInput: {
    marginTop: SPACING.xs,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  submitButton: {
    marginTop: SPACING.sm,
  },
});

export default MindfulnessScreen; 