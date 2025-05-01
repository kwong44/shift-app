import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Title, Text, TouchableRipple } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';

const MOODS = [
  { id: 'great', icon: '😊', label: 'Great' },
  { id: 'good', icon: '🙂', label: 'Good' },
  { id: 'okay', icon: '😐', label: 'Okay' },
  { id: 'low', icon: '😕', label: 'Low' },
  { id: 'bad', icon: '😢', label: 'Bad' }
];

const MoodModal = ({ visible, onDismiss, onMoodSelect }) => {
  const handleMoodSelect = async (mood) => {
    await Haptics.selectionAsync();
    onMoodSelect(mood);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.moodModal,
          { backgroundColor: COLORS.background }
        ]}
      >
        <Title style={styles.moodTitle}>How are you feeling today?</Title>
        <View style={styles.moodGrid}>
          {MOODS.map((mood) => (
            <TouchableRipple
              key={mood.id}
              onPress={() => handleMoodSelect(mood)}
              style={styles.moodSelectItem}
              accessibilityLabel={`Select mood: ${mood.label}`}
              accessibilityHint={`Sets your current mood to ${mood.label}`}
            >
              <View style={styles.moodSelectContent}>
                <Text style={styles.moodSelectEmoji}>{mood.icon}</Text>
                <Text style={styles.moodSelectLabel}>{mood.label}</Text>
              </View>
            </TouchableRipple>
          ))}
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  moodModal: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 16,
    backgroundColor: COLORS.background,
  },
  moodTitle: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.text,
    fontWeight: '700',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodSelectItem: {
    width: '18%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.backgroundLight,
    marginBottom: SPACING.md,
  },
  moodSelectContent: {
    alignItems: 'center',
    padding: SPACING.xs,
  },
  moodSelectEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  moodSelectLabel: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
});

export default MoodModal; 