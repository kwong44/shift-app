import { supabase } from '../config/supabase'; // Your Supabase client initialization
import { getWeeklyGoals } from './exercises/goals'; // Import the goals API

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
    maxTokensPerResponse: 150,
    minTimeBetweenRequests: 60000, // 1 minute in milliseconds
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
 * @returns {Promise<object>} The AI's analysis
 */
export const analyzeText = async (text, context = {}) => {
  console.debug('[aiCoachAPI] Analyzing text with AI coach', { textLength: text?.length, context });

  try {
    if (!canMakeRequest()) {
      throw new Error('Please wait a moment before making another request');
    }

    if (!text?.trim()) {
      throw new Error('Text for analysis is required');
    }

    const { data, error } = await supabase.functions.invoke('analyze-text', {
      body: { 
        text,
        context,
        maxTokens: AI_COACH_CONFIG.limits.maxTokensPerResponse
      },
    });

    if (error) throw error;

    updateLastCallTime();
    return data;
  } catch (error) {
    console.error('[aiCoachAPI] Error analyzing text:', error);
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

    // Fetch the user's weekly goals to provide context
    console.debug('[aiCoachAPI] Fetching user goals for context');
    let userGoals = [];
    try {
      userGoals = await getWeeklyGoals(user.id) || [];
      console.debug(`[aiCoachAPI] Found ${userGoals?.length || 0} goals`);
    } catch (error) {
      console.error('[aiCoachAPI] Error fetching goals:', error);
      // Continue without goals rather than failing the whole request
    }

    // Debug log the payload being sent to the Edge Function
    console.debug('[aiCoachAPI] Sending payload to Edge Function:', {
      messageLength: message?.length,
      userId: user.id,
      contextSize: Object.keys(context).length,
      goalsCount: userGoals?.length || 0,
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
          userGoals,
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
*/ 