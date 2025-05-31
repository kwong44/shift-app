import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, Dimensions, KeyboardAvoidingView, Platform, Keyboard, ScrollView } from 'react-native';
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
import PatternRecommendationCard from './components/PatternRecommendationCard';
import { JOURNAL_PROMPTS, PROMPT_TYPES } from './constants';
import { useUser } from '../../../hooks/useUser';
import CustomDialog from '../../../components/common/CustomDialog';
import { supabase } from '../../../config/supabase';
import { getFavoriteExerciseIds } from '../../../api/profile';
import useExerciseFavorites from '../../../hooks/useExerciseFavorites';
import { checkUserTokens } from '../../../api/aiCoach';

const { height } = Dimensions.get('window');

// Light gray color for journaling
const JOURNAL_GRAY = '#7A7A7A';
const JOURNAL_BACKGROUND = '#F0F0F0';

const JournalingEntry = ({ route, navigation }) => {
  const { promptType, selectedEmotions, masterExerciseId, exerciseType, originRouteName } = route.params;
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
  const [patternAnalysis, setPatternAnalysis] = useState(null);
  const [savedEntryId, setSavedEntryId] = useState(null);
  const [userCredits, setUserCredits] = useState(null);
  const [loadingCredits, setLoadingCredits] = useState(false);

  // Favorites functionality
  const { 
    toggleFavorite, 
    getFavoriteStatus, 
    getLoadingStatus, 
    setInitialFavoriteStatus 
  } = useExerciseFavorites(user?.id);

  // Get the selected prompt type data
  const selectedPromptType = PROMPT_TYPES.find(type => type.value === promptType);

  // Load initial favorite status
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (user?.id && masterExerciseId) {
        console.debug('[JournalingEntry] Loading favorite status for exercise:', masterExerciseId);
        try {
          const favoriteIds = await getFavoriteExerciseIds(user.id);
          const isFavorite = favoriteIds.includes(masterExerciseId);
          setInitialFavoriteStatus(masterExerciseId, isFavorite);
          console.debug('[JournalingEntry] Initial favorite status loaded:', isFavorite);
        } catch (error) {
          console.error('[JournalingEntry] Error loading favorite status:', error);
        }
      }
    };

    loadFavoriteStatus();
  }, [user?.id, masterExerciseId, setInitialFavoriteStatus]);

  // Load user's credit balance
  useEffect(() => {
    const loadUserCredits = async () => {
      if (!user?.id) {
        console.debug('[JournalingEntry] No user ID available for credit loading');
        return;
      }
      
      console.debug('[JournalingEntry] Starting to load user credits for user:', user.id);
      setLoadingCredits(true);
      
      try {
        console.debug('[JournalingEntry] Calling checkUserTokens()...');
        const creditsResponse = await checkUserTokens();
        console.debug('[JournalingEntry] checkUserTokens response:', creditsResponse);
        
        if (creditsResponse && creditsResponse.hasEnough !== undefined) {
          // checkUserTokens returns { hasEnough, tokens, credits, isLow }
          const credits = creditsResponse.credits || 0;
          setUserCredits(credits);
          console.debug('[JournalingEntry] User credits loaded successfully:', credits);
        } else {
          console.warn('[JournalingEntry] Invalid response from checkUserTokens:', creditsResponse);
          setUserCredits(0);
        }
      } catch (error) {
        console.error('[JournalingEntry] Error loading user credits:', error);
        setUserCredits(0);
      } finally {
        setLoadingCredits(false);
        console.debug('[JournalingEntry] Finished loading credits, loadingCredits set to false');
      }
    };

    loadUserCredits();
  }, [user?.id]);

  const handleFavoriteToggle = async () => {
    if (!masterExerciseId) {
      console.warn('[JournalingEntry] No masterExerciseId available for favorite toggle');
      return;
    }

    const currentStatus = getFavoriteStatus(masterExerciseId, false);
    console.debug('[JournalingEntry] Toggling favorite for exercise:', masterExerciseId, 'Current status:', currentStatus);
    
    const newStatus = await toggleFavorite(masterExerciseId, currentStatus);
    
    // Show feedback message
    const message = newStatus ? 'Added to favorites!' : 'Removed from favorites';
    setError(message);
    setSnackbarVisible(true);
  };

  // Debug logging - only log when props change
  useEffect(() => {
    console.debug('[JournalingEntry] Props or state updated:', {
      promptType,
      masterExerciseId,
      exerciseType,
      currentPrompt,
      promptText: JOURNAL_PROMPTS[promptType]?.[currentPrompt],
      selectedPromptType,
      entryLength: entry?.length || 0,
      originRouteName,
      userId: user?.id
    });
  }, [promptType, masterExerciseId, exerciseType, originRouteName, currentPrompt, selectedPromptType, entry, user]);

  const handleSaveEntry = async () => {
    if (!entry.trim()) {
      setError('Please write something in your journal');
      setSnackbarVisible(true);
      return;
    }
    if (!user?.id) {
      console.error('[JournalingEntry] handleSaveEntry: No user ID available.');
      setError('Cannot save entry: User information missing.');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      console.debug('[JournalingEntry] Saving journal entry without AI analysis');

      // Save journal entry WITHOUT AI analysis (free)
      const savedEntry = await createJournalEntry(user.id, {
        content: entry.trim(),
        insights: null, // No AI insights yet
        aiMetadata: {
          promptInfo: {
            type: promptType,
            prompt: JOURNAL_PROMPTS[promptType][currentPrompt]
          },
          emotions: selectedEmotions,
          hasAiAnalysis: false // Indicates no AI analysis performed yet
        }
      });

      console.debug('[JournalingEntry] Entry saved successfully without AI analysis:', { entryId: savedEntry.id });
      
      // Store the saved entry ID for potential AI analysis later
      setSavedEntryId(savedEntry.id);
      
      // Log to daily_exercise_logs
      if (masterExerciseId) {
        const dailyLogEntry = {
          user_id: user.id,
          exercise_id: masterExerciseId,
          exercise_type: exerciseType || 'Journaling',
          duration_seconds: 0,
          completed_at: new Date().toISOString(),
          source: 'JournalingEntry',
          metadata: {
            prompt_type: promptType,
            prompt_text: JOURNAL_PROMPTS[promptType]?.[currentPrompt],
            entry_length: entry.trim().length,
            emotions_selected_count: selectedEmotions?.length || 0,
            has_ai_analysis: false, // No AI analysis yet
            journal_entry_id: savedEntry.id
          }
        };
        console.debug('[JournalingEntry] Attempting to insert into daily_exercise_logs:', dailyLogEntry);
        supabase.from('daily_exercise_logs').insert(dailyLogEntry)
          .then(({ error: dailyErr }) => {
            if (dailyErr) console.error('[JournalingEntry] Error inserting to daily_exercise_logs:', dailyErr.message);
            else console.debug('[JournalingEntry] Inserted to daily_exercise_logs.');
          });
      } else {
        console.warn('[JournalingEntry] masterExerciseId not available, cannot log to daily_exercise_logs.');
      }
      
      // Clear states and show dialog with AI analysis option
      setLoading(false);
      
      // Dismiss keyboard before showing dialog
      Keyboard.dismiss();
      
      // Add a small delay to ensure keyboard dismisses smoothly
      setTimeout(() => {
        setShowDialog(true);
      }, 100);
      
    } catch (error) {
      console.error('[JournalingEntry] Error saving entry:', error);
      setError(error.message || 'Failed to save journal entry');
      setSnackbarVisible(true);
      setLoading(false);
    }
  };

  /**
   * Handle AI analysis as a separate credit-based step
   */
  const handleGetAiInsights = async () => {
    if (!user?.id || !savedEntryId || !entry.trim()) {
      console.error('[JournalingEntry] handleGetAiInsights: Missing required data');
      setError('Cannot analyze entry: Missing entry data');
      setSnackbarVisible(true);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      console.debug('[JournalingEntry] Getting AI insights for saved journal entry');
      
      const aiResponse = await analyzeText(entry.trim(), {
        type: 'journal',
        promptType,
        emotions: selectedEmotions
      }, true);

      if (!aiResponse.success) {
        throw new Error(aiResponse.error || 'Failed to analyze journal entry');
      }

      const journalInsights = aiResponse.data.analysis;
      const journalPatternAnalysis = aiResponse.data.patternAnalysis;
      console.debug('[JournalingEntry] AI analysis completed', {
        hasInsights: !!journalInsights,
        hasPatternAnalysis: !!journalPatternAnalysis,
        patternDetected: journalPatternAnalysis?.pattern_detected,
        tokensUsed: aiResponse.data.metadata.tokensUsed
      });

      // Update the saved journal entry with AI insights
      const { error: updateError } = await supabase
        .from('journal_entries')
        .update({
          insights: journalInsights,
          ai_metadata: {
            model: aiResponse.data.metadata.model,
            tokensUsed: aiResponse.data.metadata.tokensUsed,
            processingTimeMs: aiResponse.data.metadata.processingTimeMs,
            hasPatternAnalysis: aiResponse.data.metadata.hasPatternAnalysis,
            patternAnalysis: journalPatternAnalysis,
            promptInfo: {
              type: promptType,
              prompt: JOURNAL_PROMPTS[promptType][currentPrompt]
            },
            emotions: selectedEmotions,
            hasAiAnalysis: true
          }
        })
        .eq('id', savedEntryId);

      if (updateError) {
        throw new Error(`Failed to update entry with insights: ${updateError.message}`);
      }

      console.debug('[JournalingEntry] Entry updated with AI insights successfully');
      setInsights(journalInsights);
      setPatternAnalysis(journalPatternAnalysis);
      
      // Refresh user credits after analysis (since credits were deducted)
      try {
        const creditsResponse = await checkUserTokens();
        if (creditsResponse.success) {
          setUserCredits(creditsResponse.credits);
          console.debug('[JournalingEntry] User credits refreshed after AI analysis:', creditsResponse.credits);
        }
      } catch (creditsError) {
        console.warn('[JournalingEntry] Failed to refresh credits after analysis:', creditsError);
      }
      
      // Update daily_exercise_logs to reflect AI analysis
      if (masterExerciseId) {
        console.debug(`[JournalingEntry] Attempting to update daily_exercise_logs for journal entry ID: ${savedEntryId}`);
        const { error: logUpdateError } = await supabase
          .from('daily_exercise_logs')
          .update({
            metadata: {
              prompt_type: promptType,
              prompt_text: JOURNAL_PROMPTS[promptType]?.[currentPrompt],
              entry_length: entry.trim().length,
              emotions_selected_count: selectedEmotions?.length || 0,
              has_ai_analysis: true,
              ai_tokens_used: aiResponse.data.metadata.tokensUsed,
              journal_entry_id: savedEntryId // This is correct for storing within metadata
            }
          })
          // Corrected filter: Query within the JSONB metadata column
          // Assumes savedEntryId is a string (UUID or text). If it's a number, casting might be needed.
          .eq('metadata->>journal_entry_id', savedEntryId);

        if (logUpdateError) {
          console.warn('[JournalingEntry] Warning: Could not update daily_exercise_logs with AI analysis data:', logUpdateError);
        } else {
          console.debug('[JournalingEntry] Updated daily_exercise_logs with AI analysis data for journal_entry_id:', savedEntryId);
        }
      }
      
      setIsAnalyzing(false);
      
    } catch (error) {
      console.error('[JournalingEntry] Error analyzing entry:', error);
      setError(error.message || 'Failed to analyze journal entry');
      setSnackbarVisible(true);
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

  /**
   * Handle navigation to recommended exercise from pattern analysis
   */
  const handleNavigateToRecommendedExercise = (recommendation) => {
    console.debug('[JournalingEntry] Navigating to recommended exercise:', recommendation);
    
    // Extract exerciseId and exerciseType from the recommendation object
    const { exercise_id: exerciseId, exercise_type: exerciseType } = recommendation;
    
    console.debug('[JournalingEntry] Extracted navigation params:', { exerciseId, exerciseType });
    
    // Dismiss the dialog first
    setShowDialog(false);
    
    // Navigate based on exercise type - same navigation logic as HomeScreen Insights
    switch (exerciseType) {
      case 'Mindfulness':
        navigation.navigate('MindfulnessSetup', { 
          preselectedExercise: exerciseId,
          source: 'pattern_recommendation' 
        });
        break;
      case 'Visualization':
        navigation.navigate('VisualizationSetup', { 
          preselectedExercise: exerciseId,
          source: 'pattern_recommendation' 
        });
        break;
      case 'Deep Work':
        navigation.navigate('DeepWorkSetup', { 
          source: 'pattern_recommendation' 
        });
        break;
      case 'Task Planning':
        navigation.navigate('TaskPlanner', { 
          source: 'pattern_recommendation' 
        });
        break;
      default:
        console.warn('[JournalingEntry] Unknown exercise type:', exerciseType, 'falling back to ExercisesDashboard');
        navigation.navigate('ExercisesDashboard');
    }
  };

  const handleFinish = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setShowDialog(false);
      
      // Clear states
      setEntry('');
      setInsights(null);
      setPatternAnalysis(null);
      setError(null);
      
      const targetRoute = originRouteName || 'ExercisesDashboard';
      console.debug(`[JournalingEntry] Navigating to ${targetRoute} after completion.`);
      
      setTimeout(() => {
        navigation.navigate(targetRoute);
      }, 100);
    } catch (error) {
      console.error('[JournalingEntry] Error in handleFinish:', error);
      // Fallback navigation if error occurs during state clearing or haptics
      const targetRoute = originRouteName || 'ExercisesDashboard';
      navigation.navigate(targetRoute);
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
              SAVE
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
              Great job! Your journal entry has been saved.
            </Text>
            
            {/* Credit Balance Display */}
            <View style={styles.creditBalanceContainer}>
              <MaterialCommunityIcons 
                name="circle-multiple" 
                size={16} 
                color={COLORS.primary} 
                style={styles.creditIcon}
              />
              <Text style={styles.creditBalanceText}>
                {loadingCredits ? 'Loading...' : `${userCredits || 0} credits available`}
              </Text>
            </View>

            {/* AI Analysis Section */}
            {!insights && (
              <View style={styles.aiAnalysisSection}>
                <Text style={styles.aiAnalysisTitle}>Get AI Insights & Pattern Analysis</Text>
                <Text style={styles.aiAnalysisDescription}>
                  Unlock personalized insights and exercise recommendations based on your journal entry.
                </Text>
                
                {/* Cost Estimate */}
                <View style={styles.costEstimateContainer}>
                  <Text style={styles.costEstimateText}>
                    Estimated cost: 5-15 credits
                  </Text>
                  <Text style={styles.costEstimateSubtext}>
                    (Varies by entry length and analysis complexity)
                  </Text>
                </View>

                {/* AI Analysis Button or Low Credits Warning */}
                {userCredits !== null && userCredits < 5 && (
                  <View style={styles.lowCreditsWarning}>
                    <MaterialCommunityIcons 
                      name="alert-circle-outline" 
                      size={16} 
                      color={COLORS.warning} 
                    />
                    <Text style={styles.lowCreditsText}>
                      Low credits! Consider purchasing more for continued AI features.
                    </Text>
                  </View>
                )}

                <View style={styles.aiActionButtons}>
                  <Button
                    mode="contained"
                    onPress={handleGetAiInsights}
                    disabled={isAnalyzing || (userCredits !== null && userCredits < 5)}
                    loading={isAnalyzing}
                    style={[
                      styles.aiAnalysisButton,
                      (userCredits !== null && userCredits < 5) && styles.disabledButton
                    ]}
                    labelStyle={styles.aiAnalysisButtonText}
                    icon="brain"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Get AI Insights'}
                  </Button>

                  {(userCredits !== null && userCredits < 5) && (
                    <Button
                      mode="outlined"
                      onPress={() => {
                        setShowDialog(false); // Dismiss dialog first
                        navigation.navigate('CreditsPurchase');
                      }}
                      style={styles.purchaseCreditsButton}
                      labelStyle={styles.purchaseCreditsButtonText}
                      icon="credit-card"
                    >
                      Buy Credits
                    </Button>
                  )}
                </View>
              </View>
            )}
            
            {/* Show insights if available */}
            {insights && (
              <ScrollView 
                style={styles.insightsScrollContainer}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                <Text style={styles.insightsLabel}>AI Insights:</Text>
                <Text style={styles.insightsText}>
                  {insights.length > 300 ? `${insights.substring(0, 300)}...` : insights}
                </Text>
                {insights.length > 300 && (
                  <Text style={styles.readMoreText}>
                    View full insights in your journal history
                  </Text>
                )}
              </ScrollView>
            )}
          </View>
        }
        icon="check-circle-outline"
        confirmText={insights ? "Done" : "Skip AI Analysis"}
        onConfirm={handleFinish}
        iconColor={COLORS.primary}
        iconBackgroundColor={`${COLORS.primary}15`}
        showFavoriteButton={!!masterExerciseId}
        isFavorite={getFavoriteStatus(masterExerciseId, false)}
        onFavoriteToggle={handleFavoriteToggle}
        favoriteLoading={getLoadingStatus(masterExerciseId)}
        patternAnalysis={patternAnalysis}
        onNavigateToRecommendedExercise={(recommendation) => {
          console.debug('[JournalingEntry] Pattern recommendation navigation triggered with:', recommendation);
          handleNavigateToRecommendedExercise(recommendation);
        }}
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
    color: COLORS.pinkGradient.start,
    fontWeight: FONT.weight.semiBold,
    fontSize: FONT.size.md,
  },
  dialogContent: {
    alignItems: 'center',
    gap: SPACING.md,
    width: '100%',
  },
  dialogText: {
    textAlign: 'center',
    color: COLORS.textLight,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  insightsScrollContainer: {
    maxHeight: 120, // Limit insights height to keep dialog manageable
    width: '100%',
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: SPACING.sm,
  },
  insightsLabel: {
    color: COLORS.text,
    fontWeight: FONT.weight.bold,
    marginBottom: SPACING.xs,
    fontSize: FONT.size.sm,
  },
  insightsText: {
    color: COLORS.text,
    lineHeight: 20,
    fontSize: FONT.size.sm,
  },
  readMoreText: {
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
    fontSize: FONT.size.xs,
    textAlign: 'center',
  },
  snackbar: {
    bottom: SPACING.md,
  },
  creditBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}10`,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
    width: '100%',
  },
  creditIcon: {
    marginRight: SPACING.xs,
  },
  creditBalanceText: {
    color: COLORS.text,
    fontWeight: FONT.weight.semiBold,
    fontSize: FONT.size.sm,
  },
  aiAnalysisSection: {
    alignItems: 'center',
    gap: SPACING.md,
    width: '100%',
    padding: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: RADIUS.md,
  },
  aiAnalysisTitle: {
    color: COLORS.text,
    fontWeight: FONT.weight.bold,
    fontSize: FONT.size.md,
    textAlign: 'center',
  },
  aiAnalysisDescription: {
    color: COLORS.textLight,
    textAlign: 'center',
    fontSize: FONT.size.sm,
    lineHeight: 20,
  },
  costEstimateContainer: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  costEstimateText: {
    color: COLORS.text,
    fontWeight: FONT.weight.semiBold,
    fontSize: FONT.size.sm,
  },
  costEstimateSubtext: {
    color: COLORS.textLight,
    fontStyle: 'italic',
    fontSize: FONT.size.xs,
    textAlign: 'center',
  },
  lowCreditsWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.warning}15`,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    gap: SPACING.xs,
    width: '100%',
  },
  lowCreditsText: {
    flex: 1,
    color: COLORS.warning,
    fontWeight: FONT.weight.semiBold,
    fontSize: FONT.size.xs,
  },
  aiActionButtons: {
    flexDirection: 'column',
    gap: SPACING.sm,
    width: '100%',
  },
  aiAnalysisButton: {
    backgroundColor: COLORS.primary,
  },
  aiAnalysisButtonText: {
    color: COLORS.surface,
    fontWeight: FONT.weight.semiBold,
  },
  disabledButton: {
    backgroundColor: COLORS.textLight,
    opacity: 0.5,
  },
  purchaseCreditsButton: {
    borderColor: COLORS.primary,
  },
  purchaseCreditsButtonText: {
    color: COLORS.primary,
    fontWeight: FONT.weight.semiBold,
  },
});

export default JournalingEntry; 