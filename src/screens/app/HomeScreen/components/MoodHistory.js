import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { SPACING, COLORS } from '../../../../config/theme';

const MoodHistory = ({ moodHistory }) => {
  // Debug log
  console.debug('[MoodHistory] Processing dates for mood history');

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

  // Fill in missing days with empty states for the last 7 days
  const getLastSevenDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString();
      
      // Find mood for this day
      const mood = moodHistory.find(m => {
        const moodDate = new Date(m.created_at);
        return moodDate.toDateString() === date.toDateString();
      });

      days.push({
        date: dateStr,
        ...mood || { icon: '😶', mood_label: 'No data' }
      });
    }

    return days;
  };

  const weekData = getLastSevenDays();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Past Week</Text>
      <View style={styles.historyContainer}>
        {weekData.map((day, index) => (
          <View key={index} style={styles.dayContainer}>
            <Text style={styles.emoji}>{day.mood_icon || day.icon}</Text>
            <Text style={styles.day}>{getDayName(day.date)}</Text>
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
  historyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayContainer: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  day: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

export default MoodHistory; 