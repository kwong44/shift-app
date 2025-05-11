import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { SPACING, COLORS } from '../../config/theme';

/**
 * A container component that positions the setup screen button at the bottom
 * with proper spacing and safe area handling.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The button component
 */
const SetupScreenButtonContainer = ({ children }) => {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

export default SetupScreenButtonContainer; 