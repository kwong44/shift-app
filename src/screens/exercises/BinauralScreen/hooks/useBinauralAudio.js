import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { startBinauralSession, completeBinauralSession } from '../../../../api/exercises';
import { useUser } from '../../../../hooks/useUser';

// Audio placeholders for different binaural frequencies
// Replace these commented imports with your actual audio files once you have them
const BINAURAL_AUDIO = {
  // Example of what to uncomment when you add actual files:
  // focus: require('../../../../../assets/audio/binaural-15hz.mp3'),
  // meditation: require('../../../../../assets/audio/binaural-6hz.mp3'),
  // creativity: require('../../../../../assets/audio/binaural-8hz.mp3'),
  // sleep: require('../../../../../assets/audio/binaural-4hz.mp3'),
  
  // This is a temporary placeholder - you'll need to create or download this file
  placeholder: require('../../../../../assets/audio/silence.mp3'),
};

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
    sessionId,
    waveformType: selectedFrequencyData?.waveform || 'sine',
    audioCategoryKey: selectedFrequencyData?.name?.toLowerCase()
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
      console.debug('Loading binaural beat:', selectedFrequencyData.name);
      
      // Generate a mock audio URL based on the frequency settings for database requirements
      const mockAudioUrl = `binaural_${selectedFrequencyData.frequency}hz_${selectedFrequencyData.waveform}.mp3`;
      
      // Start a new session in the database
      const session = await startBinauralSession(
        user.id,
        mockAudioUrl,
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
      
      // Get the audio file for this frequency type
      // When you add actual audio files, modify this line to use the frequency type
      // const audioSource = BINAURAL_AUDIO[frequencyType.toLowerCase()];
      
      // For now, use the placeholder
      const audioSource = BINAURAL_AUDIO.placeholder;
      
      if (!audioSource) {
        console.error('No audio file found for:', selectedFrequencyData.name);
        throw new Error('Audio file not found');
      }
      
      console.debug('Playing audio file for:', selectedFrequencyData.name);
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        audioSource,
        { 
          shouldPlay: true, 
          isLooping: true,
          volume: 1.0,
          progressUpdateIntervalMillis: 1000,
        }
      );
      
      setSound(newSound);
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
        await sound.pauseAsync();
      }
    } else {
      if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        if (progress > 0) {
          loadAndPlaySound();
        } else {
          setTimeElapsed(0);
          loadAndPlaySound();
        }
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