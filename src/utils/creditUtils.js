/**
 * Credit System Utilities
 * 
 * Utilities for managing the credit-based system instead of subscriptions
 * Provides hooks and functions for checking token balance, showing credit purchase prompts, etc.
 * 
 * @file creditUtils.js
 */

import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { getUserTokens } from '../api/credits';
import { CREDIT_CONFIG } from '../config/revenuecat';

// Debug logging
console.debug('[creditUtils] Credit utilities module loaded');

/**
 * Hook to get current user token balance
 * 
 * @returns {Object} Token balance and loading state
 */
export const useTokenBalance = () => {
  const [tokens, setTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refreshTokens = async () => {
    try {
      console.debug('[useTokenBalance] Refreshing token balance');
      setLoading(true);
      setError(null);
      
      const balance = await getUserTokens();
      setTokens(balance);
      setLastUpdated(new Date());
      
      console.debug('[useTokenBalance] Token balance updated:', balance);
      
      return balance;
    } catch (err) {
      console.error('[useTokenBalance] Error fetching tokens:', err);
      setError(err.message);
      return 0;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTokens();
  }, []);

  return {
    tokens,
    loading,
    error,
    lastUpdated,
    refreshTokens,
  };
};

/**
 * Check if user has enough tokens and show purchase prompt if not
 * 
 * @param {Object} navigation - React Navigation object
 * @param {number} requiredTokens - Number of tokens required
 * @param {string} actionName - Name of the action (for messaging)
 * @returns {Promise<boolean>} Whether user can proceed
 */
export const checkTokensAndPromptPurchase = async (navigation, requiredTokens = CREDIT_CONFIG.minTokensRequired, actionName = 'this feature') => {
  try {
    console.debug('[checkTokensAndPromptPurchase] Checking tokens for action:', {
      requiredTokens,
      actionName,
    });

    const currentTokens = await getUserTokens();
    
    if (currentTokens >= requiredTokens) {
      console.debug('[checkTokensAndPromptPurchase] User has sufficient tokens:', currentTokens);
      return true;
    }

    console.debug('[checkTokensAndPromptPurchase] Insufficient tokens:', {
      currentTokens,
      requiredTokens,
      shortfall: requiredTokens - currentTokens,
    });

    // Show purchase prompt
    Alert.alert(
      'More Credits Needed',
      `You need ${requiredTokens.toLocaleString()} tokens to use ${actionName}.\n\nYou currently have ${currentTokens.toLocaleString()} tokens.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Buy Credits',
          onPress: () => {
            navigation.navigate('CreditsPurchase', {
              minimumCreditsRequired: requiredTokens,
              showCloseButton: true,
            });
          },
        },
      ]
    );

    return false;

  } catch (error) {
    console.error('[checkTokensAndPromptPurchase] Error checking tokens:', error);
    
    Alert.alert(
      'Error',
      'Unable to check your credit balance. Please try again.',
      [{ text: 'OK' }]
    );
    
    return false;
  }
};

export default {
  useTokenBalance,
  checkTokensAndPromptPurchase,
};
