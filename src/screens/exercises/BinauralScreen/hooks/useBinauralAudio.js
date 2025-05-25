import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { completeBinauralSession } from '../../../../api/exercises';

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
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [error, setError] = useState(null);

  // Use a ref to store sessionId to avoid issues with stale closures in useEffect/callbacks
  const sessionIdRef = useRef(selectedFrequencyData.sessionId);
  useEffect(() => {
    sessionIdRef.current = selectedFrequencyData.sessionId;
  }, [selectedFrequencyData.sessionId]);

  // Debug logging
  console.debug('[useBinauralAudio] Hook initialized/updated. Props:', { 
    selectedFrequencyData 
  });
  console.debug('[useBinauralAudio] State:', {
    isPlaying,
    progress,
    timeElapsed, // Actual seconds spent
    error,
    sessionId: sessionIdRef.current, // Log current sessionId from ref
    // selectedFrequencyName: selectedFrequencyData?.name,
    // totalDurationForTimer: selectedFrequencyData?.duration, // Total configured duration in seconds
  });

  useEffect(() => {
    // This effect is for cleanup when the component unmounts or sound object changes
    return () => {
      if (sound) {
        console.debug('[useBinauralAudio] Cleaning up audio resources (sound unload).');
        sound.unloadAsync();
      }
    };
  }, [sound]); // Only re-run if sound object itself changes

  // Progress tracking & auto-completion
  useEffect(() => {
    let interval;
    if (isPlaying && selectedFrequencyData?.duration > 0) { // Ensure duration is valid
      interval = setInterval(() => {
        setTimeElapsed(prevTime => {
          const newTime = prevTime + 1;
          // Calculate progress based on the duration passed in selectedFrequencyData
          const newProgress = newTime / selectedFrequencyData.duration;
          const finalProgress = newProgress > 1 ? 1 : newProgress;
          setProgress(finalProgress);
          
          console.debug(`[useBinauralAudio] Progress: ${finalProgress * 100}%, Time Elapsed: ${newTime}s`);

          // Complete session when finished
          if (finalProgress >= 1 && sessionIdRef.current) {
            console.debug(`[useBinauralAudio] Session timer complete. Attempting to mark session ${sessionIdRef.current} as complete.`);
            completeBinauralSession(sessionIdRef.current, newTime) // Pass actual time elapsed
              .then(() => console.debug(`[useBinauralAudio] Session ${sessionIdRef.current} marked as complete via progress tracker.`))
              .catch(err => console.error(`[useBinauralAudio] Error completing session ${sessionIdRef.current} via progress tracker:`, err.message));
            // setIsPlaying(false); // Optionally stop playback controls, though audio might stop itself
            // clearInterval(interval); // Stop the interval
          }
          return newTime;
        });
      }, 1000);
    } else if (!isPlaying && interval) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval); // Cleanup interval on unmount or when isPlaying/duration changes
  }, [isPlaying, selectedFrequencyData?.duration]); // Removed sessionIdRef.current from deps, completion is event-driven by progress

  const loadAndPlaySound = async () => {
    try {
      // Ensure sessionId is present before trying to play
      if (!sessionIdRef.current) {
        console.error('[useBinauralAudio] No session ID found. Cannot load sound. This should have been set by SetupScreen.');
        setError('Session ID missing. Cannot start audio.');
        return;
      }
      console.debug(`[useBinauralAudio] Loading binaural beat for session: ${sessionIdRef.current}, Name: ${selectedFrequencyData.name}`);
      
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true, // Ensure this is the desired behavior
        // playThroughEarpieceAndroid: false // Explicitly set if needed
      });
      
      if (sound) {
        console.debug('[useBinauralAudio] Unloading previous sound instance.');
        await sound.unloadAsync();
        // setSound(null); // Sound object will be replaced by newSound
      }
      
      const audioSource = BINAURAL_AUDIO.placeholder; // Using placeholder for now
      
      if (!audioSource) {
        console.error('[useBinauralAudio] No audio file found for:', selectedFrequencyData.name);
        setError('Audio file not found. Please check configuration.');
        throw new Error('Audio file not found');
      }
      
      console.debug('[useBinauralAudio] Creating and playing sound instance for:', selectedFrequencyData.name);
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        audioSource,
        { 
          shouldPlay: true, 
          // isLooping: true, // Binaural beats usually play for a fixed duration, not loop indefinitely unless intended for the full duration.
                              // If your audio file is shorter than selectedFrequencyData.duration, you might need looping.
                              // Or, ensure audio file matches selected duration.
                              // For now, assuming audio length is handled or file is long enough.
          isLooping: false, // Let's set to false and rely on duration timer.
          volume: 1.0,
          // progressUpdateIntervalMillis: 1000, // This is for onPlaybackStatusUpdate, not setInterval for UI
        }
      );
      
      setSound(newSound);
      setIsPlaying(true); // Set playing true
      // setTimeElapsed(0); // Reset timeElapsed only if starting fresh, not resuming. loadAndPlaySound implies fresh start here.
      // setProgress(0); // Reset progress
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.debug(`[useBinauralAudio] Sound loaded and playing for session ${sessionIdRef.current}.`);
      
    } catch (err) {
      console.error('[useBinauralAudio] Error in loadAndPlaySound:', err.message);
      setError(`Failed to load audio: ${err.message}. Please try again.`);
      // Clean up if error occurs
      if (sound) await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  const handlePlayPause = async () => {
    if (!sound && !isPlaying && progress === 0) { // If no sound, not playing, and at start, then load and play
      console.debug('[useBinauralAudio] handlePlayPause: No sound, attempting to load and play.');
      await loadAndPlaySound();
      return;
    }
    
    if (!sound) {
      console.warn('[useBinauralAudio] handlePlayPause: Sound object is null, cannot play/pause.');
      // setError('Audio not ready. Try restarting the session.'); // Potentially set an error
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (isPlaying) {
      console.debug(`[useBinauralAudio] Pausing audio for session ${sessionIdRef.current}.`);
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      console.debug(`[useBinauralAudio] Resuming/Playing audio for session ${sessionIdRef.current}.`);
      await sound.playAsync(); // Assumes sound is loaded
      setIsPlaying(true);
    }
  };

  const handleStop = async () => {
    console.debug(`[useBinauralAudio] handleStop called for session: ${sessionIdRef.current}`);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    if (sound) {
      console.debug('[useBinauralAudio] Unloading sound in handleStop.');
      await sound.unloadAsync();
      setSound(null);
    }
    setIsPlaying(false); // Stop playback state

    // Only complete the session if it exists and wasn't already completed by progress tracker
    // (Progress tracker might beat this if audio plays to full)
    // Check progress to avoid double completion if already at 1
    if (sessionIdRef.current && progress < 1) { 
      try {
        console.debug(`[useBinauralAudio] Attempting to mark session ${sessionIdRef.current} as complete via handleStop. Elapsed: ${timeElapsed}s`);
        await completeBinauralSession(sessionIdRef.current, timeElapsed); // Pass actual time elapsed
        console.debug(`[useBinauralAudio] Session ${sessionIdRef.current} marked as complete via handleStop.`);
      } catch (err) {
        console.error(`[useBinauralAudio] Error completing session ${sessionIdRef.current} via handleStop:`, err.message);
        // setError might be useful here if UI needs to show it
      }
    } else if (sessionIdRef.current && progress >=1) {
        console.debug(`[useBinauralAudio] Session ${sessionIdRef.current} already marked complete or at 100% progress. Not calling complete again from handleStop.`);
    }
    
    // Resetting UI state regardless of completion call outcome
    setProgress(0);
    setTimeElapsed(0); 
    // sessionIdRef.current remains as is, PlayerScreen might navigate away or reset based on this stop.
    // No need to set sessionIdRef.current to null here, its lifecycle is tied to selectedFrequencyData
  };

  const resetAudio = () => { // Typically called on error or explicit reset action from UI
    console.debug(`[useBinauralAudio] resetAudio called for session: ${sessionIdRef.current}`);
    if (sound) {
      console.debug('[useBinauralAudio] Unloading sound in resetAudio.');
      sound.unloadAsync();
      setSound(null);
    }
    setIsPlaying(false);
    setProgress(0);
    setTimeElapsed(0);
    setError(null); 
    // sessionIdRef.current is managed by props, not reset here.
    console.debug('[useBinauralAudio] Audio reset complete.');
  };

  // Effect to automatically start playing when selectedFrequencyData (and thus sessionId) is available
  // and sound is not already set up.
  useEffect(() => {
    if (selectedFrequencyData && selectedFrequencyData.sessionId && !sound && !isPlaying && progress === 0) {
      console.debug(`[useBinauralAudio] Auto-starting sound for new session: ${selectedFrequencyData.sessionId}`);
      // Reset time and progress before starting a new sound session from fresh data
      setTimeElapsed(0);
      setProgress(0);
      loadAndPlaySound();
    }
  }, [selectedFrequencyData]); // React to changes in selectedFrequencyData

  return {
    isPlaying,
    progress,
    timeElapsed, // Actual seconds spent
    error,
    handlePlayPause,
    handleStop,
    resetAudio,
    // No need to return loadAndPlaySound if it's only called internally or on initial load
  };
}; 