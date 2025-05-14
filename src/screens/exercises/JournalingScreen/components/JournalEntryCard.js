import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Text, TextInput, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, FONT } from '../../../../config/theme';

const { height } = Dimensions.get('window');

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
  promptsLength,
  isFullScreen = false
}) => {
  // Debug log only when important props change
  useEffect(() => {
    console.debug('[JournalEntryCard] Significant props changed:', { 
      currentPrompt, 
      promptText,
      entryLength: entry?.length || 0,
      isFullScreen 
    });
  }, [currentPrompt, promptText, entry, isFullScreen]);

  return (
    <View style={styles.container}>
      <View style={styles.promptSection}>
        <View style={styles.promptHeader}>
          <IconButton
            icon="chevron-left"
            iconColor={COLORS.background}
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
            iconColor={COLORS.background}
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
            color={COLORS.background}
            style={styles.quoteIcon}
          />
          <Text style={styles.promptText}>
            {promptText}
          </Text>
          <MaterialCommunityIcons
            name="format-quote-close"
            size={20}
            color={COLORS.background}
            style={[styles.quoteIcon, styles.quoteIconRight]}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          mode="flat"
          placeholder="Write your thoughts here..."
          value={entry}
          onChangeText={setEntry}
          multiline
          autoFocus={true}
          showSoftInputOnFocus={true}
          cursorColor={promptData.color}
          textAlignVertical="top"
          style={[
            styles.journalInput,
            { minHeight: isFullScreen ? height * 0.5 : Math.max(200, textInputHeight) }
          ]}
          contentStyle={styles.journalInputContent}
          onContentSizeChange={(e) => !isFullScreen && setTextInputHeight(e.nativeEvent.contentSize.height)}
          theme={{
            colors: {
              primary: promptData.color,
              text: COLORS.text,
              placeholder: COLORS.textLight,
              background: 'white',
            },
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  promptSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  promptNavButton: {
    margin: 0,
    padding: 0,
  },
  promptNavButtonDisabled: {
    opacity: 0.3,
  },
  promptCount: {
    fontWeight: FONT.weight.medium,
    color: COLORS.background,
    fontSize: FONT.size.sm,
  },
  promptTextContainer: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    position: 'relative',
  },
  promptText: {
    fontSize: FONT.size.md,
    fontStyle: 'italic',
    lineHeight: 20,
    textAlign: 'center',
    color: COLORS.background,
  },
  quoteIcon: {
    position: 'absolute',
    top: SPACING.xs,
    left: SPACING.sm,
    opacity: 0.6,
    color: COLORS.background,
  },
  quoteIconRight: {
    left: 'auto',
    right: SPACING.sm,
    top: 'auto',
    bottom: SPACING.xs,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  journalInput: {
    backgroundColor: 'white',
    fontSize: FONT.size.md,
    lineHeight: 24,
  },
  journalInputContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    color: COLORS.text,
  },
}); 