import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { 
  Surface, 
  Text, 
  Chip, 
  useTheme, 
  IconButton,
  HelperText,
  Portal,
  Dialog,
  Button
} from 'react-native-paper';
import { SPACING } from '../../config/theme';
import CustomDialog from '../common/CustomDialog';

const EMOTIONS = [
  { id: 'joy', label: 'Joy', icon: 'emoticon-happy', color: '#FFD700' },
  { id: 'peace', label: 'Peace', icon: 'peace', color: '#90EE90' },
  { id: 'gratitude', label: 'Gratitude', icon: 'heart', color: '#FF69B4' },
  { id: 'focus', label: 'Focus', icon: 'target', color: '#4169E1' },
  { id: 'energy', label: 'Energy', icon: 'lightning-bolt', color: '#FFA500' },
  { id: 'calm', label: 'Calm', icon: 'water', color: '#87CEEB' },
  { id: 'motivation', label: 'Motivation', icon: 'rocket', color: '#9370DB' },
  { id: 'confidence', label: 'Confidence', icon: 'shield-star', color: '#FFB6C1' },
  { id: 'clarity', label: 'Clarity', icon: 'lightbulb-on', color: '#98FB98' },
  { id: 'strength', label: 'Strength', icon: 'arm-flex', color: '#DDA0DD' },
];

/**
 * EmotionPicker component for selecting emotions during exercises
 * @param {Object} props
 * @param {string[]} props.selectedEmotions - Array of selected emotion IDs
 * @param {Function} props.onSelectEmotion - Callback when an emotion is selected/deselected
 * @param {number} props.maxSelections - Maximum number of emotions that can be selected
 * @param {string} props.helperText - Helper text to display below the picker
 */
const EmotionPicker = ({
  selectedEmotions = [],
  onSelectEmotion,
  maxSelections = 3,
  helperText
}) => {
  const theme = useTheme();
  const [showMaxDialog, setShowMaxDialog] = useState(false);

  const handleSelect = useCallback((emotionId) => {
    if (selectedEmotions.includes(emotionId)) {
      onSelectEmotion(selectedEmotions.filter(id => id !== emotionId));
    } else if (selectedEmotions.length < maxSelections) {
      onSelectEmotion([...selectedEmotions, emotionId]);
    } else {
      setShowMaxDialog(true);
    }
  }, [selectedEmotions, maxSelections, onSelectEmotion]);

  const renderEmotionChip = useCallback((emotion) => {
    const isSelected = selectedEmotions.includes(emotion.id);
    return (
      <Chip
        key={emotion.id}
        mode={isSelected ? 'flat' : 'outlined'}
        selected={isSelected}
        onPress={() => handleSelect(emotion.id)}
        style={[
          styles.emotionChip,
          isSelected && { backgroundColor: `${emotion.color}40` }
        ]}
        icon={emotion.icon}
        showSelectedOverlay
      >
        {emotion.label}
      </Chip>
    );
  }, [selectedEmotions, handleSelect]);

  const renderSelectedEmotions = useCallback(() => {
    if (selectedEmotions.length === 0) return null;

    return (
      <Surface style={styles.selectedContainer} elevation={0}>
        <Text variant="labelMedium" style={styles.selectedLabel}>
          Selected Emotions
        </Text>
        <View style={styles.selectedEmotions}>
          {selectedEmotions.map(id => {
            const emotion = EMOTIONS.find(e => e.id === id);
            return (
              <Surface
                key={emotion.id}
                style={[
                  styles.selectedEmotion,
                  { backgroundColor: `${emotion.color}20` }
                ]}
                elevation={0}
              >
                <IconButton
                  icon={emotion.icon}
                  size={24}
                  iconColor={emotion.color}
                />
                <Text variant="bodyMedium">{emotion.label}</Text>
              </Surface>
            );
          })}
        </View>
      </Surface>
    );
  }, [selectedEmotions]);

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {EMOTIONS.map(renderEmotionChip)}
      </ScrollView>

      {helperText && (
        <HelperText type="info" style={styles.helperText}>
          {helperText}
        </HelperText>
      )}

      {renderSelectedEmotions()}

      <CustomDialog
        visible={showMaxDialog}
        onDismiss={() => setShowMaxDialog(false)}
        title="Maximum Selections Reached"
        content={`You can select up to ${maxSelections} emotions. Please deselect an emotion before adding a new one.`}
        icon="alert-circle-outline"
        confirmText="Got it"
        onConfirm={() => setShowMaxDialog(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  emotionChip: {
    marginVertical: SPACING.xs,
  },
  helperText: {
    marginHorizontal: SPACING.md,
  },
  selectedContainer: {
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    borderRadius: 8,
  },
  selectedLabel: {
    marginBottom: SPACING.sm,
    opacity: 0.7,
  },
  selectedEmotions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  selectedEmotion: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingRight: SPACING.sm,
  },
});

export default EmotionPicker; 