// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// OpenAI (Future Use)
// import { OpenAI } from 'https://esm.sh/openai@4.20.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
// Import Google Generative AI SDK
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from 'https://esm.sh/@google/generative-ai';
// Winston-style logger (Edge-safe)
import logger from '../_shared/logger.ts';
import { AVAILABLE_EXERCISES } from '../_shared/exercises.ts';

logger.info('Initializing analyze-text function with Gemini');

// Get environment variables
// const openaiApiKey = Deno.env.get('OPENAI_API_KEY'); // OpenAI (Future Use)
const geminiApiKey = Deno.env.get('GEMINI_API_KEY'); // For Google Gemini
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// ---------------------------------------------------------------------------
// Supabase Admin Client (Service Role)
// ---------------------------------------------------------------------------
const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : null;

if (supabaseAdmin) {
  logger.info('Supabase admin client initialized');
} else {
  logger.error('Supabase environment variables missing; Supabase client NOT initialized');
}

// Initialize OpenAI client (Future Use)
// const openai = new OpenAI({ // OpenAI (Future Use)
//   apiKey: openaiApiKey, // OpenAI (Future Use)
// }); // OpenAI (Future Use)

// Initialize Google Generative AI client
let genAI;
let geminiModel;
if (geminiApiKey) {
  genAI = new GoogleGenerativeAI(geminiApiKey);
  geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); 
  logger.info('Google Generative AI client initialized with gemini-2.0-flash');
} else {
  logger.error('Gemini API Key not found, Google AI client not initialized.');
}

/**
 * Sanitize user-provided text for safe prompt embedding.
 * - Escapes double quotes to avoid breaking template strings.
 * - Truncates to a configurable maximum to stay within token limits.
 * @param str Raw user text
 * @param maxChars Maximum characters to retain (default 1500)
 */
function sanitizeForPrompt(str: string, maxChars: number = 1500): string {
  if (!str) return '';
  let sanitized = str.replace(/"/g, '\\"');
  if (sanitized.length > maxChars) {
    logger.warn('Input truncated for prompt length safety', { original: sanitized.length, maxChars });
    sanitized = sanitized.slice(0, maxChars) + '...';
  }
  return sanitized;
}

/**
 * Update a user's token balance
 * @param userId - The user ID to update
 * @param amount - The amount to adjust (negative to deduct)
 * @returns The new token balance or error
 */
async function updateUserTokens(userId: string, amount: number) {
  logger.debug(`Updating tokens for user ${userId} by ${amount}`);
  
  // Ensure we don't try to add tokens with this function, only deduct.
  if (amount > 0) {
    logger.warn(`updateUserTokens called with a positive amount (${amount}). The 'add_user_tokens' RPC is designed for both, but this function wrapper is intended for deductions. Proceeding, but this may be unintentional.`);
  }

  // If amount is 0, no need to call the database.
  if (amount === 0) {
    logger.debug(`Token update amount is 0 for user ${userId}. Skipping database call.`);
    // We need to fetch the current balance to return it accurately.
    const { data, error } = await supabaseAdmin.rpc('get_user_tokens', { p_user_id: userId });
    if (error) {
      logger.error('Error fetching current token balance when amount is 0:', error);
      return { success: false, error: 'Failed to fetch token balance', tokens: 0 };
    }
    return { success: true, tokens: data };
  }

  try {
    // Use the server-side function to update tokens safely
    const { data, error } = await supabaseAdmin.rpc(
      'add_user_tokens',
      { p_user_id: userId, p_amount: amount }
    );
    
    if (error) {
      logger.error('Error updating user tokens:', error);
      return { 
        success: false, 
        error: 'Failed to update token balance',
        tokens: 0
      };
    }
    
    logger.info(`Updated token balance for user ${userId} to ${data}`);
    return { 
      success: true, 
      tokens: data
    };
  } catch (error) {
    logger.error('Error in updateUserTokens:', error);
    return { 
      success: false, 
      error: String(error),
      tokens: 0
    };
  }
}

/**
 * Counts the tokens for a given text using the Gemini model.
 * @param {string} text The text to count tokens for.
 * @returns {Promise<number>} The number of tokens.
 */
async function countTokens(text: string): Promise<number> {
  if (!geminiModel || !text) {
    return 0;
  }
  try {
    const { totalTokens } = await geminiModel.countTokens(text);
    return totalTokens;
  } catch (error) {
    logger.warn(`[TokenCounting] Could not count tokens: ${error.message}`);
    // A rough estimate: 1 token per 4 characters as a fallback.
    return Math.ceil(text.length / 4);
  }
}

/**
 * Get user's recent journal entries for pattern analysis
 */
async function getRecentJournalEntries(userId: string, days: number = 7) {
  logger.debug(`[PatternAnalysis] Getting recent journal entries for user ${userId} (last ${days} days)`);
  
  try {
    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .select('content, insights, created_at, ai_metadata')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      logger.error('Error fetching recent journal entries:', error);
      return [];
    }

    logger.debug(`[PatternAnalysis] Found ${data?.length || 0} recent journal entries`);
    return data || [];
  } catch (error) {
    logger.error('Error in getRecentJournalEntries:', error);
    return [];
  }
}

