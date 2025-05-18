import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { 
  Text, 
  Chip, 
  useTheme, 
  HelperText,
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
  const [showMaxDialog, setShowMaxDialog] = React.useState(false);

  // Debug logs
  console.log('Rendering EmotionPicker with selections:', selectedEmotions);

  const handleSelect = useCallback((emotionId) => {
    console.log('Emotion selected:', emotionId);
    if (selectedEmotions.includes(emotionId)) {
      // If already selected, remove it
      onSelectEmotion(selectedEmotions.filter(id => id !== emotionId));
    } else if (selectedEmotions.length < maxSelections) {
      // If not at max selections, add it
      onSelectEmotion([...selectedEmotions, emotionId]);
    } else {
      // At max selections, show dialog
      console.log('Max selections reached, showing dialog');
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
          isSelected && { 
            backgroundColor: `${emotion.color}40`,
            borderWidth: 2,
            borderColor: emotion.color
          }
        ]}
        icon={emotion.icon}
        showSelectedOverlay
        elevated={isSelected}
      >
        {emotion.label}
      </Chip>
    );
  }, [selectedEmotions, handleSelect]);

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        {EMOTIONS.map(renderEmotionChip)}
      </View>

      {helperText && (
        <HelperText type="info" style={styles.helperText}>
          {helperText}
        </HelperText>
      )}

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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  emotionChip: {
    margin: SPACING.xxs,
    minWidth: 100,
    justifyContent: 'center',
  },
  helperText: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
  },
});

export default EmotionPicker; 