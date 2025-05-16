// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

console.log('Initializing test-coach function');

serve(async (req) => {
  try {
    // Parse the request body
    const body = await req.json();
    
    // Debug log the entire request for troubleshooting
    console.log('Request received:', body);
    
    // Return a simple response
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          response: "This is a test response. Your message was: " + (body.message || "none"),
          metadata: {
            userGoalsCount: body.userGoals?.length || 0
          }
        }
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in test-coach:', error);
    
    // Return a more detailed error response
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