/**
 * Get user's recent exercise completions for personalization
 */
async function getRecentExerciseHistory(userId: string, days: number = 7) {
  logger.debug(`[PatternAnalysis] Getting recent exercise history for user ${userId} (last ${days} days)`);
  
  try {
    const { data, error } = await supabaseAdmin
      .from('daily_exercise_logs')
      .select('exercise_id, exercise_type, completed_at, source, metadata')
      .eq('user_id', userId)
      .gte('completed_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('completed_at', { ascending: false })
      .limit(20);

    if (error) {
      logger.error('Error fetching recent exercise history:', error);
      return [];
    }

    logger.debug(`[PatternAnalysis] Found ${data?.length || 0} recent exercise completions`);
    return data || [];
  } catch (error) {
    logger.error('Error in getRecentExerciseHistory:', error);
    return [];
  }
}

/**
 * Compute explicit metrics to ground the pattern analysis.
 */
function computePatternMetrics(entries: any[], history: any[]): Record<string, any> {
  const metrics: Record<string, any> = {};

  // Emotion keywords (simple heuristic)
  const emotionKeywords = ['stress', 'stressed', 'anxious', 'anxiety', 'happy', 'sad', 'motivated', 'tired'];
  const keywordCounts: Record<string, number> = {};
  entries.forEach((e) => {
    emotionKeywords.forEach((kw) => {
      const count = (e.content.match(new RegExp(`\\b${kw}\\b`, 'gi')) || []).length;
      keywordCounts[kw] = (keywordCounts[kw] || 0) + count;
    });
  });
  metrics.emotion_keyword_counts = keywordCounts;

  // Time-of-day distribution
  const timeBuckets = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  entries.forEach((e) => {
    const h = e.time_of_day;
    if (h < 12) timeBuckets.morning += 1;
    else if (h < 17) timeBuckets.afternoon += 1;
    else if (h < 21) timeBuckets.evening += 1;
    else timeBuckets.night += 1;
  });
  metrics.time_of_day_distribution = timeBuckets;

  // Exercise type frequency
  const exerciseTypeFreq: Record<string, number> = {};
  history.forEach((h) => {
    exerciseTypeFreq[h.exercise_type] = (exerciseTypeFreq[h.exercise_type] || 0) + 1;
  });
  metrics.exercise_type_counts = exerciseTypeFreq;

  metrics.total_entries = entries.length;
  metrics.total_exercises = history.length;

  return metrics;
}

/**
 * Analyze patterns and generate exercise recommendations
 */
async function analyzeJournalingPatterns(userId: string, currentEntry: string, context: any) {
  logger.debug(`[PatternAnalysis] Starting pattern analysis for user ${userId} (USING GEMINI)`);
  
  if (!geminiModel) {
    logger.error('[PatternAnalysis] Gemini model not initialized. Skipping pattern analysis.');
    return null;
  }

  // OPTIMIZATION: Run database queries in parallel
  const [recentEntries, exerciseHistory] = await Promise.all([
    getRecentJournalEntries(userId, 7),
    getRecentExerciseHistory(userId, 7)
  ]);
  
  if (recentEntries.length < 2) {
    logger.debug(`[PatternAnalysis] Insufficient data for pattern analysis (${recentEntries.length} entries)`);
    return null;
  }

  const entryAnalysis = recentEntries.map(entry => ({
    content: entry.content.toLowerCase(),
    insights: entry.insights || '',
    created_at: entry.created_at,
    time_of_day: new Date(entry.created_at).getHours(),
    emotions: context?.emotions || []
  }));

  const exerciseSequences = exerciseHistory.reduce((acc, exercise, index) => {
    if (index > 0) {
      const prevExercise = exerciseHistory[index - 1];
      const timeDiff = new Date(prevExercise.completed_at).getTime() - new Date(exercise.completed_at).getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff <= 24) {
        acc.push({
          first: exercise.exercise_type,
          second: prevExercise.exercise_type,
          first_id: exercise.exercise_id,
          second_id: prevExercise.exercise_id,
          hours_between: hoursDiff
        });
      }
    }
    return acc;
  }, []);

  // Compute metrics
  const patternMetrics = computePatternMetrics(entryAnalysis, exerciseHistory);

  // System prompt for the Gemini model
  const systemInstructionForPatterns = 'You are an expert pattern analyst for personalized exercise recommendations. Respond only with valid JSON.';

  // Construct enhanced prompt for pattern analysis
  const sanitizedCurrentEntry = sanitizeForPrompt(currentEntry, 1200);
  const patternPrompt = await buildPatternPrompt(entryAnalysis, exerciseHistory, exerciseSequences, sanitizedCurrentEntry, patternMetrics);

  try {
    logger.debug('[PatternAnalysis] Making Gemini API call for pattern analysis');
    
    // Estimate prompt tokens (Gemini doesn't return used tokens directly in generateContent response for output)
    let inputTokens = 0;
    try {
      const countResult = await geminiModel.countTokens(patternPrompt);
      inputTokens = countResult.totalTokens;
      logger.debug(`[PatternAnalysis] Estimated prompt tokens for Gemini: ${inputTokens}`);
    } catch (countError) {
      logger.warn('[PatternAnalysis] Could not count prompt tokens for Gemini:', countError.message);
    }

    const generationConfig = {
      temperature: 0.3, // Lower temperature for more consistent pattern detection
      maxOutputTokens: 500, // Reasonable cap for JSON payload size
    };
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];
    
    /*
     * Strict JSON generation with retry
     * ---------------------------------------------------
     * We ask Gemini for JSON (responseMimeType) and attempt
     * to parse the result. On first failure, we retry once.
     */
    const MAX_JSON_ATTEMPTS = 2;
    let patterns: any = null;
    let outputTokensTotal = 0;
    for (let attempt = 0; attempt < MAX_JSON_ATTEMPTS; attempt++) {
      if (attempt > 0) {
        logger.warn(`[PatternAnalysis] Attempt #${attempt + 1} to retrieve valid JSON from Gemini`);
      }

      const result = await geminiModel.generateContent({
        contents: [
          { role: "system", parts: [{ text: systemInstructionForPatterns }] },
          { role: "user", parts: [{ text: patternPrompt }] }
        ],
        generationConfig,
        safetySettings,
        responseMimeType: "application/json", // <— enforce JSON response
      });

      const response = result.response;
      const analysisText = response.text();
      logger.debug('[PatternAnalysis] Raw pattern analysis response (Gemini):', analysisText);

      // Count tokens for this attempt
      const outputTokens = await countTokens(analysisText);
      outputTokensTotal += outputTokens;

      try {
        patterns = JSON.parse(analysisText);
        // ✅ Successfully parsed JSON; break loop
        break;
      } catch (parseError) {
        logger.error('[PatternAnalysis] JSON parse failed', { attempt: attempt + 1, error: parseError.message });
        patterns = null;
      }
    }

    // Final token accounting
    inputTokens = await countTokens(patternPrompt);
    const totalTokens = inputTokens + outputTokensTotal;
    logger.debug(`[PatternAnalysis] Gemini tokens used: ${totalTokens} (Prompt: ${inputTokens}, Output: ${outputTokensTotal})`);

    // Validate pattern JSON before returning
    const validatedPatterns = validatePatternOutput(patterns);
    return {
      patterns: validatedPatterns,
      tokens_used: totalTokens
    };
  } catch (error) {
    logger.error('[PatternAnalysis] Error in pattern analysis (Gemini):', error);
    const inputTokensFallback = await countTokens(patternPrompt); // Count prompt tokens on failure
    if (error.message.includes('SAFETY')) {
        logger.warn('[PatternAnalysis] Gemini content blocked due to safety settings.');
        return {
            patterns: { pattern_detected: false, reason: "Content generation blocked by safety filters.", safety_blocked: true },
            tokens_used: inputTokensFallback
        };
    }
    return {
        patterns: null,
        tokens_used: inputTokensFallback
    };
  }
}

