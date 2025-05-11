import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Text, TouchableRipple, IconButton, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';

const DAILY_EXERCISES = [
  {
    id: 'mindfulness',
    title: 'Mindfulness',
    icon: 'meditation',
    duration: '5-10 min',
    route: 'Mindfulness',
    benefit: 'Reduce stress and improve focus',
    gradientColors: [COLORS.tealGradient.start, COLORS.tealGradient.end]
  },
  {
    id: 'visualization',
    title: 'Visualization',
    icon: 'eye-outline',
    duration: '5 min',
    route: 'VisualizationSetup',
    benefit: 'Strengthen your goal achievement mindset',
    gradientColors: [COLORS.coralGradient.start, COLORS.coralGradient.end]
  },
  {
    id: 'tasks',
    title: 'Task Planning',
    icon: 'checkbox-marked-outline',
    duration: '10 min',
    route: 'TaskPlanner',
    benefit: 'Stay organized and productive',
    gradientColors: [COLORS.purpleGradient.start, COLORS.purpleGradient.end]
  },
  {
    id: 'deepwork',
    title: 'Deep Work',
    icon: 'timer-outline',
    duration: '25-50 min',
    route: 'DeepWorkSetup',
    benefit: 'Focus intensely on important tasks',
    gradientColors: [COLORS.blueGradient.start, COLORS.blueGradient.end]
  }
];

const DailyFocus = ({ onExercisePress }) => {
  const handleExercisePress = async (exercise) => {
    await Haptics.selectionAsync();
    onExercisePress(exercise.route);
  };

  return (
    <Card style={styles.focusCard} elevation={2}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title style={styles.cardTitle}>Today's Focus</Title>
          <Chip 
            mode="flat"
            style={styles.focusChip}
            textStyle={styles.focusChipText}
          >
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Chip>
        </View>
        
        <View style={styles.exerciseList}>
          {DAILY_EXERCISES.map((exercise) => (
            <TouchableRipple
              key={exercise.id}
              onPress={() => handleExercisePress(exercise)}
              style={styles.exerciseButton}
              accessible={true}
              accessibilityLabel={`Start ${exercise.title} exercise`}
              accessibilityHint={`${exercise.duration} exercise to ${exercise.benefit}`}
            >
              <LinearGradient
                colors={exercise.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.exerciseGradient}
              >
                <View style={styles.exerciseItemContainer}>
                  <View style={styles.exerciseIconContainer}>
                    <MaterialCommunityIcons 
                      name={exercise.icon} 
                      size={24} 
                      color={COLORS.textOnColor} 
                    />
                  </View>
                  <View style={styles.exerciseContent}>
                    <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                    <Text style={styles.exerciseDescription}>
                      {exercise.duration} • {exercise.benefit}
                    </Text>
                  </View>
                  <IconButton 
                    icon="chevron-right" 
                    iconColor={COLORS.textOnColor} 
                    size={20}
                    style={styles.exerciseArrow}
                  />
                </View>
              </LinearGradient>
            </TouchableRipple>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  focusCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
  },
  focusChip: {
    backgroundColor: '#e9e6ff',
    borderRadius: RADIUS.md,
  },
  focusChipText: {
    color: '#6C63FF',
    fontWeight: FONT.weight.medium,
    fontSize: FONT.size.xs,
  },
  exerciseList: {
    marginTop: SPACING.md,
  },
  exerciseButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  exerciseGradient: {
    borderRadius: RADIUS.lg,
  },
  exerciseItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  exerciseIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseTitle: {
    fontWeight: FONT.weight.semiBold,
    color: COLORS.textOnColor,
    fontSize: FONT.size.md,
  },
  exerciseDescription: {
    color: COLORS.textOnColor,
    marginTop: 2,
    fontSize: FONT.size.sm,
    opacity: 0.8,
  },
  exerciseArrow: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    margin: 0,
    height: 28,
    width: 28,
  },
});

export default DailyFocus; 