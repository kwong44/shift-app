/**
 * Custom React Hook for AI-Powered Daily Focus Recommendations
 * 
 * This hook integrates with the existing AI daily focus service to provide
 * personalized exercise recommendations based on comprehensive user context.
 * 
 * Features:
 * - AI-powered recommendations using GPT-4o-mini
 * - Intelligent fallback to time-based recommendations
 * - Caching and refresh capabilities
 * - Loading states and error handling
 * - Debug logging for development
 */

import { useEffect, useCallback } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { useDailyFocus } from '../contexts/DailyFocusContext';
import { isAIPoweredRecommendation } from '../services/aiDailyFocusService';

// Debug logging for hook lifecycle
console.debug('[useAIDailyFocusRecommendations] Hook module loaded');

/**
 * Hook for AI-powered daily focus recommendations
 * @param {Object} options - Configuration options
 * @param {number} options.count - Number of recommendations to fetch (default: 3)
 * @param {boolean} options.autoRefresh - Whether to auto-refresh on focus (default: true)
 * @returns {Object} Hook state and functions
 */
const useAIDailyFocusRecommendations = (options = {}) => {
  const { count = 3, autoRefresh = true } = options;
  const isFocused = useIsFocused();

  // DailyFocus global context
  const {
    recommendations,
    loading,
    error,
    aiPowered,
    focusTheme,
    coachNote,
    lastFetched,
    fetchRecommendations,
    cacheValid,
  } = useDailyFocus();

  console.debug(`[useAIDailyFocusRecommendations] Hook initialized with options:`, { count, autoRefresh });

  /**
   * Get AI explanation for a specific exercise
   * @param {Object} exercise - Exercise object
   * @returns {string} AI reasoning or fallback explanation
   */
  const getExplanation = useCallback((exercise) => {
    if (!exercise) return '';
    
    if (exercise.ai_recommendation?.reasoning) {
      return exercise.ai_recommendation.reasoning;
    }
    
    if (exercise.fallback_recommendation?.reasoning) {
      return exercise.fallback_recommendation.reasoning;
    }
    
    return exercise.description || 'Recommended for your personal growth';
  }, []);

  // Effect: Initial load and auto-refresh on focus
  useEffect(() => {
    console.debug(`[useAIDailyFocusRecommendations] Effect triggered - isFocused: ${isFocused}, autoRefresh: ${autoRefresh}, cacheValid: ${cacheValid}`);
    
    if (isFocused && autoRefresh && !cacheValid) {
      console.debug('[useAIDailyFocusRecommendations] Triggering fetch due to invalid cache');
      fetchRecommendations(false, count);
    }
  }, [isFocused, autoRefresh, cacheValid, fetchRecommendations, count]);

  // Debug logging from context (reduced)
  useEffect(() => {
    console.debug('[useAIDailyFocusRecommendations] Context update', { count: recommendations.length, loading });
  }, [recommendations.length, loading]);

  /**
   * Force refresh recommendations regardless of cache
   */
  const refresh = useCallback(() => {
    console.debug('[useAIDailyFocusRecommendations] Manual refresh triggered');
    fetchRecommendations(true, count);
  }, [fetchRecommendations, count]);

  return {
    // Core data
    recommendations,
    loading,
    error,
    
    // AI-specific metadata
    aiPowered,
    focusTheme,
    coachNote,
    
    // Cache information
    lastFetched,
    cacheValid,
    
    // Actions
    refresh,
    getExplanation,
    
    // Utility functions
    isAIPowered: isAIPoweredRecommendation
  };
};

export default useAIDailyFocusRecommendations;

// Also export as named export for convenience
export { useAIDailyFocusRecommendations }; 