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
    error,
    selectedFrequency: selectedFrequencyData?.frequency
  });

  useEffect(() => {
    return () => {
      if (sound) {
        console.debug('Cleaning up audio resources');
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
      console.debug('Loading binaural beat:', selectedFrequencyData.frequency);
      
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
      
      if (sound) {
        await sound.unloadAsync();
      }
      
      // Create binaural beat using Web Audio API
      const audioContext = new Audio.Context();
      
      // Create oscillators for left and right ear
      const leftOsc = audioContext.createOscillator();
      const rightOsc = audioContext.createOscillator();
      
      // Set base frequency and calculate binaural beat frequency
      const baseFreq = 440; // Base frequency in Hz
      const beatFreq = selectedFrequencyData.frequency; // Binaural beat frequency
      
      leftOsc.frequency.value = baseFreq;
      rightOsc.frequency.value = baseFreq + beatFreq;
      
      // Create gain nodes for volume control
      const leftGain = audioContext.createGain();
      const rightGain = audioContext.createGain();
      
      leftGain.gain.value = 0.5;
      rightGain.gain.value = 0.5;
      
      // Create stereo panner for channel separation
      const leftPanner = audioContext.createStereoPanner();
      const rightPanner = audioContext.createStereoPanner();
      
      leftPanner.pan.value = -1; // Full left
      rightPanner.pan.value = 1;  // Full right
      
      // Connect the audio graph
      leftOsc.connect(leftGain).connect(leftPanner).connect(audioContext.destination);
      rightOsc.connect(rightGain).connect(rightPanner).connect(audioContext.destination);
      
      // Start the oscillators
      leftOsc.start();
      rightOsc.start();
      
      // Create a cleanup object
      const newSound = {
        unloadAsync: () => {
          leftOsc.stop();
          rightOsc.stop();
          audioContext.close();
        }
      };
      
      setSound(newSound);
      console.debug('Binaural beat loaded successfully');
      
      setIsPlaying(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
    } catch (err) {
      console.error('Error loading binaural beat:', err);
      setError('Failed to load audio. Please try again.');
    }
  };

  const handlePlayPause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (isPlaying) {
      setIsPlaying(false);
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
    } else {
      if (progress > 0) {
        loadAndPlaySound();
      } else {
        setTimeElapsed(0);
        loadAndPlaySound();
      }
    }
  };

  const handleStop = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    setIsPlaying(false);
    setProgress(0);
    setTimeElapsed(0);
  };

  const resetAudio = () => {
    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }
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