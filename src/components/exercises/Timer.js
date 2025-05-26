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
import Svg, { Circle, G, Defs, RadialGradient, Stop } from 'react-native-svg';
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
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Enhanced color scheme for better visibility
  const timerColor = color || theme.colors.primary;
  const progressColor = '#FFFFFF'; // White progress ring for maximum contrast
  const progressShadowColor = 'rgba(255,255,255,0.3)'; // Subtle white glow
  const backgroundRingColor = 'rgba(255,255,255,0.2)'; // Semi-transparent white background ring

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Calculate size values for the SVG circle
  const size = 260; // Increased size for more prominence
  const strokeWidth = 10; // Slightly thicker for better visibility
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Enhanced pulse animation with glow effect
  useEffect(() => {
    if (isActive && !isPaused) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ).start();

      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
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
        toValue: 0.95,
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
  
  // Glow intensity based on progress
  const glowIntensity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8]
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
          {/* Outer glow effect */}
          <Animated.View 
            style={[
              styles.glowRing,
              {
                opacity: isActive && !isPaused ? glowIntensity : 0,
                shadowOpacity: isActive && !isPaused ? glowIntensity : 0,
              }
            ]}
          />
          
          {/* Main timer background with glassmorphism effect */}
          <View style={styles.timerBackground}>
            <View style={[styles.innerCircle]}>
              <Text variant="displayMedium" style={styles.timeText}>
                {formatTime(timeLeft)}
              </Text>
              
              {isActive && (
                <Text style={styles.labelText}>
                  {isPaused ? 'Paused' : 'In Progress'}
                </Text>
              )}
            </View>
          </View>
          
          {/* Enhanced SVG progress ring */}
          <View style={styles.svgContainer}>
            <Svg width={size} height={size}>
              <Defs>
                <RadialGradient id="progressGradient" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                  <Stop offset="100%" stopColor="rgba(255,255,255,0.7)" />
                </RadialGradient>
              </Defs>
              <G rotation="-90" origin={`${center}, ${center}`}>
                {/* Background Circle with subtle glow */}
                <Circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={backgroundRingColor}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                
                {/* Progress Circle with enhanced styling */}
                <AnimatedCircle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke="url(#progressGradient)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  filter="drop-shadow(0px 0px 8px rgba(255,255,255,0.4))"
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
            <LinearGradient
              colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
              style={styles.startButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Button
                mode="contained"
                onPress={handleStart}
                style={styles.startButton}
                icon="play"
                labelStyle={styles.startButtonLabel}
                buttonColor="transparent"
                textColor="#FFFFFF"
              >
                Start
              </Button>
            </LinearGradient>
          </Animated.View>
        ) : (
          <View style={styles.activeControls}>
            <View style={styles.controlButton}>
              <LinearGradient
                colors={['rgba(244, 67, 54, 0.9)', 'rgba(244, 67, 54, 0.7)']}
                style={styles.iconButtonGradient}
              >
                <IconButton
                  icon="stop"
                  iconColor="#FFFFFF"
                  size={24}
                  onPress={handleCancel}
                  style={styles.iconButton}
                />
              </LinearGradient>
            </View>
            
            <View style={styles.controlButton}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)']}
                style={styles.iconButtonGradient}
              >
                <IconButton
                  icon={isPaused ? "play" : "pause"}
                  size={32}
                  iconColor="#FFFFFF"
                  onPress={isPaused ? handleResume : handlePause}
                  style={styles.iconButton}
                />
              </LinearGradient>
            </View>
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
    alignItems: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  timerWrapper: {
    width: 260,
    height: 260,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 25,
    elevation: 15,
  },
  timerBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 130,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    ...SHADOWS.large,
  },
  innerCircle: {
    width: '80%',
    height: '80%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    ...SHADOWS.medium,
  },
  svgContainer: {
    position: 'absolute',
    width: 260,
    height: 260,
  },
  timeText: {
    fontVariant: ['tabular-nums'],
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 42,
  },
  labelText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
    fontWeight: '500',
  },
  controls: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  startButtonGradient: {
    borderRadius: RADIUS.lg,
    ...SHADOWS.medium,
  },
  startButton: {
    minWidth: 180,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    elevation: 0,
  },
  startButtonLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  activeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  controlButton: {
    borderRadius: RADIUS.round,
    ...SHADOWS.medium,
  },
  iconButtonGradient: {
    borderRadius: RADIUS.round,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    margin: 0,
    backgroundColor: 'transparent',
  },
});

export default Timer; 