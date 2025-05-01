import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import { Text, TouchableRipple, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';
import { LinearGradient } from 'expo-linear-gradient';

// Debug logger for tracking component lifecycle and user interactions
const debug = {
  log: (message) => {
    console.log(`[ProgressSection] ${message}`);
  }
};

const GrowthRoadmap = ({ 
  dailyProgress, 
  streak, 
  currentMood, 
  onMoodPress,
  MOODS,
  // New props for roadmap features
  currentPhase,
  focusAreas = [],
  weeklyGoals = [],
  nextMilestone,
  overallProgress
}) => {
  const [animatedProgress] = React.useState(new Animated.Value(0));
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    debug.log('Animating progress bar');
    Animated.timing(animatedProgress, {
      toValue: dailyProgress || 0,
      duration: 1000,
      useNativeDriver: false
    }).start();
  }, [dailyProgress]);

  const toggleSection = (section) => {
    debug.log(`Toggling section: ${section}`);
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderPhaseIndicator = () => (
    <TouchableRipple 
      onPress={() => toggleSection('phase')}
      style={styles.phaseContainer}
    >
      <View>
        <View style={styles.phaseHeader}>
          <MaterialCommunityIcons name="map-marker-path" size={24} color={COLORS.textOnColor} />
          <Text style={styles.phaseTitle}>Current Phase: {currentPhase?.name || 'Getting Started'}</Text>
        </View>
        {expandedSection === 'phase' && (
          <View style={styles.phaseDetails}>
            <Text style={styles.phaseDescription}>{currentPhase?.description}</Text>
            <View style={styles.nextMilestone}>
              <MaterialCommunityIcons name="flag" size={16} color={COLORS.textOnColor} />
              <Text style={styles.milestoneText}>Next: {nextMilestone}</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableRipple>
  );

  const renderFocusAreas = () => (
    <TouchableRipple 
      onPress={() => toggleSection('focus')}
      style={styles.focusContainer}
    >
      <View>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="target" size={20} color={COLORS.textOnColor} />
          <Text style={styles.sectionTitle}>Focus Areas</Text>
        </View>
        {expandedSection === 'focus' && (
          <View style={styles.focusGrid}>
            {focusAreas.map((area, index) => (
              <View key={index} style={styles.focusArea}>
                <Text style={styles.focusLabel}>{area.name}</Text>
                <ProgressBar 
                  progress={area.progress} 
                  color={COLORS.textOnColor}
                  style={styles.focusProgress} 
                />
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableRipple>
  );

  const renderWeeklyGoals = () => (
    <TouchableRipple 
      onPress={() => toggleSection('goals')}
      style={styles.goalsContainer}
    >
      <View>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={20} color={COLORS.textOnColor} />
          <Text style={styles.sectionTitle}>Weekly Goals</Text>
        </View>
        {expandedSection === 'goals' && (
          <View style={styles.goalsList}>
            {weeklyGoals.map((goal, index) => (
              <View key={index} style={styles.goalItem}>
                <MaterialCommunityIcons 
                  name={goal.completed ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} 
                  size={16} 
                  color={COLORS.textOnColor} 
                />
                <Text style={styles.goalText}>{goal.text}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableRipple>
  );

  return (
    <LinearGradient
      colors={[COLORS.purpleGradient.start, COLORS.purpleGradient.end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.headerGradient}
    >
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.headerContent}>
          <TouchableRipple style={styles.streakContainer}>
            <View style={styles.streakBadge}>
              <MaterialCommunityIcons name="fire" size={20} color={COLORS.textOnColor} />
              <Text style={styles.streakText}>{streak} day streak</Text>
            </View>
          </TouchableRipple>
          
          <TouchableRipple 
            onPress={onMoodPress} 
            style={styles.moodButton}
            accessible={true}
            accessibilityLabel="Set your mood"
            accessibilityHint="Opens mood selection dialog"
          >
            <View style={styles.moodContent}>
              <Text style={styles.moodEmoji}>
                {currentMood ? MOODS.find(m => m.id === currentMood)?.icon || '😊' : '😶'}
              </Text>
              <Text style={styles.moodLabel}>
                {currentMood ? MOODS.find(m => m.id === currentMood)?.label : 'Add Mood'}
              </Text>
            </View>
          </TouchableRipple>
        </View>

        <View style={styles.overallProgress}>
          <Text style={styles.progressTitle}>Your Growth Roadmap</Text>
          <View style={styles.progressBarContainer}>
            <Animated.View 
              style={[
                styles.progressBarFill,
                {
                  width: animatedProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]}
            />
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressCircleText}>{Math.round((overallProgress || 0) * 100)}%</Text>
          </View>
        </View>

        {renderPhaseIndicator()}
        {renderFocusAreas()}
        {renderWeeklyGoals()}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  scrollContainer: {
    maxHeight: 500,
    padding: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  streakContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: RADIUS.md,
    padding: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    color: COLORS.textOnColor,
    fontWeight: FONT.weight.medium,
    fontSize: FONT.size.sm,
    marginLeft: 4,
  },
  moodButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: RADIUS.md,
    padding: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  moodContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  moodEmoji: {
    fontSize: 22,
    marginRight: SPACING.xs,
  },
  moodLabel: {
    color: COLORS.textOnColor,
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
  },
  overallProgress: {
    position: 'relative',
    marginVertical: SPACING.md,
  },
  progressTitle: {
    color: COLORS.textOnColor,
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semiBold,
    marginBottom: SPACING.xs,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginRight: 46,
    marginTop: SPACING.md,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  progressCircle: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleText: {
    color: COLORS.textOnColor,
    fontWeight: FONT.weight.bold,
    fontSize: FONT.size.xs,
  },
  phaseContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phaseTitle: {
    color: COLORS.textOnColor,
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semiBold,
    marginLeft: SPACING.sm,
  },
  phaseDetails: {
    marginTop: SPACING.sm,
  },
  phaseDescription: {
    color: COLORS.textOnColor,
    fontSize: FONT.size.sm,
    marginBottom: SPACING.sm,
  },
  nextMilestone: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  milestoneText: {
    color: COLORS.textOnColor,
    fontSize: FONT.size.sm,
    marginLeft: SPACING.xs,
  },
  focusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    color: COLORS.textOnColor,
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semiBold,
    marginLeft: SPACING.sm,
  },
  focusGrid: {
    marginTop: SPACING.sm,
  },
  focusArea: {
    marginVertical: SPACING.xs,
  },
  focusLabel: {
    color: COLORS.textOnColor,
    fontSize: FONT.size.sm,
    marginBottom: SPACING.xxs,
  },
  focusProgress: {
    height: 4,
    borderRadius: 2,
  },
  goalsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  goalsList: {
    marginTop: SPACING.sm,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  goalText: {
    color: COLORS.textOnColor,
    fontSize: FONT.size.sm,
    marginLeft: SPACING.xs,
  },
});

export default GrowthRoadmap; 