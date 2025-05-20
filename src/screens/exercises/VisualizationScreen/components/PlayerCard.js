import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, IconButton, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../../config/theme';
import * as Haptics from 'expo-haptics';

// Debug logging
console.debug('VisualizationPlayerCard mounted');

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const PlayerCard = ({
  visualizationType,
  duration,
  isPlaying,
  progress,
  timeElapsed,
  onPlayPause,
  onStop,
}) => {
  const handlePlayPause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPlayPause();
  };

  const handleStop = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStop();
  };

  const remainingTime = duration - timeElapsed;

  // Debug logging
  console.debug('VisualizationPlayerCard props:', {
    visualizationType: visualizationType.value,
    visualizationLabel: visualizationType.label,
    isPlaying,
    progress
  });

  return (
    <LinearGradient
      colors={[COLORS.coralGradient.start, COLORS.coralGradient.end]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.iconContainer}>
        <View style={styles.iconBackground}>
          <MaterialCommunityIcons
            name={visualizationType.icon}
            size={80}
            color={COLORS.textOnColor}
            style={[
              styles.icon,
              { opacity: isPlaying ? 1 : 0.7 }
            ]}
          />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.titleText}>
          {visualizationType.label}
        </Text>
        
        <Chip 
          style={styles.chip} 
          textStyle={styles.chipText}
          icon="meditation"
        >
          Guided Visualization
        </Chip>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${progress * 100}%` }
            ]} 
          />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(timeElapsed)}</Text>
          <Text style={styles.timeText}>{formatTime(remainingTime)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <IconButton
          icon="stop"
          size={32}
          iconColor={COLORS.textOnColor}
          style={styles.controlButton}
          onPress={handleStop}
        />
        <IconButton
          icon={isPlaying ? 'pause' : 'play'}
          size={48}
          iconColor={COLORS.textOnColor}
          style={[styles.controlButton, styles.playButton]}
          onPress={handlePlayPause}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.lg,
    ...SHADOWS.medium,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    opacity: 0.9,
  },
  infoContainer: {
    width: '100%',
    gap: SPACING.sm,
  },
  titleText: {
    color: COLORS.textOnColor,
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    textAlign: 'center',
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginVertical: SPACING.md,
  },
  chipText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: FONT.size.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.round,
    overflow: 'hidden',
    marginTop: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.textOnColor,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  controlButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  playButton: {
    transform: [{ scale: 1.2 }],
  },
});

export default PlayerCard; 