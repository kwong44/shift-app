import { supabase } from '../config/supabase';

// Debug logging
console.debug('[tokens] Initializing Tokens API');

/**
 * Token system configuration
 */
export const TOKENS_CONFIG = {
  // Package options for purchasing
  packages: [
    { id: 'small', tokens: 5000, price: 1.99, label: '5 Credits (5,000 tokens)' },
    { id: 'medium', tokens: 20000, price: 6.99, label: '20 Credits (20,000 tokens)' },
    { id: 'large', tokens: 50000, price: 14.99, label: '50 Credits (50,000 tokens)' }
  ],
  
  // Free tokens for new users
  initialFreeTokens: 10000,
  
  // Warnings
  lowBalanceThreshold: 2000,
  
  // Conversion rate for display
  tokensPerCredit: 1000,
  
  // Minimum tokens required for a conversation
  minTokensRequired: 1000
};

/**
 * Convert tokens to credits for UI display
 * @param {number} tokens - The number of tokens
 * @returns {number} The equivalent number of credits (rounded down)
 */
export const tokensToCredits = (tokens) => {
  if (!tokens || tokens < 0) return 0;
  return Math.floor(tokens / TOKENS_CONFIG.tokensPerCredit);
};

/**
 * Gets the current token balance for a user
 * @returns {Promise<{tokens: number, credits: number}>} The user's token balance and credit equivalent
 */
export const getUserTokens = async () => {
  console.debug('[tokens] Getting token balance');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Query the user_credits table
    const { data, error } = await supabase
      .from('user_credits')
      .select('tokens')
      .eq('user_id', user.id)
      .maybeSingle(); // Use maybeSingle instead of single to handle the "no record" case
    
    // Handle non-critical errors that aren't just "no record found"
    if (error && error.code !== 'PGRST116') {
      console.error('[tokens] Error fetching token balance:', error);
      throw error;
    }
    
    // If user has no record, initialize them with free tokens
    if (!data) {
      console.debug('[tokens] No token record found for user, initializing with free tokens');
      return initializeUserTokens(user.id);
    }
    
    console.debug('[tokens] User token balance:', data.tokens);
    
    // Return both tokens and the credit equivalent for UI
    return {
      tokens: data.tokens,
      credits: tokensToCredits(data.tokens)
    };
  } catch (error) {
    console.error('[tokens] Error getting user tokens:', error);
    throw error;
  }
};

/**
 * Initializes a new user with free tokens
 * @param {string} userId - The user's ID
 * @returns {Promise<{tokens: number, credits: number}>} The initial token balance
 */
export const initializeUserTokens = async (userId) => {
  console.debug('[tokens] Initializing new user with free tokens');
  
  try {
    const initialTokens = TOKENS_CONFIG.initialFreeTokens;
    
    // Insert a new record with initial free tokens
    const { error } = await supabase
      .from('user_credits')
      .insert([
        { user_id: userId, tokens: initialTokens }
      ]);
    
    if (error) {
      console.error('[tokens] Error initializing user tokens:', error);
      // If there was an error (likely because another process created the record),
      // try getting the tokens again
      const { data: checkData } = await supabase
        .from('user_credits')
        .select('tokens')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkData) {
        console.debug('[tokens] Found existing token record after failed insert');
        return {
          tokens: checkData.tokens,
          credits: tokensToCredits(checkData.tokens)
        };
      }
      
      // If we still can't get the token record, return default values
      console.debug('[tokens] Returning default tokens after initialization failure');
      return {
        tokens: initialTokens,
        credits: tokensToCredits(initialTokens)
      };
    }
    
    console.debug('[tokens] User initialized with tokens:', initialTokens);
    return {
      tokens: initialTokens,
      credits: tokensToCredits(initialTokens)
    };
  } catch (error) {
    console.error('[tokens] Error in initializeUserTokens:', error);
    // Return default values on error
    return {
      tokens: TOKENS_CONFIG.initialFreeTokens,
      credits: tokensToCredits(TOKENS_CONFIG.initialFreeTokens)
    };
  }
};

