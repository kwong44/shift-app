import React from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { Text, IconButton, Chip } from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT } from '../../../../config/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

// Debug logging
console.debug('PlayerCard mounted');

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Map waveform types to their corresponding icon names
const waveformIcons = {
  sine: 'sine-wave',
  triangle: 'triangle-wave',
  square: 'square-wave',
  sawtooth: 'sawtooth-wave'
};

// Default to sine wave if icon not found
const getWaveformIcon = (waveform) => waveformIcons[waveform] || 'sine-wave';

// Map frequency categories to icons
const categoryIcons = {
  Delta: 'sleep',
  Theta: 'meditation',
  Alpha: 'brain',
  Beta: 'lightning-bolt',
  Gamma: 'flash'
};

const PlayerCard = ({
  frequency,
  duration,
  isPlaying,
  progress,
  timeElapsed,
  onPlayPause,
  onStop,
  waveform = 'sine',
  frequencyCategory,
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
  const categoryIcon = frequencyCategory ? categoryIcons[frequencyCategory] || 'brain' : 'brain';

  // Debug logging for audio properties
  console.debug('PlayerCard audio properties:', {
    frequency,
    waveform,
    frequencyCategory,
    categoryIcon,
    isPlaying,
    progress
  });

  return (
    <LinearGradient
      colors={[COLORS.indigoGradient.start, COLORS.indigoGradient.end]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.waveformContainer}>
        <MaterialCommunityIcons 
          name={getWaveformIcon(waveform)} 
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
        
        <View style={styles.chipContainer}>
          <Chip 
            style={styles.chip} 
            textStyle={styles.chipText}
            icon={getWaveformIcon(waveform)}
          >
            {waveform.charAt(0).toUpperCase() + waveform.slice(1)} Wave
          </Chip>
          
          {frequencyCategory && (
            <Chip 
              style={styles.chip} 
              textStyle={styles.chipText}
              icon={categoryIcon}
            >
              {frequencyCategory} Wave
            </Chip>
          )}
        </View>
        
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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginVertical: SPACING.lg,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  chipText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: FONT.size.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginTop: SPACING.xs,
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