// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from 'https://esm.sh/@google/generative-ai';

console.log('[DailyFocusAI] Initializing AI-powered daily focus recommendation function');

// Environment variables
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Verify environment variables
if (!geminiApiKey) {
  console.error('[DailyFocusAI] Missing GEMINI_API_KEY environment variable');
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[DailyFocusAI] Missing Supabase environment variables');
}

// Initialize clients
let geminiModel: any = null;
if (geminiApiKey) {
  const genAI = new GoogleGenerativeAI(geminiApiKey);
  geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  console.log('[DailyFocusAI] Google Generative AI client initialized with gemini-2.0-flash');
} else {
  console.error('[DailyFocusAI] Gemini client not initialized due to missing API key');
}

const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || ''
);

// Master Exercise List - This should match the client-side list
const AVAILABLE_EXERCISES = [
  {
    id: 'mindfulness_breath_5min',
    title: 'Breath Focus',
    type: 'Mindfulness',
    description: 'Anchor your attention on breathing',
    icon: 'weather-windy',
    route: 'MindfulnessSetup',
    tags: ['stress_reduction', 'focus', 'calm', 'short_session', 'beginner'],
    defaultDurationText: '5 min',
    benefit: 'Reduce stress and improve focus'
  },
  {
    id: 'mindfulness_body_scan_8min',
    title: 'Body Scan',
    type: 'Mindfulness',
    description: 'Release tension through awareness',
    icon: 'human',
    route: 'MindfulnessSetup',
    tags: ['relaxation', 'body_awareness', 'tension_release'],
    defaultDurationText: '8 min',
    benefit: 'Release physical and mental tension'
  },
  {
    id: 'visualization_goals_5min',
    title: 'Goal Achievement Visualization',
    type: 'Visualization',
    description: 'Visualize successfully achieving your goals',
    icon: 'target',
    route: 'VisualizationSetup',
    tags: ['goal_setting', 'motivation', 'success_mindset'],
    defaultDurationText: '5 min',
    benefit: 'Boost motivation and goal clarity'
  },
  {
    id: 'tasks_planner',
    title: 'Task Planning',
    type: 'Task Planning',
    description: 'Organize & Focus on your priorities',
    icon: 'checkbox-marked-outline',
    route: 'TaskPlanner',
    tags: ['organization', 'productivity', 'planning', 'focus'],
    defaultDurationText: 'Flexible',
    benefit: 'Get organized and focused'
  },
  {
    id: 'deepwork_pomodoro_25min',
    title: 'Pomodoro Session',
    type: 'Deep Work',
    description: 'Classic 25-minute focus interval',
    icon: 'timer-outline',
    route: 'DeepWorkSetup',
    tags: ['focus', 'productivity', 'time_management', 'pomodoro'],
    defaultDurationText: '25 min',
    benefit: 'Improve focus and productivity'
  },
  {
    id: 'binaural_focus_beta_20min',
    title: 'Focus Beats (Beta)',
    type: 'Binaural Beats',
    description: 'Enhance concentration and mental clarity',
    icon: 'brain',
    route: 'BinauralSetup',
    tags: ['focus', 'concentration', 'study', 'work', 'beta_waves'],
    defaultDurationText: '20 min',
    benefit: 'Enhance mental clarity and focus'
  }
  // Add more exercises as needed
];

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
    console.warn(`[TokenCounting] Could not count tokens: ${error.message}`);
    // A rough estimate: 1 token per 4 characters as a fallback.
    return Math.ceil(text.length / 4);
  }
}

/**
 * Update a user's token balance
 * @param userId - The user ID to update
 * @param amount - The amount to adjust (negative to deduct)
 * @returns The new token balance or error
 */
