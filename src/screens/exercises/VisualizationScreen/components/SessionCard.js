import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';

const SessionCard = ({ 
  visualizationType, 
  affirmation, 
  selectedEmotions = []
}) => {
  // Debug log
  console.debug('SessionCard rendered', { 
    type: visualizationType.value, 
    emotionsCount: selectedEmotions.length 
  });

  return (
    <Card style={styles.card} elevation={4}>
      <LinearGradient
        colors={[`${visualizationType.color}10`, `${visualizationType.color}02`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Card.Content>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: `${visualizationType.color}25` }]}>
              <MaterialCommunityIcons name={visualizationType.icon} size={24} color={visualizationType.color} />
            </View>
            <Text style={styles.type}>{visualizationType.label}</Text>
          </View>
          
          <View style={styles.affirmationContainer}>
            <MaterialCommunityIcons 
              name="format-quote-open" 
              size={20} 
              color={visualizationType.color}
              style={styles.quoteIcon} 
            />
            <Text style={styles.affirmationText}>
              {affirmation}
            </Text>
            <MaterialCommunityIcons 
              name="format-quote-close" 
              size={20} 
              color={visualizationType.color}
              style={[styles.quoteIcon, styles.quoteIconRight]} 
            />
          </View>
          
          {selectedEmotions.length > 0 && (
            <View style={styles.emotionsRow}>
              {selectedEmotions.map(emotion => (
                <Chip 
                  key={emotion} 
                  style={[styles.emotionChip, { borderColor: visualizationType.color + '30' }]}
                  textStyle={[styles.emotionChipText, { color: visualizationType.color }]}
                >
                  {emotion}
                </Chip>
              ))}
            </View>
          )}
        </Card.Content>
      </LinearGradient>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.xl,
    ...SHADOWS.medium,
  },
  gradient: {
    padding: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    ...SHADOWS.small,
  },
  type: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
  },
  affirmationContainer: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    position: 'relative',
    ...SHADOWS.small,
  },
  affirmationText: {
    fontSize: FONT.size.md,
    fontStyle: 'italic',
    color: COLORS.text,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  quoteIcon: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    opacity: 0.6,
  },
  quoteIconRight: {
    left: 'auto',
    right: SPACING.sm,
    top: 'auto',
    bottom: SPACING.sm,
  },
  emotionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: SPACING.xs,
  },
  emotionChip: {
    margin: 4,
    backgroundColor: COLORS.background,
    borderWidth: 1,
  },
  emotionChipText: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.medium,
  },
});

export default SessionCard; 