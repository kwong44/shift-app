import React from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  Dialog, 
  Portal, 
  Text, 
  Button, 
  Avatar, 
  useTheme 
} from 'react-native-paper';
import { SPACING } from '../../config/theme';

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
 * @param {boolean} props.showIcon - Whether to show the icon (default: true)
 * @param {boolean} props.showFavoriteButton - Whether to show the favorite button (default: false)
 * @param {boolean} props.isFavorite - Current favorite status (default: false)
 * @param {function} props.onFavoriteToggle - Callback when favorite button is pressed
 * @param {boolean} props.favoriteLoading - Whether favorite action is loading (default: false)
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
  showIcon = true,
  showFavoriteButton = false,
  isFavorite = false,
  onFavoriteToggle,
  favoriteLoading = false
}) => {
  const theme = useTheme();
  
  // Debug logs
  console.log(`DEBUG: CustomDialog rendered with title: ${title}`);
  console.log(`DEBUG: CustomDialog visible state: ${visible}`);
  console.log(`DEBUG: CustomDialog showFavoriteButton: ${showFavoriteButton}, isFavorite: ${isFavorite}`);
  console.log(`DEBUG: CustomDialog onFavoriteToggle function exists: ${!!onFavoriteToggle}`);
  console.log(`DEBUG: CustomDialog favoriteLoading: ${favoriteLoading}`);
  
  // Additional debug for troubleshooting
  if (showFavoriteButton) {
    console.log(`DEBUG: CustomDialog - Favorites button SHOULD be visible!`);
  } else {
    console.log(`DEBUG: CustomDialog - Favorites button will NOT show because showFavoriteButton is false`);
  }

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={styles.dialog}
      >
        <View style={styles.dialogContent}>
          {/* Header with icon */}
          <View style={styles.headerContainer}>
            {showIcon && (
              <Avatar.Icon 
                size={iconSize} 
                icon={icon} 
                style={styles.dialogIcon} 
                color={iconColor || theme.colors.primary}
                backgroundColor={iconBackgroundColor || theme.colors.primaryContainer} 
              />
            )}
          </View>
          
          {title && <Dialog.Title style={styles.dialogTitle}>{title}</Dialog.Title>}
          
          <Dialog.Content style={styles.dialogContentContainer}>
            {typeof content === 'string' ? (
              <Text variant="bodyMedium" style={styles.dialogText}>
                {content}
              </Text>
            ) : (
              content
            )}
          </Dialog.Content>
          
          <Dialog.Actions style={styles.dialogActions}>
            {/* Favorite button - shown first if enabled */}
            {showFavoriteButton && (
              <Button 
                mode="outlined"
                onPress={() => {
                  console.log('DEBUG: CustomDialog favorite button pressed');
                  onFavoriteToggle && onFavoriteToggle();
                }}
                loading={favoriteLoading}
                disabled={favoriteLoading}
                style={[styles.dialogButton, styles.favoriteButtonStyle]}
                labelStyle={styles.favoriteButtonLabel}
                icon={isFavorite ? 'heart' : 'heart-outline'}
              >
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </Button>
            )}
            
            {/* Action buttons row */}
            <View style={styles.actionButtonsRow}>
              {cancelText && (
                <Button 
                  onPress={() => {
                    console.log('DEBUG: CustomDialog cancel button pressed');
                    onCancel && onCancel();
                  }}
                  style={styles.dialogButton}
                >
                  {cancelText}
                </Button>
              )}
              
              <Button 
                mode={confirmMode}
                onPress={() => {
                  console.log('DEBUG: CustomDialog confirm button pressed');
                  onConfirm && onConfirm();
                }}
                style={styles.dialogButton}
              >
                {confirmText}
              </Button>
            </View>
          </Dialog.Actions>
        </View>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 20,
    backgroundColor: 'white',
  },
  dialogContent: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  dialogIcon: {
    // Icon is centered by default due to headerContainer justifyContent: 'center'
  },
  dialogTitle: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  dialogContentContainer: {
    paddingVertical: 0,
    paddingHorizontal: SPACING.md,
  },
  dialogText: {
    textAlign: 'center',
    color: theme => theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  dialogActions: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  dialogButton: {
    minWidth: 200,
  },
  favoriteButtonStyle: {
    borderColor: '#FF6B6B',
    marginBottom: SPACING.sm,
    minWidth: 200,
  },
  favoriteButtonLabel: {
    color: '#FF6B6B',
    fontSize: 14,
  },
});

export default CustomDialog; 