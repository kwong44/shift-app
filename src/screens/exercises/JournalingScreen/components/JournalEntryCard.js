import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, FONT, RADIUS } from '../../../../config/theme';

const { height, width } = Dimensions.get('window');

// Light gray color for journaling
const JOURNAL_GRAY = '#7A7A7A';
const JOURNAL_BACKGROUND = '#F0F0F0';

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
      <View style={styles.promptContainer}>
        <View style={styles.promptNavigation}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color={currentPrompt > 0 ? COLORS.text : 'rgba(0,0,0,0.2)'}
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
            color={currentPrompt < promptsLength - 1 ? COLORS.text : 'rgba(0,0,0,0.2)'}
            onPress={onNextPrompt}
            style={[
              styles.navIcon,
              currentPrompt === promptsLength - 1 && styles.navIconDisabled
            ]}
          />
        </View>
        
        <View style={styles.promptTextContainer}>
          <MaterialCommunityIcons
            name="format-quote-open"
            size={20}
            color={JOURNAL_GRAY}
            style={styles.quoteIcon}
          />
          <Text style={styles.promptText}>
            {promptText}
          </Text>
          <MaterialCommunityIcons
            name="format-quote-close"
            size={20}
            color={JOURNAL_GRAY}
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
          cursorColor={COLORS.textLight}
          textAlignVertical="top"
          style={styles.journalInput}
          contentStyle={styles.journalInputContent}
          onContentSizeChange={(e) => setTextInputHeight(e.nativeEvent.contentSize.height)}
          theme={{
            colors: {
              primary: COLORS.textLight,
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
    paddingBottom: SPACING.sm,
  },
  promptNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
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
    padding: SPACING.lg,
    paddingTop: 0,
    position: 'relative',
  },
  promptText: {
    fontSize: FONT.size.md,
    fontStyle: 'italic',
    lineHeight: 24,
    textAlign: 'center',
    color: COLORS.text,
  },
  quoteIcon: {
    position: 'absolute',
    top: 0,
    left: SPACING.lg,
    opacity: 0.5,
  },
  quoteIconRight: {
    left: 'auto',
    right: SPACING.lg,
    top: 'auto',
    bottom: 0,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  journalInput: {
    backgroundColor: 'white',
    fontSize: FONT.size.md,
    flex: 1,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  journalInputContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.lg,
    color: COLORS.text,
  },
}); 