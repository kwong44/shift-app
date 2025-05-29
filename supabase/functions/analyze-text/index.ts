// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { OpenAI } from 'https://esm.sh/openai@4.20.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

console.log('Initializing analyze-text function');

// Get environment variables
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Verify environment variables
if (!openaiApiKey) {
  console.error('Missing OPENAI_API_KEY environment variable');
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

// Initialize Supabase admin client (with service role for direct DB access)
const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || ''
);

/**
 * Master Exercise List - Available exercises for recommendations
 */
const AVAILABLE_EXERCISES = [
  // Mindfulness Exercises
  {
    id: 'mindfulness_breath_5min',
    title: 'Breath Focus',
    type: 'Mindfulness',
    description: 'Anchor your attention on breathing',
    tags: ['stress_reduction', 'focus', 'calm', 'short_session', 'beginner'],
    defaultDurationText: '5 min'
  },
  {
    id: 'mindfulness_body_scan_8min',
    title: 'Body Scan',
    type: 'Mindfulness',
    description: 'Release tension through awareness',
    tags: ['relaxation', 'body_awareness', 'tension_release'],
    defaultDurationText: '8 min'
  },
  {
    id: 'mindfulness_senses_4min',
    title: 'Five Senses',
    type: 'Mindfulness',
    description: 'Connect with your surroundings',
    tags: ['grounding', 'present_moment', 'short_session'],
    defaultDurationText: '4 min'
  },

  // Visualization Exercises
  {
    id: 'visualization_goals_5min',
    title: 'Goal Achievement Visualization',
    type: 'Visualization',
    description: 'Visualize successfully achieving your goals',
    tags: ['goal_setting', 'motivation', 'success_mindset'],
    defaultDurationText: '5 min'
  },
  {
    id: 'visualization_ideal_life_5min',
    title: 'Ideal Life Visualization',
    type: 'Visualization',
    description: 'Envision your perfect future and lifestyle',
    tags: ['future_planning', 'inspiration', 'positive_outlook'],
    defaultDurationText: '5 min'
  },
  {
    id: 'visualization_confidence_5min',
    title: 'Self-Confidence Visualization',
    type: 'Visualization',
    description: 'Build confidence and positive self-image',
    tags: ['self_esteem', 'confidence_boost', 'positive_self_image'],
    defaultDurationText: '5 min'
  },
  {
    id: 'visualization_contentment_5min',
    title: 'Contentment Visualization',
    type: 'Visualization',
    description: 'Embrace gratitude and present moment awareness',
    tags: ['gratitude', 'present_moment', 'inner_peace'],
    defaultDurationText: '5 min'
  },
  {
    id: 'visualization_calm_5min',
    title: 'Inner Peace Visualization',
    type: 'Visualization',
    description: 'Find calmness and emotional balance',
    tags: ['calm', 'emotional_regulation', 'relaxation'],
    defaultDurationText: '5 min'
  },

  // Task Planning
  {
    id: 'tasks_planner',
    title: 'Task Planning',
    type: 'Task Planning',
    description: 'Organize & Focus on your priorities',
    tags: ['organization', 'productivity', 'planning', 'focus'],
    defaultDurationText: 'Flexible'
  },

  // Deep Work Sessions
  {
    id: 'deepwork_pomodoro_25min',
    title: 'Pomodoro Session',
    type: 'Deep Work',
    description: 'Classic 25-minute focus interval',
    tags: ['focus', 'productivity', 'time_management', 'pomodoro'],
    defaultDurationText: '25 min'
  },
  {
    id: 'deepwork_extended_45min',
    title: 'Extended Focus Session',
    type: 'Deep Work',
    description: '45-minute focused work period',
    tags: ['focus', 'deep_work', 'productivity'],
    defaultDurationText: '45 min'
  },
  {
    id: 'deepwork_deep_50min',
    title: 'Deep Work Block',
    type: 'Deep Work',
    description: '50-minute intense work session',
    tags: ['deep_work', 'intense_focus', 'productivity'],
    defaultDurationText: '50 min'
  },

  // Binaural Beats
  {
    id: 'binaural_focus_beta_20min',
    title: 'Focus Beats (Beta)',
    type: 'Binaural Beats',
    description: 'Enhance concentration and mental clarity',
    tags: ['focus', 'concentration', 'study', 'work', 'beta_waves'],
    defaultDurationText: '20 min'
  },
  {
    id: 'binaural_meditation_theta_15min',
    title: 'Meditation Beats (Theta)',
    type: 'Binaural Beats',
    description: 'Deep relaxation and mindfulness support',
    tags: ['meditation', 'relaxation', 'mindfulness', 'theta_waves'],
    defaultDurationText: '15 min'
  },
  {
    id: 'binaural_creativity_alpha_30min',
    title: 'Creativity Beats (Alpha)',
    type: 'Binaural Beats',
    description: 'Boost creative thinking and flow state',
    tags: ['creativity', 'flow_state', 'inspiration', 'alpha_waves'],
    defaultDurationText: '30 min'
  },
  {
    id: 'binaural_sleep_theta_30min',
    title: 'Sleep Beats (Theta)',
    type: 'Binaural Beats',
    description: 'Aid in falling asleep and better rest',
    tags: ['sleep', 'relaxation', 'insomnia_aid', 'theta_waves'],
    defaultDurationText: '30 min'
  },

  // Journaling
  {
    id: 'journaling_gratitude',
    title: 'Gratitude Journaling',
    type: 'Journaling',
    description: 'Express appreciation for positive aspects',
    tags: ['gratitude', 'positive_psychology', 'reflection', 'well_being'],
    defaultDurationText: '5-10 min'
  },
  {
    id: 'journaling_reflection',
    title: 'Daily Reflection',
    type: 'Journaling',
    description: 'Explore your thoughts and experiences',
    tags: ['self_reflection', 'mindfulness', 'personal_growth'],
    defaultDurationText: '5-10 min'
  },
  {
    id: 'journaling_growth',
    title: 'Growth Journaling',
    type: 'Journaling',
    description: 'Focus on personal progress and improvement',
    tags: ['personal_development', 'goal_setting', 'learning'],
    defaultDurationText: '5-10 min'
  },
  {
    id: 'journaling_free_write',
    title: 'Free Write',
    type: 'Journaling',
    description: 'Unstructured writing to clear your mind',
    tags: ['mind_clearing', 'creativity', 'self_expression'],
    defaultDurationText: 'Flexible'
  }
];

