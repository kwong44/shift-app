# AI-Powered Daily Focus Recommendation Engine

## Overview
This document details the implementation of the AI-powered Daily Focus Recommendation Engine in the Shift App. The system leverages advanced AI (GPT-4o-mini) and user context to generate personalized daily exercise recommendations, replacing the previous static/favorites-based approach.

---

## Architecture

### 1. AI Edge Function (Supabase)
- **File:** `supabase/functions/daily-focus-ai/index.ts`
- **Purpose:**
  - Gathers comprehensive user context (goals, journal entries, mood, exercise history, conversation history, favorites)
  - Calls OpenAI (GPT-4o-mini) to generate JSON-formatted recommendations
  - Returns structured recommendations, focus theme, and coach note
  - Provides robust fallback to user favorites if AI is unavailable

### 2. Client Service Layer
- **File:** `src/services/aiDailyFocusService.js`
- **Purpose:**
  - Calls the Supabase Edge Function for recommendations
  - Validates and enhances AI results with local exercise metadata
  - Provides fallback recommendations (time-based, general wellness) if AI fails
  - Exposes utility functions for explanations, AI status, and focus theme

### 3. React Hook
- **File:** `src/hooks/useAIDailyFocusRecommendations.js`
- **Purpose:**
  - Provides a React hook for UI components to access AI-powered recommendations
  - Handles loading, error, and cache state
  - Supports auto-refresh on screen focus and manual refresh
  - Tracks if recommendations are AI-powered or fallback
  - Exposes focus theme and explanation utilities

### 4. UI Integration
- **File:** `src/screens/app/HomeScreen/components/DailyFocus.js`
- **Purpose:**
  - Uses the new hook to display daily focus recommendations
  - Shows AI status (chip), focus theme, and improved loading/error states
  - Handles retry and refresh logic
  - Maintains exercise completion tracking

---

## Implementation Steps

1. **Edge Function**: Built a Supabase Edge Function that:
   - Fetches all relevant user data in parallel
   - Formats a rich system prompt for OpenAI
   - Parses and validates AI JSON output
   - Returns fallback recommendations if AI fails

2. **Service Layer**: Created `aiDailyFocusService.js` to:
   - Call the edge function
   - Validate and enhance recommendations
   - Provide robust fallback logic
   - Expose utility methods for explanations and focus theme

3. **React Hook**: Implemented `useAIDailyFocusRecommendations`:
   - Smart caching (default 30 min)
   - Auto-refresh on focus
   - Request cancellation and memory leak prevention
   - Parallel fetching of recommendations and focus theme
   - Exposes AI status, explanations, and refresh actions

4. **UI Update**: Refactored `DailyFocus.js`:
   - Switched from static/favorites to AI-powered recommendations
   - Added AI chip, focus theme, and improved error/loading UI
   - Integrated retry and refresh logic
   - Maintained completion tracking

5. **Testing**: Updated `AITestButton.js` to allow devs to test the AI recommendation system directly from the UI.

---

## Developer Notes

- **Debug Logging:**
  - Extensive debug logs are present throughout the service, hook, and UI for easier troubleshooting.
- **Fallbacks:**
  - If AI or network fails, the system gracefully falls back to time-based and general recommendations.
- **Caching:**
  - Recommendations are cached for 30 minutes by default to reduce API calls and improve performance.
- **AI Metadata:**
  - Each recommendation includes AI metadata (score, reasoning, personalization, benefit) when available.
- **Focus Theme:**
  - The AI coach can provide a daily focus theme, displayed in the UI for extra context.
- **Manual Refresh:**
  - Users/devs can manually refresh recommendations if needed.
- **Extensibility:**
  - The architecture supports future enhancements, such as deeper pattern analysis, user feedback, and ML-based scoring.

---

## How to Extend or Debug

- **To adjust fallback logic:** Edit `getFallbackRecommendations` in `aiDailyFocusService.js`.
- **To change cache duration:** Update `cacheTimeout` in the hook options.
- **To add new user context:** Update the edge function's `gatherUserContext` and prompt.
- **To debug AI output:** Check logs in both the edge function and client service for raw AI responses and errors.
- **To test in-app:** Use the "Test AI Daily Focus" button in `AITestButton.js`.

---

## Future Enhancements
- Deeper AI pattern analysis (journals, mood, tasks)
- User feedback loop for recommendation quality
- ML-based scoring refinement
- Calendar/time-based context
- More granular fallback strategies

---

## Summary
This system brings true AI-powered personalization to the Daily Focus feature, leveraging the user's complete context and the latest AI models. The architecture is robust, extensible, and designed for both reliability and future growth. 