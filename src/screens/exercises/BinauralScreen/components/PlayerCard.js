import React from 'react';
import { StyleSheet, View, Dimensions, Animated } from 'react-native';
import { Text, Card, IconButton, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../../config/theme';

const { width } = Dimensions.get('window');

export const PlayerCard = ({ 
  frequencyData,
  isPlaying,
  progress,
  timeElapsed,
  pulseAnim,
  onPlayPause,
  onStop,
  onComplete
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.waveformContainer}>
        <Animated.View 
          style={[
            styles.waveCircle,
            {
              backgroundColor: `${frequencyData.color}30`,
              transform: [{ scale: pulseAnim }]
            }
          ]}
        >
          <View style={styles.innerCircle}>
            <MaterialCommunityIcons 
              name={isPlaying ? "pause" : "play"} 
              size={48} 
              color={frequencyData.color}
              onPress={onPlayPause}
            />
          </View>
        </Animated.View>
        
        <Text style={styles.title}>
          {frequencyData.label}
        </Text>
        
        <Text style={styles.description}>
          {frequencyData.details}
        </Text>
        
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={progress} 
            color={frequencyData.color} 
            style={styles.progressBar}
          />
          
          <View style={styles.timeLabels}>
            <Text style={styles.timeLabel}>
              {formatTime(timeElapsed)}
            </Text>
            <Text style={styles.timeLabel}>
              {formatTime(frequencyData.duration)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.controlsContainer}>
        <IconButton
          icon="stop"
          size={32}
          mode="contained"
          disabled={!isPlaying && progress === 0}
          containerColor={`${frequencyData.color}20`}
          iconColor={frequencyData.color}
          onPress={onStop}
          style={styles.controlButton}
        />
        
        <IconButton
          icon={isPlaying ? "pause" : "play"}
          size={56}
          mode="contained"
          containerColor={frequencyData.color}
          iconColor={COLORS.background}
          onPress={onPlayPause}
          style={styles.playButton}
        />
        
        <IconButton
          icon="skip-next"
          size={32}
          mode="contained"
          disabled={progress >= 1}
          containerColor={`${frequencyData.color}20`}
          iconColor={frequencyData.color}
          onPress={onComplete}
          style={styles.controlButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.large,
  },
  waveformContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  waveCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  innerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT.size.md,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  progressContainer: {
    width: '100%',
    marginTop: SPACING.sm,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  timeLabel: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
    marginTop: SPACING.md,
  },
  controlButton: {
    margin: 0,
  },
  playButton: {
    margin: 0,
    ...SHADOWS.medium,
  },
}); 