// ---------------------------------------------------------------------------
// Helper: Validate pattern analysis JSON output
// ---------------------------------------------------------------------------
const AVAILABLE_EXERCISE_IDS = new Set(AVAILABLE_EXERCISES.map((ex) => ex.id));

/**
 * Validate the JSON returned by Gemini for pattern analysis.
 * Ensures mandatory keys are present and exercise_id is valid.
 * If validation fails it downgrades to pattern_detected=false with a reason.
 */
function validatePatternOutput(raw: any): any {
  // If parsing failed upstream, we just propagate null
  if (!raw || typeof raw !== 'object') {
    return {
      pattern_detected: false,
      reason: 'Invalid or empty response from model',
    };
  }

  // If model says no pattern, accept it
  if (raw.pattern_detected === false) {
    return raw;
  }

  // Verify structure
  const rec = raw.recommendation || {};
  const requiredKeys = ['exercise_type', 'exercise_id', 'reasoning', 'trigger', 'personalization'];
  const hasAllKeys = requiredKeys.every((k) => k in rec);

  if (!hasAllKeys) {
    return {
      pattern_detected: false,
      reason: 'Missing required keys in recommendation',
    };
  }

  // Verify exercise ID exists
  if (!AVAILABLE_EXERCISE_IDS.has(rec.exercise_id)) {
    return {
      pattern_detected: false,
      reason: `Unknown exercise_id: ${rec.exercise_id}`,
    };
  }

  // Passed all checks
  return raw;
}

