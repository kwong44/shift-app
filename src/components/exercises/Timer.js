import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { 
  Surface, 
  Text, 
  Button, 
  ProgressBar, 
  useTheme, 
  IconButton,
  Portal,
  Dialog
} from 'react-native-paper';
import { SPACING } from '../../config/theme';

/**
 * Timer component for exercise sessions
 * @param {Object} props
 * @param {number} props.duration - Duration in seconds
 * @param {Function} props.onComplete - Callback when timer completes
 * @param {Function} props.onPause - Callback when timer is paused
 * @param {Function} props.onResume - Callback when timer is resumed
 * @param {Function} props.onCancel - Callback when timer is cancelled
 */
const Timer = ({ 
  duration, 
  onComplete, 
  onPause, 
  onResume, 
  onCancel 
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const theme = useTheme();

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            clearInterval(interval);
            setIsActive(false);
            onComplete?.();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, timeLeft, onComplete]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
    onPause?.();
  };

  const handleResume = () => {
    setIsPaused(false);
    onResume?.();
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(duration);
    setShowCancelDialog(false);
    onCancel?.();
  };

  const progress = 1 - (timeLeft / duration);

  return (
    <Surface style={styles.container} elevation={0}>
      <View style={styles.timerContainer}>
        <Surface 
          style={[
            styles.timeDisplay,
            { backgroundColor: theme.colors.surfaceVariant }
          ]} 
          elevation={1}
        >
          <Text variant="displaySmall" style={styles.timeText}>
            {formatTime(timeLeft)}
          </Text>
        </Surface>

        <ProgressBar
          progress={progress}
          style={styles.progressBar}
          color={theme.colors.primary}
        />
      </View>

      <View style={styles.controls}>
        {!isActive ? (
          <Button
            mode="contained"
            onPress={handleStart}
            style={styles.button}
            icon="play"
          >
            Start
          </Button>
        ) : (
          <View style={styles.activeControls}>
            <IconButton
              icon="stop"
              mode="contained-tonal"
              size={24}
              onPress={handleCancel}
              style={styles.iconButton}
            />
            <IconButton
              icon={isPaused ? "play" : "pause"}
              mode="contained"
              size={32}
              onPress={isPaused ? handleResume : handlePause}
              style={styles.iconButton}
            />
          </View>
        )}
      </View>

      <Portal>
        <Dialog
          visible={showCancelDialog}
          onDismiss={() => setShowCancelDialog(false)}
        >
          <Dialog.Title>Cancel Timer?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to cancel the current session?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCancelDialog(false)}>No, Continue</Button>
            <Button onPress={confirmCancel}>Yes, Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    borderRadius: 16,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timeDisplay: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timeText: {
    fontVariant: ['tabular-nums'],
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
  },
  controls: {
    alignItems: 'center',
  },
  button: {
    minWidth: 120,
  },
  activeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  iconButton: {
    margin: 0,
  },
});

export default Timer; 