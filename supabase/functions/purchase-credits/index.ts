// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/deploy/docs/tutorial-node-fetch

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Debug logs
console.debug('[purchase-tokens] Edge function initializing');

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PurchaseTokensRequest {
  userId: string;
  amount: number;
  // In a real app, would include payment details/confirmation
  paymentIntentId?: string;
}

interface PurchaseTokensResponse {
  success: boolean;
  error?: string;
  data?: {
    newBalance: number;
    addedTokens: number;
  };
}

Deno.serve(async (req) => {
  console.debug('[purchase-tokens] Request received');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }
    
    // Create a Supabase client with the auth header
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );
    
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }
    
    // Parse the request body
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }
    
    const { userId, amount, paymentIntentId } = await req.json() as PurchaseTokensRequest;
    
    // Verify the user is updating their own tokens
    if (userId !== user.id) {
      throw new Error('Cannot modify tokens for another user');
    }
    
    // Validate amount
    if (!amount || amount <= 0 || !Number.isInteger(amount)) {
      throw new Error('Invalid token amount');
    }
    
    // In a real app, verify the payment was successful here
    // e.g., validate paymentIntentId with Stripe
    // For now, we'll just add the tokens
    console.debug(`[purchase-tokens] Adding ${amount} tokens to user ${userId}`);
    
    // Use the server-side function to add tokens
    const { data, error } = await supabaseClient.rpc(
      'add_user_tokens',
      { p_user_id: userId, p_amount: amount }
    );
    
    if (error) throw error;
    
    const response: PurchaseTokensResponse = {
      success: true,
      data: {
        newBalance: data,
        addedTokens: amount
      }
    };
    
    console.debug('[purchase-tokens] Tokens added successfully', response);
    
    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
    
  } catch (error) {
    console.error('[purchase-tokens] Error processing request', error);
    
    const errorResponse: PurchaseTokensResponse = {
      success: false,
      error: error.message,
    };
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
}); 