// ---------------------------------------------------------------------------
// Helper: Build pattern analysis prompt with adaptive truncation
// ---------------------------------------------------------------------------
const SAFE_PROMPT_TOKEN_LIMIT = 6000; // Soft limit for Gemini context (adjust as needed)

/**
 * Build the pattern analysis prompt. If the initial prompt exceeds SAFE_PROMPT_TOKEN_LIMIT
 * we progressively truncate less-important sections until it fits.
 */
async function buildPatternPrompt(entryAnalysis: any[], exerciseHistory: any[], exerciseSequences: any[], currentEntrySanitized: string, patternMetrics: Record<string, any>): Promise<string> {
  // Helper to format blocks
  const formatPrompt = (entries: any[], history: any[], sequences: any[], useCompactExerciseList: boolean, metrics: Record<string, any>) => `
CONTEXT: Analyze journal patterns for exercise recommendations.

CURRENT ENTRY: "${currentEntrySanitized}"

METRICS: ${JSON.stringify(metrics, null, 2)}

RECENT ENTRIES (last 7 days):
${entries.map((entry: any, i: number) => `- Entry ${i + 1}: ${entry.content.slice(0, 80)}...`).join('\n')}

EXERCISE HISTORY (last 7 days):
${history.map((ex: any) => `- ${ex.exercise_type}`).join('\n')}

AVAILABLE EXERCISES (Recommend ONLY from this list):
${AVAILABLE_EXERCISES.map(ex => `- ${ex.id} | ${ex.title}`).join('\n')}

INSTRUCTIONS:
1. Find recurring emotions in entries.
2. Identify which exercises follow certain emotional states.
3. Only recommend if a clear pattern exists.
4. Personalize based on their successful patterns.
5. You MUST use an exercise_id from the list.

OUTPUT FORMAT (JSON only):
{
  "pattern_detected": boolean,
  "pattern_description": "Brief description of the pattern",
  "recommendation": {
    "exercise_type": "string",
    "exercise_id": "string",
    "reasoning": "Why this exercise based on patterns",
    "trigger": "When to use this recommendation",
    "personalization": "How this relates to their past success"
  }
}
If no pattern: { "pattern_detected": false, "reason": "Why" }
`;

  // Initial prompt with full details
  let prompt = formatPrompt(entryAnalysis, exerciseHistory, exerciseSequences, false, patternMetrics);
  let tokens = await countTokens(prompt);

  // If too large, start truncation steps
  if (tokens > SAFE_PROMPT_TOKEN_LIMIT) {
    // Step 1: shorten lists
    const trimmedEntries = entryAnalysis.slice(0, 5); // most recent 5
    const trimmedHistory = exerciseHistory.slice(0, 8);
    const trimmedSequences = exerciseSequences.slice(0, 5);
    prompt = formatPrompt(trimmedEntries, trimmedHistory, trimmedSequences, false, patternMetrics);
    tokens = await countTokens(prompt);
  }

  if (tokens > SAFE_PROMPT_TOKEN_LIMIT) {
    // Step 2: use compact exercise list
    const trimmedEntries = entryAnalysis.slice(0, 5);
    const trimmedHistory = exerciseHistory.slice(0, 8);
    const trimmedSequences = exerciseSequences.slice(0, 5);
    prompt = formatPrompt(trimmedEntries, trimmedHistory, trimmedSequences, true, patternMetrics);
    tokens = await countTokens(prompt);
  }

  if (tokens > SAFE_PROMPT_TOKEN_LIMIT) {
    // Step 3: extreme trim - only current entry + compact exercise list
    prompt = formatPrompt(entryAnalysis.slice(0, 1), [], [], true, patternMetrics);
    // No further counting needed; we assume this will fit but can still count for logging
    tokens = await countTokens(prompt);
  }

  logger.debug(`[PatternAnalysis] Final prompt tokens: ${tokens}`);
  return prompt;
}

