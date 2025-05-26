import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { 
  Surface, 
  Text, 
  Button, 
  useTheme, 
  IconButton,
  Portal,
  Dialog
} from 'react-native-paper';
import { SPACING, COLORS, SHADOWS, RADIUS } from '../../config/theme';
import Svg, { Circle, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import CustomDialog from '../common/CustomDialog';

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[Timer] ${message}`, data);
  }
};

/**
 * Enhanced Timer component for exercise sessions with animated circular progress
 * @param {Object} props
 * @param {number} props.duration - Duration in seconds
 * @param {Function} props.onComplete - Callback when timer completes
 * @param {Function} props.onPause - Callback when timer is paused
 * @param {Function} props.onResume - Callback when timer is resumed
 * @param {Function} props.onCancel - Callback when timer is cancelled
 * @param {string} props.color - Optional custom color for the timer
 */
const Timer = ({ 
  duration, 
  onComplete, 
  onPause, 
  onResume, 
  onCancel,
  color
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const theme = useTheme();
  
  // Animation values
  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  // Use the provided color or default to the theme primary color
  const timerColor = color || theme.colors.primary;
  const timerSecondaryColor = color ? `${color}80` : theme.colors.secondary;

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Calculate size values for the SVG circle
  const size = 220;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Start the pulse animation for the active timer
  useEffect(() => {
    if (isActive && !isPaused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive, isPaused]);

  // Timer countdown logic
  useEffect(() => {
    let interval = null;
    
    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          const newTime = time - 1;
          // Update the animated value for progress
          Animated.timing(animatedValue, {
            toValue: 1 - (newTime / duration),
            duration: 950,  // Slightly less than interval for smooth animation
            useNativeDriver: false,
            easing: Easing.linear
          }).start();
          
          if (time <= 1) {
            clearInterval(interval);
            setIsActive(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            debug.log('Timer completed, calling onComplete with duration:', duration);
            onComplete?.(duration);
            return 0;
          }
          
          // Add haptic feedback every minute
          if (newTime > 0 && newTime % 60 === 0) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, timeLeft, onComplete, duration]);
  
  // Initialize the animation value
  useEffect(() => {
    animatedValue.setValue(0);
  }, [duration]);

  const handleStart = () => {
    debug.log('Timer started');
    
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    debug.log('Timer paused');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPaused(true);
    onPause?.();
  };

  const handleResume = () => {
    debug.log('Timer resumed');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPaused(false);
    onResume?.();
  };

  const handleCancel = () => {
    debug.log('Cancel requested');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    const timeSpent = duration - timeLeft;
    debug.log('Timer cancelled, calling onCancel with timeSpent:', timeSpent);
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(duration);
    animatedValue.setValue(0);
    setShowCancelDialog(false);
    onCancel?.(timeSpent);
  };

  // Calculate the stroke dash offset for the progress circle
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0]
  });
  
  // Background opacity changes based on progress
  const backgroundOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.2]
  });

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Animated.View
          style={[
            styles.timerWrapper,
            {
              transform: [{ scale: isActive && !isPaused ? pulseAnim : 1 }]
            }
          ]}
        >
          <LinearGradient
            colors={[
              timerColor + 'CC', // main color with opacity
              timerSecondaryColor + '99' // secondary color with opacity
            ]}
            style={styles.timerBackground}
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 0.9, y: 0.9 }}
          >
            <View style={[styles.innerCircle, { backgroundColor: '#fff' }]}>
              <Text variant="displayMedium" style={styles.timeText}>
                {formatTime(timeLeft)}
              </Text>
              
              {isActive && (
                <Text style={styles.labelText}>
                  {isPaused ? 'Paused' : 'In Progress'}
                </Text>
              )}
            </View>
          </LinearGradient>
          
          <View style={styles.svgContainer}>
            <Svg width={size} height={size}>
              <G rotation="-90" origin={`${center}, ${center}`}>
                {/* Background Circle */}
                <Circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={timerColor + '30'}  // Very light version of the color
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                
                {/* Progress Circle */}
                <AnimatedCircle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={timerColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </G>
            </Svg>
          </View>
        </Animated.View>
      </View>

      <View style={styles.controls}>
        {!isActive ? (
          <Animated.View
            style={{
              transform: [{ scale: buttonScale }]
            }}
          >
            <Button
              mode="contained"
              onPress={handleStart}
              style={[styles.button, { backgroundColor: timerColor }]}
              icon="play"
              labelStyle={styles.buttonLabel}
            >
              Start
            </Button>
          </Animated.View>
        ) : (
          <View style={styles.activeControls}>
            <IconButton
              icon="stop"
              mode="contained-tonal"
              iconColor="#fff"
              containerColor={COLORS.error + 'DD'}
              size={24}
              onPress={handleCancel}
              style={styles.iconButton}
            />
            <IconButton
              icon={isPaused ? "play" : "pause"}
              mode="contained"
              size={32}
              containerColor={timerColor}
              iconColor="#fff"
              onPress={isPaused ? handleResume : handlePause}
              style={styles.iconButton}
            />
          </View>
        )}
      </View>

      <CustomDialog
        visible={showCancelDialog}
        onDismiss={() => setShowCancelDialog(false)}
        title="Cancel Timer?"
        content="Are you sure you want to cancel the current session?"
        icon="timer-off"
        confirmText="Yes, Cancel"
        confirmMode="contained"
        onConfirm={confirmCancel}
        cancelText="No, Continue"
        onCancel={() => setShowCancelDialog(false)}
        iconColor={COLORS.error}
        iconBackgroundColor={`${COLORS.error}20`}
      />
    </View>
  );
};

// Create an animated circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timerWrapper: {
    width: 220,
    height: 220,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  innerCircle: {
    width: '85%',
    height: '85%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  svgContainer: {
    position: 'absolute',
    width: 220,
    height: 220,
  },
  timeText: {
    fontVariant: ['tabular-nums'],
    color: COLORS.text,
    fontWeight: '600',
  },
  labelText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
  },
  controls: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  button: {
    minWidth: 160,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    ...SHADOWS.small,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  activeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  iconButton: {
    margin: 0,
    ...SHADOWS.small,
  },
  dialog: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  dialogGradient: {
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
  },
  dialogTitle: {
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  dialogText: {
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  dialogActions: {
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.md,
  },
  dialogButton: {
    minWidth: 130,
  },
});

export default Timer; 