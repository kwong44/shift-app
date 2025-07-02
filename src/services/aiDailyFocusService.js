import { supabase } from '../config/supabase';
import { MASTER_EXERCISE_LIST } from '../constants/masterExerciseList';

console.debug('[aiDailyFocusService] Service initialized');

/**
 * AI-Powered Daily Focus Recommendation Service
 * This service leverages the AI coach's intelligence to generate personalized daily exercise recommendations
 * based on comprehensive user context including goals, journal entries, exercise history, and conversation patterns.
 */

/**
 * Generate AI-powered daily focus recommendations
 * @param {string} userId - The user's ID
 * @param {number} count - Number of recommendations to generate (default: 3)
 * @returns {Promise<Array>} Array of personalized exercise recommendations
 */
export const generateAIDailyFocusRecommendations = async (userId, count = 3) => {
  console.debug(`[aiDailyFocusService] Generating AI recommendations for user: ${userId}, count: ${count}`);

  try {
    if (!userId) {
      console.warn('[aiDailyFocusService] No userId provided, returning fallback recommendations');
      return getFallbackRecommendations(count);
    }

    // Call the AI-powered Edge Function
    console.debug('[aiDailyFocusService] Calling daily-focus-ai Edge Function');
    
    const { data, error } = await supabase.functions.invoke('daily-focus-ai', {
      body: {
        userId,
        requestedCount: count
      }
    });

    if (error) {
      console.error('[aiDailyFocusService] Edge Function error:', error);
      throw error;
    }

    if (!data || !data.success) {
      console.warn('[aiDailyFocusService] AI service returned unsuccessful response:', data);
      return getFallbackRecommendations(count);
    }

    // Process AI recommendations
    const aiRecommendations = data.recommendations || [];
    console.debug(`[aiDailyFocusService] Received ${aiRecommendations.length} AI recommendations`);

    // Log AI insights for debugging
    if (data.metadata) {
      console.debug('[aiDailyFocusService] AI Focus Theme:', data.metadata.overall_focus_theme);
      console.debug('[aiDailyFocusService] AI Coach Note:', data.metadata.coach_note);
      console.debug('[aiDailyFocusService] Context Factors:', data.metadata.contextFactors);
    }

    // Validate and enhance recommendations
    const validatedRecommendations = validateAndEnhanceRecommendations(aiRecommendations);
    
    // If we don't have enough valid recommendations, fill with fallbacks
    if (validatedRecommendations.length < count) {
      console.debug(`[aiDailyFocusService] Only ${validatedRecommendations.length} valid recommendations, filling with fallbacks`);
      const fallbacks = getFallbackRecommendations(count - validatedRecommendations.length);
      validatedRecommendations.push(...fallbacks);
    }

    console.debug(`[aiDailyFocusService] Returning ${validatedRecommendations.length} final recommendations`);
    return validatedRecommendations.slice(0, count);

  } catch (error) {
    console.error('[aiDailyFocusService] Error generating AI recommendations:', error);
    console.debug('[aiDailyFocusService] Falling back to basic recommendations');
    return getFallbackRecommendations(count);
  }
};

/**
 * Validate AI recommendations and enhance with client-side data
 * @param {Array} aiRecommendations - Raw recommendations from AI
 * @returns {Array} Validated and enhanced recommendations
 */
const validateAndEnhanceRecommendations = (aiRecommendations) => {
  console.debug(`[aiDailyFocusService] Validating ${aiRecommendations.length} AI recommendations`);

  const validatedExercises = [];

  for (const aiRec of aiRecommendations) {
    try {
      // Find the exercise in our master list
      const exercise = MASTER_EXERCISE_LIST.find(ex => ex.id === aiRec.exercise_id);
      
      if (!exercise) {
        console.warn(`[aiDailyFocusService] Exercise not found in master list: ${aiRec.exercise_id}`);
        continue;
      }

      // Enhance with AI metadata
      const enhancedExercise = {
        ...exercise,
        ai_recommendation: {
          priority_score: aiRec.ai_metadata?.priority_score || 75,
          reasoning: aiRec.ai_metadata?.reasoning || 'Recommended based on your current context',
          personalization: aiRec.ai_metadata?.personalization || '',
          expected_benefit: aiRec.ai_metadata?.expected_benefit || exercise.description,
          is_ai_powered: true,
          recommendation_timestamp: new Date().toISOString()
        }
      };

      validatedExercises.push(enhancedExercise);
      console.debug(`[aiDailyFocusService] Validated exercise: ${exercise.title} (Score: ${aiRec.ai_metadata?.priority_score || 'N/A'})`);
    } catch (error) {
      console.error('[aiDailyFocusService] Error validating recommendation:', error, aiRec);
    }
  }

  console.debug(`[aiDailyFocusService] Successfully validated ${validatedExercises.length} recommendations`);
  return validatedExercises;
};

