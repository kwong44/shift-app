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
 * @param {number} props.iconSize - Size of the icon (default: 80)
 * @param {string} props.confirmText - Text for the confirm button (default: 'OK')
 * @param {function} props.onConfirm - Callback when confirm button is pressed
 * @param {string} props.confirmMode - Button mode for confirm button (default: 'contained')
 * @param {string} props.cancelText - Text for optional cancel button
 * @param {function} props.onCancel - Callback when cancel button is pressed
 * @param {boolean} props.showIcon - Whether to show the icon (default: true)
 */
const CustomDialog = ({
  visible,
  onDismiss,
  title,
  content,
  icon = 'information',
  iconColor,
  iconBackgroundColor,
  iconSize = 80,
  confirmText = 'OK',
  onConfirm,
  confirmMode = 'contained',
  cancelText,
  onCancel,
  showIcon = true
}) => {
  const theme = useTheme();
  
  // Debug logs
  console.log(`DEBUG: CustomDialog rendered with title: ${title}`);
  console.log(`DEBUG: CustomDialog visible state: ${visible}`);

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={styles.dialog}
      >
        <View style={styles.dialogContent}>
          {showIcon && (
            <Avatar.Icon 
              size={iconSize} 
              icon={icon} 
              style={styles.dialogIcon} 
              color={iconColor || theme.colors.primary}
              backgroundColor={iconBackgroundColor || theme.colors.primaryContainer} 
            />
          )}
          
          {title && <Dialog.Title style={styles.dialogTitle}>{title}</Dialog.Title>}
          
          <Dialog.Content>
            {typeof content === 'string' ? (
              <Text variant="bodyMedium" style={styles.dialogText}>
                {content}
              </Text>
            ) : (
              content
            )}
          </Dialog.Content>
          
          <Dialog.Actions style={styles.dialogActions}>
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
    paddingVertical: SPACING.lg,
  },
  dialogIcon: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  dialogTitle: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  dialogText: {
    textAlign: 'center',
    marginHorizontal: SPACING.lg,
    color: theme => theme.colors.onSurfaceVariant,
  },
  dialogActions: {
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  dialogButton: {
    borderRadius: 30,
    marginHorizontal: SPACING.xs,
    paddingHorizontal: SPACING.lg,
  },
});

export default CustomDialog; 