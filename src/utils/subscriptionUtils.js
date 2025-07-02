/**
 * Subscription Utilities
 * 
 * Helper functions for managing subscription checks and premium feature access
 * throughout the app. These utilities work with RevenueCat and the subscription context.
 */

import { useSubscription } from '../contexts/SubscriptionContext';
import { ENTITLEMENTS } from '../config/revenuecat';

console.debug('[SubscriptionUtils] Utilities module loaded');

/**
 * Custom hook to check if user has premium access
 * @returns {Object} Premium access status and methods
 */
export const usePremiumAccess = () => {
  const { isSubscribed, isLoading, hasEntitlement } = useSubscription();
  
  return {
    isPremium: isSubscribed,
    isLoading,
    hasAICoachAccess: () => hasEntitlement(ENTITLEMENTS.premium),
    requiresPremium: !isSubscribed,
    canAccessFeature: () => isSubscribed,
  };
};

/**
 * Higher-order component to protect premium features
 * Wraps components that require premium access
 * 
 * @param {React.Component} WrappedComponent - Component to protect
 * @param {Object} options - Protection options
 * @returns {React.Component} Protected component
 */
export const withPremiumAccess = (WrappedComponent, options = {}) => {
  const {
    fallbackComponent = null,
    showUpgrade = true,
    featureName = 'this feature',
  } = options;

  return (props) => {
    const { isPremium, isLoading } = usePremiumAccess();
    
    console.debug('[SubscriptionUtils] Premium access check:', {
      isPremium,
      isLoading,
      featureName,
    });

    // Show loading state
    if (isLoading) {
      return fallbackComponent;
    }

    // Check premium access
    if (!isPremium) {
      console.debug('[SubscriptionUtils] Premium access required for:', featureName);
      
      if (showUpgrade && props.navigation) {
        // Navigate to paywall for upgrade
        props.navigation.navigate('Paywall');
        return null;
      }
      
      return fallbackComponent;
    }

    // User has premium access
    return <WrappedComponent {...props} />;
  };
};

/**
 * Hook to get subscription info for display
 * @returns {Object} Subscription display information
 */
export const useSubscriptionInfo = () => {
  const { isSubscribed, getSubscriptionInfo, isLoading } = useSubscription();
  
  const subscriptionInfo = getSubscriptionInfo();
  
  return {
    isLoading,
    isSubscribed,
    subscriptionInfo,
    displayInfo: {
      status: isSubscribed ? 'Active' : 'Inactive',
      isActive: subscriptionInfo.isActive,
    },
  };
};

/**
 * Validate premium feature access and show appropriate messaging
 * 
 * @param {string} featureName - Name of the feature being accessed
 * @param {Object} navigation - Navigation object for redirecting to paywall
 * @returns {boolean} Whether access is granted
 */
export const validatePremiumAccess = (featureName, navigation) => {
  const { isPremium } = usePremiumAccess();
  
  console.debug('[SubscriptionUtils] Validating premium access for:', featureName);
  
  if (!isPremium) {
    console.debug('[SubscriptionUtils] Premium access denied for:', featureName);
    
    if (navigation) {
      navigation.navigate('Paywall');
    }
    
    return false;
  }
  
  return true;
};

/**
 * Get trial status information
 * @returns {Object} Trial status details
 */
export const useTrialStatus = () => {
  const { customerInfo } = useSubscription();
  
  // Check if user is in trial period
  const isInTrial = customerInfo?.entitlements?.active[ENTITLEMENTS.premium]?.isInIntroOffer || false;
  
  return {
    isInTrial,
    trialDaysRemaining: isInTrial ? calculateTrialDaysRemaining(customerInfo) : 0,
  };
};

/**
 * Calculate remaining trial days
 * @private
 */
const calculateTrialDaysRemaining = (customerInfo) => {
  try {
    const premiumEntitlement = customerInfo.entitlements.active[ENTITLEMENTS.premium];
    if (!premiumEntitlement || !premiumEntitlement.expirationDate) return 0;
    
    const expirationDate = new Date(premiumEntitlement.expirationDate);
    const currentDate = new Date();
    const timeDiff = expirationDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return Math.max(0, daysDiff);
  } catch (error) {
    console.error('[SubscriptionUtils] Error calculating trial days:', error);
    return 0;
  }
};

export default {
  usePremiumAccess,
  withPremiumAccess,
  useSubscriptionInfo,
  validatePremiumAccess,
  useTrialStatus,
}; 