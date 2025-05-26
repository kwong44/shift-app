import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { completeVisualization } from '../../../../api/exercises';
import { useUser } from '../../../../hooks/useUser';
import { supabase } from '../../../../config/supabase';

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

export const useVisualizationAudio = (selectedType, duration, vizIdFromProps, masterExerciseId, exerciseType) => {
  const { user } = useUser();
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const visualizationIdRef = useRef(vizIdFromProps);
  const masterExerciseIdRef = useRef(masterExerciseId);
  const exerciseTypeRef = useRef(exerciseType);

  useEffect(() => {
    visualizationIdRef.current = vizIdFromProps;
    masterExerciseIdRef.current = masterExerciseId;
    exerciseTypeRef.current = exerciseType;
  }, [vizIdFromProps, masterExerciseId, exerciseType]);

  // Debug logging
  console.debug('[useVisualizationAudio] Hook initialized/updated. Props & State:', {
    selectedType: selectedType?.value,
    duration,
    visualizationId: visualizationIdRef.current,
    masterExerciseId: masterExerciseIdRef.current,
    exerciseType: exerciseTypeRef.current,
    userId: user?.id,
    isPlaying,
    progress,
    timeElapsed,
    error,
    loading,
  });

  // Clean up audio resources when unmounting
  useEffect(() => {
    return () => {
      if (sound) {
        console.debug('[useVisualizationAudio] Cleaning up audio resources (unload).');
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Progress tracking & auto-completion
  useEffect(() => {
    let interval;
    if (isPlaying && duration > 0) {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          const newProgress = newTime / duration;
          const finalProgress = newProgress > 1 ? 1 : newProgress;
          setProgress(finalProgress);
          
          if (finalProgress >= 1 && visualizationIdRef.current && user?.id) {
            console.debug(`[useVisualizationAudio] Progress complete. Marking viz ${visualizationIdRef.current} complete. Duration: ${newTime}s. Master ID: ${masterExerciseIdRef.current}`);
            completeVisualization(visualizationIdRef.current, newTime)
              .then(() => {
                console.debug(`[useVisualizationAudio] Visualization ${visualizationIdRef.current} marked as complete in visualizations table.`);
                // Now log to daily_exercise_logs
                if (masterExerciseIdRef.current) {
                  const dailyLogEntry = {
                    user_id: user.id,
                    exercise_id: masterExerciseIdRef.current,
                    exercise_type: exerciseTypeRef.current || 'Visualization',
                    duration_seconds: newTime,
                    completed_at: new Date().toISOString(),
                    source: 'VisualizationPlayer_Progress',
                    metadata: { /* ... relevant metadata ... */ }
                  };
                  supabase.from('daily_exercise_logs').insert(dailyLogEntry)
                    .then(({ error: dailyErr }) => {
                      if (dailyErr) console.error('[useVisualizationAudio] Error inserting to daily_exercise_logs from progress:', dailyErr.message);
                      else console.debug('[useVisualizationAudio] Inserted to daily_exercise_logs from progress.');
                    });
                } else {
                  console.warn('[useVisualizationAudio] No masterExerciseId for daily_exercise_logs from progress.');
                }
              })
              .catch(err => console.error(`[useVisualizationAudio] Error completing viz ${visualizationIdRef.current} via progress:`, err.message));
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration, user]);

  const loadAndPlaySound = async () => {
    // Ensure visualizationId is present (passed from PlayerScreen, originating from SetupScreen)
    if (!visualizationIdRef.current) {
      console.error('[useVisualizationAudio] No visualizationId provided. Cannot load sound.');
      setError('Visualization session ID is missing. Cannot start audio.');
      setLoading(false); // Ensure loading is false if we bail early
      return;
    }
    
    setLoading(true); // For audio loading
    setError(null); // Clear previous errors
    try {
      console.debug(`[useVisualizationAudio] Loading audio for viz: ${visualizationIdRef.current}, Type: ${selectedType?.label}`);
      
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
      console.debug(`[useVisualizationAudio] Pausing audio for viz: ${visualizationIdRef.current}`);
      if (sound) {
        await sound.pauseAsync();
      }
      setIsPlaying(false); // Set playing state after pause attempt
    } else {
      if (sound) {
        console.debug(`[useVisualizationAudio] Playing existing audio for viz: ${visualizationIdRef.current}`);
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        // Only load if not already playing and sound is null (i.e., fresh start or after stop)
        console.debug(`[useVisualizationAudio] No sound object, calling loadAndPlaySound for viz: ${visualizationIdRef.current}`);
        // Reset time/progress if starting fresh, PlayerScreen may also manage this if re-entering
        setTimeElapsed(0);
        setProgress(0);
        await loadAndPlaySound(); // This will set isPlaying to true on success
      }
    }
  };

  const handleStop = async () => {
    console.debug(`[useVisualizationAudio] handleStop called for viz: ${visualizationIdRef.current}`);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (sound) {
      console.debug('[useVisualizationAudio] Unloading sound in handleStop.');
      await sound.unloadAsync();
      setSound(null);
    }
    setIsPlaying(false);
    // Don't reset progress/timeElapsed here if PlayerScreen might want to show final state
    // Let PlayerScreen decide to call resetAudio or navigate away.

    // Complete the visualization if it exists and progress is not yet 1 (to avoid double calls)
    if (visualizationIdRef.current && progress < 1 && user?.id) {
      try {
        setLoading(true);
        console.debug(`[useVisualizationAudio] Marking viz ${visualizationIdRef.current} complete via handleStop. Duration: ${timeElapsed}s. Master ID: ${masterExerciseIdRef.current}`);
        await completeVisualization(visualizationIdRef.current, timeElapsed);
        console.debug(`[useVisualizationAudio] Visualization ${visualizationIdRef.current} marked as complete in visualizations table via handleStop.`);
        setProgress(1);
        // Now log to daily_exercise_logs
        if (masterExerciseIdRef.current) {
          const dailyLogEntry = {
            user_id: user.id,
            exercise_id: masterExerciseIdRef.current,
            exercise_type: exerciseTypeRef.current || 'Visualization',
            duration_seconds: timeElapsed,
            completed_at: new Date().toISOString(),
            source: 'VisualizationPlayer_StopButton',
            metadata: { /* ... relevant metadata ... */ }
          };
          supabase.from('daily_exercise_logs').insert(dailyLogEntry)
            .then(({ error: dailyErr }) => {
              if (dailyErr) console.error('[useVisualizationAudio] Error inserting to daily_exercise_logs from handleStop:', dailyErr.message);
              else console.debug('[useVisualizationAudio] Inserted to daily_exercise_logs from handleStop.');
            });
        } else {
          console.warn('[useVisualizationAudio] No masterExerciseId for daily_exercise_logs from handleStop.');
        }
      } catch (err) {
        console.error(`[useVisualizationAudio] Error completing viz ${visualizationIdRef.current} from handleStop:`, err.message);
        setError(`Failed to complete visualization: ${err.message}`);
      } finally {
        setLoading(false);
      }
    } else if (visualizationIdRef.current && progress >= 1) {
      console.debug(`[useVisualizationAudio] Viz ${visualizationIdRef.current} already at 100% or completed. Not calling API again from handleStop.`);
    }
    // Do not setVisualizationId to null here, PlayerScreen controls its lifecycle.
  };

  const resetAudio = () => {
    console.debug(`[useVisualizationAudio] resetAudio called for viz: ${visualizationIdRef.current}`);
    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }
    setIsPlaying(false);
    setProgress(0);
    setTimeElapsed(0);
    setError(null);
    console.debug('[useVisualizationAudio] Audio reset complete.');
  };

  // Effect to automatically start playing when visualizationId is available from props
  // and sound is not already set up (e.g., on initial mount with valid ID).
  useEffect(() => {
    if (visualizationIdRef.current && !sound && !isPlaying && progress === 0 && selectedType) {
        console.debug(`[useVisualizationAudio] Auto-starting sound for new viz session: ${visualizationIdRef.current}`);
        // Reset time and progress before starting a new sound session from fresh data
        setTimeElapsed(0);
        setProgress(0);
        loadAndPlaySound(); 
    }
  }, [visualizationIdRef.current, selectedType]); // React to changes in ID or selectedType

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