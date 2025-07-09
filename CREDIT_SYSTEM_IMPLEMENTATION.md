# Subscription (Hard Paywall) Implementation

## Overview
The app has been reverted from a **credit-based pay-per-use model** back to a **subscription hard paywall**.  Users must purchase one of three auto-renewable subscriptions to access premium functionality after onboarding.

| Tier | Duration | Price |
|------|----------|-------|
| Weekly  | 1 week  | **$3.99** |
| Monthly | 1 month | **$9.99** |
| Annual  | 1 year  | **$49.99** |

---

## Key Changes

### 🔄 System Architecture
* **Before:** Open access → credits deducted per feature → optional credit top-ups.
* **After:** Onboarding → **Hard Paywall** → active subscription unlocks entire app.

### 🏗️ Technical Implementation

1. **RevenueCat Configuration (`src/config/revenuecat.js`)**
   * Added `SUBSCRIPTION_PRODUCTS` map for the three tiers.
   * Added `ENTITLEMENTS.premium` and helper `getSubscriptionStatus()`.
2. **Subscription Context (`src/contexts/SubscriptionContext.js`)**
   * Already existed – re-enabled in `App.js`.
   * Manages entitlement checks / listener callbacks.
3. **Navigation (`src/navigation/index.js`)**
   * Injects `useSubscription()`.
   * Blocks navigation with `PaywallScreen` until `isSubscribed === true`.
4. **Paywall Screen (`src/screens/PaywallScreen.js`)**
   * Unchanged UI; now the *sole* gateway post-onboarding.
5. **App Root (`App.js`)**
   * Wraps app in `SubscriptionProvider` again.
   * RevenueCat SDK initialised for subscription use.
6. **Removed Files / Code**
   * `CreditsPurchaseScreen`, `creditUtils.js`, etc. remain in repo for potential future use but are no longer referenced in the flow.

---

## User Flow

```text
Authentication → Onboarding → 🚧 HARD PAYWALL 🚧 → Purchase Weekly/Monthly/Annual → Main App
```

* If the user cancels purchase or closes the paywall, they remain blocked.
* Restore purchases is available on Paywall screen.

---

## RevenueCat Dashboard Setup

1. **Products**
   * `shift_subscription_weekly`
   * `shift_subscription_monthly`
   * `shift_subscription_annual`
2. **Entitlement** – `premium`
3. **Offering** – `default`
   * WEEKLY → weekly product
   * MONTHLY → monthly product
   * ANNUAL → annual product (custom package)

Refer to the step-by-step setup guide in the project docs for detailed App Store Connect instructions.

---

## Testing

### Local / Preview (OTA)
* Use `eas update --branch preview` to push JS-only paywall changes to existing dev builds.

### TestFlight / Review
* Build new binary with `eas build --profile production --platform ios`.
* Verify paywall appears on first launch with a sandbox tester that has **no active subscriptions**.
* Perform a test purchase for each tier, ensure entitlement unlocks and navigation proceeds to Home.

---

## Next Steps
1. Prepare updated App Store screenshots of the Paywall (5.5-inch & 6.7-inch).
2. Upload new build to TestFlight and submit for review.
3. Monitor RevenueCat analytics to ensure entitlement activations are tracked correctly.

---

*Last updated:* {{DATE}} 