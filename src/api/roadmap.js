import { supabase } from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ROADMAP_STORAGE_KEY = '@roadmap';

/**
 * Fetch user's roadmap from Supabase
 * @param {string} userId - The user's ID from Supabase Auth
 * @returns {Promise} - The roadmap object
 */
export const fetchRoadmap = async (userId) => {
  try {
    // First try to get from local storage
    const localRoadmap = await AsyncStorage.getItem(ROADMAP_STORAGE_KEY);
    if (localRoadmap) {
      return JSON.parse(localRoadmap);
    }

    // If not in local storage, fetch from Supabase
    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    // Store in local storage for offline access
    if (data) {
      await AsyncStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(data));
    }

    return data;
  } catch (error) {
    console.error('Error fetching roadmap:', error.message);
    throw error;
  }
};

/**
 * Create a new roadmap for the user
 * @param {string} userId - The user's ID from Supabase Auth
 * @param {object} assessmentData - The user's self-assessment data
 * @returns {Promise} - The created roadmap object
 */
export const createRoadmap = async (userId, assessmentData) => {
  try {
    // Log the user ID and a summary of assessment data (e.g., number of aspirations)
    console.log('[Roadmap] Creating roadmap (v3 - 5 Phases) for user:', userId, 
                `with ${assessmentData?.aspirations?.length || 0} aspirations.`);
    
    // Transform assessment data into roadmap goals (LTAs) and metadata
    const roadmapData = generateRoadmapFromAssessment(assessmentData);

    // Ensure roadmapData.goals is an array, even if empty
    const goalsToInsert = roadmapData.goals || [];

    // Define the 5 phases of the roadmap
    const roadmapPhases = [
      {
        number: 1,
        name: 'Foundations of Focus',
        description: 'Begin your journey by establishing a regular practice. Focus on completing at least one suggested exercise consistently.',
        status: 'active', // Initial phase is active
        advancement_summary: 'Complete at least 1 Daily Focus exercise, 3 times a week, for 2 consecutive weeks to reach Phase 2.',
        // For future machine-readable criteria:
        // advancement_criteria: { min_completions_per_week: 3, num_consecutive_weeks: 2, exercise_types: ['any_daily_focus'] }
      },
      {
        number: 2,
        name: 'Building Momentum',
        description: "You're getting consistent! Now, let's deepen that practice and explore a wider range of exercises.",
        status: 'locked',
        advancement_summary: 'Complete at least 1 Daily Focus exercise, 4 times a week, for 3 consecutive weeks to reach Phase 3.',
        // advancement_criteria: { min_completions_per_week: 4, num_consecutive_weeks: 3, exercise_types: ['any_daily_focus'] }
      },
      {
        number: 3,
        name: 'Deepening Practice',
        description: "Your commitment is strong. This phase is about integrating these practices more deeply into your life and tackling more specific growth areas.",
        status: 'locked',
        advancement_summary: 'Complete at least 1 Daily Focus exercise, 4 times a week, for 4 consecutive weeks to reach Phase 4. Try to vary your exercises!',
        // advancement_criteria: { min_completions_per_week: 4, num_consecutive_weeks: 4, exercise_types: ['any_daily_focus'] } // Simplified for now
      },
      {
        number: 4,
        name: 'Consistent Integration',
        description: "You've built solid habits. This phase focuses on maintaining high consistency and making these practices an integral part of your lifestyle.",
        status: 'locked',
        advancement_summary: 'Complete at least 1 Daily Focus exercise, 5 times a week, for 4 consecutive weeks to reach Phase 5.',
        // advancement_criteria: { min_completions_per_week: 5, num_consecutive_weeks: 4, exercise_types: ['any_daily_focus'] }
      },
      {
        number: 5,
        name: 'Sustained Transformation',
        description: "This is a testament to your dedication. Continue to nurture your growth and explore new depths in your well-being journey.",
        status: 'locked',
        advancement_summary: 'Maintain Phase 4 consistency (5 exercises/week) for an additional 6 consecutive weeks to master this phase. True mastery is an ongoing journey!',
        // advancement_criteria: { min_completions_per_week: 5, num_consecutive_weeks: 6, exercise_types: ['any_daily_focus'], from_phase_requirement: 4 } // Example of building on previous
      }
    ];

    const { data, error } = await supabase
      .from('roadmaps')
      .insert({
        user_id: userId,
        goals: goalsToInsert, // These are now the LTAs
        progress: {
          completed_goals: 0,
          total_goals: goalsToInsert.length, 
        },
        metadata: roadmapData.metadata, 
        current_phase: 1, // Default starting phase
        phases: roadmapPhases, // Assign the defined 5 phases
        // roadmap_version: '3.0' // Optional: if you want to version the roadmap structure itself
      })
      .select()
      .single();

    if (error) {
      console.error('[Roadmap] Error creating roadmap in Supabase:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('[Roadmap] Successfully created LTA-based roadmap:', JSON.stringify(data, null, 2));

    // Store in local storage
    await AsyncStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(data));

    return data;
  } catch (error) {
    console.error('[Roadmap] Error creating roadmap:', error.message);
    throw error;
  }
};

/**
 * Update user's roadmap progress
 * @param {string} roadmapId - The roadmap ID
 * @param {object} updates - The updates to apply to the roadmap
 * @returns {Promise} - The updated roadmap object
 */
export const updateRoadmap = async (roadmapId, updates) => {
  try {
    const { data, error } = await supabase
      .from('roadmaps')
      .update(updates)
      .eq('id', roadmapId)
      .select()
      .single();

    if (error) throw error;

    // Update local storage
    await AsyncStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(data));

    return data;
  } catch (error) {
    console.error('Error updating roadmap:', error.message);
    throw error;
  }
};

