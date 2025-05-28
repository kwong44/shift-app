import { useState, useCallback } from 'react';
import { setExerciseFavorite } from '../api/profile';
import * as Haptics from 'expo-haptics';

/**
 * Hook to manage exercise favorites functionality
 * @param {string} userId - The current user's ID
 * @returns {Object} - Object containing favorite state and toggle function
 */
const useExerciseFavorites = (userId) => {
  const [favoriteStates, setFavoriteStates] = useState({});
  const [loadingStates, setLoadingStates] = useState({});

  console.debug('[useExerciseFavorites] Hook initialized for user:', userId);

  /**
   * Toggle favorite status for an exercise
   * @param {string} exerciseId - The exercise ID to toggle
   * @param {boolean} currentFavoriteStatus - Current favorite status
   * @returns {Promise<boolean>} - Returns the new favorite status
   */
  const toggleFavorite = useCallback(async (exerciseId, currentFavoriteStatus) => {
    if (!userId || !exerciseId) {
      console.warn('[useExerciseFavorites] Missing userId or exerciseId for toggle');
      return currentFavoriteStatus;
    }

    const newFavoriteStatus = !currentFavoriteStatus;
    console.debug('[useExerciseFavorites] Toggling favorite:', { exerciseId, currentFavoriteStatus, newFavoriteStatus });

    // Set loading state
    setLoadingStates(prev => ({ ...prev, [exerciseId]: true }));

    // Optimistically update the UI
    setFavoriteStates(prev => ({ ...prev, [exerciseId]: newFavoriteStatus }));

    try {
      // Haptic feedback for user interaction
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Call API to update favorite status
      const result = await setExerciseFavorite(userId, exerciseId, newFavoriteStatus);
      
      if (result) {
        console.debug('[useExerciseFavorites] Successfully updated favorite status:', result);
        // Success haptic feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return newFavoriteStatus;
      } else {
        // Revert optimistic update on failure
        console.error('[useExerciseFavorites] Failed to update favorite status, reverting');
        setFavoriteStates(prev => ({ ...prev, [exerciseId]: currentFavoriteStatus }));
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return currentFavoriteStatus;
      }
    } catch (error) {
      console.error('[useExerciseFavorites] Error toggling favorite:', error);
      // Revert optimistic update on error
      setFavoriteStates(prev => ({ ...prev, [exerciseId]: currentFavoriteStatus }));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return currentFavoriteStatus;
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({ ...prev, [exerciseId]: false }));
    }
  }, [userId]);

  /**
   * Get the current favorite status for an exercise
   * @param {string} exerciseId - The exercise ID
   * @param {boolean} defaultStatus - Default status if not in state
   * @returns {boolean} - Current favorite status
   */
  const getFavoriteStatus = useCallback((exerciseId, defaultStatus = false) => {
    return favoriteStates[exerciseId] !== undefined ? favoriteStates[exerciseId] : defaultStatus;
  }, [favoriteStates]);

  /**
   * Get the loading status for an exercise
   * @param {string} exerciseId - The exercise ID
   * @returns {boolean} - Current loading status
   */
  const getLoadingStatus = useCallback((exerciseId) => {
    return loadingStates[exerciseId] || false;
  }, [loadingStates]);

  /**
   * Set initial favorite status for an exercise (useful when loading from API)
   * @param {string} exerciseId - The exercise ID
   * @param {boolean} isFavorite - The favorite status
   */
  const setInitialFavoriteStatus = useCallback((exerciseId, isFavorite) => {
    setFavoriteStates(prev => ({ ...prev, [exerciseId]: isFavorite }));
  }, []);

  return {
    toggleFavorite,
    getFavoriteStatus,
    getLoadingStatus,
    setInitialFavoriteStatus,
  };
};

export default useExerciseFavorites; 