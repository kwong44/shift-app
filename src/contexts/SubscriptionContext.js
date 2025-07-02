/**
 * Subscription Context
 * 
 * Manages subscription state and provides subscription-related functionality
 * throughout the app using RevenueCat SDK.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Purchases from 'react-native-purchases';
import { getSubscriptionStatus, ENTITLEMENTS } from '../config/revenuecat';

console.debug('[SubscriptionContext] Context module loaded');

// Create the subscription context
const SubscriptionContext = createContext();

/**
 * Custom hook to use subscription context
 * @returns {Object} Subscription context value
 */
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

/**
 * Subscription Provider Component
 * Wraps the app to provide subscription state management
 */
export const SubscriptionProvider = ({ children }) => {
  // Subscription state
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  console.debug('[SubscriptionContext] Provider initialized');

  /**
   * Check subscription status from RevenueCat
   * @param {boolean} forceRefresh - Force refresh from server
   */
  const checkSubscriptionStatus = useCallback(async (forceRefresh = false) => {
    try {
      console.debug('[SubscriptionContext] Checking subscription status', { forceRefresh });
      
      setIsLoading(true);
      setSubscriptionError(null);

      // Get customer info from RevenueCat
      let customerInfo;
      if (forceRefresh) {
        // Force refresh from RevenueCat servers
        customerInfo = await Purchases.getCustomerInfo();
      } else {
        // Use cached version if available
        const status = await getSubscriptionStatus();
        customerInfo = status.customerInfo;
        setIsSubscribed(status.isSubscribed);
      }

      if (customerInfo) {
        setCustomerInfo(customerInfo);
        
        // Check premium entitlement
        const hasActivePremium = customerInfo.entitlements.active[ENTITLEMENTS.premium] !== undefined;
        setIsSubscribed(hasActivePremium);
        
        console.debug('[SubscriptionContext] Subscription status updated:', {
          isSubscribed: hasActivePremium,
          activeEntitlements: Object.keys(customerInfo.entitlements.active),
          latestExpirationDate: customerInfo.latestExpirationDate,
        });
      }

      setLastChecked(new Date());
      
    } catch (error) {
      console.error('[SubscriptionContext] Error checking subscription:', error);
      setSubscriptionError(error.message);
      
      // On error, assume no subscription for safety
      setIsSubscribed(false);
      setCustomerInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle purchase completion
   * @param {Object} purchaseResult - Result from RevenueCat purchase
   */
  const handlePurchaseComplete = useCallback((purchaseResult) => {
    console.debug('[SubscriptionContext] Purchase completed:', purchaseResult);
    
    if (purchaseResult.customerInfo) {
      setCustomerInfo(purchaseResult.customerInfo);
      
      // Check if premium entitlement is now active
      const hasActivePremium = purchaseResult.customerInfo.entitlements.active[ENTITLEMENTS.premium] !== undefined;
      setIsSubscribed(hasActivePremium);
      
      console.debug('[SubscriptionContext] Subscription status after purchase:', {
        isSubscribed: hasActivePremium,
        productIdentifier: purchaseResult.productIdentifier,
      });
    }
  }, []);

  /**
   * Handle restore purchases completion
   * @param {Object} restoreResult - Result from RevenueCat restore
   */
  const handleRestoreComplete = useCallback((restoreResult) => {
    console.debug('[SubscriptionContext] Restore completed:', restoreResult);
    
    if (restoreResult.customerInfo) {
      setCustomerInfo(restoreResult.customerInfo);
      
      // Check if premium entitlement is active after restore
      const hasActivePremium = restoreResult.customerInfo.entitlements.active[ENTITLEMENTS.premium] !== undefined;
      setIsSubscribed(hasActivePremium);
      
      console.debug('[SubscriptionContext] Subscription status after restore:', {
        isSubscribed: hasActivePremium,
        hasActiveEntitlements: restoreResult.hasActiveEntitlements,
      });
    }
  }, []);

  /**
   * Check if user has access to a specific feature
   * @param {string} entitlement - The entitlement to check
   * @returns {boolean} Whether user has access
   */
  const hasEntitlement = useCallback((entitlement) => {
    if (!customerInfo) return false;
    
    const hasAccess = customerInfo.entitlements.active[entitlement] !== undefined;
    console.debug('[SubscriptionContext] Checking entitlement:', { entitlement, hasAccess });
    
    return hasAccess;
  }, [customerInfo]);

  /**
   * Get subscription expiration info
   * @returns {Object} Expiration information
   */
  const getSubscriptionInfo = useCallback(() => {
    if (!customerInfo || !isSubscribed) {
      return {
        isActive: false,
        expirationDate: null,
        willRenew: false,
        productIdentifier: null,
      };
    }

    const premiumEntitlement = customerInfo.entitlements.active[ENTITLEMENTS.premium];
    
    return {
      isActive: true,
      expirationDate: premiumEntitlement?.expirationDate,
      willRenew: premiumEntitlement?.willRenew || false,
      productIdentifier: premiumEntitlement?.productIdentifier,
      originalPurchaseDate: premiumEntitlement?.originalPurchaseDate,
    };
  }, [customerInfo, isSubscribed]);

  // Set up RevenueCat listeners for real-time updates
  useEffect(() => {
    console.debug('[SubscriptionContext] Setting up RevenueCat listeners');
    
    // Listen for customer info updates
    const customerInfoUpdateListener = (customerInfo) => {
      console.debug('[SubscriptionContext] Customer info updated from RevenueCat');
      setCustomerInfo(customerInfo);
      
      const hasActivePremium = customerInfo.entitlements.active[ENTITLEMENTS.premium] !== undefined;
      setIsSubscribed(hasActivePremium);
    };

    // Add the listener
    Purchases.addCustomerInfoUpdateListener(customerInfoUpdateListener);

    // Initial subscription check
    checkSubscriptionStatus(false);

    // Cleanup listener on unmount
    return () => {
      console.debug('[SubscriptionContext] Cleaning up RevenueCat listeners');
      Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateListener);
    };
  }, [checkSubscriptionStatus]);

  // Context value
  const contextValue = {
    // Subscription state
    isSubscribed,
    customerInfo,
    isLoading,
    subscriptionError,
    lastChecked,
    
    // Methods
    checkSubscriptionStatus,
    handlePurchaseComplete,
    handleRestoreComplete,
    hasEntitlement,
    getSubscriptionInfo,
    
    // Convenience methods
    refreshSubscription: () => checkSubscriptionStatus(true),
    isPremiumUser: isSubscribed,
  };

  console.debug('[SubscriptionContext] Provider rendering with state:', {
    isSubscribed,
    isLoading,
    hasError: !!subscriptionError,
    lastChecked,
  });

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext; 