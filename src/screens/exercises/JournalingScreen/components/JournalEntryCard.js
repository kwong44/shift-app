import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Text, Card, TextInput, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export const JournalEntryCard = ({ 
  promptData,
  currentPrompt,
  promptText,
  entry,
  setEntry,
  textInputHeight,
  setTextInputHeight,
  onNextPrompt,
  onPreviousPrompt,
  promptsLength
}) => {
  // Debug log
  console.debug('JournalEntryCard rendered', { currentPrompt, entry });

  return (
    <Card style={styles.card} elevation={4}>
      <LinearGradient
        colors={[`${promptData.color}15`, `${promptData.color}05`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Card.Content>
          <View style={styles.promptHeader}>
            <IconButton
              icon="chevron-left"
              iconColor={COLORS.text}
              size={24}
              onPress={onPreviousPrompt}
              disabled={currentPrompt === 0}
              style={[
                styles.promptNavButton,
                currentPrompt === 0 && styles.promptNavButtonDisabled
              ]}
            />
            <Text style={styles.promptCount}>
              Prompt {currentPrompt + 1} of {promptsLength}
            </Text>
            <IconButton
              icon="chevron-right"
              iconColor={COLORS.text}
              size={24}
              onPress={onNextPrompt}
              disabled={currentPrompt === promptsLength - 1}
              style={[
                styles.promptNavButton,
                currentPrompt === promptsLength - 1 && styles.promptNavButtonDisabled
              ]}
            />
          </View>
          
          <View style={styles.promptTextContainer}>
            <MaterialCommunityIcons
              name="format-quote-open"
              size={20}
              color={promptData.color}
              style={styles.quoteIcon}
            />
            <Text style={[styles.promptText, { color: COLORS.text }]}>
              {promptText}
            </Text>
            <MaterialCommunityIcons
              name="format-quote-close"
              size={20}
              color={promptData.color}
              style={[styles.quoteIcon, styles.quoteIconRight]}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              mode="outlined"
              placeholder="Write your thoughts here..."
              value={entry}
              onChangeText={setEntry}
              multiline
              style={[styles.journalInput, {height: Math.max(200, textInputHeight)}]}
              onContentSizeChange={(e) => setTextInputHeight(e.nativeEvent.contentSize.height)}
              selectionColor={promptData.color}
              outlineColor={`${promptData.color}50`}
              activeOutlineColor={promptData.color}
              placeholderTextColor={`${COLORS.textLight}90`}
            />
          </View>
        </Card.Content>
      </LinearGradient>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  gradient: {
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  promptNavButton: {
    margin: -SPACING.xs,
  },
  promptNavButtonDisabled: {
    opacity: 0.3,
  },
  promptCount: {
    fontWeight: FONT.weight.medium,
    color: COLORS.text,
    fontSize: FONT.size.sm,
  },
  promptTextContainer: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    position: 'relative',
    ...SHADOWS.small,
  },
  promptText: {
    fontSize: FONT.size.md,
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  quoteIcon: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    opacity: 0.6,
  },
  quoteIconRight: {
    left: 'auto',
    right: SPACING.sm,
    top: 'auto',
    bottom: SPACING.sm,
  },
  inputContainer: {
    marginTop: SPACING.sm,
  },
  journalInput: {
    backgroundColor: COLORS.background,
    minHeight: 200,
    fontSize: FONT.size.md,
    lineHeight: 24,
    ...SHADOWS.small,
  },
}); 