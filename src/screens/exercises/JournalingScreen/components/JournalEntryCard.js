import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, FONT, RADIUS } from '../../../../config/theme';

const { height, width } = Dimensions.get('window');

// Light gray color for journaling
const JOURNAL_GRAY = '#7A7A7A';
const JOURNAL_BACKGROUND = '#F8F8F8';

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
  hidePromptNavigation = false
}) => {
  // Debug log only when important props change
  useEffect(() => {
    console.debug('[JournalEntryCard] Significant props changed:', { 
      currentPrompt, 
      promptText,
      entryLength: entry?.length || 0,
      hidePromptNavigation
    });
  }, [currentPrompt, promptText, entry, hidePromptNavigation]);

  return (
    <View style={styles.container}>
      <View style={styles.promptContainer}>
        {!hidePromptNavigation && (
          <View style={styles.promptNavigation}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color={currentPrompt > 0 ? COLORS.backgroundLight.start : 'rgba(0,0,0,0.2)'}
              onPress={onPreviousPrompt}
              style={[
                styles.navIcon,
                currentPrompt === 0 && styles.navIconDisabled
              ]}
            />
            <Text style={styles.promptCounter}>
              Prompt {currentPrompt + 1} of {promptsLength}
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={28}
              color={currentPrompt < promptsLength - 1 ? COLORS.backgroundLight.start : 'rgba(0,0,0,0.2)'}
              onPress={onNextPrompt}
              style={[
                styles.navIcon,
                currentPrompt === promptsLength - 1 && styles.navIconDisabled
              ]}
            />
          </View>
        )}
        
        <View style={styles.promptTextContainer}>
          <Text style={styles.promptText}>
            {promptText}
          </Text>
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
          cursorColor={COLORS.pinkGradient.start}
          textAlignVertical="top"
          style={styles.journalInput}
          contentStyle={styles.journalInputContent}
          onContentSizeChange={(e) => setTextInputHeight(e.nativeEvent.contentSize.height)}
          theme={{
            colors: {
              primary: COLORS.pinkGradient.start,
              text: COLORS.text,
              placeholder: COLORS.textLight,
              background: 'white',
            },
          }}
          underlineStyle={{ display: 'none' }}
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
  promptContainer: {
    backgroundColor: JOURNAL_BACKGROUND,
    paddingVertical: SPACING.xxs,
  },
  promptNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
  },
  promptCounter: {
    fontWeight: FONT.weight.medium,
    color: COLORS.text,
    fontSize: FONT.size.md,
    marginHorizontal: SPACING.md,
  },
  navIcon: {
    padding: SPACING.xs,
  },
  navIconDisabled: {
    opacity: 0.3,
  },
  promptTextContainer: {
    padding: SPACING.md,
    position: 'relative',
  },
  promptText: {
    fontSize: FONT.size.md,
    fontStyle: 'italic',
    lineHeight: 18,
    textAlign: 'center',
    color: COLORS.text,
  },
  quoteIcon: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.lg,
    opacity: 0.6,
  },
  quoteIconRight: {
    left: 'auto',
    right: SPACING.lg,
    top: 'auto',
    bottom: SPACING.md,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  journalInput: {
    backgroundColor: 'white',
    fontSize: FONT.size.md,
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    minHeight: height * 0.5,
  },
  journalInputContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.lg,
    color: COLORS.text,
    lineHeight: 24,
  },
});