async function updateUserTokens(userId: string, amount: number) {
    console.log(`[DailyFocusAI] Updating tokens for user ${userId} by ${amount}`);

    if (amount === 0) {
        console.log(`[DailyFocusAI] Token update amount is 0 for user ${userId}. Skipping database call.`);
        const { data, error } = await supabaseAdmin.rpc('get_user_tokens', { p_user_id: userId });
        if (error) {
            console.error('[DailyFocusAI] Error fetching current token balance when amount is 0:', error);
            return { success: false, error: 'Failed to fetch token balance', tokens: 0 };
        }
        return { success: true, tokens: data };
    }

    try {
        const { data, error } = await supabaseAdmin.rpc(
            'add_user_tokens',
            { p_user_id: userId, p_amount: amount }
        );

        if (error) {
            console.error('[DailyFocusAI] Error updating user tokens:', error);
            return {
                success: false,
                error: 'Failed to update token balance',
                tokens: 0
            };
        }

        console.log(`[DailyFocusAI] Updated token balance for user ${userId} to ${data}`);
        return {
            success: true,
            tokens: data
        };
    } catch (error) {
        console.error('[DailyFocusAI] Error in updateUserTokens:', error);
        return {
            success: false,
            error: String(error),
            tokens: 0
        };
    }
}

/**
 * Gather comprehensive user context for AI recommendations
 */
