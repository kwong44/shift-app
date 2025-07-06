import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { generateAIDailyFocusRecommendations, getDailyFocusTheme, isAIPoweredRecommendation } from '../services/aiDailyFocusService';
import { useUser } from '../hooks/useUser';

// ---------------------------------------------------------------------------
// DailyFocusContext
// ---------------------------------------------------------------------------
// Stores today\'s recommendations in-memory so that navigating between screens
// (or re-rendering HomeScreen) doesn\'t re-hit the Edge Function. Fetches at
// most once per calendar day unless explicitly invalidated.
// ---------------------------------------------------------------------------

console.debug('[DailyFocusContext] Module loaded');

const DailyFocusContext = createContext();

export const DailyFocusProvider = ({ children, defaultCount = 3 }) => {
  const { user } = useUser();
  const [state, setState] = useState({
    recommendations: [],
    loading: false,
    error: null,
    aiPowered: false,
    focusTheme: null,
    coachNote: null,
    lastFetched: null, // JS Date object
  });

  // Ref used to cancel in-flight fetches if needed.
  const currentRequestRef = useRef(null);
  // Ref to store the latest state for access in callbacks
  const stateRef = useRef(state);
  stateRef.current = state;

  // Helper: is same local calendar day
  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // FIXED: Stable fetchRecommendations without state.lastFetched in dependencies
  const fetchRecommendations = useCallback(
    async (force = false, count = defaultCount) => {
      if (!user?.id) {
        console.debug('[DailyFocusContext] No user ID, skipping fetch');
        return;
      }

      console.debug('[DailyFocusContext] fetchRecommendations called', { force, count, hasUser: !!user?.id });

      // Check current state using ref to avoid dependency issues
      const currentState = stateRef.current;
      
      // Bail out if we already fetched today and not forcing
      if (!force && currentState.lastFetched && isSameDay(new Date(), currentState.lastFetched)) {
        console.debug('[DailyFocusContext] Cache still valid, skipping fetch');
        return;
      }

      // Cancel previous request
      if (currentRequestRef.current) {
        currentRequestRef.current.cancelled = true;
      }
      const tracker = { cancelled: false };
      currentRequestRef.current = tracker;

      // Set loading state
      setState(prev => ({ ...prev, loading: true, error: null }));
      console.debug('[DailyFocusContext] Fetch start');

      try {
        const [recs, themeData] = await Promise.all([
          generateAIDailyFocusRecommendations(user.id, count),
          getDailyFocusTheme(user.id),
        ]);

        if (tracker.cancelled) {
          console.debug('[DailyFocusContext] Fetch cancelled');
          return;
        }

        const aiPowered = recs.some(isAIPoweredRecommendation);

        setState({
          recommendations: recs,
          loading: false,
          error: null,
          aiPowered,
          focusTheme: themeData?.theme ?? null,
          coachNote: themeData?.coachNote ?? null,
          lastFetched: new Date(),
        });
        console.debug('[DailyFocusContext] Fetch success', { recs: recs.length, aiPowered });
      } catch (err) {
        if (tracker.cancelled) {
          console.debug('[DailyFocusContext] Fetch cancelled during error');
          return;
        }
        setState(prev => ({ ...prev, loading: false, error: err.message || 'Failed to fetch' }));
        console.error('[DailyFocusContext] Fetch error', err);
      } finally {
        currentRequestRef.current = null;
      }
    },
    [user?.id, defaultCount] // FIXED: Removed state.lastFetched from dependencies
  );

  // Manual invalidation — call after exercise completion, etc.
  const invalidate = useCallback(() => {
    console.debug('[DailyFocusContext] Invalidate called');
    setState(prev => ({ ...prev, lastFetched: null }));
  }, []);

  // Calculate cache validity - this is a computed value, not a function
  const cacheValid = state.lastFetched ? isSameDay(new Date(), state.lastFetched) : false;

  return (
    <DailyFocusContext.Provider value={{ ...state, cacheValid, fetchRecommendations, invalidate }}>
      {children}
    </DailyFocusContext.Provider>
  );
};

export const useDailyFocus = () => useContext(DailyFocusContext); 