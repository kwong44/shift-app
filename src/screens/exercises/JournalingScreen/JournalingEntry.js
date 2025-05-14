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
  IconButton,
  FAB
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

const { height } = Dimensions.get('window');

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
      <StatusBar barStyle="light-content" backgroundColor={selectedPromptType.gradient[0]} />
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
                title="Journaling" 
                titleStyle={styles.appbarTitle}
                subtitle={selectedPromptType.label}
                subtitleStyle={styles.appbarSubtitle}
              />
              <IconButton
                icon="information"
                iconColor={COLORS.background}
                size={24}
                onPress={() => {
                  // TODO: Show info modal about journaling
                }}
              />
            </Appbar.Header>

            <View style={styles.content}>
              <JournalEntryCard
                prompt={JOURNAL_PROMPTS[promptType][currentPrompt]}
                entry={entry}
                onChangeText={setEntry}
                textInputHeight={textInputHeight}
                onContentSizeChange={e => {
                  const minHeight = height * 0.4;
                  const maxHeight = height * 0.6;
                  const newHeight = Math.max(minHeight, Math.min(e.nativeEvent.contentSize.height, maxHeight));
                  setTextInputHeight(newHeight);
                }}
                loading={loading}
                isAnalyzing={isAnalyzing}
              />
            </View>

            <View style={styles.footer}>
              <View style={styles.promptNavigation}>
                <IconButton
                  icon="chevron-left"
                  iconColor={currentPrompt > 0 ? COLORS.background : 'rgba(255,255,255,0.3)'}
                  size={28}
                  onPress={handlePreviousPrompt}
                  disabled={currentPrompt === 0}
                />
                <Text style={styles.promptCounter}>
                  {currentPrompt + 1} / {JOURNAL_PROMPTS[promptType].length}
                </Text>
                <IconButton
                  icon="chevron-right"
                  iconColor={currentPrompt < JOURNAL_PROMPTS[promptType].length - 1 ? COLORS.background : 'rgba(255,255,255,0.3)'}
                  size={28}
                  onPress={handleNextPrompt}
                  disabled={currentPrompt === JOURNAL_PROMPTS[promptType].length - 1}
                />
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>

        <FAB
          icon="check"
          label="Save Entry"
          style={[
            styles.fab,
            { backgroundColor: entry.trim() ? COLORS.background : 'rgba(255,255,255,0.5)' }
          ]}
          color={selectedPromptType.gradient[0]}
          onPress={handleSaveEntry}
          disabled={!entry.trim() || loading}
          loading={loading}
        />

        <Portal>
          <Dialog visible={showDialog} onDismiss={handleFinish}>
            <LinearGradient
              colors={[`${COLORS.primary}10`, `${COLORS.secondary}05`]}
              style={styles.dialogGradient}
            >
              <Dialog.Title style={styles.dialogTitle}>Entry Saved!</Dialog.Title>
              <Dialog.Content>
                <View style={styles.dialogContent}>
                  <MaterialCommunityIcons 
                    name="check-circle-outline" 
                    size={48} 
                    color={COLORS.primary} 
                    style={styles.dialogIcon} 
                  />
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
              </Dialog.Content>
              <Dialog.Actions>
                <Button 
                  onPress={handleFinish} 
                  mode="contained" 
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
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenGradient: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  safeArea: {
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
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONT.size.sm,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  promptNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.full,
    alignSelf: 'center',
  },
  promptCounter: {
    color: COLORS.background,
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
    marginHorizontal: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
  },
  dialogGradient: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  dialogTitle: {
    textAlign: 'center',
    color: COLORS.text,
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
  },
  dialogContent: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  dialogIcon: {
    marginBottom: SPACING.sm,
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
  dialogButton: {
    marginTop: SPACING.md,
  },
  snackbar: {
    bottom: SPACING.md,
  },
});

export default JournalingEntry; 