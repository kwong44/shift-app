import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, FONT } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';

// Debug logging
console.debug('ExercisesTopBar mounted');

const TopBar = ({ onBack }) => {
  const handleBack = async () => {
    await Haptics.selectionAsync();
    onBack();
  };

  return (
    <View style={styles.topBar}>
      <TouchableOpacity 
        onPress={handleBack}
        style={styles.backButton}
        accessible={true}
        accessibilityLabel="Go back"
        accessibilityHint="Returns to the previous screen"
      >
        <MaterialCommunityIcons 
          name="chevron-left" 
          size={28} 
          color={COLORS.primary} 
        />
      </TouchableOpacity>
      <Text style={styles.title}>Exercises</Text>
      <View style={styles.placeholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -SPACING.sm,
  },
  title: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.semiBold,
    color: COLORS.primary,
  },
  placeholder: {
    width: 40, // Same width as backButton for symmetry
  },
});

export default TopBar; 