import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS } from '../../config/theme';

const CircularProgress = ({ percentage = 0, size = 80, strokeWidth = 8 }) => {
  // Create animated value for progress
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate to new percentage
    Animated.timing(animatedProgress, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  // Calculate rotation based on progress
  const rotation = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background Circle */}
      <View style={[styles.backgroundCircle, { 
        width: size, 
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: COLORS.surfaceVariant,
      }]} />

      {/* Animated Progress Circle */}
      <Animated.View style={[
        styles.progressCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: COLORS.primary,
          transform: [{ rotate: rotation }],
        }
      ]} />

      {/* Percentage Text */}
      <View style={styles.textContainer}>
        <Animated.Text style={styles.text}>
          {Math.round(percentage)}%
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundCircle: {
    position: 'absolute',
    borderStyle: 'solid',
  },
  progressCircle: {
    position: 'absolute',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '-90deg' }],
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});

export default CircularProgress; 