/**
 * Get fallback recommendations when AI is unavailable
 * @param {number} count - Number of recommendations needed
 * @returns {Array} Fallback exercise recommendations
 */
const getFallbackRecommendations = (count) => {
  console.debug(`[aiDailyFocusService] Generating ${count} fallback recommendations`);

  // Use time-based and general wellness recommendations as fallback
  const timeBasedRecommendations = getTimeBasedRecommendations();
  const generalRecommendations = [
    'mindfulness_breath_5min',
    'tasks_planner', 
    'visualization_goals_5min',
    'deepwork_pomodoro_25min',
    'binaural_focus_beta_20min'
  ];

  // Combine and shuffle
  const allFallbacks = [...timeBasedRecommendations, ...generalRecommendations];
  const shuffled = allFallbacks.sort(() => 0.5 - Math.random());
  
  // Get unique exercise objects
  const fallbackExercises = [];
  const usedIds = new Set();

  for (const exerciseId of shuffled) {
    if (usedIds.has(exerciseId) || fallbackExercises.length >= count) {
      continue;
    }

    const exercise = MASTER_EXERCISE_LIST.find(ex => ex.id === exerciseId);
    if (exercise) {
      fallbackExercises.push({
        ...exercise,
        fallback_recommendation: {
          type: 'time_based_fallback',
          reasoning: 'Selected based on time of day and general wellness principles',
          is_ai_powered: false,
          recommendation_timestamp: new Date().toISOString()
        }
      });
      usedIds.add(exerciseId);
    }
  }

  console.debug(`[aiDailyFocusService] Generated ${fallbackExercises.length} fallback recommendations`);
  return fallbackExercises;
};

/**
 * Get time-based exercise recommendations
 * @returns {Array} Exercise IDs appropriate for current time
 */
const getTimeBasedRecommendations = () => {
  const hour = new Date().getHours();
  
  // Morning (6-11): Energy and planning
  if (hour >= 6 && hour < 12) {
    return [
      'tasks_planner',
      'visualization_goals_5min', 
      'deepwork_pomodoro_25min',
      'mindfulness_breath_5min'
    ];
  }
  
  // Afternoon (12-17): Focus and productivity
  if (hour >= 12 && hour < 18) {
    return [
      'deepwork_pomodoro_25min',
      'binaural_focus_beta_20min',
      'tasks_planner',
      'mindfulness_breath_5min'
    ];
  }
  
  // Evening (18-23): Relaxation and reflection
  if (hour >= 18 && hour < 24) {
    return [
      'mindfulness_body_scan_8min',
      'visualization_contentment_5min',
      'journaling_reflection_15min',
      'mindfulness_breath_5min'
    ];
  }
  
  // Late night/Early morning (0-5): Gentle activities
  return [
    'mindfulness_breath_5min',
    'visualization_calm_5min',
    'mindfulness_body_scan_8min'
  ];
};

/**
 * Get AI recommendation explanation for display
 * @param {Object} exercise - Exercise with AI recommendation data
 * @returns {string} Human-readable explanation
 */
export const getAIRecommendationExplanation = (exercise) => {
  if (exercise.ai_recommendation?.reasoning) {
    return exercise.ai_recommendation.reasoning;
  }
  
  if (exercise.fallback_recommendation?.reasoning) {
    return exercise.fallback_recommendation.reasoning;
  }
  
  return `${exercise.description} - Perfect for your current focus needs.`;
};

/**
 * Check if an exercise has AI-powered recommendations
 * @param {Object} exercise - Exercise object
 * @returns {boolean} True if AI-powered
 */
export const isAIPoweredRecommendation = (exercise) => {
  return exercise.ai_recommendation?.is_ai_powered === true;
};

/**
 * Get the AI coach's focus theme for the day
 * This can be displayed to give users context about their recommendations
 * @param {string} userId - User's ID
 * @returns {Promise<string|null>} The focus theme or null
 */
export const getDailyFocusTheme = async (userId) => {
  try {
    console.debug(`[aiDailyFocusService] Getting daily focus theme for user: ${userId}`);
    
    // This could be cached or retrieved from a recent AI recommendation call
    // For now, we'll make a lightweight call to get just the theme
    const { data, error } = await supabase.functions.invoke('daily-focus-ai', {
      body: {
        userId,
        requestedCount: 1,
        themeOnly: true // Could be a parameter to return just the theme
      }
    });

    if (error || !data?.success) {
      console.debug('[aiDailyFocusService] Could not get focus theme, using fallback');
      return null;
    }

    return data.metadata?.overall_focus_theme || null;
  } catch (error) {
    console.error('[aiDailyFocusService] Error getting daily focus theme:', error);
    return null;
  }
};

export default {
  generateAIDailyFocusRecommendations,
  getAIRecommendationExplanation,
  isAIPoweredRecommendation,
  getDailyFocusTheme
}; 