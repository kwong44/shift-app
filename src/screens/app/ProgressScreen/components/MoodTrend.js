import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';
import { getMoodIcon, getMoodColor } from '../helpers/moodHelpers';

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[MoodTrend] ${message}`, data);
  }
};

const MoodTrend = ({ trend }) => {
  debug.log('Rendering mood trend:', { trend });
  const moodColor = getMoodColor(trend);
  const moodIcon = getMoodIcon(trend);
  const formattedTrend = trend.charAt(0).toUpperCase() + trend.slice(1);

  return (
    <Card style={styles.contentCard} mode="elevated">
      <Card.Content>
        <View style={styles.cardHeaderContainer}>
          <MaterialCommunityIcons 
            name="emoticon-happy-outline" 
            size={24} 
            color={COLORS.secondary} 
          />
          <Text style={styles.contentCardTitle}>Mood Trend</Text>
        </View>
        <View style={styles.moodTrendContent}>
          <MaterialCommunityIcons
            name={moodIcon}
            size={60}
            color={moodColor}
          />
          <Text style={[styles.moodTrendText, { color: moodColor }]}>
            {formattedTrend}
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
    elevation: 2,
  },
  cardHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  contentCardTitle: {
    fontFamily: FONT.family.heading,
    fontWeight: FONT.weight.semiBold,
    fontSize: FONT.size.lg,
    marginLeft: SPACING.sm,
    color: COLORS.text,
  },
  moodTrendContent: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  moodTrendText: {
    fontFamily: FONT.family.heading,
    fontWeight: FONT.weight.semiBold,
    fontSize: FONT.size.xl,
    marginTop: SPACING.sm,
  },
});

export default MoodTrend;