// ---------------------------------------------------------------------------
// App Transformation Pillars
// ---------------------------------------------------------------------------
const TRANSFORMATION_PILLARS = ['Mindfulness', 'Visualization', 'Deep Work', 'Task Planning', 'Binaural Beats', 'Journaling'];

// Helper: Build insight prompt for a single journal entry or generic text analysis
// ---------------------------------------------------------------------------
/**
 * Build a concise yet information-rich prompt for Gemini to generate insightful
 * feedback on a user provided journal entry (or arbitrary text). We embed
 * lightweight context such as the prompt type and selected emotions so the
 * model can tailor its answer, while keeping the payload compact to control
 * token usage.
 *
 * We purposefully keep this function synchronous, but mark it `async` so that
 * existing `await buildInsightPrompt(...)` calls remain valid and do not need
 * to be refactored.
 *
 * @param entryText   The sanitized user text.
 * @param context     Object that may include { type, promptType, emotions }
 * @returns           A complete prompt string ready for the Gemini model.
 */
export async function buildInsightPrompt(entryText: string, context: any = {}): Promise<string> {
  const promptType = context?.promptType || 'general';
  const selectedEmotions = Array.isArray(context?.emotions) && context.emotions.length > 0
    ? context.emotions.join(', ')
    : 'None provided';

  /*
   * The TRANSFORMATION_PILLARS constant is defined higher in this file. We
   * reference it here to nudge the model to ground its suggestions within the
   * core areas of the app – ensuring downstream UI can categorise responses
   * without additional parsing.
   */
  const pillarsList = TRANSFORMATION_PILLARS.map((p) => `- ${p}`).join('\n');

  return `You are a world-class mindset and habits coach. Analyse the following user journal entry and return calming, actionable insights that are short, compassionate and immediately useful.\n\n` +
    `ENTRY TYPE: ${context?.type || 'text'}\n` +
    `PROMPT CATEGORY: ${promptType}\n` +
    `EMOTIONS TAGGED: ${selectedEmotions}\n\n` +
    `USER JOURNAL ENTRY (verbatim):\n"""\n${entryText}\n"""\n\n` +
    `When crafting your answer:\n` +
    `1. Start with a **one-sentence summary** capturing the emotional tone.\n` +
    `2. Provide **two to three bullet-point insights** highlighting patterns or reframes.\n` +
    `3. End with **one concrete suggestion** that maps to ONE of the following transformation pillars (exact name):\n${pillarsList}\n` +
    `Keep the entire response under 120 words. Avoid mentioning that you are an AI model.`;
}

