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

import { useState, useEffect, useCallback, useRef } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { generateAIDailyFocusRecommendations, getDailyFocusTheme, isAIPoweredRecommendation } from '../services/aiDailyFocusService';
import { useUser } from './useUser';

// Debug logging for hook lifecycle
console.debug('[useAIDailyFocusRecommendations] Hook module loaded');

/**
 * Hook for AI-powered daily focus recommendations
 * @param {Object} options - Configuration options
 * @param {number} options.count - Number of recommendations to fetch (default: 3)
 * @param {boolean} options.autoRefresh - Whether to auto-refresh on focus (default: true)
 * @param {number} options.cacheTimeout - Cache timeout in milliseconds (default: 30 minutes)
 * @returns {Object} Hook state and functions
 */
const useAIDailyFocusRecommendations = (options = {}) => {
  const {
    count = 3,
    autoRefresh = true,
    cacheTimeout = 30 * 60 * 1000 // 30 minutes default cache
  } = options;

  // Get user context and screen focus state
  const { user } = useUser();
  const isFocused = useIsFocused();

  // State management for recommendations
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiPowered, setAiPowered] = useState(false);
  const [focusTheme, setFocusTheme] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  // Refs for preventing memory leaks and managing state
  const mountedRef = useRef(true);
  const currentRequestRef = useRef(null);

  console.debug(`[useAIDailyFocusRecommendations] Hook initialized with options:`, { count, autoRefresh, cacheTimeout });

  /**
   * Check if current cache is still valid
   * @returns {boolean} True if cache is valid
   */
  const isCacheValid = useCallback(() => {
    if (!lastFetched) return false;
    const cacheAge = Date.now() - lastFetched;
    const isValid = cacheAge < cacheTimeout;
    console.debug(`[useAIDailyFocusRecommendations] Cache check: age=${Math.round(cacheAge/1000)}s, valid=${isValid}`);
    return isValid;
  }, [lastFetched, cacheTimeout]);

  /**
   * Fetch AI-powered recommendations
   * @param {boolean} force - Force refresh even if cache is valid
   * @returns {Promise<void>}
   */
  const fetchRecommendations = useCallback(async (force = false) => {
    // Early return if no user or cache is valid and not forcing
    if (!user?.id) {
      console.debug('[useAIDailyFocusRecommendations] No user ID, skipping fetch');
      setLoading(false);
      return;
    }

    if (!force && isCacheValid()) {
      console.debug('[useAIDailyFocusRecommendations] Cache is valid, skipping fetch');
      return;
    }

    // Cancel any existing request
    if (currentRequestRef.current) {
      console.debug('[useAIDailyFocusRecommendations] Cancelling previous request');
      currentRequestRef.current.cancelled = true;
    }

    // Create new request tracker
    const requestTracker = { cancelled: false };
    currentRequestRef.current = requestTracker;

    console.debug(`[useAIDailyFocusRecommendations] Starting fetch for user: ${user.id}, count: ${count}, force: ${force}`);
    setLoading(true);
    setError(null);

    try {
      // Fetch recommendations and theme in parallel for better performance
      const [recommendationsResult, themeResult] = await Promise.allSettled([
        generateAIDailyFocusRecommendations(user.id, count),
        getDailyFocusTheme(user.id)
      ]);

      // Check if request was cancelled while waiting
      if (requestTracker.cancelled || !mountedRef.current) {
        console.debug('[useAIDailyFocusRecommendations] Request was cancelled or component unmounted');
        return;
      }

      // Process recommendations result
      if (recommendationsResult.status === 'fulfilled') {
        const fetchedRecommendations = recommendationsResult.value || [];
        
        console.debug(`[useAIDailyFocusRecommendations] Successfully fetched ${fetchedRecommendations.length} recommendations`);
        
        // Check if any recommendations are AI-powered
        const hasAIPowered = fetchedRecommendations.some(exercise => isAIPoweredRecommendation(exercise));
        
        // Log AI recommendation details for debugging
        fetchedRecommendations.forEach((exercise, index) => {
          const isAI = isAIPoweredRecommendation(exercise);
          const score = exercise.ai_recommendation?.priority_score;
          console.debug(`[useAIDailyFocusRecommendations] Rec ${index + 1}: ${exercise.title} (AI: ${isAI}, Score: ${score || 'N/A'})`);
        });

        setRecommendations(fetchedRecommendations);
        setAiPowered(hasAIPowered);
        setLastFetched(Date.now());
        
        console.debug(`[useAIDailyFocusRecommendations] Updated state - AI powered: ${hasAIPowered}`);
      } else {
        console.error('[useAIDailyFocusRecommendations] Failed to fetch recommendations:', recommendationsResult.reason);
        setError('Failed to load personalized recommendations');
        setRecommendations([]);
      }

      // Process theme result
      if (themeResult.status === 'fulfilled') {
        const theme = themeResult.value;
        if (theme) {
          console.debug(`[useAIDailyFocusRecommendations] Daily focus theme: ${theme}`);
          setFocusTheme(theme);
        }
      } else {
        console.debug('[useAIDailyFocusRecommendations] Could not fetch focus theme:', themeResult.reason);
      }

    } catch (err) {
      if (requestTracker.cancelled || !mountedRef.current) {
        console.debug('[useAIDailyFocusRecommendations] Request cancelled during error handling');
        return;
      }

      console.error('[useAIDailyFocusRecommendations] Error fetching recommendations:', err);
      setError(err.message || 'Failed to load recommendations');
      setRecommendations([]);
      setAiPowered(false);
    } finally {
      if (!requestTracker.cancelled && mountedRef.current) {
        setLoading(false);
        currentRequestRef.current = null;
      }
    }
  }, [user, count, isCacheValid]);

  /**
   * Force refresh recommendations regardless of cache
   */
  const refresh = useCallback(() => {
    console.debug('[useAIDailyFocusRecommendations] Manual refresh triggered');
    fetchRecommendations(true);
  }, [fetchRecommendations]);

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
    console.debug(`[useAIDailyFocusRecommendations] Effect triggered - isFocused: ${isFocused}, autoRefresh: ${autoRefresh}, user: ${!!user?.id}`);
    
    if (isFocused && autoRefresh) {
      fetchRecommendations();
    }
  }, [user?.id, isFocused, autoRefresh, fetchRecommendations]);

  // Effect: Cleanup on unmount
  useEffect(() => {
    return () => {
      console.debug('[useAIDailyFocusRecommendations] Component unmounting, cleaning up');
      mountedRef.current = false;
      if (currentRequestRef.current) {
        currentRequestRef.current.cancelled = true;
      }
    };
  }, []);

  // Debug logging for state changes
  useEffect(() => {
    console.debug(`[useAIDailyFocusRecommendations] State updated:`, {
      recommendationsCount: recommendations.length,
      loading,
      error: !!error,
      aiPowered,
      focusTheme: !!focusTheme,
      cacheAge: lastFetched ? Math.round((Date.now() - lastFetched) / 1000) : null
    });
  }, [recommendations, loading, error, aiPowered, focusTheme, lastFetched]);

  return {
    // Core data
    recommendations,
    loading,
    error,
    
    // AI-specific metadata
    aiPowered,
    focusTheme,
    
    // Cache information
    lastFetched,
    cacheValid: isCacheValid(),
    
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