/**
 * Updates a user's token balance
 * @param {number} amount - Amount to adjust (negative to deduct)
 * @returns {Promise<{tokens: number, credits: number}>} The new token balance and credit equivalent
 */
export const updateUserTokens = async (amount) => {
  console.debug('[tokens] Updating user tokens by', amount);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Check if user has a token record first
    const { data: checkData } = await supabase
      .from('user_credits')
      .select('tokens')
      .eq('user_id', user.id)
      .maybeSingle();
    
    // If no record exists, initialize one first
    if (!checkData) {
      console.debug('[tokens] No token record found, initializing before update');
      const initialData = await initializeUserTokens(user.id);
      
      // If adding tokens, add to the initial amount
      if (amount > 0) {
        return updateUserTokens(amount);
      }
      
      // If deducting tokens, just return the initial amount (can't deduct yet)
      return initialData;
    }
    
    // Use the server-side function to update tokens safely
    const { data, error } = await supabase.rpc(
      'add_user_tokens',
      { p_user_id: user.id, p_amount: amount }
    );
    
    if (error) throw error;
    
    console.debug('[tokens] Updated token balance:', data);
    
    // Return both tokens and the credit equivalent for UI
    return {
      tokens: data,
      credits: tokensToCredits(data)
    };
  } catch (error) {
    console.error('[tokens] Error updating user tokens:', error);
    throw error;
  }
};

/**
 * Purchases tokens for the current user
 * @param {string} packageId - The ID of the package to purchase
 * @returns {Promise<object>} The result of the purchase
 */
export const purchaseTokens = async (packageId) => {
  console.debug('[tokens] Processing token purchase:', packageId);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Find the package by ID
    const selectedPackage = TOKENS_CONFIG.packages.find(pkg => pkg.id === packageId);
    if (!selectedPackage) {
      throw new Error('Invalid package selected');
    }
    
    console.debug('[tokens] Selected package:', selectedPackage);
    
    // In a real app, this would integrate with a payment processor
    // For now, we'll just call our Edge Function directly
    
    // Call the Edge Function to purchase tokens
    console.debug('[tokens] Calling purchase-credits Edge Function');
    const { data, error } = await supabase.functions.invoke('purchase-credits', {
      body: {
        userId: user.id,
        amount: selectedPackage.tokens,
        // In a real app, would include payment confirmation
      }
    });
    
    if (error) throw error;
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to purchase tokens');
    }
    
    console.debug('[tokens] Purchase successful:', data);
    
    return {
      success: true,
      newBalance: {
        tokens: data.data.newBalance,
        credits: tokensToCredits(data.data.newBalance)
      },
      added: {
        tokens: data.data.addedTokens,
        credits: tokensToCredits(data.data.addedTokens)
      },
      package: selectedPackage
    };
  } catch (error) {
    console.error('[tokens] Error purchasing tokens:', error);
    throw error;
  }
};

/**
 * Mock function to simulate token purchase for development
 * @param {number} amount - The number of tokens to purchase
 * @returns {Promise<object>} Mock purchase result
 */
export const mockPurchaseTokens = async (amount) => {
  console.debug('[tokens] MOCK purchase of', amount, 'tokens');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would call the Edge Function after processing payment
    // For development, we'll directly update the tokens in the database
    
    // Use the server-side function to add tokens
    const { data, error } = await supabase.rpc(
      'add_user_tokens',
      { p_user_id: user.id, p_amount: amount }
    );
    
    if (error) throw error;
    
    console.debug('[tokens] MOCK purchase successful, new balance:', data);
    
    return {
      success: true,
      newBalance: {
        tokens: data,
        credits: tokensToCredits(data)
      },
      added: {
        tokens: amount,
        credits: tokensToCredits(amount)
      }
    };
  } catch (error) {
    console.error('[tokens] Error in MOCK purchase:', error);
    throw error;
  }
};

// Export all functions for use in the app
export default {
  getUserTokens,
  updateUserTokens,
  purchaseTokens,
  mockPurchaseTokens,
  tokensToCredits,
  config: TOKENS_CONFIG
}; 