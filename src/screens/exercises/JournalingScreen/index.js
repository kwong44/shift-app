import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Appbar,
  Card,
  Button,
  Portal,
  Dialog,
  Snackbar,
  IconButton
} from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../config/theme';
import { supabase } from '../../../config/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Import local components and constants
import { JournalEntryCard } from './components/JournalEntryCard';
import { PromptTypeSelector } from './components/PromptTypeSelector';
import EmotionPicker from '../../../components/exercises/EmotionPicker';
import { JOURNAL_PROMPTS, PROMPT_TYPES } from './constants';

// Debug logging
console.debug('JournalingScreen mounted');

const JournalingScreen = ({ navigation }) => {
  const [promptType, setPromptType] = useState('gratitude');
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [entry, setEntry] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);
  const [textInputHeight, setTextInputHeight] = useState(200);

  // Get the selected prompt type data
  const selectedPromptType = PROMPT_TYPES.find(type => type.value === promptType);
  
  // Debug logging for state changes
  console.debug('JournalingScreen state:', {
    promptType,
    currentPrompt,
    entryLength: entry.length,
    selectedEmotions,
  });

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
      // Provide haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
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

      console.debug('Journal entry saved successfully');
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
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentPrompt(prev => prev + 1);
      setEntry('');
    }
  };

  const handlePreviousPrompt = () => {
    if (currentPrompt > 0) {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentPrompt(prev => prev - 1);
      setEntry('');
    }
  };

  const handleFinish = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDialog(false);
    navigation.goBack();
  };

  const handlePromptTypeChange = (newType) => {
    if (newType !== promptType) {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPromptType(newType);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={selectedPromptType.gradient}
        style={styles.screenGradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <Appbar.Header style={styles.appbar} statusBarHeight={0}>
            <Appbar.BackAction 
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.goBack();
              }} 
              color={COLORS.background} 
            />
            <Appbar.Content 
              title="Journaling" 
              titleStyle={styles.appbarTitle} 
              subtitle={selectedPromptType.label}
              subtitleStyle={styles.appbarSubtitle}
            />
          </Appbar.Header>

          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Card style={styles.instructionCard} elevation={3}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Daily Journal</Text>
                  <IconButton 
                    icon="book-open-page-variant" 
                    size={24} 
                    iconColor={selectedPromptType.color}
                    style={styles.headerIcon}
                  />
                </View>
                <Text style={styles.instruction}>
                  Take a moment to reflect on your experiences and feelings. Choose a focus area and follow the prompts.
                </Text>
              </Card.Content>
            </Card>
            
            <Text style={styles.sectionTitle}>Choose Your Focus</Text>
            
            <PromptTypeSelector 
              promptTypes={PROMPT_TYPES}
              selectedPromptType={selectedPromptType}
              onSelectPromptType={handlePromptTypeChange}
            />
            
            <JournalEntryCard 
              promptData={selectedPromptType}
              currentPrompt={currentPrompt}
              promptText={JOURNAL_PROMPTS[promptType][currentPrompt]}
              entry={entry}
              setEntry={setEntry}
              textInputHeight={textInputHeight}
              setTextInputHeight={setTextInputHeight}
              onNextPrompt={handleNextPrompt}
              onPreviousPrompt={handlePreviousPrompt}
              promptsLength={JOURNAL_PROMPTS[promptType].length}
            />
            
            <Text style={styles.sectionTitle}>How are you feeling?</Text>
            
            <Card style={styles.emotionsCard} elevation={3}>
              <Card.Content>
                <EmotionPicker
                  selectedEmotions={selectedEmotions}
                  onSelectEmotion={setSelectedEmotions}
                  maxSelections={3}
                  helperText="Select up to 3 emotions that reflect your current state"
                />
              </Card.Content>
            </Card>

            <Button
              mode="contained"
              onPress={handleSaveEntry}
              style={[styles.saveButton, { backgroundColor: selectedPromptType.color }]}
              labelStyle={styles.saveButtonLabel}
              icon="content-save"
              loading={loading}
            >
              Save Journal Entry
            </Button>
          </ScrollView>
        </SafeAreaView>

        <Portal>
          <Dialog visible={showDialog} onDismiss={handleFinish}>
            <LinearGradient
              colors={[`${selectedPromptType.color}15`, `${selectedPromptType.color}05`]}
              style={styles.dialogGradient}
            >
              <Dialog.Title style={styles.dialogTitle}>Journal Entry Saved</Dialog.Title>
              <Dialog.Content>
                <View style={styles.dialogContent}>
                  <MaterialCommunityIcons name="check-circle-outline" size={48} color={selectedPromptType.color} style={styles.dialogIcon} />
                  <Text style={styles.dialogText}>
                    Great work on your reflection! Regular journaling can help you process emotions, track growth, and maintain mindfulness in your daily life.
                  </Text>
                </View>
              </Dialog.Content>
              <Dialog.Actions>
                <Button 
                  onPress={handleFinish} 
                  mode="contained" 
                  buttonColor={selectedPromptType.color}
                  style={styles.dialogButton}
                >
                  Done
                </Button>
              </Dialog.Actions>
            </LinearGradient>
          </Dialog>
        </Portal>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          action={{
            label: 'OK',
            onPress: () => setSnackbarVisible(false),
          }}
          style={styles.snackbar}
        >
          {error || 'An error occurred. Please try again.'}
        </Snackbar>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
  },
  screenGradient: {
    flex: 1,
  },
  appbar: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  appbarTitle: {
    color: COLORS.background,
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
  },
  appbarSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: FONT.size.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  instructionCard: {
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
  },
  headerIcon: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: RADIUS.sm,
  },
  instruction: {
    color: COLORS.textLight,
    lineHeight: 20,
    fontSize: FONT.size.sm,
  },
  sectionTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    color: COLORS.background,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  emotionsCard: {
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.lg,
    ...SHADOWS.medium,
  },
  saveButton: {
    borderRadius: RADIUS.md,
    paddingVertical: 4,
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  saveButtonLabel: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
  },
  dialogGradient: {
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
  },
  dialogTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    textAlign: 'center',
  },
  dialogContent: {
    alignItems: 'center',
  },
  dialogIcon: {
    marginBottom: SPACING.md,
  },
  dialogText: {
    textAlign: 'center',
    lineHeight: 22,
    color: COLORS.text,
  },
  dialogButton: {
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.md,
  },
  snackbar: {
    bottom: SPACING.md,
  },
});

export default JournalingScreen; 