/**
 * Update a user's token balance
 * @param userId - The user ID to update
 * @param amount - The amount to adjust (negative to deduct)
 * @returns The new token balance or error
 */
async function updateUserTokens(userId: string, amount: number) {
  console.log(`Updating tokens for user ${userId} by ${amount}`);
  
  try {
    // Use the server-side function to update tokens safely
    const { data, error } = await supabaseAdmin.rpc(
      'add_user_tokens',
      { p_user_id: userId, p_amount: amount }
    );
    
    if (error) {
      console.error('Error updating user tokens:', error);
      return { 
        success: false, 
        error: 'Failed to update token balance',
        tokens: 0
      };
    }
    
    console.log(`Updated token balance for user ${userId} to ${data}`);
    return { 
      success: true, 
      tokens: data
    };
  } catch (error) {
    console.error('Error in updateUserTokens:', error);
    return { 
      success: false, 
      error: String(error),
      tokens: 0
    };
  }
}

/**
 * Get user's recent journal entries for pattern analysis
 */
async function getRecentJournalEntries(userId: string, days: number = 7) {
  console.log(`[PatternAnalysis] Getting recent journal entries for user ${userId} (last ${days} days)`);
  
  try {
    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .select('content, insights, created_at, ai_metadata')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching recent journal entries:', error);
      return [];
    }

    console.log(`[PatternAnalysis] Found ${data?.length || 0} recent journal entries`);
    return data || [];
  } catch (error) {
    console.error('Error in getRecentJournalEntries:', error);
    return [];
  }
}

/**
 * Get user's recent exercise completions for personalization
 */
async function getRecentExerciseHistory(userId: string, days: number = 14) {
  console.log(`[PatternAnalysis] Getting recent exercise history for user ${userId} (last ${days} days)`);
  
  try {
    const { data, error } = await supabaseAdmin
      .from('daily_exercise_logs')
      .select('exercise_id, exercise_type, completed_at, source, metadata')
      .eq('user_id', userId)
      .gte('completed_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('completed_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching recent exercise history:', error);
      return [];
    }

    console.log(`[PatternAnalysis] Found ${data?.length || 0} recent exercise completions`);
    return data || [];
  } catch (error) {
    console.error('Error in getRecentExerciseHistory:', error);
    return [];
  }
}

