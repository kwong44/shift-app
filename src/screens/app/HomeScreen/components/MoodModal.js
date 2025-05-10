import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Title, Text, TouchableRipple } from 'react-native-paper';
import { SPACING, COLORS } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';
import { saveMood, getWeekMoodHistory } from '../../../../api/mood';
import MoodHistory from './MoodHistory';
import { useUser } from '../../../../hooks/useUser'; // You'll need to create this hook

const MOODS = [
  { id: 'great', icon: '😊', label: 'Great' },
  { id: 'good', icon: '🙂', label: 'Good' },
  { id: 'okay', icon: '😐', label: 'Okay' },
  { id: 'low', icon: '😕', label: 'Low' },
  { id: 'bad', icon: '😢', label: 'Bad' }
];

const MoodModal = ({ visible, onDismiss, onMoodSelect }) => {
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  // Debug log
  console.debug('[MoodModal] Rendering with user:', user?.id);

  useEffect(() => {
    if (visible && user) {
      fetchMoodHistory();
    }
  }, [visible, user]);

  const fetchMoodHistory = async () => {
    try {
      setLoading(true);
      const history = await getWeekMoodHistory(user.id);
      console.debug('[MoodModal] Fetched mood history:', history);
      setMoodHistory(history);
    } catch (error) {
      console.error('[MoodModal] Error fetching mood history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = async (mood) => {
    try {
      await Haptics.selectionAsync();
      
      // Save mood to database
      await saveMood(user.id, mood);
      
      // Refresh mood history
      await fetchMoodHistory();
      
      // Notify parent component
      onMoodSelect(mood);
    } catch (error) {
      console.error('[MoodModal] Error saving mood:', error);
    }
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
        
        {/* Add mood history component */}
        {!loading && moodHistory.length > 0 && (
          <MoodHistory moodHistory={moodHistory} />
        )}
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
    marginBottom: SPACING.lg,
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