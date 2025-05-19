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
    // 1. Parse the request body
    const { text, context, maxTokens = 150, userId } = await req.json();
    
    // Debug log the request (excluding sensitive data)
    console.log('Analyzing text:', { 
      textLength: text?.length,
      contextKeys: context ? Object.keys(context) : [],
      maxTokens,
      userId
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
      systemPrompt += ' Focus on emotional themes, patterns, and potential areas for growth.';
    } else if (context?.type === 'goal') {
      systemPrompt += ' Evaluate if the goal is SMART (Specific, Measurable, Achievable, Relevant, Time-bound) and suggest improvements.';
    }

    // 4. Make the OpenAI API call
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      model: 'gpt-3.5-turbo',
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    // 5. Process and return the response
    const analysis = completion.choices[0].message.content;
    const tokensUsed = completion.usage?.total_tokens || 0;
    
    // Debug log the response length
    console.log('Analysis complete:', { 
      analysisLength: analysis.length,
      tokensUsed 
    });

    // 6. Deduct tokens used from the user's balance
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
          metadata: {
            tokensUsed,
            model: 'gpt-3.5-turbo'
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