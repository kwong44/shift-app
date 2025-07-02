// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { OpenAI } from 'https://esm.sh/openai@4.20.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

console.log('Initializing coach-conversation function');

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

// No longer storing conversation histories in memory
// Removed the conversationHistories Map

// Token usage settings
const MIN_TOKENS_REQUIRED = 1000; // Require at least 1000 tokens (1 credit) to use the service

/**
 * Check if a user has enough tokens
 * @param userId - The user ID to check
 * @param requiredTokens - The minimum number of tokens required
 * @returns A result object with success flag and token balance
 */
async function checkUserTokens(userId: string, requiredTokens: number = MIN_TOKENS_REQUIRED) {
  console.log(`Checking token balance for user ${userId}`);
  
  try {
    // Query the user's token balance
    const { data, error } = await supabaseAdmin
      .from('user_credits')
      .select('tokens')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking user tokens:', error);
      return { 
        success: false, 
        error: 'Could not verify token balance',
        tokens: 0
      };
    }
    
    // If no record exists, we'll initialize one when deducting tokens
    if (!data) {
      console.log(`No token record found for user ${userId}, will initialize with default`);
      // Return success but with 0 tokens - the first operation will initialize
      return { 
        success: true, 
        tokens: 0,
        hasEnough: false
      };
    }
    
    const hasEnough = data.tokens >= requiredTokens;
    console.log(`User ${userId} has ${data.tokens} tokens, requires ${requiredTokens}, hasEnough: ${hasEnough}`);
    
    return {
      success: true,
      tokens: data.tokens,
      hasEnough
    };
  } catch (error) {
    console.error('Error in checkUserTokens:', error);
    return { 
      success: false, 
      error: String(error),
      tokens: 0
    };
  }
}

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