/**
 * Analyze patterns and generate exercise recommendations
 */
async function analyzeJournalingPatterns(userId: string, currentEntry: string, context: any) {
  console.log(`[PatternAnalysis] Starting pattern analysis for user ${userId}`);
  
  // Get recent data
  const recentEntries = await getRecentJournalEntries(userId, 7);
  const exerciseHistory = await getRecentExerciseHistory(userId, 14);
  
  // Only analyze patterns if we have sufficient data (at least 2 recent entries)
  if (recentEntries.length < 2) {
    console.log(`[PatternAnalysis] Insufficient data for pattern analysis (${recentEntries.length} entries)`);
    return null;
  }

  // Extract emotional themes and time patterns
  const entryAnalysis = recentEntries.map(entry => ({
    content: entry.content.toLowerCase(),
    insights: entry.insights || '',
    created_at: entry.created_at,
    time_of_day: new Date(entry.created_at).getHours(),
    emotions: context?.emotions || []
  }));

  // Analyze exercise sequences and patterns
  const exerciseSequences = exerciseHistory.reduce((acc, exercise, index) => {
    if (index > 0) {
      const prevExercise = exerciseHistory[index - 1];
      const timeDiff = new Date(prevExercise.completed_at).getTime() - new Date(exercise.completed_at).getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      // Look for exercises completed within 24 hours of each other
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

  // Construct enhanced prompt for pattern analysis
  const patternPrompt = `
CONTEXT: You are analyzing journaling patterns to provide intelligent exercise recommendations.

CURRENT JOURNAL ENTRY: "${currentEntry}"

RECENT JOURNAL PATTERNS (last 7 days):
${entryAnalysis.map((entry, i) => 
  `Entry ${i + 1} (${new Date(entry.created_at).toLocaleDateString()}, ${entry.time_of_day}:00): 
  Key themes: ${entry.content.slice(0, 100)}...
  Previous insights: ${entry.insights}`
).join('\n')}

RECENT EXERCISE HISTORY (last 14 days):
${exerciseHistory.map(ex => 
  `${ex.exercise_type} (${ex.exercise_id}) - ${new Date(ex.completed_at).toLocaleDateString()}`
).join('\n')}

EXERCISE SEQUENCE PATTERNS:
${exerciseSequences.map(seq => 
  `${seq.first} → ${seq.second} (${seq.hours_between.toFixed(1)}h apart)`
).join('\n')}

AVAILABLE EXERCISES (YOU MUST ONLY RECOMMEND FROM THIS LIST):
${AVAILABLE_EXERCISES.map(ex => 
  `- ${ex.id} | ${ex.title} (${ex.type}) | ${ex.description} | Duration: ${ex.defaultDurationText} | Tags: ${ex.tags.join(', ')}`
).join('\n')}

ANALYSIS INSTRUCTIONS:
1. EMOTIONAL PATTERNS: Look for recurring emotions/themes across recent entries (stress, anxiety, motivation, etc.)
2. TIME PATTERNS: Notice when they journal and their emotional state at different times
3. EXERCISE EFFECTIVENESS: Identify which exercises they complete after certain emotional states
4. SEQUENCE SUCCESS: Notice if certain exercise combinations are effective for them

RECOMMENDATION CRITERIA:
- Only recommend if you detect a clear pattern (e.g., "stressed 3+ times", "always anxious in morning")
- CRITICAL: You MUST only use exercise_id values from the AVAILABLE EXERCISES list above
- Personalize based on their exercise history and what has worked before
- Be specific about timing (e.g., "when you feel X, try Y")
- Reference their successful patterns when possible
- Choose exercises whose tags match the identified emotional patterns

OUTPUT FORMAT:
If patterns detected:
{
  "pattern_detected": true,
  "pattern_description": "Brief description of the pattern found",
  "recommendation": {
    "exercise_type": "One of: Mindfulness|Visualization|Deep Work|Task Planning|Binaural Beats|Journaling",
    "exercise_id": "MUST be an exact exercise_id from the AVAILABLE EXERCISES list",
    "reasoning": "Why this specific exercise based on their patterns",
    "trigger": "When to use this recommendation",
    "personalization": "How this relates to their past successful experiences"
  }
}

If no significant patterns:
{
  "pattern_detected": false,
  "reason": "Why no patterns were detected"
}

CRITICAL: Double-check that the exercise_id exists in the AVAILABLE EXERCISES list before responding.
RESPOND ONLY WITH THE JSON - NO OTHER TEXT.
  `;

  try {
    console.log('[PatternAnalysis] Making OpenAI call for pattern analysis');
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert pattern analyst for personalized exercise recommendations. Respond only with valid JSON.' },
        { role: 'user', content: patternPrompt }
      ],
      model: 'gpt-4o-mini',
      max_tokens: 500,
      temperature: 0.3, // Lower temperature for more consistent pattern detection
    });

    const response = completion.choices[0].message.content;
    console.log('[PatternAnalysis] Raw pattern analysis response:', response);
    
    try {
      const patterns = JSON.parse(response);
      console.log('[PatternAnalysis] Parsed pattern analysis:', patterns);
      return {
        patterns,
        tokens_used: completion.usage?.total_tokens || 0
      };
    } catch (parseError) {
      console.error('[PatternAnalysis] Failed to parse pattern analysis JSON:', parseError);
      return null;
    }
  } catch (error) {
    console.error('[PatternAnalysis] Error in pattern analysis:', error);
    return null;
  }
}

