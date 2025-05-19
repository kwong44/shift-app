import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';

// Emotion data mapping
const EMOTION_DATA = {
  motivated: { 
    icon: 'rocket-launch', 
    color: '#4CAF50', 
    description: 'Ready to take on challenges' 
  },
  grateful: { 
    icon: 'heart', 
    color: '#9C27B0', 
    description: 'Appreciating life\'s gifts' 
  },
  calm: { 
    icon: 'water', 
    color: '#2196F3', 
    description: 'Peaceful and centered' 
  },
  anxious: { 
    icon: 'alert', 
    color: '#FFC107', 
    description: 'Feeling uncertain' 
  },
  overwhelmed: { 
    icon: 'lightning-bolt', 
    color: '#F44336', 
    description: 'Dealing with too much' 
  }
};

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[MoodTrend] ${message}`, data);
  }
};

const MoodTrend = ({ trend }) => {
  debug.log('Rendering emotion trend:', { trend });
  
  // Get emotion data or default
  const emotionData = EMOTION_DATA[trend] || {
    icon: 'help-circle-outline',
    color: COLORS.textSecondary,
    description: 'Tracking your emotions'
  };
  
  debug.log('Using emotion data:', emotionData);
  
  const formattedTrend = trend.charAt(0).toUpperCase() + trend.slice(1);

  return (
    <Card 
      style={[
        styles.contentCard,
        {
          borderColor: `${emotionData.color}30`,
          shadowColor: COLORS.text,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        }
      ]} 
      mode="outlined"
    >
      <Card.Content>
        <Text style={styles.contentCardTitle}>Emotional Trend</Text>
        <View style={styles.emotionTrendContent}>
          <MaterialCommunityIcons
            name={emotionData.icon}
            size={60}
            color={emotionData.color}
          />
          <Text style={[styles.emotionTrendText, { color: emotionData.color }]}>
            {formattedTrend}
          </Text>
          <Text style={styles.emotionDescription}>
            {emotionData.description}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  contentCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.background,
    borderWidth: 1,
  },
  contentCardTitle: {
    fontFamily: FONT.family.heading,
    fontWeight: FONT.weight.semiBold,
    fontSize: FONT.size.lg,
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  emotionTrendContent: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  emotionTrendText: {
    fontFamily: FONT.family.heading,
    fontWeight: FONT.weight.semiBold,
    fontSize: FONT.size.xl,
    marginTop: SPACING.sm,
  },
  emotionDescription: {
    fontFamily: FONT.family.body,
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  }
});

export default MoodTrend;
