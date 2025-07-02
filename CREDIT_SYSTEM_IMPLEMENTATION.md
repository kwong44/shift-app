# Credit System Implementation

## Overview
The app has been converted from a **subscription-based hard paywall** to a **credit-based system** using RevenueCat for purchase processing. Users can now access the main app after onboarding and purchase credits when needed for premium features.

## Key Changes

### 🔄 **System Architecture**
- **Before**: Hard paywall blocking all access until subscription
- **After**: Open access with pay-per-use credits for premium features

### 🏗️ **Technical Implementation**

#### RevenueCat Configuration (`src/config/revenuecat.js`)
- Updated products from subscriptions to **consumable credit packages**
- Credit packages: Small (5,000 tokens), Medium (20,000 tokens), Large (50,000 tokens)
- Automatic token addition to user account after purchase

#### Navigation (`src/navigation/index.js`)
- **Removed hard paywall** - users access main app after onboarding
- CreditsPurchaseScreen available as modal when needed
- Removed subscription dependency

#### New Credit Purchase Screen (`src/screens/CreditsPurchaseScreen.js`)
- Beautiful gradient UI matching app theme
- Package selection with token amounts and pricing
- Purchase flow with RevenueCat integration
- Real-time token balance display

#### Credit Utilities (`src/utils/creditUtils.js`)
- `useTokenBalance()` - Hook for current token balance
- `checkTokensAndPromptPurchase()` - Check tokens and show purchase prompt
- Token formatting and conversion utilities

### 🎯 **User Experience Flow**

#### Old Flow (Subscription)
```
Auth → Onboarding → 🚫 HARD PAYWALL → Subscribe → Main App
```

#### New Flow (Credits)
```
Auth → Onboarding → ✅ Main App → Use Features → Buy Credits When Needed
```

## Usage Examples

### Check Tokens Before Feature Use
```javascript
import { checkTokensAndPromptPurchase } from '../utils/creditUtils';

// In AI Coach or other premium feature
const handleAICoachAction = async () => {
  const canProceed = await checkTokensAndPromptPurchase(
    navigation,
    1000, // tokens required
    'AI Coach conversation'
  );
  
  if (canProceed) {
    // Proceed with feature
    startAICoachChat();
  }
  // If not enough tokens, user will see purchase prompt automatically
};
```

### Show Token Balance
```javascript
import { useTokenBalance, formatTokens } from '../utils/creditUtils';

const MyComponent = () => {
  const { tokens, loading, refreshTokens } = useTokenBalance();
  
  return (
    <Text>Balance: {formatTokens(tokens)}</Text>
  );
};
```

### Navigate to Credit Purchase
```javascript
// From any screen
navigation.navigate('CreditsPurchase', {
  minimumCreditsRequired: 1000,
  showCloseButton: true,
});
```

## RevenueCat Configuration Required

### 1. Product Setup (App Store Connect/Google Play)
Create these consumable products:
- `shift_credits_small` - $1.99 - 5,000 tokens
- `shift_credits_medium` - $6.99 - 20,000 tokens  
- `shift_credits_large` - $14.99 - 50,000 tokens

### 2. RevenueCat Dashboard
- Create credit offerings with above products
- Configure entitlements (not needed for consumables)
- Set up API keys in `src/config/revenuecat.js`

### 3. API Keys Setup
Replace placeholders in `src/config/revenuecat.js`:
```javascript
export const REVENUECAT_CONFIG = {
  ios: {
    apiKey: 'appl_YOUR_ACTUAL_IOS_KEY', // Replace this
  },
  android: {
    apiKey: 'goog_YOUR_ACTUAL_ANDROID_KEY', // Replace this
  },
};
```

## Credit System Benefits

### ✅ **Advantages**
- **Lower barrier to entry** - Users can try the app before purchasing
- **Pay-per-use model** - More flexible than fixed subscriptions  
- **Better conversion** - Users see value before being asked to pay
- **Transparent pricing** - Clear cost per feature usage
- **No recurring billing** - One-time purchases reduce churn

### ⚖️ **Considerations**
- Requires careful token balance management
- Need to implement token checks before premium features
- Revenue may be less predictable than subscriptions

## Next Steps

1. **Replace API keys** with actual RevenueCat keys
2. **Create App Store products** matching the configuration
3. **Update token costs** for each feature based on actual usage
4. **Add token balance displays** throughout the app
5. **Implement token checks** before AI Coach and other premium features

## Testing

### With Expo Go
- RevenueCat runs in "Preview API mode"
- Purchase flows work but no actual charges
- Test UI and navigation flows

### With Development Build
- Full RevenueCat functionality
- Real purchase testing with sandbox accounts
- Test actual token addition to user accounts

## Files Modified

- `src/config/revenuecat.js` - Updated for credit products
- `src/navigation/index.js` - Removed hard paywall
- `src/screens/CreditsPurchaseScreen.js` - New credit purchase UI
- `src/utils/creditUtils.js` - Credit management utilities
- `App.js` - Removed SubscriptionProvider
- `src/contexts/SubscriptionContext.js` - No longer used

The credit system is now ready for testing and can be easily extended with additional features and token costs as needed. 