// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { OpenAI } from 'https://esm.sh/openai@4.20.0';

console.log('[DailyFocusAI] Initializing AI-powered daily focus recommendation function');

// Environment variables
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Verify environment variables
if (!openaiApiKey) {
  console.error('[DailyFocusAI] Missing OPENAI_API_KEY environment variable');
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[DailyFocusAI] Missing Supabase environment variables');
}

// Initialize clients
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

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
    console.log('[DailyFocusAI] Making OpenAI API call for recommendations');
    
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt }
      ],
      model: 'gpt-4o-mini',
      max_tokens: 800,
      temperature: 0.7,
    });

    const responseText = completion.choices[0].message.content;
    const tokensUsed = completion.usage?.total_tokens || 0;
    
    console.log(`[DailyFocusAI] OpenAI response received, tokens used: ${tokensUsed}`);
    
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
          model: 'gpt-4o-mini',
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
        recommendations: userContext.userFavorites.slice(0, requestedCount)
      };
    }
  } catch (error) {
    console.error('[DailyFocusAI] Error calling OpenAI:', error);
    
    // Fallback to user favorites if AI call fails
    return {
      success: false,
      error: 'AI service unavailable',
      fallback: true,
      recommendations: userContext.userFavorites.slice(0, requestedCount)
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
  try {
    const { userId, requestedCount = 3 } = await req.json();
    
    console.log(`[DailyFocusAI] Processing request for user: ${userId}, count: ${requestedCount}`);

    // Validate request
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Gather comprehensive user context
    const userContext = await gatherUserContext(userId);
    
    // 2. Generate AI-powered recommendations
    const aiResult = await generateAIRecommendations(userContext, requestedCount);
    
    if (!aiResult.success) {
      console.warn('[DailyFocusAI] AI recommendation failed, using fallback');
      
      // Return fallback recommendations
      return new Response(
        JSON.stringify({
          success: true,
          fallback: true,
          recommendations: aiResult.recommendations,
          metadata: {
            fallback_reason: aiResult.error,
            model: 'fallback_favorites'
          }
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Format recommendations for client
    const formattedRecommendations = formatRecommendationsForClient(
      aiResult.recommendations, 
      userContext.userFavorites
    );

    // 4. Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        recommendations: formattedRecommendations,
        metadata: aiResult.metadata
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[DailyFocusAI] Error in daily focus AI function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}); 