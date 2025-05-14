import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { startBinauralSession, completeBinauralSession } from '../../../../api/exercises';
import { useUser } from '../../../../hooks/useUser';

export const useBinauralAudio = (selectedFrequencyData) => {
  const { user } = useUser();
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // Debug logging
  console.debug('useBinauralAudio hook state:', {
    isPlaying,
    progress,
    timeElapsed,
    error,
    selectedFrequency: selectedFrequencyData?.frequency,
    sessionId
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
          const finalProgress = newProgress > 1 ? 1 : newProgress;
          setProgress(finalProgress);
          
          // Complete session when finished
          if (finalProgress >= 1 && sessionId) {
            completeBinauralSession(sessionId)
              .then(() => console.debug('Session completed successfully'))
              .catch(err => console.error('Error completing session:', err));
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, selectedFrequencyData.duration, sessionId]);

  const loadAndPlaySound = async () => {
    try {
      console.debug('Loading binaural beat:', selectedFrequencyData.frequency);
      
      // Start a new session in the database
      const session = await startBinauralSession(
        user.id,
        null, // We'll implement audio storage later
        selectedFrequencyData.duration / 60, // Convert seconds to minutes
        selectedFrequencyData.name
      );
      setSessionId(session.id);
      
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
    
    // Complete the session if it exists
    if (sessionId) {
      try {
        await completeBinauralSession(sessionId);
        console.debug('Session completed successfully');
      } catch (err) {
        console.error('Error completing session:', err);
      }
      setSessionId(null);
    }
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
    setSessionId(null);
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