serve(
  async (req) => {
    // -----------------------------------------------------------------------
    // CORS & OPTIONS check
    // -----------------------------------------------------------------------
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // -----------------------------------------------------------------------
    // Main request handling
    // -----------------------------------------------------------------------
    try {
      const { text, context, enablePatternAnalysis } = await req.json();
      const sanitizedText = sanitizeForPrompt(text);

      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        throw new Error('Missing Authorization header');
      }
      const jwt = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(jwt);
      if (!user) {
        throw new Error('Invalid JWT');
      }
      
      const user_id = user.id;
      logger.info(`Request for user: ${user_id}`, { context: context?.type });

      // Fallback response for any errors
      const fallbackResponse = {
        analysis: 'The AI model is temporarily unavailable. Please try again later.',
        patternAnalysis: null,
        tokensUsed: 0,
      };

      // Generate AI insights
      const prompt = await buildInsightPrompt(sanitizedText, context);
      const tokenCount = await countTokens(prompt);
      logger.debug(`[Insights] Built prompt, token count: ${tokenCount}`);
      
      const generationConfig = {
        temperature: 0.6,
        topK: 30,
        topP: 0.7,
        maxOutputTokens: 512,
      };

      const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ];

      const generationPromise = geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
        safetySettings,
      });
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI model request timed out')), 20000)
      );

      let analysis = fallbackResponse.analysis;
      try {
        const generationResult = await Promise.race([generationPromise, timeoutPromise]);
        if (generationResult && generationResult.response) {
          const candidate = generationResult.response.candidates?.[0];
          if (candidate?.content?.parts?.[0]?.text) {
            analysis = candidate.content.parts[0].text.trim();
            logger.info(`[Insights] Successfully received analysis from Gemini.`);
          } else {
            logger.warn(`[Insights] Gemini response OK, but no content found.`, { candidate });
          }
        } else {
          logger.error('[Insights] Invalid response from Gemini model.', { generationResult });
        }
      } catch (genError) {
        logger.error('[Insights] Generation failed:', genError);
      }

      // (Optional) Pattern analysis
      let patternAnalysisResult = null;
      if (enablePatternAnalysis) {
        try {
          patternAnalysisResult = await analyzeJournalingPatterns(user_id, sanitizedText, context);
          logger.info(`[PatternAnalysis] Pattern analysis complete.`);
        } catch (patternError) {
          logger.error(`[PatternAnalysis] Failed:`, patternError);
        }
      }

      // Send response
      const responsePayload = { analysis, patternAnalysis: patternAnalysisResult, tokensUsed: tokenCount };
      logger.info(`[Success] Returning response.`);
      return new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      logger.error('Unexpected error in analyze-text:', { msg: error.message, stack: error.stack });
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
); 