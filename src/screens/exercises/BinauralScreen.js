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
  SegmentedButtons
} from 'react-native-paper';
import { SPACING } from '../../config/theme';
import Timer from '../../components/exercises/Timer';
import { supabase } from '../../config/supabase';

const FREQUENCIES = [
  { value: 'focus', label: 'Focus (Beta)', description: 'Enhance concentration and mental alertness', duration: 600 },
  { value: 'relax', label: 'Relax (Alpha)', description: 'Promote relaxation and reduce stress', duration: 900 },
  { value: 'meditate', label: 'Meditate (Theta)', description: 'Deep meditation and creativity', duration: 1200 },
];

const BinauralScreen = ({ navigation }) => {
  const [selectedFrequency, setSelectedFrequency] = useState('focus');
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

      // Save binaural session
      const { error: sessionError } = await supabase
        .from('binaural_sessions')
        .insert({
          user_id: user.id,
          frequency_type: selectedFrequency,
          duration: FREQUENCIES.find(f => f.value === selectedFrequency).duration,
          completed: true
        });

      if (sessionError) throw sessionError;

      // Update progress log
      const { error: progressError } = await supabase
        .from('progress_logs')
        .insert({
          user_id: user.id,
          exercise_type: 'binaural',
          details: {
            frequency_type: selectedFrequency,
            duration: FREQUENCIES.find(f => f.value === selectedFrequency).duration
          },
        });

      if (progressError) throw progressError;

      setShowDialog(true);
    } catch (error) {
      console.error('Error saving binaural session:', error);
      setError(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionCancel = () => {
    setIsSessionStarted(false);
  };

  const handleFinish = () => {
    setShowDialog(false);
    navigation.goBack();
  };

  const selectedFrequencyData = FREQUENCIES.find(f => f.value === selectedFrequency);

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Binaural Beats Session" />
      </Appbar.Header>

      <Surface style={styles.content} elevation={0}>
        {!isSessionStarted ? (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Card style={styles.instructionCard} mode="outlined">
              <Card.Content>
                <Text variant="titleMedium">Select Your Session Type</Text>
                <Text 
                  variant="bodyMedium" 
                  style={[styles.instruction, { color: theme.colors.onSurfaceVariant }]}
                >
                  Choose the type of binaural beats that best matches your current needs.
                </Text>
              </Card.Content>
            </Card>

            <SegmentedButtons
              value={selectedFrequency}
              onValueChange={setSelectedFrequency}
              buttons={FREQUENCIES.map(freq => ({
                value: freq.value,
                label: freq.label,
              }))}
              style={styles.segmentedButtons}
            />

            <Card style={styles.frequencyCard} mode="outlined">
              <Card.Content>
                <Text variant="titleMedium">{selectedFrequencyData.label}</Text>
                <Text 
                  variant="bodyMedium" 
                  style={{ color: theme.colors.onSurfaceVariant, marginTop: SPACING.xs }}
                >
                  {selectedFrequencyData.description}
                </Text>
                <Text 
                  variant="labelLarge" 
                  style={{ color: theme.colors.primary, marginTop: SPACING.sm }}
                >
                  Duration: {selectedFrequencyData.duration / 60} minutes
                </Text>
              </Card.Content>
            </Card>

            <Button
              mode="contained"
              onPress={() => setIsSessionStarted(true)}
              style={styles.startButton}
            >
              Start Session
            </Button>
          </ScrollView>
        ) : (
          <View style={styles.timerContainer}>
            <Timer
              duration={selectedFrequencyData.duration}
              onComplete={handleComplete}
              onCancel={handleSessionCancel}
            />
            <Text 
              variant="bodyMedium" 
              style={[styles.timerText, { color: theme.colors.onSurfaceVariant }]}
            >
              Find a comfortable position, put on your headphones, and close your eyes.
            </Text>
          </View>
        )}
      </Surface>

      <Portal>
        <Dialog visible={showDialog} onDismiss={handleFinish}>
          <Dialog.Title>Session Complete</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Great work completing your binaural beats session! Regular practice can help improve your focus, relaxation, and mental clarity.
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
  segmentedButtons: {
    marginBottom: SPACING.lg,
  },
  frequencyCard: {
    marginBottom: SPACING.xl,
  },
  startButton: {
    marginTop: SPACING.md,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  timerText: {
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});

export default BinauralScreen; 