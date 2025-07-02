/**
 * RevenueCat Configuration
 * 
 * This file configures RevenueCat SDK for subscription management
 * and defines subscription products and entitlements.
 * 
 * @see https://www.revenuecat.com/docs/getting-started/quickstart
 */

import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

// Debug logging for RevenueCat operations
console.debug('[RevenueCat] Configuration module loaded');

/**
 * RevenueCat API Keys Configuration
 * NOTE: Replace these with your actual API keys from RevenueCat Dashboard
 * Get your API keys from: Project Settings > API Keys
 */
export const REVENUECAT_CONFIG = {
  // iOS App Store API Key
  ios: {
    apiKey: 'appl_YOUR_IOS_API_KEY_HERE', // Replace with your iOS API key
  },
  
  // Google Play Store API Key  
  android: {
    apiKey: 'goog_YOUR_ANDROID_API_KEY_HERE', // Replace with your Android API key
  },
  
  // Amazon Appstore API Key (optional)
  amazon: {
    apiKey: 'amzn_YOUR_AMAZON_API_KEY_HERE', // Replace with your Amazon API key
  },
  
  // Enable debug logging for development
  debugLogsEnabled: __DEV__,
  
  // User identification settings
  allowSharingAppStoreAccount: false, // Set to true if you want to allow account sharing
};

/**
 * Credit Products Configuration  
 * These should match your consumable products configured in RevenueCat Dashboard and App Store Connect/Google Play
 * Using consumable purchases for credit/token system
 */
export const CREDIT_PRODUCTS = {
  // Small credit package
  small: {
    productId: 'shift_credits_small',
    displayName: '5 Credits',
    description: '5,000 tokens for AI Coach conversations',
    tokens: 5000,
    price: '$1.99',
    bestFor: 'Try it out',
  },
  
  // Medium credit package (most popular)
  medium: {
    productId: 'shift_credits_medium', 
    displayName: '20 Credits',
    description: '20,000 tokens - Most Popular!',
    tokens: 20000,
    price: '$6.99',
    savings: 'Best Value',
    bestFor: 'Regular users',
  },
  
  // Large credit package
  large: {
    productId: 'shift_credits_large',
    displayName: '50 Credits', 
    description: '50,000 tokens - Premium pack',
    tokens: 50000,
    price: '$14.99',
    bestFor: 'Power users',
  },
};

/**
 * Credit System Configuration
 * For credit-based system, we primarily track purchases rather than entitlements
 */
export const CREDIT_CONFIG = {
  // Free tokens for new users
  initialFreeTokens: 10000,
  
  // Warnings and thresholds
  lowBalanceThreshold: 2000,
  
  // Conversion rate for display
  tokensPerCredit: 1000,
  
  // Minimum tokens required for a conversation
  minTokensRequired: 1000,
};

/**
 * Offering Configuration
 * Offerings let you group credit products and control them remotely from RevenueCat Dashboard
 */
export const OFFERINGS = {
  default: 'credits_offering', // Main credit offering shown to users
  lowBalance: 'low_balance_offering', // Special offering when credits are low
  welcome: 'welcome_credits_offering', // For new users
};

/**
 * Initialize RevenueCat SDK
 * Call this early in your app lifecycle (App.js)
 * 
 * @param {string} appUserID - Optional user ID to identify the user
 * @returns {Promise<void>}
 */
export const initializeRevenueCat = async (appUserID = null) => {
  try {
    console.debug('[RevenueCat] Initializing SDK');

    if (REVENUECAT_CONFIG.debugLogsEnabled) {
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    }

    if (Platform.OS === 'ios') {
      await Purchases.configure({
        apiKey: REVENUECAT_CONFIG.ios.apiKey,
        appUserID: appUserID,
      });
    } else if (Platform.OS === 'android') {
      await Purchases.configure({
        apiKey: REVENUECAT_CONFIG.android.apiKey,
        appUserID: appUserID,
      });
    }

    console.debug('[RevenueCat] SDK initialized successfully');
  } catch (error) {
    console.error('[RevenueCat] Failed to initialize:', error);
    throw error;
  }
};

/**
 * Get RevenueCat customer info for credit tracking
 * 
 * @returns {Promise<{customerInfo: Object, purchaseHistory: Array}>}
 */
export const getCreditCustomerInfo = async () => {
  try {
    console.debug('[RevenueCat] Fetching customer info for credit tracking');
    
    const customerInfo = await Purchases.getCustomerInfo();
    
    // Get purchase history for credit tracking
    const creditPurchases = Object.values(customerInfo.nonSubscriptionTransactions || {});
    
    console.debug('[RevenueCat] Credit customer info retrieved:', {
      purchaseCount: creditPurchases.length,
      latestPurchase: creditPurchases[0]?.productIdentifier,
    });
    
    return {
      customerInfo,
      purchaseHistory: creditPurchases,
    };
  } catch (error) {
    console.error('[RevenueCat] Error fetching customer info:', error);
    return {
      customerInfo: null,
      purchaseHistory: [],
    };
  }
};

