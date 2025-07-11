import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT, SPACING, SHADOWS, BUTTON_STYLES, RADIUS, GRADIENTS } from '../../config/theme';

const CustomButton = ({
  title,
  onPress,
  type = 'primary',
  gradient = false, 
  gradientColors = null,
  icon = null,
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  // Button with gradient background
  if (gradient && !disabled) {
    let colors = gradientColors;
    
    // Use default gradient colors based on type if not provided
    if (!colors) {
      switch (type) {
        case 'primary':
          colors = [COLORS.purpleGradient.start, COLORS.purpleGradient.end];
          break;
        case 'blue':
          colors = [COLORS.blueGradient.start, COLORS.blueGradient.end];
          break;
        case 'pink':
          colors = [COLORS.yellowGradient.start, COLORS.yellowGradient.end];
          break;
        case 'teal':
          colors = [COLORS.tealGradient.start, COLORS.tealGradient.end];
          break;
        case 'coral':
          colors = [COLORS.coralGradient.start, COLORS.coralGradient.end];
          break;
        default:
          colors = [COLORS.purpleGradient.start, COLORS.purpleGradient.end];
      }
    }

    return (
      <TouchableOpacity
        style={[styles.buttonContainer, style]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, styles.gradientButton]}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.textOnColor} size="small" />
          ) : (
            <View style={styles.contentContainer}>
              {icon && <View style={styles.iconContainer}>{icon}</View>}
              <Text style={[styles.text, styles.gradientText, textStyle]}>
                {title}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Regular button
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
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={
            type === 'primary' || type === 'floating' 
              ? COLORS.textOnColor 
              : COLORS.primary
          } 
          size="small"
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.text, styles[`${type}Text`], textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: SPACING.xs,
  },
  text: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.medium,
    textAlign: 'center',
  },
  // Primary button (purple)
  primary: {
    ...BUTTON_STYLES.primary,
    backgroundColor: COLORS.primary,
    ...SHADOWS.small,
  },
  primaryText: {
    color: COLORS.textOnColor,
  },
  // Secondary button (outlined)
  secondary: {
    ...BUTTON_STYLES.secondary,
    backgroundColor: COLORS.background,
  },
  secondaryText: {
    color: COLORS.primary,
  },
  // Tertiary button (text only)
  tertiary: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    minWidth: 0,
  },
  tertiaryText: {
    color: COLORS.primary,
  },
  // Floating action button 
  floating: {
    ...BUTTON_STYLES.floating,
    borderRadius: RADIUS.round,
    padding: 0,
  },
  floatingText: {
    color: COLORS.textOnColor,
    fontSize: FONT.size.xl,
  },
  // Gradient button
  gradientButton: {
    borderRadius: RADIUS.md,
  },
  gradientText: {
    color: COLORS.textOnColor,
  },
  // States
  disabled: {
    opacity: 0.5,
  },
});

export default CustomButton; 