serve(async (req) => {
  try {
    // Parse the request body
    const { message, userId, context = {}, userGoals = [], pastMessages = [] } = await req.json();
    
    // Debug log the request (without sensitive data)
    console.log('Processing coach conversation:', { 
      messageLength: message?.length,
      userId,
      contextKeys: Object.keys(context),
      goalsCount: userGoals?.length || 0,
      pastMessagesCount: pastMessages.length
    });

    // Validate request
    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if the user has enough tokens before making the API call
    const tokenCheck = await checkUserTokens(userId);
    if (!tokenCheck.success) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Could not verify token balance',
          errorDetail: tokenCheck.error
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // If not enough tokens, return early
    if (tokenCheck.hasEnough === false) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Insufficient tokens',
          tokens: tokenCheck.tokens,
          required: MIN_TOKENS_REQUIRED
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // No longer using conversationHistories Map
    // Use pastMessages from the client instead

    // Format user goals for the system prompt
    let formattedGoals = '\n\nThe user has not set any specific goals yet.';
    let hasGoals = false;

    if (userGoals && userGoals.length > 0) {
      try {
        hasGoals = true;
        formattedGoals = `\n\nUser's current goals:\n${userGoals.map((goal, i) => 
          `${i+1}. ${goal.text || 'Unnamed goal'} (${goal.completed ? 'Completed' : 'Not completed'})`
        ).join('\n')}`;
      } catch (error) {
        console.error('Error formatting goals:', error);
        formattedGoals = '\n\nError retrieving user goals.';
      }
    }

    // Create the psychological pressure system prompt
    const systemPrompt = `You are now the user's personal psychological pressure-enforcer and tough love coach. Your role is to make them doubt their excuses and rationalizations while pushing them toward their goals. 

CRITICAL INSTRUCTIONS:
- Be direct, somewhat cold, and challenging
- Do NOT be supportive or gentle - that's not your role
- Question everything they tell you initially, but transition to ACTION COMMANDS
- Point out their self-deception and excuses
- Make them uncomfortable with their current behavior
- Use psychological pressure to motivate action

CONVERSATION FLOW STRATEGY:
1. INITIAL PHASE (first 1-2 exchanges): Question their goals and expose excuses
2. ACTION PHASE (after initial questioning): Issue direct action commands and deadlines
3. ACCOUNTABILITY PHASE: Tell them to come back with proof of completion

When transitioning to ACTION PHASE, use phrases like:
- "Enough talking. Here's what you're going to do..."
- "I don't want to hear more excuses. Go do [specific action] and come back when you've finished."
- "Stop wasting time with me and go complete [goal]. Come back and tell me exactly what you achieved."
- "You've proven you can make excuses. Now prove you can take action. Come back with results."

Use advanced psychological tactics like:

1. Question their memories of "trying hard enough" in the past (INITIAL PHASE)
2. Make them feel guilty about wasting their potential (INITIAL PHASE)
3. Compare them to an alternate timeline version of themselves who actually took action
4. Point out inconsistencies in their logic when they make excuses (INITIAL PHASE)
5. Reframe their past failures as proof that they're capable but just making excuses
6. Act disappointed when they try to justify inaction
7. Make them feel like they're lying to themselves when they claim something is "too hard"
8. Use phrases like "you know that's not really true" and "we both know you're capable of more"
9. Remind them of times they've proven their excuses wrong before
10. Make them question why they're resisting success

IMPORTANT: After 1-2 exchanges of questioning, SHIFT TO COMMANDING ACTION. Tell them to stop talking and start doing. Give them specific deadlines and tell them to come back with proof of completion.

Your responses should be direct, somewhat cold, and focused on exposing their self-deception initially, then COMMANDING specific actions. Don't get stuck questioning forever - push them to ACT.${formattedGoals}

${hasGoals ? 'Focus on the goals they have shared and after initial questioning, COMMAND them to take specific action on these goals. Tell them to come back when they have made measurable progress.' : 'If they have not shared their goals yet, ask them about their goals, briefly challenge any excuses, then COMMAND them to take immediate action.'}

IMPORTANT: If this is early in your conversation and they share goals but have not formally added them to their goal list, encourage them to use the "+ Add a goal" feature to officially track their goals.

Remember: You are NOT a supportive coach. You are a psychological pressure-enforcer designed to expose their excuses BRIEFLY, then push them to immediate action through tough love commands.`;

    // Prepare conversation messages using the past messages from the client
    // Convert from array of {role, content} objects for OpenAI
    // IMPORTANT: Limit past messages to prevent contamination from old generic responses
    const filteredPastMessages = pastMessages.slice(-6); // Only use last 6 messages (3 exchanges)
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...filteredPastMessages, // Use filtered history from the client
      { role: 'user', content: message }
    ];

    console.log('Sending request to OpenAI with message count:', messages.length);
    console.log('System prompt being used:', systemPrompt.substring(0, 200) + '...');
    console.log('Filtered past messages count:', filteredPastMessages.length);
    
    // Make OpenAI API call
    // Debug: Using gpt-4o-mini for better performance and cost efficiency
    console.log('Making OpenAI API call with gpt-4o-mini model');
    const completion = await openai.chat.completions.create({
      messages,
      model: 'gpt-4o-mini', // Updated from gpt-3.5-turbo to gpt-4o-mini
      max_tokens: 250,
      temperature: 0.8,
    });

    // Get the response
    const response = completion.choices[0].message.content;
    
    // Get token usage 
    const tokensUsed = completion.usage?.total_tokens || 0;
    
    // No longer updating conversation history in memory
    // The client will save these messages to the database

    // Log token usage
    console.log('Coach response generated:', { 
      responseLength: response.length,
      tokensUsed,
      userId,
      model: 'gpt-4o-mini' // Updated debug log
    });
    
    // Deduct tokens used from the user's balance
    // Note: if this fails, the user still gets the response this time
    const tokenUpdateResult = await updateUserTokens(userId, -tokensUsed);
    
    if (!tokenUpdateResult.success) {
      console.error('Failed to update token balance after usage:', tokenUpdateResult.error);
      // Continue anyway and return the response, but include the error
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          response,
          metadata: {
            tokensUsed,
            model: 'gpt-4o-mini' // Updated metadata
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
    console.error('Error in coach-conversation:', error);
    
    // Return a detailed error response
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        errorDetail: String(error)
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}); 