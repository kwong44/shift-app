import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Button } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../config/theme';

/**
 * A common button component used in exercise setup screens.
 * Appears fixed at the bottom of the screen with consistent styling.
 * 
 * @param {Object} props
 * @param {string} props.label - The button text
 * @param {Function} props.onPress - Button press handler
 * @param {string} [props.icon] - Optional icon name from MaterialCommunityIcons
 * @param {string} [props.backgroundColor] - Optional custom background color
 * @param {boolean} [props.loading] - Optional loading state
 * @param {boolean} [props.disabled] - Optional disabled state
 */
const SetupScreenButton = ({ 
  label, 
  onPress, 
  icon, 
  backgroundColor = COLORS.primary,
  loading = false,
  disabled = false,
}) => {
  return (
    <Button
      mode="contained"
      onPress={onPress}
      style={[styles.button, { backgroundColor }]}
      labelStyle={styles.buttonLabel}
      icon={icon}
      loading={loading}
      disabled={disabled}
    >
      {label}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
    paddingVertical: 4,
    height: 48,
    ...SHADOWS.medium,
  },
  buttonLabel: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    lineHeight: 24,
  },
});

export default SetupScreenButton; 