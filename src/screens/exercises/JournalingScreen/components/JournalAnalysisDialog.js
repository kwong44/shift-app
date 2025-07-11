import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Theme & UI constants
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';

// Re-use the generic dialog wrapper already in the codebase
import CustomDialog from '../../../../components/common/CustomDialog';

/**
 * JournalAnalysisDialog – Encapsulates the "Entry Saved → AI Analysis" flow.
 *
 * NOTE: This component is *presentation-only* – all business logic such as
 * checking credits, toggling favorites, purchasing credits, etc. is delegated
 * to the parent via props. This keeps the component reusable and easy to unit
 * test.
 *
 * Props
 * -------------------------------------------------------------------------
 * visible            – Boolean flag to show/hide the dialog
 * onDismiss          – Callback when the dialog is dismissed via backdrop
 * onConfirm          – Callback for the main confirm button ("Done" / "Skip")
 * isAnalyzing        – Boolean – Whether the AI insight request is running
 * insights           – String | null – If present, shows AI insights section
 * patternAnalysis    – Object | null – Passed straight through to
 *                       <CustomDialog> so the PatternRecommendationCard is
 *                       rendered automatically.
 * loadingCredits     – Boolean – Whether the credit balance is loading
 * userCredits        – Number – User's current credit balance
 * onFavoriteToggle   – () => void – Toggle favorite
 * isFavorite         – Boolean – Favorite status
 * favoriteLoading    – Boolean – Loading state for favorite action
 * onNavigate         – (obj) => void – handle pattern rec nav
 * onGetAiInsights    – () => void – Callback to get AI insights
 * -------------------------------------------------------------------------
 */
const JournalAnalysisDialog = ({
  visible,
  onDismiss,
  onConfirm,
  isAnalyzing,
  insights,
  patternAnalysis,
  onFavoriteToggle,
  isFavorite,
  favoriteLoading,
  onNavigate,
  onGetAiInsights,
}) => {
  // Debug – helps confirm prop flow
  console.debug('[JournalAnalysisDialog] Render', {
    visible,
    insightsPresent: !!insights,
    isAnalyzing,
  });

  // -----------------------------------------------------------------------
  // Dialog body content – kept static for clarity. Any user interaction is
  // handed back to the parent via the callbacks above.
  // -----------------------------------------------------------------------
  const bodyContent = (
    <View style={styles.dialogContent}>
      <Text style={styles.dialogText}>
        Great job! Your journal entry has been saved.
      </Text>

      {/* AI Analysis Offer (only show if not already analysed) */}
      {!insights && (
        <View style={styles.aiAnalysisSection}>
          <Text style={styles.aiAnalysisTitle}>Get AI Insights & Pattern Analysis</Text>
          <Text style={styles.aiAnalysisDescription}>
            Unlock personalized insights and exercise recommendations based on your journal entry.
          </Text>

          {/* Action Buttons */}
          <View style={styles.aiActionButtons}>
            <Button
              mode="contained"
              disabled={isAnalyzing}
              loading={isAnalyzing}
              onPress={onGetAiInsights}
              style={styles.aiAnalysisButton}
              labelStyle={styles.aiAnalysisButtonText}
              icon="brain"
            >
              {isAnalyzing ? 'Analyzing...' : 'Get AI Insights'}
            </Button>
          </View>
        </View>
      )}

      {/* Insights */}
      {insights && !isAnalyzing && (
        <ScrollView
          style={styles.insightsScrollContainer}
          showsVerticalScrollIndicator
          nestedScrollEnabled
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
  );

  return (
    <CustomDialog
      visible={visible}
      onDismiss={onDismiss}
      title="Entry Saved"
      content={bodyContent}
      icon="check-circle-outline"
      confirmText={insights ? 'Done' : 'Skip For Now'}
      onConfirm={onConfirm}
      iconColor={COLORS.primary}
      iconBackgroundColor={`${COLORS.primary}15`}
      showFavoriteButton={!!onFavoriteToggle}
      isFavorite={isFavorite}
      onFavoriteToggle={onFavoriteToggle}
      favoriteLoading={favoriteLoading}
      patternAnalysis={patternAnalysis}
      onNavigateToRecommendedExercise={onNavigate}
    />
  );
};

export default JournalAnalysisDialog;

// ---------------------------------------------------------------------------
// Styles – mostly copied from the original inline styles to preserve look & feel
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
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
  insightsScrollContainer: {
    maxHeight: 120,
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
}); 