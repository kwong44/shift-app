import { MD3LightTheme } from 'react-native-paper';

export const COLORS = {
  primary: '#4C63B6',    // Deep blue
  secondary: '#7D8CC4',  // Lighter blue
  accent: '#FFC107',     // Amber accent
  background: '#FFFFFF', // White
  text: '#333333',       // Dark gray
  textLight: '#757575',  // Medium gray
  success: '#4CAF50',    // Green for successful actions
  error: '#F44336',      // Red for errors
  border: '#E0E0E0',     // Light gray for borders
  shadow: 'rgba(0, 0, 0, 0.1)', // Shadow color
  backgroundLight: '#F5F5F5', // Light background for containers
  successLight: '#E8F5E9', // Light green background
  errorLight: '#FFEBEE',  // Light red background
};

export const FONT = {
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  weight: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
};

// Create a custom theme for React Native Paper
export const paperTheme = {
  ...MD3LightTheme,
  roundness: 8,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    accent: COLORS.accent,
    background: COLORS.background,
    surface: COLORS.background,
    text: COLORS.text,
    error: COLORS.error,
    success: COLORS.success,
    onSurface: COLORS.text,
    backdrop: COLORS.shadow,
    notification: COLORS.accent,
  },
  fonts: {
    ...MD3LightTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: FONT.weight.regular,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: FONT.weight.medium,
    },
    light: {
      fontFamily: 'System',
      fontWeight: FONT.weight.light,
    },
    thin: {
      fontFamily: 'System',
      fontWeight: FONT.weight.light,
    },
  },
  animation: {
    scale: 1.0,
  },
}; 