serve(async (req) => {
  try {
    // 1. Parse the request body
    const { text, context, maxTokens = 75, userId, enablePatternAnalysis = false } = await req.json();
    
    // Debug log the request (excluding sensitive data)
    console.log('Analyzing text:', { 
      textLength: text?.length,
      contextKeys: context ? Object.keys(context) : [],
      maxTokens,
      userId,
      enablePatternAnalysis
    });

    // 2. Validate the request
    if (!text?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Construct the prompt based on context
    let systemPrompt = 'You are an AI life coach assistant. Analyze the following text and provide insights.';
    if (context?.type === 'journal') {
      systemPrompt += ' Keep your response to 1-2 short sentences. Focus on the main emotional theme and one simple, actionable insight. Be supportive and encouraging, not analytical or verbose.';
    } else if (context?.type === 'goal') {
      systemPrompt += ' Evaluate if the goal is SMART (Specific, Measurable, Achievable, Relevant, Time-bound) and suggest improvements.';
    }

    // 4. Make the OpenAI API call for basic analysis
    console.log('Making OpenAI API call with gpt-4o-mini model');
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      model: 'gpt-4o-mini',
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    // 5. Process basic analysis
    const analysis = completion.choices[0].message.content;
    let tokensUsed = completion.usage?.total_tokens || 0;
    
    console.log('Basic analysis complete:', { 
      analysisLength: analysis.length,
      tokensUsed,
      model: 'gpt-4o-mini'
    });

    // 6. Pattern analysis for journaling (if enabled and is journal context)
    let patternAnalysis = null;
    if (enablePatternAnalysis && context?.type === 'journal') {
      console.log('[PatternAnalysis] Starting pattern analysis for journal entry');
      const patternResult = await analyzeJournalingPatterns(userId, text, context);
      if (patternResult) {
        patternAnalysis = patternResult.patterns;
        tokensUsed += patternResult.tokens_used;
        console.log('[PatternAnalysis] Pattern analysis completed, total tokens:', tokensUsed);
      }
    }

    // 7. Deduct tokens used from the user's balance
    const tokenUpdateResult = await updateUserTokens(userId, -tokensUsed);
    
    if (!tokenUpdateResult.success) {
      console.error('Failed to update token balance after usage:', tokenUpdateResult.error);
      // Continue anyway and return the response, but include the error
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          analysis,
          patternAnalysis,
          metadata: {
            tokensUsed,
            model: 'gpt-4o-mini',
            hasPatternAnalysis: !!patternAnalysis,
            processingTimeMs: Date.now() % 10000 // Simple processing time indicator
          }
        },
        tokens: {
          used: tokensUsed,
          remaining: tokenUpdateResult.success ? tokenUpdateResult.tokens : null,
          error: tokenUpdateResult.success ? null : tokenUpdateResult.error
        }
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Log the error details
    console.error('Error in analyze-text:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}); 