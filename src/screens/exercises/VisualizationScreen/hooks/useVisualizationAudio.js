import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { createVisualization, completeVisualization } from '../../../../api/exercises';
import { useUser } from '../../../../hooks/useUser';

// Audio placeholders for different visualization types
// Will replace these with actual guided visualization audio files later
const VISUALIZATION_AUDIO = {
  goals: require('../../../../../assets/audio/visualization/goals.mp3'),
  ideal_life: require('../../../../../assets/audio/visualization/ideal_life.mp3'),
  confidence: require('../../../../../assets/audio/visualization/confidence.mp3'),
  contentment: require('../../../../../assets/audio/visualization/contentment.mp3'),
  calm: require('../../../../../assets/audio/visualization/calm.mp3'),
  placeholder: require('../../../../../assets/audio/silence.mp3'),
};

export const useVisualizationAudio = (selectedType, duration) => {
  const { user } = useUser();
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [error, setError] = useState(null);
  const [visualizationId, setVisualizationId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Debug logging
  console.debug('useVisualizationAudio hook state:', {
    isPlaying,
    progress,
    timeElapsed,
    error,
    selectedType: selectedType?.value,
    visualizationId,
  });

  // Clean up audio resources when unmounting
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
          const newProgress = newTime / duration;
          const finalProgress = newProgress > 1 ? 1 : newProgress;
          setProgress(finalProgress);
          
          // Complete session when finished
          if (finalProgress >= 1 && visualizationId) {
            completeVisualization(visualizationId)
              .then(() => console.debug('Visualization completed successfully'))
              .catch(err => console.error('Error completing visualization:', err));
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, duration, visualizationId]);

  const loadAndPlaySound = async () => {
    try {
      // Skip if user is loading or null
      if (!user) {
        console.debug('User not available yet, skipping visualization creation');
        setError('User data not available. Please try again.');
        return;
      }
      
      setLoading(true);
      console.debug('Loading visualization audio:', selectedType.label);
      
      // Start a new visualization in the database
      const visualization = await createVisualization(user.id, {
        type: selectedType.value,
        duration: duration / 60, // Convert seconds to minutes
        completed: false
      });
      setVisualizationId(visualization.id);
      console.debug('Visualization session started:', visualization.id);
      
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
      
      if (sound) {
        await sound.unloadAsync();
      }
      
      // Get the audio file for this visualization type
      const audioSource = VISUALIZATION_AUDIO[selectedType.value] || VISUALIZATION_AUDIO.placeholder;
      
      if (!audioSource) {
        console.error('No audio file found for:', selectedType.value);
        throw new Error('Audio file not found');
      }
      
      console.debug('Playing audio file for:', selectedType.label);
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        audioSource,
        { 
          shouldPlay: true, 
          isLooping: false, // Guided visualizations shouldn't loop
          volume: 1.0,
          progressUpdateIntervalMillis: 1000,
        }
      );
      
      setSound(newSound);
      setIsPlaying(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
    } catch (err) {
      console.error('Error loading visualization audio:', err);
      setError('Failed to load audio. Please try again.');
    } finally {
      setLoading(false);
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
    
    // Complete the visualization if it exists
    if (visualizationId) {
      try {
        await completeVisualization(visualizationId);
        console.debug('Visualization completed successfully');
      } catch (err) {
        console.error('Error completing visualization:', err);
      }
      setVisualizationId(null);
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
    setVisualizationId(null);
  };

  return {
    isPlaying,
    progress,
    timeElapsed,
    error,
    loading,
    handlePlayPause,
    handleStop,
    resetAudio,
  };
}; 