/**
 * Get available offerings/products for purchase
 * 
 * @returns {Promise<Object>} Available offerings
 */
export const getAvailableOfferings = async () => {
  try {
    console.debug('[RevenueCat] Fetching available offerings');
    
    const offerings = await Purchases.getOfferings();
    
    if (offerings.current) {
      console.debug('[RevenueCat] Available packages:', {
        offeringId: offerings.current.identifier,
        packageCount: offerings.current.availablePackages.length,
        packages: offerings.current.availablePackages.map(pkg => ({
          identifier: pkg.identifier,
          packageType: pkg.packageType,
          product: {
            identifier: pkg.product.identifier,
            price: pkg.product.price,
            title: pkg.product.title,
          }
        }))
      });
    } else {
      console.warn('[RevenueCat] No current offering available');
    }

    return offerings;
    
  } catch (error) {
    console.error('[RevenueCat] Error fetching offerings:', error);
    throw new Error(`Failed to fetch offerings: ${error.message}`);
  }
};

/**
 * Make a credit purchase
 * 
 * @param {Object} packageToPurchase - The RevenueCat package to purchase
 * @param {Function} onTokensAdded - Callback to add tokens to user's account
 * @returns {Promise<Object>} Purchase result
 */
export const purchaseCredits = async (packageToPurchase, onTokensAdded = null) => {
  try {
    console.debug('[RevenueCat] Starting credit purchase process:', {
      packageId: packageToPurchase.identifier,
      productId: packageToPurchase.product.identifier,
      price: packageToPurchase.product.price,
    });

    const purchaseResult = await Purchases.purchasePackage(packageToPurchase);
    
    // Determine tokens to add based on product ID
    const productId = purchaseResult.productIdentifier;
    let tokensToAdd = 0;
    let creditPackage = null;
    
    // Find matching credit package
    Object.values(CREDIT_PRODUCTS).forEach(pkg => {
      if (pkg.productId === productId) {
        tokensToAdd = pkg.tokens;
        creditPackage = pkg;
      }
    });
    
    console.debug('[RevenueCat] Credit purchase completed:', {
      customerInfo: !!purchaseResult.customerInfo,
      productIdentifier: productId,
      tokensToAdd,
      creditPackage: creditPackage?.displayName,
    });

    // Call token addition callback if provided
    if (onTokensAdded && tokensToAdd > 0) {
      try {
        await onTokensAdded(tokensToAdd, creditPackage);
        console.debug('[RevenueCat] Tokens successfully added to user account:', tokensToAdd);
      } catch (tokenError) {
        console.error('[RevenueCat] Failed to add tokens to account:', tokenError);
        // Purchase succeeded but token addition failed - this needs handling
      }
    }

    return {
      success: true,
      customerInfo: purchaseResult.customerInfo,
      productIdentifier: productId,
      tokensAdded: tokensToAdd,
      creditPackage,
    };
    
  } catch (error) {
    console.error('[RevenueCat] Credit purchase failed:', error);
    
    // Handle specific error cases
    if (error.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED) {
      console.debug('[RevenueCat] Credit purchase was cancelled by user');
      return {
        success: false,
        cancelled: true,
        error: 'Purchase was cancelled',
      };
    }
    
    return {
      success: false,
      cancelled: false,
      error: error.message,
    };
  }
};

/**
 * Make a purchase (legacy function - use purchaseCredits for credit system)
 * 
 * @param {Object} packageToPurchase - The RevenueCat package to purchase
 * @returns {Promise<Object>} Purchase result
 */
export const makePurchase = async (packageToPurchase) => {
  return purchaseCredits(packageToPurchase);
};

/**
 * Restore credit purchases for existing customers
 * This will sync non-subscription transactions but won't re-add tokens automatically
 * 
 * @returns {Promise<Object>} Restore result
 */
export const restoreCreditPurchases = async () => {
  try {
    console.debug('[RevenueCat] Restoring credit purchases');
    
    const customerInfo = await Purchases.restorePurchases();
    
    const creditTransactions = Object.values(customerInfo.nonSubscriptionTransactions || {});
    
    console.debug('[RevenueCat] Credit purchases restored:', {
      transactionCount: creditTransactions.length,
      transactions: creditTransactions.map(tx => ({
        productId: tx.productIdentifier,
        purchaseDate: tx.purchaseDate,
      })),
    });

    return {
      success: true,
      customerInfo,
      creditTransactions,
    };
    
  } catch (error) {
    console.error('[RevenueCat] Error restoring credit purchases:', error);
    
    return {
      success: false,
      error: error.message,
    };
  }
};

// Legacy alias for backward compatibility
export const restorePurchases = restoreCreditPurchases;

export default {
  REVENUECAT_CONFIG,
  CREDIT_PRODUCTS,
  CREDIT_CONFIG,
  OFFERINGS,
  initializeRevenueCat,
  getCreditCustomerInfo,
  getAvailableOfferings,
  purchaseCredits,
  makePurchase, // Legacy alias
  restoreCreditPurchases,
  restorePurchases, // Legacy alias
}; 