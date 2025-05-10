import React, { useState } from 'react';
import { StyleSheet, View, StatusBar, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Appbar,
  Button,
  Portal,
  Dialog,
  Snackbar,
  IconButton,
  FAB
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../config/theme';
import { supabase } from '../../../config/supabase';
import { JournalEntryCard } from './components/JournalEntryCard';
import { JOURNAL_PROMPTS, PROMPT_TYPES } from './constants';

const { height } = Dimensions.get('window');

const JournalingEntry = ({ route, navigation }) => {
  const { promptType, selectedEmotions } = route.params;
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [entry, setEntry] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);
  const [textInputHeight, setTextInputHeight] = useState(height * 0.6);

  // Get the selected prompt type data
  const selectedPromptType = PROMPT_TYPES.find(type => type.value === promptType);

  // Debug logging
  console.debug('JournalingEntry rendered', {
    promptType,
    currentPrompt,
    promptText: JOURNAL_PROMPTS[promptType]?.[currentPrompt],
    selectedPromptType,
    entry
  });

  const handleSaveEntry = async () => {
    if (!entry.trim()) {
      setError('Please write something in your journal');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentPrompt(prev => prev + 1);
      setEntry('');
    }
  };

  const handlePreviousPrompt = () => {
    if (currentPrompt > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentPrompt(prev => prev - 1);
      setEntry('');
    }
  };

  const handleFinish = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDialog(false);
    navigation.navigate('ExercisesDashboard');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={selectedPromptType.gradient}
        style={styles.screenGradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <Appbar.Header style={styles.appbar} statusBarHeight={0}>
              <Appbar.BackAction 
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (entry.trim()) {
                    setError('Do you want to discard your journal entry?');
                    setSnackbarVisible(true);
                  } else {
                    navigation.goBack();
                  }
                }} 
                color={COLORS.background} 
              />
              <Appbar.Content 
                title="New Entry" 
                titleStyle={styles.appbarTitle} 
                subtitle={selectedPromptType.label}
                subtitleStyle={styles.appbarSubtitle}
              />
              <Button
                mode="text"
                textColor={COLORS.background}
                disabled={!entry.trim() || loading}
                onPress={handleSaveEntry}
                loading={loading}
                style={styles.saveButton}
                labelStyle={styles.saveButtonLabel}
              >
                SAVE
              </Button>
            </Appbar.Header>

            <View style={styles.content}>
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
                isFullScreen={true}
              />
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>

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
          action={error === 'Do you want to discard your journal entry?' ? {
            label: 'Discard',
            onPress: () => {
              setSnackbarVisible(false);
              navigation.goBack();
            },
          } : {
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
  keyboardAvoidingView: {
    flex: 1,
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
    height: 52,
  },
  appbarTitle: {
    color: COLORS.background,
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
  },
  appbarSubtitle: {
    display: 'none',
  },
  content: {
    flex: 1,
  },
  saveButton: {
    marginRight: SPACING.xs,
    height: 36,
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

export default JournalingEntry; 