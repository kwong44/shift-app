import { supabase } from '../config/supabase'; // Your Supabase client initialization
import { fetchAllUserWeeklyGoals } from './exercises/goals'; // UPDATED: Import to get all weekly goals
import { fetchRoadmap } from './roadmap'; // NEW: Import to get user's roadmap for LTAs
import { getUserTokens, updateUserTokens, TOKENS_CONFIG } from './credits'; // Import tokens API
import conversationHistory, { getContextMessages } from './conversationHistory'; // Import conversation history API

// Debug logging
console.debug('[aiCoach] Initializing AI Coach API layer');

/**
 * AI Coach API Configuration
 * These settings determine how the AI Coach behaves and interacts
 */
export const AI_COACH_CONFIG = {
  // Feature flags for AI capabilities
  features: {
    journalAnalysis: true,
    goalRefinement: true,
    personalizedNudges: false, // Will be enabled in Stage 3
    deepReflection: false,     // Will be enabled in Stage 4
  },
  
  // Interaction limits to manage costs
  limits: {
    maxDailyInteractions: 10,
    maxTokensPerResponse: 75, // Reduced from 150 for more concise insights
    minTimeBetweenRequests: 1000, // 1 second in milliseconds (reduced from 60 seconds)
  },
  
  // Token system configuration
  tokens: {
    minTokensRequired: TOKENS_CONFIG.minTokensRequired,
    lowBalanceWarningThreshold: TOKENS_CONFIG.lowBalanceThreshold
  }
};

/**
 * Tracks the last API call time to implement rate limiting
 */
let lastApiCallTime = 0;

/**
 * Validates if an AI request can be made based on rate limiting
 * @returns {boolean} Whether the request can proceed
 */
const canMakeRequest = () => {
  const now = Date.now();
  if (now - lastApiCallTime < AI_COACH_CONFIG.limits.minTimeBetweenRequests) {
    console.debug('[aiCoach] Rate limit reached, please wait before making another request');
    return false;
  }
  return true;
};

/**
 * Updates the last API call timestamp
 */
const updateLastCallTime = () => {
  lastApiCallTime = Date.now();
};

/**
 * Calls a Supabase Edge Function to test the AI connection.
 * @param {string} inputText The text to send to the AI.
 * @returns {Promise<object>} The response from the Edge Function.
 */
export const testAiConnection = async (inputText) => {
  // Debug log: Indicate the start of the API call
  console.debug('[aiCoachAPI] Attempting to invoke Supabase Edge Function: test-ai-connection', {
    functionName: 'test-ai-connection',
    params: { inputText },
  });

  try {
    if (!canMakeRequest()) {
      throw new Error('Please wait a moment before making another request');
    }

    // Ensure inputText is provided
    if (!inputText?.trim()) {
      throw new Error('Input text is required');
    }

    const { data, error } = await supabase.functions.invoke('test-ai-connection', {
      body: { message: inputText },
    });

    if (error) throw error;

    // Debug log: Successful response
    console.debug('[aiCoachAPI] Successfully received response from test-ai-connection:', data);
    
    updateLastCallTime();
    return data;
  } catch (error) {
    // Debug log: Error in API call
    console.error('[aiCoachAPI] Error in test-ai-connection:', error);
    throw error;
  }
};

/**
 * Analyzes text using the AI coach
 * @param {string} text - The text to analyze
 * @param {object} context - Additional context for the analysis
 * @param {boolean} enablePatternAnalysis - Whether to enable pattern analysis for journaling (default: false)
 * @returns {Promise<object>} The AI's analysis
 */
export const analyzeText = async (text, context = {}, enablePatternAnalysis = false) => {
  console.debug('[aiCoachAPI] Analyzing text with AI coach', { 
    textLength: text?.length, 
    context, 
    enablePatternAnalysis 
  });

  try {
    if (!canMakeRequest()) {
      throw new Error('Please wait a moment before making another request');
    }

    if (!text?.trim()) {
      throw new Error('Text for analysis is required');
    }
    
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    console.debug('[aiCoachAPI] Invoking analyze-text function with pattern analysis:', enablePatternAnalysis);

    // Create a timeout promise that rejects after 30 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Edge function timed out after 30 seconds'));
      }, 30000); // 30 second timeout
    });
    
    // Create the actual function call promise
    const functionPromise = supabase.functions.invoke('analyze-text', {
      body: { 
        text,
        context,
        maxTokens: AI_COACH_CONFIG.limits.maxTokensPerResponse,
        userId: user.id, // Add user ID to the request so the edge function can track token usage
        enablePatternAnalysis // Enable pattern analysis for journaling
      },
    });
    
    // Race the function call against the timeout
    console.debug('[aiCoachAPI] Waiting for analyze-text response (30s timeout)');
    const result = await Promise.race([functionPromise, timeoutPromise]);
    
    // Destructure the result from Supabase client
    const { data: functionData, error } = result;

    if (error) throw error;

    // Log pattern analysis results for debugging (if any)
    if (functionData?.patternAnalysis) {
      console.debug('[aiCoachAPI] Pattern analysis results:', functionData.patternAnalysis);
    }

    updateLastCallTime();

    // Return in a consistent wrapper so callers can rely on `response.data`
    return {
      success: true,
      data: functionData,
    };
  } catch (error) {
    console.error('[aiCoachAPI] Error analyzing text:', error.message);
    
    // Handle timeout errors gracefully
    if (error.message.includes('timed out')) {
      console.debug('[aiCoachAPI] Returning fallback response due to Edge Function timeout');
      
      // Create a fallback response that mimics the structure the app expects
      return {
        success: true,
        data: {
          analysis: "The AI service is currently experiencing high demand. Please try again in a moment.",
          patternAnalysis: null,
          metadata: {
            tokensUsed: 0,
            model: 'fallback',
            hasPatternAnalysis: false,
            processingTimeMs: 0
          }
        },
        tokenInfo: {
          used: 0,
          remaining: null, // We'll fetch this later if needed
          credits: null,
          lowBalanceWarning: false
        }
      };
    }
    
    // For other errors, rethrow
    throw error;
  }
};

