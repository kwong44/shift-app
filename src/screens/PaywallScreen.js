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
} from 'react-native';
import {
  Button,
  Card,
  Title,
  Paragraph,
  Chip,
  Divider,
  IconButton,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
      return pkg.product.price || 'N/A';
    }
    return pkg.product.price_string || pkg.product.price || 'N/A';
  };

  /**
   * Get package savings text
   */
  const getPackageSavings = (pkg) => {
    if (pkg.packageType === Purchases.PACKAGE_TYPE.ANNUAL) {
      return 'Save 17%';
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
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primaryContainer]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Title style={[styles.title, { color: 'white' }]}>
              Unlock Your Full Potential
            </Title>
            <Paragraph style={[styles.subtitle, { color: 'rgba(255,255,255,0.9)' }]}>
              Transform your life with unlimited access to all premium features
            </Paragraph>
          </View>

          {/* Features List */}
          <Card style={styles.featuresCard}>
            <Card.Content>
              <Title style={styles.featuresTitle}>Premium Features</Title>
              
              {[
                { icon: 'brain', text: 'Unlimited AI Coach conversations' },
                { icon: 'infinity', text: 'Access to all exercises and content' },
                { icon: 'chart-line', text: 'Advanced progress analytics' },
                { icon: 'download', text: 'Offline content access' },
                { icon: 'account-group', text: 'Priority customer support' },
                { icon: 'new-box', text: 'Early access to new features' },
              ].map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <IconButton
                    icon={feature.icon}
                    size={24}
                    iconColor={theme.colors.primary}
                    style={styles.featureIcon}
                  />
                  <Text style={[styles.featureText, { color: theme.colors.text }]}>
                    {feature.text}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>

          {/* Subscription Packages */}
          <View style={styles.packagesContainer}>
            <Title style={[styles.packagesTitle, { color: 'white' }]}>
              Choose Your Plan
            </Title>
            
            {offerings.current.availablePackages.map((pkg, index) => {
              const isSelected = selectedPackage?.identifier === pkg.identifier;
              const savings = getPackageSavings(pkg);
              
              return (
                <Card
                  key={pkg.identifier}
                  style={[
                    styles.packageCard,
                    isSelected && { 
                      borderColor: theme.colors.secondary, 
                      borderWidth: 2,
                      elevation: 8,
                    }
                  ]}
                  onPress={() => setSelectedPackage(pkg)}
                >
                  <Card.Content>
                    <View style={styles.packageHeader}>
                      <View style={styles.packageInfo}>
                        <Text style={[styles.packageTitle, { color: theme.colors.text }]}>
                          {pkg.product.title || `${pkg.packageType.charAt(0).toUpperCase() + pkg.packageType.slice(1)} Plan`}
                        </Text>
                        {savings && (
                          <Chip
                            mode="flat"
                            style={[styles.savingsChip, { backgroundColor: theme.colors.secondaryContainer }]}
                            textStyle={{ color: theme.colors.secondary }}
                            compact
                          >
                            {savings}
                          </Chip>
                        )}
                      </View>
                      <View style={styles.packagePricing}>
                        <Text style={[styles.packagePrice, { color: theme.colors.text }]}>
                          {getPackagePrice(pkg)}
                        </Text>
                        <Text style={[styles.packageDuration, { color: theme.colors.text }]}>
                          {getPackageDuration(pkg)}
                        </Text>
                      </View>
                    </View>
                    
                    {pkg.product.description && (
                      <Text style={[styles.packageDescription, { color: theme.colors.text }]}>
                        {pkg.product.description}
                      </Text>
                    )}
                  </Card.Content>
                </Card>
              );
            })}
          </View>

          {/* Purchase Button */}
          <View style={styles.purchaseContainer}>
            <Button
              mode="contained"
              onPress={handlePurchase}
              loading={purchasing}
              disabled={purchasing || !selectedPackage}
              style={styles.purchaseButton}
              labelStyle={styles.purchaseButtonText}
            >
              {purchasing ? 'Processing...' : 'Start Premium'}
            </Button>
            
            <Button
              mode="text"
              onPress={handleRestore}
              loading={restoring}
              disabled={restoring}
              style={styles.restoreButton}
              labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
            >
              {restoring ? 'Restoring...' : 'Restore Purchases'}
            </Button>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Subscriptions auto-renew. Cancel anytime in your account settings.
            </Text>
            <Text style={styles.footerText}>
              By subscribing, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
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
});

export default PaywallScreen; 