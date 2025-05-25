// src/api/dailyFocus.js
import { supabase } from '../config/supabase'; // Assuming supabase client is here for potential future DB interactions
import { MASTER_EXERCISE_LIST, getExerciseById } from '../constants/masterExerciseList';
import { getFavoriteExerciseIds } from './profile'; // Assuming profile.js is in the same directory

/**
 * Shuffles an array in place.
 * @param {Array} array Array to shuffle.
 * @returns {Array} The shuffled array.
 */
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
};

/**
 * Gets daily focus exercise suggestions for a user.
 * Phase 1: Prioritizes user's favorites, then fills with other random exercises.
 * @param {string} userId - The user's ID.
 * @param {number} count - The number of suggestions to return (default: 3).
 * @returns {Promise<Array<object>>} An array of exercise objects from MASTER_EXERCISE_LIST.
 */
export const getDailyFocusSuggestions = async (userId, count = 3) => {
  console.debug(`[getDailyFocusSuggestions] Fetching suggestions for user: ${userId}, count: ${count}`);
  if (!userId) {
    console.warn('[getDailyFocusSuggestions] No userId provided. Returning random exercises.');
    // Fallback: return 'count' random exercises from master list if no user ID
    const shuffledMasterList = shuffleArray([...MASTER_EXERCISE_LIST]);
    return shuffledMasterList.slice(0, count);
  }

  const suggestions = [];
  const addedExerciseIds = new Set();

  try {
    // 1. Fetch Favorite Exercise IDs
    const favoriteIds = await getFavoriteExerciseIds(userId);
    console.debug('[getDailyFocusSuggestions] User favorite IDs:', favoriteIds);

    // 2. Prioritize Shuffled Favorites
    const shuffledFavoriteIds = shuffleArray([...favoriteIds]);
    for (const favId of shuffledFavoriteIds) {
      if (suggestions.length >= count) break;
      if (!addedExerciseIds.has(favId)) {
        const exercise = getExerciseById(favId); // Use helper from masterExerciseList
        if (exercise) {
          suggestions.push(exercise);
          addedExerciseIds.add(favId);
        }
      }
    }
    console.debug(`[getDailyFocusSuggestions] Suggestions after favorites (${suggestions.length}/${count}):`, suggestions.map(s => s.id));

    // 3. Fill with Non-Favorite, Non-Added Exercises (if needed)
    if (suggestions.length < count) {
      const nonFavoriteExercises = MASTER_EXERCISE_LIST.filter(
        (ex) => !addedExerciseIds.has(ex.id) // Ensure it's not already added (covers favorites too)
      );
      const shuffledNonFavorites = shuffleArray(nonFavoriteExercises);

      for (const exercise of shuffledNonFavorites) {
        if (suggestions.length >= count) break;
        // The check !addedExerciseIds.has(ex.id) above already ensures no duplicates here
        suggestions.push(exercise);
        addedExerciseIds.add(exercise.id); // Should not be strictly necessary due to filter, but good for safety
      }
      console.debug(`[getDailyFocusSuggestions] Suggestions after filling non-favorites (${suggestions.length}/${count}):`, suggestions.map(s => s.id));
    }

    // Ensure we don't exceed 'count' if somehow logic above overfills (shouldn't happen)
    const finalSuggestions = suggestions.slice(0, count);
    console.debug('[getDailyFocusSuggestions] Final suggestions:', finalSuggestions.map(s => s.id));
    return finalSuggestions;

  } catch (error) {
    console.error('[getDailyFocusSuggestions] Error fetching suggestions:', error);
    // Fallback in case of error: return 'count' random exercises from master list
    const shuffledMasterList = shuffleArray([...MASTER_EXERCISE_LIST]);
    return shuffledMasterList.slice(0, count);
  }
};

// Example usage (for testing in an async context):
/*
async function testSuggestions() {
  const testUserId = 'your-test-user-id'; // Replace with a valid user ID that has some favorites
  if (testUserId === 'your-test-user-id') {
      console.warn("Please replace 'your-test-user-id' with an actual user ID for testing getDailyFocusSuggestions");
      return;
  }
  console.log(\`Testing with user ID: ${testUserId}\`);

  // Mock MASTER_EXERCISE_LIST and getFavoriteExerciseIds for isolated testing if needed
  // Or ensure your Supabase instance is running and accessible with test data.

  const suggestions = await getDailyFocusSuggestions(testUserId, 3);
  console.log('Received suggestions:', suggestions.map(s => ({id: s.id, title: s.title})));

  const suggestionsForNoUser = await getDailyFocusSuggestions(null, 2);
  console.log('Suggestions for no user:', suggestionsForNoUser.map(s => ({id: s.id, title: s.title})));
}
// testSuggestions(); // Uncomment to run test if this file is executed directly (e.g., with Node.js)
*/