/**
 * Clear locally stored roadmap data
 * Useful when logging out or debugging
 */
export const clearLocalRoadmap = async () => {
  try {
    await AsyncStorage.removeItem(ROADMAP_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing local roadmap:', error.message);
  }
};

/**
 * Generate a structured roadmap from assessment data
 * NEW: References existing long-term goals from database instead of creating new JSON entries
 * @param {object} assessmentData - The user's self-assessment responses  
 * @returns {object} - Formatted roadmap data with goals referencing database IDs
 */
const generateRoadmapFromAssessment = (assessmentData) => {
  // Console log the raw assessmentData to see what's coming in
  console.log('[Roadmap] Generating roadmap from assessment data (v3 - DB reference based):', JSON.stringify(assessmentData, null, 2));
  
  const goals = [];

  // Transform user-defined aspirations (LTAs) into roadmap goals that REFERENCE the database
  const userAspirations = assessmentData.aspirations || []; // This now comes from definedLTAs in onboarding
  console.log('[Roadmap] Processing user aspirations (LTAs) with DB references:', JSON.stringify(userAspirations, null, 2));
  
  userAspirations.forEach((aspiration, index) => {
    // NEW: Instead of generating IDs, use the actual database long_term_goal_id
    if (!aspiration.longTermGoalId) {
      console.warn('[Roadmap] WARNING: Aspiration missing longTermGoalId database reference:', aspiration);
    }
    
    goals.push({
      id: aspiration.longTermGoalId || `fallback_lta_${index}_${new Date().getTime()}`, // NEW: Use DB ID as primary reference
      legacyId: `user_lta_${index}_${new Date().getTime()}`, // Keep legacy ID for compatibility 
      text: aspiration.text, // User's own words for their LTA
      timeline: 'long-term', // Default timeline, user breaks it down with WGs
      status: 'pending', // Initial status
      priority: index + 1, // Simple priority based on order of definition
      type: 'user_defined_lta', // Clearly mark as a user-defined Long-Term Aspiration
      areaId: aspiration.areaId, // Link to the growth area
      areaLabel: aspiration.areaLabel, // Store label for convenience
      longTermGoalId: aspiration.longTermGoalId, // NEW: Explicit reference to database table
      source: 'onboarding', // NEW: Track source
      created_at: new Date().toISOString(),
    });
  });

  // The satisfaction improvement goal - we can still add this as a JSON goal for phases/milestones
  // But it could also be created in the database if needed
  if (assessmentData.satisfactionBaseline?.overallScore < 7) {
    console.log('[Roadmap] Adding satisfaction improvement goal (JSON-only for phases)');
    const goalId = `satisfaction_improvement_${new Date().getTime()}`;
    goals.push({
      id: goalId,
      text: 'Improve overall life satisfaction',
      timeline: 'ongoing', // Satisfaction is an ongoing process
      status: 'pending',
      priority: goals.length + 1,
      type: 'system_suggested_satisfaction', // Differentiate from user LTAs
      longTermGoalId: null, // This one stays JSON-only for now
      source: 'system',
      created_at: new Date().toISOString(),
    });
  }

  // Add engagement preferences and other relevant selections as metadata
  const metadata = {
    assessmentVersion: assessmentData.assessment_version || '3', // Store assessment version used
    satisfactionBaseline: assessmentData.satisfactionBaseline,
    engagementPreferences: assessmentData.engagementPrefs,
    growthAreasSelected: assessmentData.growthAreas, // Store the selected growth areas raw objects
    longTermGoalIds: userAspirations.map(asp => asp.longTermGoalId).filter(Boolean), // NEW: Track DB IDs for easy reference
  };

  console.log('[Roadmap] Generated goals (DB-reference based):', JSON.stringify(goals, null, 2));
  console.log('[Roadmap] Generated metadata with DB references:', JSON.stringify(metadata, null, 2));

  return {
    goals, // These now reference the database long_term_goals table
    metadata
  };
};

/**
 * Checks if the user meets the criteria to advance to the next roadmap phase
 * and updates the roadmap if they do.
 * @param {string} userId - The user's ID.
 * @param {object} currentRoadmap - The user's current roadmap object.
 * @returns {Promise<object|null>} - The updated roadmap object with new phase details if advanced, otherwise null or an object indicating no advancement.
 */
export const checkAndAdvancePhase = async (userId, currentRoadmap) => {
  if (!userId || !currentRoadmap || !currentRoadmap.phases || !currentRoadmap.current_phase) {
    console.error('[Roadmap] checkAndAdvancePhase: Invalid userId or roadmap data provided.', { userId, currentRoadmap });
    return null;
  }

  console.log(`[Roadmap] Checking phase advancement for user: ${userId}, Current Phase: ${currentRoadmap.current_phase}`);

  const currentPhaseNumber = currentRoadmap.current_phase;
  const phases = currentRoadmap.phases;
  const currentPhaseDetails = phases.find(p => p.number === currentPhaseNumber);

  if (!currentPhaseDetails) {
    console.error(`[Roadmap] Could not find details for current phase ${currentPhaseNumber}.`);
    return null;
  }

  if (currentPhaseNumber >= phases.length) {
    console.log('[Roadmap] User is already in the final phase.');
    return { advanced: false, reason: 'Final phase' };
  }

  const nextPhaseDetails = phases.find(p => p.number === currentPhaseNumber + 1);
  if (!nextPhaseDetails) {
    console.error(`[Roadmap] Could not find next phase definition for phase ${currentPhaseNumber + 1}.`);
    return { advanced: false, error: 'Next phase definition missing' };
  }

  console.log(`[Roadmap] Evaluating advancement from Phase ${currentPhaseDetails.name} to Phase ${nextPhaseDetails.name}`);
  console.log(`[Roadmap] Advancement criteria for ${nextPhaseDetails.name}: ${nextPhaseDetails.advancement_summary}`);

  // Define criteria for phase advancement (could be moved to phase definitions later)
  const advancementCriteria = {
    1: { completionsPerWeek: 3, consecutiveWeeks: 2, nextPhaseNumber: 2 }, // Criteria to move from P1 to P2
    2: { completionsPerWeek: 4, consecutiveWeeks: 3, nextPhaseNumber: 3 }, // Criteria to move from P2 to P3
    3: { completionsPerWeek: 4, consecutiveWeeks: 4, nextPhaseNumber: 4 }, // Criteria to move from P3 to P4
    4: { completionsPerWeek: 5, consecutiveWeeks: 4, nextPhaseNumber: 5 }, // Criteria to move from P4 to P5
    5: { completionsPerWeek: 5, consecutiveWeeks: 6, nextPhaseNumber: null } // Criteria for "mastering" P5 (no next phase)
  };

  const criteria = advancementCriteria[currentPhaseNumber];
  if (!criteria) {
    console.error(`[Roadmap] No advancement criteria defined for current phase ${currentPhaseNumber}.`);
    return { advanced: false, error: 'Criteria not defined for current phase' };
  }

  let criteriaMet = false;

  try {
    // Fetch daily_exercise_logs for the user
    // Fetch enough history to cover the longest consecutive week requirement (e.g., 6 weeks for phase 5 + buffer)
    const lookbackWeeks = Math.max(criteria.consecutiveWeeks, 6) + 2; // Add buffer
    const oldestDateToFetch = new Date();
    oldestDateToFetch.setDate(oldestDateToFetch.getDate() - (lookbackWeeks * 7));

    console.debug(`[Roadmap] Fetching logs since: ${oldestDateToFetch.toISOString()}`);

    const { data: exerciseLogs, error: logError } = await supabase
      .from('daily_exercise_logs')
      .select('completed_at, exercise_id') // Assuming 'exercise_id' exists
      .eq('user_id', userId)
      // .eq('source', 'daily_focus') // Optional: if you only want to count Daily Focus completions
      .gte('completed_at', oldestDateToFetch.toISOString())
      .order('completed_at', { ascending: false });

    if (logError) {
      console.error('[Roadmap] Error fetching exercise logs:', logError);
      throw logError;
    }

    if (!exerciseLogs || exerciseLogs.length === 0) {
      console.log('[Roadmap] No recent exercise logs found for user.');
      return { advanced: false, reason: 'No recent logs' };
    }
    
    console.debug(`[Roadmap] Fetched ${exerciseLogs.length} exercise logs for analysis.`);

    // --- Analyze Logs --- 
    const getISOWeekAndYear = (date) => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      return `${d.getUTCFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
    };

    const weeklyCompletions = {}; // Format: { 'YYYY-Www': Set(dayOfYearString) }

    exerciseLogs.forEach(log => {
      const completedDate = new Date(log.completed_at);
      const weekId = getISOWeekAndYear(completedDate);
      const dayOfYearString = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}-${String(completedDate.getDate()).padStart(2, '0')}`;

      if (!weeklyCompletions[weekId]) {
        weeklyCompletions[weekId] = new Set();
      }
      weeklyCompletions[weekId].add(dayOfYearString); // Count unique days with completions
    });
    
    console.debug('[Roadmap] Weekly completion counts (unique days):', 
      Object.entries(weeklyCompletions)
        .map(([week, days]) => `${week}: ${days.size}`)
        .sort() // Sort for easier reading of logs
    );

    const sortedWeekIds = Object.keys(weeklyCompletions).sort().reverse(); // Most recent weeks first
    
    if (sortedWeekIds.length < criteria.consecutiveWeeks) {
      console.log(`[Roadmap] Criteria NOT met. Not enough unique weeks with data (${sortedWeekIds.length}) to check for ${criteria.consecutiveWeeks} consecutive weeks.`);
      return { advanced: false, reason: 'Not enough weekly data' };
    }

    let consecutiveWeeksMeetingCriteria = 0;
    // Check the N most recent weeks. sortedWeekIds[0] is the most recent week with logs.
    for (let i = 0; i < criteria.consecutiveWeeks; i++) {
      const weekIdToCheck = sortedWeekIds[i];
      if (weekIdToCheck && weeklyCompletions[weekIdToCheck] && weeklyCompletions[weekIdToCheck].size >= criteria.completionsPerWeek) {
        consecutiveWeeksMeetingCriteria++;
      } else {
        // If any of the N most recent weeks (that we need for the streak) is missing or doesn't meet criteria, the streak is broken.
        console.log(`[Roadmap] Streak broken at week ${i+1} (${weekIdToCheck || 'missing week in sequence'}). Completions: ${weeklyCompletions[weekIdToCheck]?.size || 0}/${criteria.completionsPerWeek}`);
        break; 
      }
    }

    if (consecutiveWeeksMeetingCriteria >= criteria.consecutiveWeeks) {
      criteriaMet = true;
      console.log(`[Roadmap] Criteria met: ${consecutiveWeeksMeetingCriteria} recent consecutive weeks with ${criteria.completionsPerWeek} or more completions.`);
    } else {
      console.log(`[Roadmap] Criteria NOT met. Recent consecutive streak: ${consecutiveWeeksMeetingCriteria}/${criteria.consecutiveWeeks} weeks did not meet ${criteria.completionsPerWeek} completions/week.`);
    }

  } catch (error) {
    console.error('[Roadmap] Error during phase advancement check logic:', error);
    return { advanced: false, error: 'Error during log analysis' };
  }

  if (criteriaMet) {
    console.log(`[Roadmap] User ${userId} meets criteria to advance to Phase ${nextPhaseDetails.name}!`);

    // Create updated phases array
    const updatedPhases = phases.map(p => {
      if (p.number === currentPhaseNumber) {
        return { ...p, status: 'completed' };
      }
      if (p.number === nextPhaseDetails.number) {
        return { ...p, status: 'active' };
      }
      return p;
    });

    const updates = {
      current_phase: nextPhaseDetails.number,
      phases: updatedPhases,
      updated_at: new Date().toISOString(), // Track when the phase update happened
    };

    try {
      const { data: updatedRoadmap, error } = await supabase
        .from('roadmaps')
        .update(updates)
        .eq('id', currentRoadmap.id)
        .eq('user_id', userId) // Ensure we only update the correct user's roadmap
        .select()
        .single();

      if (error) {
        console.error('[Roadmap] Error updating roadmap for phase advancement:', error);
        throw error;
      }
      
      console.log('[Roadmap] Successfully advanced user to new phase. New roadmap:', updatedRoadmap);
      // Store in local storage
      await AsyncStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(updatedRoadmap));
      return { advanced: true, newPhase: nextPhaseDetails, updatedRoadmap };

    } catch (error) {
      console.error('[Roadmap] Exception during phase advancement update:', error);
      return null; // Or { advanced: false, error: 'Update failed' }
    }

  } else {
    console.log(`[Roadmap] User ${userId} does not yet meet criteria for Phase ${nextPhaseDetails.name}.`);
    return null; // Or { advanced: false, reason: 'Criteria not met' }
  }
};

export default {
  fetchRoadmap,
  createRoadmap,
  updateRoadmap,
  clearLocalRoadmap,
  checkAndAdvancePhase
}; 