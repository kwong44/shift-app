import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';

const AffirmationInput = ({ 
  affirmation, 
  setAffirmation, 
  placeholder,
  textInputHeight,
  setTextInputHeight
}) => {
  // Debug logging
  console.debug('AffirmationInput rendered', { 
    affirmationLength: affirmation?.length,
    currentHeight: textInputHeight
  });

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          placeholder={placeholder}
          value={affirmation}
          onChangeText={setAffirmation}
          multiline
          style={[styles.input, { height: Math.max(120, textInputHeight) }]}
          onContentSizeChange={(e) => setTextInputHeight(e.nativeEvent.contentSize.height)}
          autoCapitalize="sentences"
          outlineColor={`${COLORS.coralGradient.start}30`}
          activeOutlineColor={COLORS.coralGradient.start}
          placeholderTextColor={COLORS.textLight + '80'}
          textColor={COLORS.text}
          theme={{
            colors: {
              background: COLORS.background,
            },
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
  },
  inputContainer: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    ...SHADOWS.small,
  },
  input: {
    minHeight: 120,
    backgroundColor: COLORS.background,
    fontSize: FONT.size.md,
    lineHeight: 24,
  }
});

export default AffirmationInput; 