import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

export const useBinauralAudio = (selectedFrequencyData) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [error, setError] = useState(null);

  // Debug logging
  console.debug('useBinauralAudio hook state:', {
    isPlaying,
    progress,
    timeElapsed,
    error
  });

  useEffect(() => {
    return () => {
      if (sound) {
        console.debug('Unloading sound');
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Progress tracking
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          const newProgress = newTime / selectedFrequencyData.duration;
          setProgress(newProgress > 1 ? 1 : newProgress);
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, selectedFrequencyData.duration]);

  const loadAndPlaySound = async () => {
    try {
      console.debug('Loading sound for', selectedFrequencyData.value);
      
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
      
      if (sound) {
        await sound.unloadAsync();
      }
      
      // Simulated sound loading for now
      await new Promise(resolve => setTimeout(resolve, 500));
      const newSound = {};
      
      setSound(newSound);
      console.debug('Sound loaded successfully');
      
      setIsPlaying(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
    } catch (err) {
      console.error('Error loading sound:', err);
      setError('Failed to load audio. Please try again.');
    }
  };

  const handlePlayPause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (progress > 0) {
        setIsPlaying(true);
      } else {
        setTimeElapsed(0);
        loadAndPlaySound();
      }
    }
  };

  const handleStop = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsPlaying(false);
    setProgress(0);
    setTimeElapsed(0);
  };

  const resetAudio = () => {
    setIsPlaying(false);
    setProgress(0);
    setTimeElapsed(0);
    setError(null);
  };

  return {
    isPlaying,
    progress,
    timeElapsed,
    error,
    handlePlayPause,
    handleStop,
    resetAudio,
  };
}; 