import React from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Debug logging
console.debug('PlayerCard mounted');

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const PlayerCard = ({
  frequency,
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

  return (
    <View style={styles.container}>
      <View style={styles.waveformContainer}>
        <MaterialCommunityIcons 
          name="waveform" 
          size={120} 
          color={COLORS.background}
          style={[
            styles.waveform,
            { opacity: isPlaying ? 1 : 0.5 }
          ]}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.frequencyText}>
          {frequency} Hz
        </Text>
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
          iconColor={COLORS.background}
          style={styles.controlButton}
          onPress={handleStop}
        />
        <IconButton
          icon={isPlaying ? 'pause' : 'play'}
          size={48}
          iconColor={COLORS.background}
          style={[styles.controlButton, styles.playButton]}
          onPress={handlePlayPause}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.lg,
  },
  waveformContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  waveform: {
    opacity: 0.8,
  },
  infoContainer: {
    width: '100%',
    gap: SPACING.sm,
  },
  frequencyText: {
    color: COLORS.background,
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.background,
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