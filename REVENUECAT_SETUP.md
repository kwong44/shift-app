# RevenueCat Hard Paywall Setup Guide

This guide will help you configure RevenueCat for your Shift app to implement a hard paywall that blocks access to all premium features until users subscribe.

## Prerequisites

1. **RevenueCat Account**: Create a free account at [https://app.revenuecat.com](https://app.revenuecat.com)
2. **App Store Connect Account** (iOS) or **Google Play Console** (Android)
3. **Products configured** in your app store

## Step 1: RevenueCat Dashboard Setup

### 1.1 Create a New Project
1. Log into RevenueCat dashboard
2. Click "Create new project" 
3. Enter your app name: "Shift - Life Transformation"
4. Choose your platform(s): iOS and/or Android

### 1.2 Configure Platforms
1. Go to **Project Settings > Platforms**
2. For iOS:
   - Enter your Bundle ID (from your app.json)
   - Upload your App Store Connect API Key
3. For Android:
   - Enter your Package Name 
   - Upload your Google Play Service Account credentials

### 1.3 Get API Keys
1. In **Project Settings > API Keys**
2. Copy your platform-specific API keys:
   - iOS: `appl_xxxxxxxxxxxxxxxx`
   - Android: `goog_xxxxxxxxxxxxxxxx`

## Step 2: App Store Product Configuration

### 2.1 Create Subscription Products

In App Store Connect (iOS) or Google Play Console (Android), create these products:

**Recommended Products:**
- `shift_premium_monthly` - $9.99/month
- `shift_premium_annual` - $99.99/year (best value)
- `shift_premium_weekly` - $2.99/week (for testing)

### 2.2 Configure Products in RevenueCat

1. Go to **Products** in RevenueCat dashboard
2. Add each product with:
   - Product ID (must match app store)
   - Display name
   - Description

## Step 3: Configure Entitlements and Offerings

### 3.1 Create Entitlement
1. Go to **Entitlements** 
2. Create entitlement: `premium_access`
3. Attach all your subscription products to this entitlement

### 3.2 Create Offering
1. Go to **Offerings**
2. Create offering: `default_offering`
3. Add packages:
   - Annual package (recommended)
   - Monthly package  
   - Weekly package (optional)

## Step 4: Update App Configuration

### 4.1 Update API Keys

Edit `src/config/revenuecat.js` and replace the placeholder API keys:

```javascript
export const REVENUECAT_CONFIG = {
  ios: {
    apiKey: 'appl_YOUR_ACTUAL_IOS_API_KEY_HERE', // Replace this
  },
  android: {
    apiKey: 'goog_YOUR_ACTUAL_ANDROID_API_KEY_HERE', // Replace this
  },
  // ... rest of config
};
```

### 4.2 Update Product IDs

Ensure your product IDs in `SUBSCRIPTION_PRODUCTS` match exactly what you created in the app stores:

```javascript
export const SUBSCRIPTION_PRODUCTS = {
  monthly: {
    productId: 'shift_premium_monthly', // Must match App Store Connect
    // ...
  },
  annual: {
    productId: 'shift_premium_annual', // Must match App Store Connect  
    // ...
  },
};
```

### 4.3 Update Entitlement Names

Make sure `ENTITLEMENTS.premium` matches your RevenueCat entitlement:

```javascript
export const ENTITLEMENTS = {
  premium: 'premium_access', // Must match RevenueCat dashboard
};
```

## Step 5: Test the Integration

### 5.1 Test Environment Setup

1. **iOS Testing:**
   - Use TestFlight or Simulator
   - Create test user in App Store Connect
   - Enable sandbox testing

2. **Android Testing:**
   - Use internal testing track in Play Console
   - Add test accounts

### 5.2 Test Flow

1. **Authentication**: Sign up/sign in to app
2. **Onboarding**: Complete onboarding process  
3. **Paywall**: Should see paywall blocking app access
4. **Purchase**: Test subscription purchase
5. **Access**: Verify full app access after purchase
6. **Restore**: Test purchase restoration

### 5.3 Debug Logs

Monitor debug logs for RevenueCat operations:
- `[RevenueCat]` - SDK operations
- `[SubscriptionContext]` - Subscription state changes
- `[PaywallScreen]` - Paywall interactions

## Step 6: Hard Paywall Behavior

### 6.1 User Flow
1. **Free Users**: Blocked at paywall after onboarding
2. **Subscribers**: Full access to all features
3. **Expired Subscriptions**: Redirected back to paywall

### 6.2 Features Requiring Premium
- All AI Coach conversations
- All exercises and content
- Progress analytics  
- Offline access
- Priority support

### 6.3 Navigation Flow
```
Auth → Onboarding → Paywall (if not subscribed) → Main App (if subscribed)
```

## Step 7: Production Deployment

### 7.1 Pre-Launch Checklist
- [ ] API keys configured correctly
- [ ] Products created in app stores
- [ ] Entitlements configured in RevenueCat
- [ ] Test purchases working
- [ ] Restore purchases working
- [ ] Hard paywall blocking correctly

### 7.2 App Store Review
- Ensure paywall provides clear value proposition
- Include restore purchases functionality
- Test with real App Store products
- Follow platform subscription guidelines

### 7.3 Monitoring
- Monitor RevenueCat dashboard for subscription metrics
- Track conversion rates from paywall
- Monitor customer support for subscription issues

## Troubleshooting

### Common Issues

1. **"No products available"**
   - Check product IDs match exactly
   - Verify products are approved in app store
   - Ensure API keys are correct

2. **"Purchase failed"**
   - Check test account setup
   - Verify app store credentials
   - Check RevenueCat webhook configuration

3. **"Paywall not showing"**
   - Check subscription context initialization
   - Verify navigation logic
   - Check debug logs for subscription status

### Debug Commands

```bash
# Check Metro bundler logs
npx expo start

# Check device logs (iOS)
xcrun simctl spawn booted log stream --predicate 'process CONTAINS "Expo"'

# Check device logs (Android)
adb logcat | grep -i revenuecat
```

## Support

- **RevenueCat Docs**: https://docs.revenuecat.com
- **RevenueCat Support**: https://support.revenuecat.com
- **App Implementation**: Check `src/config/revenuecat.js` for configuration
- **Debug Logs**: Enable debug mode in development for detailed logging

## Security Notes

⚠️ **Important**: 
- Never commit real API keys to version control
- Use environment variables for production keys
- Test thoroughly before releasing to production
- Monitor for subscription fraud and abuse 