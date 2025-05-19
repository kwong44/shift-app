import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Title, Text, TouchableRipple } from 'react-native-paper';
import { SPACING, COLORS } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';
import { saveMood, getWeekMoodHistory } from '../../../../api/mood';
import MoodHistory from './MoodHistory';
import { useUser } from '../../../../hooks/useUser'; // You'll need to create this hook
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Define emotions with their associated colors and icons
const EMOTIONS = [
  { id: 'motivated', label: 'Motivated', color: '#4CAF50', icon: 'rocket-launch' },
  { id: 'grateful', label: 'Grateful', color: '#9C27B0', icon: 'heart' },
  { id: 'calm', label: 'Calm', color: '#2196F3', icon: 'water' },
  { id: 'anxious', label: 'Anxious', color: '#FFC107', icon: 'alert' },
  { id: 'overwhelmed', label: 'Overwhelmed', color: '#F44336', icon: 'lightning-bolt' }
];

const MoodModal = ({ visible, onDismiss, onMoodSelect }) => {
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  // Debug log
  console.debug('[MoodModal] Rendering with user:', user?.id);
  console.debug('[MoodModal] Defined emotions:', EMOTIONS);

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

  const handleMoodSelect = async (emotion) => {
    try {
      await Haptics.selectionAsync();
      
      console.debug('[MoodModal] Saving emotion:', emotion);
      
      // Save mood to database with emotion data
      await saveMood(user.id, emotion);
      
      // Refresh mood history
      await fetchMoodHistory();
      
      // Notify parent component
      onMoodSelect(emotion);
    } catch (error) {
      console.error('[MoodModal] Error saving emotion:', error);
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
          {EMOTIONS.map((emotion) => (
            <TouchableRipple
              key={emotion.id}
              onPress={() => handleMoodSelect(emotion)}
              style={[
                styles.emotionSelectItem,
                { backgroundColor: `${emotion.color}20` } // Lighter version of the color
              ]}
              accessibilityLabel={`Select emotion: ${emotion.label}`}
              accessibilityHint={`Sets your current emotion to ${emotion.label}`}
            >
              <View style={styles.emotionSelectContent}>
                <MaterialCommunityIcons 
                  name={emotion.icon} 
                  size={28} 
                  color={emotion.color} 
                  style={styles.emotionIcon}
                />
                <Text style={[
                  styles.emotionSelectLabel,
                  { color: emotion.color }
                ]}>
                  {emotion.label}
                </Text>
              </View>
            </TouchableRipple>
          ))}
        </View>
        
        {/* Add mood history component */}
        {!loading && moodHistory.length > 0 && (
          <MoodHistory moodHistory={moodHistory} emotions={EMOTIONS} />
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
  emotionSelectItem: {
    width: '48%', // Changed from 18% to make it 2 columns instead of 5
    aspectRatio: 2.5, // Changed from 1 to make items rectangular
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  emotionSelectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    width: '100%',
  },
  emotionIcon: {
    marginRight: SPACING.xs,
  },
  emotionSelectLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MoodModal; 