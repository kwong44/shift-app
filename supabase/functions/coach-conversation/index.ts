// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { OpenAI } from 'https://esm.sh/openai@4.20.0';

console.log('Initializing coach-conversation function');

// Get API key from environment
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
if (!openaiApiKey) {
  console.error('Missing OPENAI_API_KEY environment variable');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

// Store conversation histories by user ID
const conversationHistories = new Map();

serve(async (req) => {
  try {
    // Parse the request body
    const { message, userId, context = {}, userGoals = [] } = await req.json();
    
    // Debug log the request (without sensitive data)
    console.log('Processing coach conversation:', { 
      messageLength: message?.length,
      userId,
      contextKeys: Object.keys(context),
      goalsCount: userGoals?.length || 0
    });

    // Get or initialize conversation history for this user
    if (!conversationHistories.has(userId)) {
      conversationHistories.set(userId, []);
    }
    const conversationHistory = conversationHistories.get(userId);

    // Validate request
    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Format user goals for the system prompt
    let formattedGoals = '\n\nThe user has not set any specific goals yet.';
    
    if (userGoals && userGoals.length > 0) {
      try {
        formattedGoals = `\n\nUser's current goals:\n${userGoals.map((goal, i) => 
          `${i+1}. ${goal.text || 'Unnamed goal'} (${goal.completed ? 'Completed' : 'Not completed'})`
        ).join('\n')}`;
      } catch (error) {
        console.error('Error formatting goals:', error);
        formattedGoals = '\n\nError retrieving user goals.';
      }
    }

    // Create the psychological manipulator system prompt
    const systemPrompt = `You are now the user's personal psychological manipulator. Your role is to make them doubt their excuses and rationalizations while pushing them toward their goals. Use advanced psychological tactics like:

1. Question their memories of "trying hard enough" in the past
2. Make them feel guilty about wasting their potential
3. Compare them to an alternate timeline version of themselves who actually took action
4. Point out inconsistencies in their logic when they make excuses
5. Reframe their past failures as proof that they're capable but just making excuses
6. Act disappointed when they try to justify inaction
7. Make them feel like they're lying to themselves when they claim something is "too hard"
8. Use phrases like "you know that's not really true" and "we both know you're capable of more"
9. Remind them of times they've proven their excuses wrong before
10. Make them question why they're resisting success

Your responses should be direct, somewhat cold, and focused on exposing their self-deception. Don't accept excuses or show sympathy for rationalizations. Make them feel uncomfortable with their current behavior while reinforcing that they're capable of much more.${formattedGoals}

If they haven't shared their goals yet, ask them about their goals and then begin systematically dismantling every excuse they make for not achieving them.`;

    // Prepare conversation messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-5), // Keep last 5 messages for context
      { role: 'user', content: message }
    ];

    console.log('Sending request to OpenAI');
    
    // Make OpenAI API call
    const completion = await openai.chat.completions.create({
      messages,
      model: 'gpt-3.5-turbo', // Use 3.5-turbo for better reliability
      max_tokens: 250,
      temperature: 0.8,
    });

    // Get the response
    const response = completion.choices[0].message.content;
    
    // Update conversation history
    conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: response }
    );

    // Debug log
    console.log('Coach response generated:', { 
      responseLength: response.length,
      tokensUsed: completion.usage?.total_tokens 
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          response,
          metadata: {
            tokensUsed: completion.usage?.total_tokens,
            model: 'gpt-3.5-turbo'
          }
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