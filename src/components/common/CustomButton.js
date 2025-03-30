import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, FONT, SPACING, SHADOWS } from '../../config/theme';

const CustomButton = ({
  title,
  onPress,
  type = 'primary',
  disabled = false,
  loading = false,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[type],
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={type === 'primary' ? COLORS.background : COLORS.primary} />
      ) : (
        <Text style={[styles.text, styles[`${type}Text`]]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  text: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.medium,
  },
  primary: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.small,
  },
  primaryText: {
    color: COLORS.background,
  },
  secondary: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryText: {
    color: COLORS.primary,
  },
  tertiary: {
    backgroundColor: 'transparent',
  },
  tertiaryText: {
    color: COLORS.primary,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default CustomButton; 