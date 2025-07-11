/**
 * Hard Paywall Screen
 * 
 * This screen blocks access to the main app and requires users to subscribe
 * to continue using premium features. Uses RevenueCat for subscription management.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  Button,
  Card,
  Title,
  Paragraph,
  Chip,
  Divider,
  IconButton,
  RadioButton,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Purchases from 'react-native-purchases';
import { useSubscription } from '../contexts/SubscriptionContext';

console.debug('[PaywallScreen] Screen module loaded');

/**
 * Main Paywall Screen Component
 */
const PaywallScreen = ({ navigation }) => {
  const theme = useTheme();
  const { handlePurchaseComplete, handleRestoreComplete } = useSubscription();
  
  // Component state
  const [offerings, setOfferings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  console.debug('[PaywallScreen] Component initialized');

  /**
   * Load available subscription offerings from RevenueCat
   */
  const loadOfferings = async () => {
    try {
      console.debug('[PaywallScreen] Loading offerings from RevenueCat');
      setLoading(true);
      
      const offerings = await Purchases.getOfferings();
      
      if (offerings.current) {
        setOfferings(offerings);
        
        // Auto-select the annual package as recommended
        const annualPackage = offerings.current.availablePackages.find(
          pkg => pkg.packageType === Purchases.PACKAGE_TYPE.ANNUAL
        );
        
        if (annualPackage) {
          setSelectedPackage(annualPackage);
          console.debug('[PaywallScreen] Auto-selected annual package');
        } else if (offerings.current.availablePackages.length > 0) {
          setSelectedPackage(offerings.current.availablePackages[0]);
          console.debug('[PaywallScreen] Auto-selected first available package');
        }
        
        console.debug('[PaywallScreen] Offerings loaded successfully:', {
          offeringId: offerings.current.identifier,
          packageCount: offerings.current.availablePackages.length,
        });
      } else {
        console.warn('[PaywallScreen] No current offering available');
        Alert.alert(
          'Error',
          'Unable to load subscription options. Please try again later.',
        );
      }
    } catch (error) {
      console.error('[PaywallScreen] Error loading offerings:', error);
      Alert.alert(
        'Error',
        'Failed to load subscription options. Please check your connection and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle subscription purchase
   */
  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert('Error', 'Please select a subscription option');
      return;
    }

    try {
      console.debug('[PaywallScreen] Starting purchase process:', {
        packageId: selectedPackage.identifier,
        productId: selectedPackage.product.identifier,
      });
      
      setPurchasing(true);
      
      const purchaseResult = await Purchases.purchasePackage(selectedPackage);
      
      console.debug('[PaywallScreen] Purchase completed successfully');
      
      // Update subscription context
      handlePurchaseComplete(purchaseResult);
      
      // Show success message
      Alert.alert(
        'Welcome to Premium!',
        'Your subscription is now active. Enjoy unlimited access to all features!',
        [
          {
            text: 'Get Started',
            onPress: () => {
              // The subscription context will automatically update and navigation will change
              console.debug('[PaywallScreen] User confirmed subscription success');
            },
          },
        ]
      );
      
    } catch (error) {
      console.error('[PaywallScreen] Purchase failed:', error);
      
      // Handle specific error cases
      if (error.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED) {
        console.debug('[PaywallScreen] Purchase was cancelled by user');
        // Don't show error for user cancellation
        return;
      }
      
      // Show error for other cases
      Alert.alert(
        'Purchase Failed',
        'We couldn\'t complete your purchase. Please try again or contact support if the problem persists.',
        [{ text: 'OK' }]
      );
    } finally {
      setPurchasing(false);
    }
  };

  /**
   * Handle restore purchases
   */
  const handleRestore = async () => {
    try {
      console.debug('[PaywallScreen] Starting restore process');
      setRestoring(true);
      
      const restoreResult = await Purchases.restorePurchases();
      
      // Update subscription context
      handleRestoreComplete(restoreResult);
      
      const hasActiveEntitlements = Object.keys(restoreResult.entitlements.active).length > 0;
      
      if (hasActiveEntitlements) {
        console.debug('[PaywallScreen] Purchases restored successfully');
        Alert.alert(
          'Purchases Restored',
          'Your previous purchases have been restored successfully!',
        );
      } else {
        console.debug('[PaywallScreen] No active purchases found to restore');
        Alert.alert(
          'No Purchases Found',
          'We couldn\'t find any previous purchases to restore for this account.',
        );
      }
      
    } catch (error) {
      console.error('[PaywallScreen] Restore failed:', error);
      Alert.alert(
        'Restore Failed',
        'We couldn\'t restore your purchases. Please try again or contact support.',
      );
    } finally {
      setRestoring(false);
    }
  };

  /**
   * Get display price for a package
   */
  const getPackagePrice = (pkg) => {
    if (Platform.OS === 'ios') {
      return pkg.product.priceString || pkg.product.price || 'N/A';
    }
    return pkg.product.price_string || pkg.product.price || 'N/A';
  };

  /**
   * Get package savings text
   */
  const getPackageSavings = (pkg) => {
    // Show a 19% discount badge for the annual plan (matches marketing copy)
    if (pkg.packageType === Purchases.PACKAGE_TYPE.ANNUAL) {
      return '19% OFF';
    }
    return null;
  };

  /**
   * Format package duration
   */
  const getPackageDuration = (pkg) => {
    switch (pkg.packageType) {
      case Purchases.PACKAGE_TYPE.WEEKLY:
        return 'per week';
      case Purchases.PACKAGE_TYPE.MONTHLY:
        return 'per month';
      case Purchases.PACKAGE_TYPE.ANNUAL:
        return 'per year';
      default:
        return '';
    }
  };

  /**
   * Get suffix to append after the price (e.g. /wk, /mo, /yr)
   */
  const getPriceSuffix = (pkg) => {
    switch (pkg.packageType) {
      case Purchases.PACKAGE_TYPE.WEEKLY:
        return '/wk';
      case Purchases.PACKAGE_TYPE.MONTHLY:
        return '/mo';
      case Purchases.PACKAGE_TYPE.ANNUAL:
        return '/yr';
      default:
        return '';
    }
  };

  // Load offerings on component mount
  useEffect(() => {
    loadOfferings();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading subscription options...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if no offerings
  if (!offerings?.current) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <IconButton
            icon="alert-circle"
            size={64}
            iconColor={theme.colors.error}
          />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Unable to Load
          </Text>
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            We couldn't load subscription options. Please check your connection and try again.
          </Text>
          <Button mode="contained" onPress={loadOfferings} style={styles.retryButton}>
            Try Again
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Headline */}
        <Text style={styles.headline}>Shift</Text>
        <Text style={styles.tagline}>Transform your life</Text>

        {/* Illustration */}
        <Image
          source={require('../../assets/shift-icon-transparent.png')}
          style={styles.illustration}
          resizeMode="contain"
        />

        {/* Subscription plans */}
        <View style={styles.plansWrapper}>
          {offerings.current.availablePackages.map((pkg) => {
            const isSelected = selectedPackage?.identifier === pkg.identifier;
            const savings = getPackageSavings(pkg);

            return (
              <TouchableOpacity
                key={pkg.identifier}
                style={[styles.planRow, isSelected && styles.planRowSelected]}
                onPress={() => setSelectedPackage(pkg)}
                activeOpacity={0.9}
              >
                <RadioButton
                  value={pkg.identifier}
                  status={isSelected ? 'checked' : 'unchecked'}
                  onPress={() => setSelectedPackage(pkg)}
                  color={theme.colors.primary}
                />

                <View style={styles.planInfo}>
                  <Text style={styles.planTitle}>
                    {pkg.packageType === Purchases.PACKAGE_TYPE.ANNUAL
                      ? 'Annual'
                      : pkg.packageType === Purchases.PACKAGE_TYPE.MONTHLY
                      ? 'Monthly'
                      : 'Weekly'}
                  </Text>
                  <Text style={styles.planSubTitle}>
                    {pkg.packageType === Purchases.PACKAGE_TYPE.ANNUAL
                      ? '12 mo'
                      : pkg.packageType === Purchases.PACKAGE_TYPE.MONTHLY
                      ? '1 mo'
                      : '1 wk'}{' '}
                    • {getPackagePrice(pkg)}
                  </Text>
                </View>

                <View style={styles.priceColumn}>
                  <Text style={styles.planPrice}>
                    {getPackagePrice(pkg)}{getPriceSuffix(pkg)}
                  </Text>
                  {savings && (
                    <Chip
                      compact
                      mode="flat"
                      style={[styles.discountChip, { backgroundColor: theme.colors.primary }]}
                      textStyle={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}
                    >
                      {savings}
                    </Chip>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Continue Button */}
        <Button
          mode="contained"
          onPress={handlePurchase}
          loading={purchasing}
          disabled={purchasing || !selectedPackage}
          style={styles.continueButton}
          labelStyle={styles.continueButtonLabel}
        >
          {purchasing ? 'Processing…' : 'Continue'}
        </Button>

        {/* Restore */}
        <TouchableOpacity onPress={handleRestore} disabled={restoring}>
          <Text style={styles.restoreText}>
            {restoring ? 'Restoring…' : 'Restore purchases'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    marginTop: 16,
  },
  header: {
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresCard: {
    margin: 16,
    marginBottom: 8,
  },
  featuresTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    margin: 0,
    marginRight: 8,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
  },
  packagesContainer: {
    padding: 16,
    paddingTop: 8,
  },
  packagesTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  packageCard: {
    marginBottom: 12,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  packageInfo: {
    flex: 1,
    marginRight: 16,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  savingsChip: {
    alignSelf: 'flex-start',
  },
  packagePricing: {
    alignItems: 'flex-end',
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  packageDuration: {
    fontSize: 14,
    opacity: 0.7,
  },
  packageDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  purchaseContainer: {
    padding: 16,
    paddingTop: 8,
  },
  purchaseButton: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  restoreButton: {
    marginBottom: 8,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C4C4C4',
    marginHorizontal: 3,
  },
  dotActive: {
    width: 10,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#707070',
  },
  contentContainer: {
    padding: 24,
    alignItems: 'center',
  },
  headline: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6e6e6e',
    marginTop: 4,
  },
  illustration: {
    width: '80%',
    height: 200,
    marginVertical: 24,
  },
  plansWrapper: {
    width: '100%',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  planRowSelected: {
    borderColor: '#00C27A', // highlight green border
  },
  planInfo: {
    flex: 1,
    marginHorizontal: 8,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  planSubTitle: {
    fontSize: 14,
    color: '#6e6e6e',
    marginTop: 2,
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  discountChip: {
    marginTop: 4,
  },
  continueButton: {
    width: '100%',
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  continueButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  restoreText: {
    marginTop: 12,
    textAlign: 'center',
    color: '#6e6e6e',
  },
});

export default PaywallScreen; 