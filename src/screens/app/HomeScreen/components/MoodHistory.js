import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS } from '../../../../config/theme';

const MoodHistory = ({ moodHistory, emotions }) => {
  // Debug log
  console.debug('[MoodHistory] Processing mood history', moodHistory);
  console.debug('[MoodHistory] Available emotions:', emotions);

  const getDayName = (dateString) => {
    try {
      const date = new Date(dateString);
      console.debug('[MoodHistory] Formatting date:', dateString, '→', date.toLocaleDateString());
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } catch (error) {
      console.error('[MoodHistory] Error formatting date:', error);
      return '---';
    }
  };

  // Find emotion data by ID
  const findEmotionData = (moodType) => {
    console.debug('[MoodHistory] Finding emotion for type:', moodType);
    
    // If no mood type, return default
    if (!moodType) {
      console.debug('[MoodHistory] No mood type found, using default');
      return { 
        id: 'unknown', 
        color: '#EEEEEE', 
        icon: 'help-circle',
        label: 'Unknown'
      };
    }
    
    // Find matching emotion from the passed emotions array
    const foundEmotion = emotions.find(e => e.id === moodType);
    
    if (foundEmotion) {
      console.debug('[MoodHistory] Found matching emotion:', foundEmotion);
      return foundEmotion;
    } else {
      console.debug('[MoodHistory] No matching emotion found for:', moodType);
      // If we have color saved in the mood itself, use that
      return { 
        id: moodType, 
        color: '#EEEEEE',
        icon: 'help-circle',
        label: moodType
      };
    }
  };

  // Fill in missing days with empty states for the last 7 days
  const getLastSevenDays = () => {
    console.debug('[MoodHistory] Building 7-day history array');
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0]; // Just get YYYY-MM-DD
      
      // Find mood for this day
      const mood = moodHistory.find(m => {
        const moodDate = new Date(m.created_at);
        return moodDate.toDateString() === date.toDateString();
      });

      console.debug(`[MoodHistory] Day ${dateStr}:`, mood || 'No mood data');
      
      // Get emotion data from the mood type
      const emotionData = mood ? findEmotionData(mood.mood_type) : null;
      
      // If mood exists but we couldn't find matching emotion, use saved color/icon
      const moodColor = emotionData?.color || mood?.mood_color || '#EEEEEE';
      const moodIcon = emotionData?.icon || 'help-circle';

      days.push({
        date: dateStr,
        dayName: getDayName(date),
        mood: mood || null,
        color: moodColor,
        icon: moodIcon
      });
    }

    return days;
  };

  const weekData = getLastSevenDays();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Past Week</Text>
      
      <View style={styles.gridContainer}>
        {weekData.map((day, index) => (
          <View key={index} style={styles.dayBlock}>
            <Surface style={[
              styles.emotionIndicator, 
              { backgroundColor: day.color }
            ]}>
              <MaterialCommunityIcons 
                name={day.icon} 
                size={20} 
                color="#FFFFFF" 
              />
            </Surface>
            <Text style={styles.dayName}>{day.dayName}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayBlock: {
    alignItems: 'center',
    width: '13%', // ~100% / 7 days with a little margin
  },
  emotionIndicator: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    elevation: 2,
  },
  dayName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});

export default MoodHistory; 