async function gatherUserContext(userId: string) {
  console.log(`[DailyFocusAI] Gathering user context for: ${userId}`);

  try {
    // Parallel data fetching for better performance
    const [
      weeklyGoals,
      longTermGoals,
      recentJournalEntries,
      recentExerciseHistory,
      recentMoodLogs,
      conversationHistory,
      userFavorites
    ] = await Promise.all([
      // Weekly goals
      supabaseAdmin
        .from('weekly_goals')
        .select('text, completed, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5),

      // Long-term goals/roadmap
      supabaseAdmin
        .from('long_term_goals')
        .select('text, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3),

      // Recent journal entries
      supabaseAdmin
        .from('journal_entries')
        .select('content, insights, created_at')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(3),

      // Recent exercise completions
      supabaseAdmin
        .from('daily_exercise_logs')
        .select('exercise_id, exercise_type, completed_at')
        .eq('user_id', userId)
        .gte('completed_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
        .order('completed_at', { ascending: false })
        .limit(10),

      // Recent mood logs
      supabaseAdmin
        .from('mood_logs')
        .select('mood_type, notes, created_at')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5),

      // Recent AI coach conversations for context
      supabaseAdmin
        .from('conversation_history')
        .select('content, is_user, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),

      // User's favorite exercises
      supabaseAdmin
        .from('profile')
        .select('favorite_exercises')
        .eq('user_id', userId)
        .single()
    ]);

    console.log(`[DailyFocusAI] Context gathered - Goals: ${weeklyGoals.data?.length || 0}, Journal: ${recentJournalEntries.data?.length || 0}, Exercises: ${recentExerciseHistory.data?.length || 0}`);

    return {
      weeklyGoals: weeklyGoals.data || [],
      longTermGoals: longTermGoals.data || [],
      recentJournalEntries: recentJournalEntries.data || [],
      recentExerciseHistory: recentExerciseHistory.data || [],
      recentMoodLogs: recentMoodLogs.data || [],
      conversationHistory: conversationHistory.data || [],
      userFavorites: userFavorites.data?.favorite_exercises || []
    };
  } catch (error) {
    console.error('[DailyFocusAI] Error gathering user context:', error);
    return {
      weeklyGoals: [],
      longTermGoals: [],
      recentJournalEntries: [],
      recentExerciseHistory: [],
      recentMoodLogs: [],
      conversationHistory: [],
      userFavorites: []
    };
  }
}

/**
 * Generate AI-powered daily focus recommendations
 */
async function generateAIRecommendations(userContext: any, requestedCount: number = 3) {
  console.log(`[DailyFocusAI] Generating AI recommendations for ${requestedCount} exercises`);

  // Create rich context summary for AI
  const contextSummary = {
    goals: [
      ...userContext.weeklyGoals.map(g => `Weekly: ${g.text} (${g.completed ? 'completed' : 'in progress'})`),
      ...userContext.longTermGoals.map(g => `Long-term: ${g.text} (${g.status})`)
    ],
    recentEmotions: userContext.recentMoodLogs.map(m => `${m.mood_type}: ${m.notes || ''}`),
    recentJournalThemes: userContext.recentJournalEntries.map(j => j.insights || j.content.slice(0, 100)),
    recentExercises: userContext.recentExerciseHistory.map(e => `${e.exercise_type} (${e.exercise_id})`),
    recentConversationTopics: userContext.conversationHistory
      .filter(c => !c.is_user)
      .slice(0, 3)
      .map(c => c.content.slice(0, 100)),
    favoriteExercises: userContext.userFavorites,
    timeOfDay: new Date().getHours()
  };

  const systemPrompt = `You are an expert life coach AI that generates personalized daily exercise recommendations. 

CURRENT USER CONTEXT:
Goals: ${JSON.stringify(contextSummary.goals)}
Recent Emotions: ${JSON.stringify(contextSummary.recentEmotions)}  
Journal Insights: ${JSON.stringify(contextSummary.recentJournalThemes)}
Recent Exercises: ${JSON.stringify(contextSummary.recentExercises)}
Coach Conversation Topics: ${JSON.stringify(contextSummary.recentConversationTopics)}
Favorite Exercises: ${JSON.stringify(contextSummary.favoriteExercises)}
Time of Day: ${contextSummary.timeOfDay}:00

AVAILABLE EXERCISES:
${AVAILABLE_EXERCISES.map(ex => 
  `- ${ex.id}: ${ex.title} (${ex.type}) - ${ex.description} [Tags: ${ex.tags.join(', ')}] [Benefit: ${ex.benefit}]`
).join('\n')}

RECOMMENDATION CRITERIA:
1. PERSONALIZATION: Match exercises to their current emotional state, goals, and recent patterns
2. VARIETY: Don't recommend the same exercises they've done recently unless specifically beneficial
3. PROGRESSION: Consider their journey and what they need for growth
4. TIMING: Factor in time of day for appropriate energy levels
5. FAVORITES: Include favorites but also introduce growth opportunities

OUTPUT FORMAT (JSON only):
{
  "recommendations": [
    {
      "exercise_id": "exact_exercise_id_from_available_list",
      "priority_score": 95,
      "reasoning": "Why this exercise is perfect for them right now",
      "personalization": "How this connects to their specific context",
      "expected_benefit": "What they'll gain from this exercise"
    }
  ],
  "overall_focus_theme": "What their daily focus should be today",
  "coach_note": "Encouraging message about their journey"
}

Generate exactly ${requestedCount} recommendations, ranked by priority score (100 = perfect match).
RESPOND ONLY WITH VALID JSON.`;

  try {
    if (!geminiModel) {
      throw new Error('Gemini model not initialized');
    }

    console.log('[DailyFocusAI] Making Gemini API call for recommendations');

    const generationConfig = {
      temperature: 0.7,
      maxOutputTokens: 800,
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      generationConfig,
      safetySettings,
    });

    const responseText = result.response.text();
    console.log('[DailyFocusAI] Gemini response received, length:', responseText.length);
    
    // Accurately count tokens
    const promptTokens = await countTokens(systemPrompt);
    const responseTokens = await countTokens(responseText);
    const tokensUsed = promptTokens + responseTokens;
    console.log(`[DailyFocusAI] Tokens used: ${tokensUsed} (Prompt: ${promptTokens}, Response: ${responseTokens})`);
    
    try {
      const aiResult = JSON.parse(responseText);
      console.log(`[DailyFocusAI] Successfully parsed AI recommendations: ${aiResult.recommendations?.length || 0} exercises`);
      
      return {
        success: true,
        recommendations: aiResult.recommendations || [],
        metadata: {
          overall_focus_theme: aiResult.overall_focus_theme,
          coach_note: aiResult.coach_note,
          tokensUsed,
          model: 'gemini-2.0-flash',
          contextFactors: Object.keys(contextSummary)
        }
      };
    } catch (parseError) {
      console.error('[DailyFocusAI] Failed to parse AI response:', parseError);
      console.error('[DailyFocusAI] Raw response:', responseText);
      
      // Fallback to user favorites if AI parsing fails
      return {
        success: false,
        error: 'Failed to parse AI recommendations',
        fallback: true,
        recommendations: userContext.userFavorites.slice(0, requestedCount),
        tokensUsed // Pass tokens used even on parse failure
      };
    }
  } catch (error) {
    console.error('[DailyFocusAI] Error calling Gemini:', error);
    
    const promptTokens = await countTokens(systemPrompt); // Still count prompt tokens on failure

    // Fallback to user favorites if Gemini call fails
    return {
      success: false,
      error: 'Gemini service unavailable',
      fallback: true,
      recommendations: userContext.userFavorites.slice(0, requestedCount),
      tokensUsed: promptTokens
    };
  }
}

/**
 * Convert AI recommendations to client-compatible format
 */
function formatRecommendationsForClient(aiRecommendations: any[], userFavorites: string[]) {
  console.log(`[DailyFocusAI] Formatting ${aiRecommendations.length} recommendations for client`);
  
  const formattedExercises = aiRecommendations.map(rec => {
    // Find the full exercise data
    const exercise = AVAILABLE_EXERCISES.find(ex => ex.id === rec.exercise_id);
    
    if (!exercise) {
      console.warn(`[DailyFocusAI] Exercise not found: ${rec.exercise_id}`);
      return null;
    }

    // Add AI-specific metadata
    return {
      ...exercise,
      ai_metadata: {
        priority_score: rec.priority_score,
        reasoning: rec.reasoning,
        personalization: rec.personalization,
        expected_benefit: rec.expected_benefit,
        is_ai_recommended: true
      }
    };
  }).filter(Boolean);

  console.log(`[DailyFocusAI] Successfully formatted ${formattedExercises.length} exercises`);
  return formattedExercises;
}

serve(async (req) => {
  let payload;
  try {
    payload = await req.json();
  } catch (parseErr) {
    console.error('[DailyFocusAI] Failed to parse JSON body:', parseErr);
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { userId, requestedCount = 3 } = payload;

    console.log(`[DailyFocusAI] Processing request for user: ${userId}, count: ${requestedCount}`);

    // Validate request
    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Gather comprehensive user context
    const userContext = await gatherUserContext(userId);

    // 2. Generate AI-powered recommendations
    const aiResult = await generateAIRecommendations(userContext, requestedCount);

    // 3. Deduct tokens used, regardless of success/failure of the AI generation itself.
    const tokensUsed = aiResult.metadata?.tokensUsed || aiResult.tokensUsed || 0;
    const tokenUpdateResult = await updateUserTokens(userId, -tokensUsed);

    if (!tokenUpdateResult.success) {
        console.error('[DailyFocusAI] Failed to update token balance after usage:', tokenUpdateResult.error);
        // This error info will be added to the response.
    }

    // 4. If AI failed, fallback is already prepared by the generation function
    if (!aiResult.success) {
      console.warn('[DailyFocusAI] AI recommendation failed or unavailable, using fallback');
      return new Response(
        JSON.stringify({
          success: true,
          fallback: true,
          recommendations: aiResult.recommendations, // Fallback recommendations
          metadata: {
            fallback_reason: aiResult.error || 'Gemini unavailable',
            model: 'fallback_favorites'
          },
          tokens: {
              used: tokensUsed,
              remaining: tokenUpdateResult.success ? tokenUpdateResult.tokens : null,
              error: tokenUpdateResult.success ? null : tokenUpdateResult.error
          }
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. Format successful recommendations for client
    const formattedRecommendations = formatRecommendationsForClient(
      aiResult.recommendations,
      userContext.userFavorites
    );

    // 6. Return successful response with token info
    return new Response(
      JSON.stringify({
        success: true,
        recommendations: formattedRecommendations,
        metadata: aiResult.metadata,
        tokens: {
            used: tokensUsed,
            remaining: tokenUpdateResult.success ? tokenUpdateResult.tokens : null,
            error: tokenUpdateResult.success ? null : tokenUpdateResult.error
        }
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[DailyFocusAI] Error in daily focus AI function:', error);
    // Always respond with 200 to avoid client-side non-2xx errors; indicate failure in JSON
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Unknown error' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}); 