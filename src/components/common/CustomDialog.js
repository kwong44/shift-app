import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Keyboard } from 'react-native';
import { Dialog, Portal, Button, Text, IconButton, Paragraph } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT } from '../../config/theme';
import PatternRecommendationCard from '../../screens/exercises/JournalingScreen/components/PatternRecommendationCard';

const { height: screenHeight } = Dimensions.get('window');

/**
 * CustomDialog - A reusable dialog component with consistent styling
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Controls dialog visibility
 * @param {function} props.onDismiss - Callback when dialog is dismissed
 * @param {string} props.title - Dialog title text
 * @param {string} props.content - Dialog content text
 * @param {string} props.icon - Material icon name (default: 'information')
 * @param {string} props.iconColor - Icon color (uses theme.colors.primary by default)
 * @param {string} props.iconBackgroundColor - Icon background color (uses theme.colors.primaryContainer by default)
 * @param {number} props.iconSize - Size of the icon (default: 60)
 * @param {string} props.confirmText - Text for the confirm button (default: 'OK')
 * @param {function} props.onConfirm - Callback when confirm button is pressed
 * @param {string} props.confirmMode - Button mode for confirm button (default: 'contained')
 * @param {string} props.cancelText - Text for optional cancel button
 * @param {function} props.onCancel - Callback when cancel button is pressed
 * @param {boolean} props.showIcon - Whether to show the icon (default: false)
 * @param {boolean} props.showFavoriteButton - Whether to show the favorite button (default: false)
 * @param {boolean} props.isFavorite - Current favorite status (default: false)
 * @param {function} props.onFavoriteToggle - Callback when favorite button is pressed
 * @param {boolean} props.favoriteLoading - Whether favorite action is loading (default: false)
 * @param {object} props.patternAnalysis - Pattern analysis object
 * @param {function} props.onNavigateToRecommendedExercise - Callback to navigate to recommended exercise
 */
const CustomDialog = ({
  visible,
  onDismiss,
  title,
  content,
  icon = 'information',
  iconColor,
  iconBackgroundColor,
  iconSize = 60,
  confirmText = 'OK',
  onConfirm,
  confirmMode = 'contained',
  cancelText,
  onCancel,
  showIcon = false,
  showFavoriteButton = false,
  isFavorite = false,
  onFavoriteToggle,
  favoriteLoading = false,
  patternAnalysis = null,
  onNavigateToRecommendedExercise = null
}) => {
  // Debug log
  console.debug('DEBUG: CustomDialog rendered with title:', title);
  console.debug('DEBUG: CustomDialog visible state:', visible);
  console.debug('DEBUG: CustomDialog showFavoriteButton:', showFavoriteButton, 'isFavorite:', isFavorite);
  console.debug('DEBUG: CustomDialog onFavoriteToggle function exists:', typeof onFavoriteToggle === 'function');
  console.debug('DEBUG: CustomDialog favoriteLoading:', favoriteLoading);
  console.debug('DEBUG: CustomDialog patternAnalysis:', patternAnalysis);

  if (showFavoriteButton) {
    console.debug('DEBUG: CustomDialog - Favorites button SHOULD be visible!');
  }

  const [expandedInsights, setExpandedInsights] = useState(false);
  
  // Dismiss keyboard when dialog opens
  React.useEffect(() => {
    if (visible) {
      Keyboard.dismiss();
    }
  }, [visible]);

  const screenHeight = Dimensions.get('window').height;
  const maxDialogHeight = screenHeight * 0.8; // 80% of screen height

  // Determine if content should be truncated
  const shouldTruncateContent = typeof content === 'string' && content.length > 300 && !expandedInsights;
  const displayContent = shouldTruncateContent ? content.substring(0, 300) + '...' : content;

  const handleDismissPatternRecommendation = () => {
    console.debug('[CustomDialog] Dismissing pattern recommendation');
    // Just hide the pattern analysis by setting it to null
    // This is handled by parent component state
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <ScrollView 
          style={[styles.scrollContainer, { maxHeight: maxDialogHeight }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Title */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
            </View>

            {showFavoriteButton && (
              <IconButton
                icon={isFavorite ? 'heart' : 'heart-outline'}
                iconColor={isFavorite ? COLORS.error : COLORS.textLight}
                size={24}
                onPress={onFavoriteToggle}
                disabled={favoriteLoading}
                style={styles.favoriteButton}
                accessibilityLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
              />
            )}
          </View>

          {/* Pattern Recommendation Card (if available) */}
          {patternAnalysis && patternAnalysis.pattern_detected && (
            <View style={styles.patternRecommendationContainer}>
              <PatternRecommendationCard
                patternAnalysis={patternAnalysis}
                onNavigateToExercise={onNavigateToRecommendedExercise}
                onDismiss={handleDismissPatternRecommendation}
                visible={true}
              />
            </View>
          )}

          {/* Main Content */}
          <View style={styles.content}>
            {typeof displayContent === 'string' ? (
              <Paragraph style={styles.contentText}>
                {displayContent}
              </Paragraph>
            ) : (
              displayContent
            )}
            
            {/* Expand/Collapse for long content */}
            {typeof content === 'string' && content.length > 300 && (
              <Button 
                mode="text" 
                onPress={() => setExpandedInsights(!expandedInsights)}
                style={styles.expandButton}
                labelStyle={styles.expandButtonText}
                icon={expandedInsights ? "chevron-up" : "chevron-down"}
              >
                {expandedInsights ? "Show less" : "Read more"}
              </Button>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {cancelText && onCancel && (
              <Button
                mode="outlined"
                onPress={onCancel}
                style={[styles.button, styles.cancelButton]}
                labelStyle={styles.cancelButtonText}
              >
                {cancelText}
              </Button>
            )}
            
            {/* Render confirm button only if text is provided */}
            {Boolean(confirmText) && (
              <Button
                mode={confirmMode}
                onPress={onConfirm || onDismiss}
                style={[styles.button, styles.confirmButton, styles.fullWidthButton]}
                labelStyle={styles.confirmButtonText}
              >
                {confirmText}
              </Button>
            )}
          </View>
        </ScrollView>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    margin: SPACING.lg,
  },
  scrollContainer: {
    flexGrow: 0, // Prevent unnecessary expansion
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  iconContainer: {
    borderRadius: RADIUS.full,
    marginRight: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    margin: 0,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    lineHeight: 28,
  },
  favoriteButton: {
    margin: 0,
  },
  patternRecommendationContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    minHeight: 40, // Ensure minimum content area
  },
  contentText: {
    fontSize: FONT.size.md,
    lineHeight: 22,
    color: COLORS.text,
    textAlign: 'left',
  },
  expandButton: {
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  expandButtonText: {
    color: COLORS.primary,
    fontSize: FONT.size.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  button: {
    minWidth: 80,
  },
  cancelButton: {
    borderColor: COLORS.textLight,
  },
  cancelButtonText: {
    color: COLORS.textLight,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    flex: 1, // Make button take available space
  },
  confirmButtonText: {
    color: COLORS.surface,
  },
  fullWidthButton: {
    flex: 1, // Ensure it takes full width in the actions container if it's the only button
  },
});

export default CustomDialog; 