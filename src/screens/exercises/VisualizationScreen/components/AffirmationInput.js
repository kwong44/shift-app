import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, TextInput } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';

export const AffirmationInput = ({ 
  affirmation, 
  setAffirmation, 
  placeholder,
  textInputHeight,
  setTextInputHeight
}) => {
  // Debug log
  console.debug('AffirmationInput rendered', { affirmationLength: affirmation.length });

  return (
    <Card style={styles.card} elevation={3}>
      <Card.Content>
        <View style={styles.inputContainer}>
          <TextInput
            mode="outlined"
            placeholder={placeholder}
            value={affirmation}
            onChangeText={setAffirmation}
            multiline
            style={[styles.input, {height: Math.max(120, textInputHeight)}]}
            onContentSizeChange={(e) => setTextInputHeight(e.nativeEvent.contentSize.height)}
            autoCapitalize="sentences"
            outlineColor={COLORS.primary + '50'}
            activeOutlineColor={COLORS.primary}
            placeholderTextColor={COLORS.textLight + '80'}
          />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    minHeight: 120,
    backgroundColor: COLORS.background,
    fontSize: FONT.size.md,
    lineHeight: 24,
  }
}); 