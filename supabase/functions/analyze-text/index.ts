import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { OpenAI } from 'https://esm.sh/openai@4.20.0';

console.log('Initializing analyze-text function');

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
if (!openaiApiKey) {
  console.error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

serve(async (req) => {
  try {
    // 1. Parse the request body
    const { text, context, maxTokens = 150 } = await req.json();
    
    // Debug log the request (excluding sensitive data)
    console.log('Analyzing text:', { 
      textLength: text?.length,
      contextKeys: context ? Object.keys(context) : [],
      maxTokens 
    });

    // 2. Validate the request
    if (!text?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
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
    
    // Debug log the response length
    console.log('Analysis complete:', { 
      analysisLength: analysis.length,
      tokensUsed: completion.usage?.total_tokens 
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          analysis,
          metadata: {
            tokensUsed: completion.usage?.total_tokens,
            model: 'gpt-3.5-turbo'
          }
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