/**
 * Initiates or continues a conversation with the AI coach
 * @param {string} message - The user's message
 * @param {object} context - Additional context for the conversation
 * @returns {Promise<object>} The AI coach's response
 */
export const chatWithCoach = async (message, context = {}) => {
  console.debug('[aiCoachAPI] Starting coach conversation', { messageLength: message?.length, context });

  try {
    if (!canMakeRequest()) {
      throw new Error('Please wait a moment before making another request');
    }

    if (!message?.trim()) {
      throw new Error('Message is required');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Fetch the user's roadmap to get Long-Term Aspirations (LTAs)
    console.debug('[aiCoachAPI] Fetching user roadmap for LTAs');
    let longTermAspirations = [];
    try {
      const roadmap = await fetchRoadmap(user.id);
      if (roadmap && roadmap.goals && Array.isArray(roadmap.goals)) {
        longTermAspirations = roadmap.goals.map(lta => ({
          text: `Long-Term Aspiration: ${lta.text}`, // Prefix to distinguish from WGs
          completed: lta.status === 'completed', // Assuming 'completed' status exists or can be inferred
          type: 'LTA' // Add a type for clarity
        }));
      }
      console.debug(`[aiCoachAPI] Found ${longTermAspirations.length} LTAs`);
    } catch (error) {
      console.error('[aiCoachAPI] Error fetching roadmap for LTAs:', error);
      // Continue without LTAs rather than failing the whole request
    }

    // Fetch all user's weekly goals to provide context
    console.debug('[aiCoachAPI] Fetching all user weekly goals for context');
    let weeklyGoals = [];
    try {
      // Use fetchAllUserWeeklyGoals instead of getWeeklyGoals
      const allWGs = await fetchAllUserWeeklyGoals(user.id) || [];
      weeklyGoals = allWGs.map(wg => ({
        text: `Weekly Goal: ${wg.text}`, // Prefix to distinguish from LTAs
        completed: wg.completed,
        type: 'WG' // Add a type for clarity
      }));
      console.debug(`[aiCoachAPI] Found ${weeklyGoals.length} weekly goals`);
    } catch (error) {
      console.error('[aiCoachAPI] Error fetching weekly goals:', error);
      // Continue without goals rather than failing the whole request
    }
    
    // Combine LTAs and WGs for the AI context
    const combinedUserGoals = [...longTermAspirations, ...weeklyGoals];
    console.debug(`[aiCoachAPI] Total combined goals for AI context: ${combinedUserGoals.length}`);

    // Get conversation history for the AI context
    console.debug('[aiCoachAPI] Fetching conversation history for context');
    let pastMessages = [];
    try {
      pastMessages = await getContextMessages();
      console.debug(`[aiCoachAPI] Found ${pastMessages.length} past messages for context`);
    } catch (error) {
      console.error('[aiCoachAPI] Error fetching conversation history:', error);
      // Continue without history rather than failing the whole request
    }

    // Debug log the payload being sent to the Edge Function
    console.debug('[aiCoachAPI] Sending payload to Edge Function:', {
      messageLength: message?.length,
      userId: user.id,
      contextSize: Object.keys(context).length,
      goalsCount: combinedUserGoals.length,
      pastMessagesCount: pastMessages.length
    });

    // Call the Edge Function with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      // Use the real coach-conversation function
      const { data, error } = await supabase.functions.invoke('coach-conversation', {
        body: { 
          message,
          userId: user.id,
          context,
          userGoals: combinedUserGoals,
          pastMessages
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (error) {
        console.error('[aiCoachAPI] Edge function error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No response data received from coach');
      }
      
      console.debug('[aiCoachAPI] Coach response received:', {
        responseLength: data.data?.response?.length,
        metadata: data.data?.metadata
      });

      updateLastCallTime();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. The coach is taking too long to respond.');
      }
      throw error;
    }
  } catch (error) {
    console.error('[aiCoachAPI] Error in coach conversation:', error);
    throw error;
  }
};

// Export configuration for use in other parts of the app
export default {
  config: AI_COACH_CONFIG,
  testConnection: testAiConnection,
  analyzeText: analyzeText,
  chatWithCoach: chatWithCoach,
};

/*
Debug Comments:
- This module centralizes calls to AI-related Supabase Edge Functions.
- `testAiConnection` is the first function, calling the 'test-ai-connection' Edge Function.
- It uses `supabase.functions.invoke` for communication.
- Includes detailed console logs for request initiation, parameters, success, and errors.
- Enhanced error handling: checks for invalid input before calling the function and provides structured error responses.
- Ensures the payload structure matches the Edge Function's expectations.
- Removed token system functions as credit system is deprecated.
*/ 