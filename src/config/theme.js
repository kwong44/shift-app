import { MD3LightTheme } from 'react-native-paper';

// Primary palette - core colors
export const COLORS = {
  // Brand colors
  primary: '#5F52EE',       // Purple (main brand color)
  primaryLight: '#E8DFFF',  // Light purple for add goal prompt
  secondary: '#6C63FF',     // Slightly lighter purple
  accent: '#FF5757',        // Coral/red accent (for fire icon)
  
  // UI Background colors
  background: '#FFFFFF',    // Pure white background
  backgroundLight: '#F8F9FC', // Very light blue-gray for subtle contrast
  surface: '#FFFFFF',       // White surface

  // Text colors
  text: '#333333',          // Dark gray for text
  textLight: '#757575',     // Medium gray
  textOnColor: '#FFFFFF',   // White text on colored backgrounds

  // Utility colors
  success: '#4CAF50',       // Green for success states
  error: '#F44336',         // Red for errors
  warning: '#FFC107',       // Amber for warnings
  info: '#2196F3',          // Blue for information
  
  // Stat card colors
  blue: '#5AC8FA',          // Blue for Focus Time
  orange: '#FF9500',        // Orange for Streaks
  teal: '#00B894',          // Teal for Mindful Minutes
  purple: '#6C63FF',        // Purple for Exercise Count
  
  // Border & Divider
  border: '#E0E0E0',        // Light gray for borders
  divider: '#F0F0F0',       // Subtle divider
  
  // Additional UI colors
  textSecondary: '#757575',    // Secondary text color
  backgroundInput: '#F8F9FC',  // Input background
  textInput: '#333333',        // Input text color
  textHeader: '#1A1A1A',       // Darker header text
  mediumGray: '#E0E0E0',       // Medium gray for progress bars
  primaryMuted: '#F3F1FF',     // Very light purple
  
  // Card Gradient Colors - Based on screenshot
  blueGradient: {
    start: '#5AC8FA',
    end: '#4B9EF8',
  },
  pinkGradient: {
    start: '#F368E0',
    end: '#D63AC8',
  },
  tealGradient: {
    start: '#00B894',
    end: '#007E66',
  },
  coralGradient: {
    start: '#FF7675',
    end: '#FF5D5D',
  },
  purpleGradient: {
    start: '#6C63FF',
    end: '#5F52EE',
  },
  indigoGradient: {
    start: '#7D8CC4',
    end: '#5D6CAF',
  },
  
  // Navigation & Interactive elements
  navigationActive: '#5F52EE',    // Active nav item (purple)
  navigationInactive: '#9E9E9E',  // Inactive nav items
  
  // Shadow & Overlay
  shadow: 'rgba(0, 0, 0, 0.08)',  // Lighter shadow for softer feel
  overlay: 'rgba(0, 0, 0, 0.5)',  // Modal overlays
};

export const FONT = {
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 26,
    xxxl: 32,
  },
  weight: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
  family: {
    // Default to system fonts, but consider adding custom fonts
    // through expo or react-native
    base: 'System',
    heading: 'System',
  }
};

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 56,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16, 
  xl: 24,
  round: 999, // For circular elements
};

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 7,
    elevation: 8,
  },
};

export const CARD_STYLES = {
  base: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.medium,
  },
  category: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    minHeight: 160,
    ...SHADOWS.small,
  },
  // Match the circular pattern seen in the cards
  gradientPattern: {
    opacity: 0.1,  // Subtle
    scale: 0.9,    // Size relative to the card
  }
};

export const BUTTON_STYLES = {
  primary: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  secondary: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  floating: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primary,
    ...SHADOWS.medium,
  }
};

export const BADGE_STYLES = {
  default: {
    minWidth: 24,
    height: 24,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primary,
    color: COLORS.textOnColor,
  },
  streak: {
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.orange,
    ...SHADOWS.small,
  },
  mood: {
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  }
};

// Create a custom theme for React Native Paper
export const paperTheme = {
  ...MD3LightTheme,
  roundness: RADIUS.md,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    accent: COLORS.accent,
    background: COLORS.background,
    surface: COLORS.surface,
    text: COLORS.text,
    error: COLORS.error,
    success: COLORS.success,
    onSurface: COLORS.text,
    backdrop: COLORS.overlay,
    notification: COLORS.accent,
  },
  fonts: {
    ...MD3LightTheme.fonts,
    regular: {
      fontFamily: FONT.family.base,
      fontWeight: FONT.weight.regular,
    },
    medium: {
      fontFamily: FONT.family.base,
      fontWeight: FONT.weight.medium,
    },
    light: {
      fontFamily: FONT.family.base,
      fontWeight: FONT.weight.light,
    },
    thin: {
      fontFamily: FONT.family.base,
      fontWeight: FONT.weight.light,
    },
  },
  animation: {
    scale: 1.0,
  },
};

// Helper function to create linear gradients with pattern
export const createGradient = (colors, direction = 'vertical') => {
  return {
    colors: colors,
    start: direction === 'vertical' ? { x: 0, y: 0 } : { x: 0, y: 0 },
    end: direction === 'vertical' ? { x: 0, y: 1 } : { x: 1, y: 0 },
  };
};

// Predefined gradients ready to use
export const GRADIENTS = {
  blue: createGradient([COLORS.blueGradient.start, COLORS.blueGradient.end]),
  pink: createGradient([COLORS.pinkGradient.start, COLORS.pinkGradient.end]),
  teal: createGradient([COLORS.tealGradient.start, COLORS.tealGradient.end]),
  coral: createGradient([COLORS.coralGradient.start, COLORS.coralGradient.end]),
  purple: createGradient([COLORS.purpleGradient.start, COLORS.purpleGradient.end]),
  indigo: createGradient([COLORS.indigoGradient.start, COLORS.indigoGradient.end]),
}; 