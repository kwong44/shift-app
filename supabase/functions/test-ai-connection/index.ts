import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { OpenAI } from 'https://esm.sh/openai@4.20.0';

console.log('Initializing test-ai-connection function');

// Initialize the LLM client with the API key from environment variables/secrets
// Ensure you have set OPENAI_API_KEY in your Supabase project's Edge Function secrets
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

if (!openaiApiKey) {
  console.error('Missing OPENAI_API_KEY environment variable. Please set it in your Supabase project secrets.');
  // Throw an error or return a specific response if the key is missing
  // For now, we'll let it fail if the key isn't there when OpenAI is initialized.
}

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

serve(async (req) => {
  console.debug('[test-ai-connection] Received request');
  try {
    // 1. Ensure the request method is POST
    if (req.method !== 'POST') {
      console.warn(`[test-ai-connection] Invalid request method: ${req.method}`);
      return new Response(
        JSON.stringify({ error: 'Invalid request method. Please use POST.' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // 2. Parse the request body
    let inputText = '';
    try {
      const body = await req.json();
      inputText = body.inputText;
    } catch (e) {
      console.warn('[test-ai-connection] Error parsing request body:', e.message);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!inputText) {
      console.warn('[test-ai-connection] Missing inputText in request body');
      return new Response(
        JSON.stringify({ error: 'Missing inputText in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    console.debug(`[test-ai-connection] Processing inputText: "${inputText}"`);

    // 3. Call OpenAI API
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: inputText },
      ],
      model: 'gpt-3.5-turbo', // Choose a cost-effective model for testing
      max_tokens: 50, // Keep tokens low for testing
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content;
    console.debug(`[test-ai-connection] AI Response: "${aiResponse}"`);

    // 4. Return the response
    return new Response(
      JSON.stringify({ success: true, data: aiResponse || 'No response from AI.' }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }, // Added CORS for local testing
    );
  } catch (error) {
    console.error('[test-ai-connection] Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process request' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }, // Added CORS for local testing
    );
  }
});

/* 
Debug Comments:
- This function serves as a basic test for LLM connectivity.
- It expects a JSON payload with an 'inputText' field via POST request.
- It uses the OpenAI SDK.
- API key is fetched from environment variables/secrets (ensure 'OPENAI_API_KEY' is set in Supabase).
- `max_tokens` is kept low to control cost during testing.
- Includes console logs for debugging various stages.
- Added basic request method validation and improved body parsing.
- Added CORS headers for easier local testing; review for production.
*/ 