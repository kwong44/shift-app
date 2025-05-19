import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Appbar,
  Button,
  Portal,
  Dialog,
  Snackbar,
  IconButton
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../config/theme';
import { analyzeText } from '../../../api/aiCoach';
import { createJournalEntry } from '../../../api/exercises';
import { JournalEntryCard } from './components/JournalEntryCard';
import { JOURNAL_PROMPTS, PROMPT_TYPES } from './constants';
import { useUser } from '../../../hooks/useUser';
import CustomDialog from '../../../components/common/CustomDialog';

const { height } = Dimensions.get('window');

// Light gray color for journaling
const JOURNAL_GRAY = '#7A7A7A';
const JOURNAL_BACKGROUND = '#F0F0F0';

const JournalingEntry = ({ route, navigation }) => {
  const { promptType, selectedEmotions } = route.params;
  const { user } = useUser();
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [entry, setEntry] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);
  const [textInputHeight, setTextInputHeight] = useState(height * 0.6);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState(null);

  // Get the selected prompt type data
  const selectedPromptType = PROMPT_TYPES.find(type => type.value === promptType);

  // Debug logging - only log when props change
  useEffect(() => {
    console.debug('[JournalingEntry] Props or state updated:', {
      promptType,
      currentPrompt,
      promptText: JOURNAL_PROMPTS[promptType]?.[currentPrompt],
      selectedPromptType,
      entryLength: entry?.length || 0 // Log length instead of full text
    });
  }, [promptType, currentPrompt, selectedPromptType, entry]);

  const handleSaveEntry = async () => {
    if (!entry.trim()) {
      setError('Please write something in your journal');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    setIsAnalyzing(true);
    setError(null);
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Get AI insights
      console.debug('[JournalingEntry] Getting AI insights for journal entry');
      
      const aiResponse = await analyzeText(entry.trim(), {
        type: 'journal',
        promptType,
        emotions: selectedEmotions
      });

      if (!aiResponse.success) {
        throw new Error(aiResponse.error || 'Failed to analyze journal entry');
      }

      const journalInsights = aiResponse.data.analysis;
      console.debug('[JournalingEntry] AI analysis completed');

      // Save journal entry with insights and metadata
      const savedEntry = await createJournalEntry(user.id, {
        content: entry.trim(),
        insights: journalInsights,
        aiMetadata: {
          model: aiResponse.data.metadata.model,
          tokensUsed: aiResponse.data.metadata.tokensUsed,
          processingTimeMs: aiResponse.data.metadata.processingTimeMs,
          confidenceScore: aiResponse.data.metadata.confidenceScore,
          promptInfo: {
            type: promptType,
            prompt: JOURNAL_PROMPTS[promptType][currentPrompt]
          },
          emotions: selectedEmotions
        }
      });

      console.debug('[JournalingEntry] Entry saved successfully:', { entryId: savedEntry.id });
      setInsights(journalInsights);
      
      // Ensure all state updates are done before showing dialog
      setLoading(false);
      setIsAnalyzing(false);
      setShowDialog(true);
      
    } catch (error) {
      console.error('[JournalingEntry] Error saving entry:', error);
      setError(error.message || 'Failed to save journal entry');
      setSnackbarVisible(true);
      setLoading(false);
      setIsAnalyzing(false);
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
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowDialog(false);
      
      // Clear states
      setEntry('');
      setInsights(null);
      setError(null);
      
      // Navigate after a small delay
      setTimeout(() => {
        navigation.navigate('ExercisesDashboard');
      }, 100);
    } catch (error) {
      console.error('[JournalingEntry] Error in handleFinish:', error);
      navigation.navigate('ExercisesDashboard');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={JOURNAL_BACKGROUND} />
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
              color={COLORS.text} 
            />
            <Appbar.Content 
              title="Journal Entry" 
              titleStyle={styles.appbarTitle}
            />
            <Button 
              mode="text"
              loading={loading}
              disabled={!entry.trim() || loading}
              onPress={handleSaveEntry}
              labelStyle={styles.saveButtonLabel}
              style={styles.saveButton}
            >
              Save
            </Button>
          </Appbar.Header>

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
        </SafeAreaView>
      </KeyboardAvoidingView>

      <CustomDialog
        visible={showDialog}
        onDismiss={handleFinish}
        title="Entry Saved!"
        content={
          <View style={styles.dialogContent}>
            <Text style={styles.dialogText}>
              Great job! Your journal entry has been saved and analyzed. 
              Regular journaling helps improve self-awareness and emotional intelligence.
            </Text>
            {insights && (
              <Text style={styles.insightsText}>
                {insights}
              </Text>
            )}
          </View>
        }
        icon="check-circle-outline"
        confirmText="Done"
        onConfirm={handleFinish}
        iconColor={COLORS.primary}
        iconBackgroundColor={`${COLORS.primary}15`}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
        action={{
          label: error?.includes('discard') ? 'Yes' : 'OK',
          onPress: () => {
            setSnackbarVisible(false);
            if (error?.includes('discard')) {
              navigation.goBack();
            }
          },
        }}
      >
        {error}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: JOURNAL_BACKGROUND,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  appbar: {
    backgroundColor: JOURNAL_BACKGROUND,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  appbarTitle: {
    color: COLORS.text,
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
  },
  saveButton: {
    marginRight: SPACING.xs,
  },
  saveButtonLabel: {
    color: COLORS.primary,
    fontWeight: FONT.weight.semiBold,
  },
  dialogContent: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  dialogText: {
    textAlign: 'center',
    color: COLORS.textLight,
    lineHeight: 22,
  },
  insightsText: {
    textAlign: 'left',
    color: COLORS.text,
    lineHeight: 24,
    fontStyle: 'italic',
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    width: '100%',
  },
  snackbar: {
    bottom: SPACING.md,
  },
});

export default JournalingEntry; 