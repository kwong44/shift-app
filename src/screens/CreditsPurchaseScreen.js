/**
 * Credits Purchase Screen
 * 
 * Displays available credit packages for purchase using RevenueCat
 * Shows when user needs to buy more credits for AI Coach or other premium features
 * 
 * Features:
 * - Beautiful gradient UI matching app theme
 * - Credit package selection with token amounts
 * - Purchase flow integration with RevenueCat
 * - Real-time token balance display
 * - Error handling and loading states
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Text,
  Button,
  Card,
  ActivityIndicator,
  Portal,
  Modal,
  IconButton,
  Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

// Config and API imports
import { theme } from '../config/theme';
import { 
  getAvailableOfferings, 
  purchaseCredits, 
  restoreCreditPurchases,
  CREDIT_PRODUCTS,
  CREDIT_CONFIG,
} from '../config/revenuecat';
import { addUserTokens, getUserTokens } from '../api/credits';

const { width } = Dimensions.get('window');

// Debug logging
console.debug('[CreditsPurchaseScreen] Screen module loaded');

/**
 * Credits Purchase Screen Component
 * 
 * @param {Object} navigation - React Navigation object
 * @param {Object} route - Route parameters
 */
const CreditsPurchaseScreen = ({ navigation, route }) => {
  // State management
  const [offerings, setOfferings] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [currentTokens, setCurrentTokens] = useState(0);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Extract route params
  const { 
    showCloseButton = true, 
    minimumCreditsRequired = 0,
    onPurchaseComplete = null,
  } = route?.params || {};

  console.debug('[CreditsPurchaseScreen] Component initialized', {
    showCloseButton,
    minimumCreditsRequired,
    hasOnPurchaseCallback: !!onPurchaseComplete,
  });

  /**
   * Initialize screen data
   */
  useEffect(() => {
    initializeScreen();
  }, []);

  /**
   * Load offerings and user token balance
   */
  const initializeScreen = async () => {
    try {
      console.debug('[CreditsPurchaseScreen] Initializing screen data');
      setLoading(true);

      // Load current token balance
      const tokens = await getUserTokens();
      setCurrentTokens(tokens);

      // Load RevenueCat offerings
      const availableOfferings = await getAvailableOfferings();
      setOfferings(availableOfferings);

      // Auto-select first package if available
      if (availableOfferings?.current?.availablePackages?.length > 0) {
        setSelectedPackage(availableOfferings.current.availablePackages[0]);
        console.debug('[CreditsPurchaseScreen] Auto-selected first package');
      }

      console.debug('[CreditsPurchaseScreen] Screen initialized successfully', {
        currentTokens: tokens,
        packagesAvailable: availableOfferings?.current?.availablePackages?.length || 0,
      });

    } catch (error) {
      console.error('[CreditsPurchaseScreen] Failed to initialize:', error);
      Alert.alert(
        'Loading Error',
        'Failed to load credit packages. Please try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle credit package purchase
   */
  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert('Selection Required', 'Please select a credit package first.');
      return;
    }

    try {
      console.debug('[CreditsPurchaseScreen] Starting purchase process', {
        packageId: selectedPackage.identifier,
        productId: selectedPackage.product.identifier,
      });

      setPurchasing(true);
      setShowPurchaseModal(true);

      // Handle token addition callback
      const onTokensAdded = async (tokensToAdd, creditPackage) => {
        console.debug('[CreditsPurchaseScreen] Adding tokens to user account', {
          tokensToAdd,
          creditPackage: creditPackage?.displayName,
        });
        
        await addUserTokens(tokensToAdd);
        
        // Update local token count
        const newTokens = await getUserTokens();
        setCurrentTokens(newTokens);
        
        console.debug('[CreditsPurchaseScreen] Tokens added successfully', {
          newBalance: newTokens,
        });
      };

      // Make the purchase
      const result = await purchaseCredits(selectedPackage, onTokensAdded);

      if (result.success) {
        console.debug('[CreditsPurchaseScreen] Purchase completed successfully', {
          tokensAdded: result.tokensAdded,
          newBalance: currentTokens + (result.tokensAdded || 0),
        });

        setShowPurchaseModal(false);
        
        // Show success message
        Alert.alert(
          'Purchase Successful! 🎉',
          `${result.creditPackage?.displayName || 'Credits'} added to your account!\n\nYou now have ${currentTokens + (result.tokensAdded || 0)} tokens.`,
          [
            {
              text: 'Continue',
              onPress: () => {
                // Call completion callback if provided
                if (onPurchaseComplete) {
                  onPurchaseComplete(result);
                }
                navigation.goBack();
              },
            },
          ]
        );

      } else if (result.cancelled) {
        console.debug('[CreditsPurchaseScreen] Purchase cancelled by user');
        setShowPurchaseModal(false);
        
      } else {
        console.error('[CreditsPurchaseScreen] Purchase failed:', result.error);
        setShowPurchaseModal(false);
        Alert.alert(
          'Purchase Failed',
          result.error || 'Something went wrong. Please try again.',
          [{ text: 'OK' }]
        );
      }

    } catch (error) {
      console.error('[CreditsPurchaseScreen] Purchase error:', error);
      setShowPurchaseModal(false);
      Alert.alert(
        'Purchase Error',
        'Failed to complete purchase. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setPurchasing(false);
    }
  };

  /**
   * Handle restore purchases
   */
  const handleRestorePurchases = async () => {
    try {
      console.debug('[CreditsPurchaseScreen] Restoring purchases');
      setRestoring(true);

      const result = await restoreCreditPurchases();

      if (result.success) {
        console.debug('[CreditsPurchaseScreen] Purchases restored successfully', {
          transactionCount: result.creditTransactions?.length || 0,
        });

        // Refresh token balance in case transactions were restored
        const newTokens = await getUserTokens();
        setCurrentTokens(newTokens);

        Alert.alert(
          'Restore Complete',
          result.creditTransactions?.length > 0
            ? `Found ${result.creditTransactions.length} previous purchases.`
            : 'No previous purchases found.',
          [{ text: 'OK' }]
        );
      } else {
        console.error('[CreditsPurchaseScreen] Restore failed:', result.error);
        Alert.alert(
          'Restore Failed',
          result.error || 'Failed to restore purchases.',
          [{ text: 'OK' }]
        );
      }

    } catch (error) {
      console.error('[CreditsPurchaseScreen] Restore error:', error);
      Alert.alert(
        'Restore Error',
        'Failed to restore purchases. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setRestoring(false);
    }
  };

  /**
   * Get credit package info from product ID
   */
  const getCreditPackageInfo = (productId) => {
    return Object.values(CREDIT_PRODUCTS).find(pkg => pkg.productId === productId);
  };

  /**
   * Render credit package card
   */
  const renderCreditPackage = (pkg) => {
    const packageInfo = getCreditPackageInfo(pkg.product.identifier);
    const isSelected = selectedPackage?.identifier === pkg.identifier;
    
    return (
      <Card
        key={pkg.identifier}
        style={[
          styles.packageCard,
          isSelected && styles.selectedPackageCard,
        ]}
        onPress={() => setSelectedPackage(pkg)}
      >
        <Card.Content style={styles.packageContent}>
          {/* Package header */}
          <View style={styles.packageHeader}>
            <Text variant="titleMedium" style={styles.packageTitle}>
              {packageInfo?.displayName || pkg.product.title}
            </Text>
            
            {packageInfo?.savings && (
              <Chip 
                style={styles.savingsChip}
                textStyle={styles.savingsText}
                compact
              >
                {packageInfo.savings}
              </Chip>
            )}
          </View>

          {/* Token amount */}
          <Text variant="headlineSmall" style={styles.tokenAmount}>
            {packageInfo?.tokens?.toLocaleString() || '0'} tokens
          </Text>

          {/* Description */}
          <Text variant="bodyMedium" style={styles.packageDescription}>
            {packageInfo?.description || pkg.product.description}
          </Text>

          {/* Best for */}
          {packageInfo?.bestFor && (
            <Text variant="bodySmall" style={styles.bestForText}>
              Best for: {packageInfo.bestFor}
            </Text>
          )}

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text variant="titleLarge" style={styles.priceText}>
              {pkg.product.priceString || packageInfo?.price || 'N/A'}
            </Text>
            <Text variant="bodySmall" style={styles.priceSubtext}>
              ≈ {Math.round((packageInfo?.tokens || 0) / CREDIT_CONFIG.tokensPerCredit)} credits
            </Text>
          </View>

          {/* Selection indicator */}
          {isSelected && (
            <MaterialIcons 
              name="check-circle" 
              size={24} 
              color={theme.colors.primary}
              style={styles.selectionIcon}
            />
          )}
        </Card.Content>
      </Card>
    );
  };

  // Loading screen
  if (loading) {
    return (
      <LinearGradient
        colors={theme.gradients.primary}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.onPrimary} />
            <Text 
              variant="titleMedium" 
              style={[styles.loadingText, { color: theme.colors.onPrimary }]}
            >
              Loading credit packages...
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={theme.gradients.primary}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          {showCloseButton && (
            <IconButton
              icon="close"
              iconColor={theme.colors.onPrimary}
              size={24}
              onPress={() => navigation.goBack()}
              style={styles.closeButton}
            />
          )}
          
          <View style={styles.headerContent}>
            <Text variant="headlineMedium" style={styles.headerTitle}>
              Buy Credits
            </Text>
            
            <Text variant="bodyLarge" style={styles.headerSubtitle}>
              Power up your AI Coach conversations
            </Text>

            {/* Current balance */}
            <View style={styles.balanceContainer}>
              <MaterialIcons name="account-balance-wallet" size={20} color={theme.colors.onPrimary} />
              <Text variant="titleMedium" style={styles.balanceText}>
                {currentTokens.toLocaleString()} tokens
              </Text>
            </View>
          </View>
        </View>

        {/* Credit packages */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {offerings?.current?.availablePackages?.map(renderCreditPackage)}

          {/* Restore button */}
          <Button
            mode="outlined"
            onPress={handleRestorePurchases}
            loading={restoring}
            disabled={restoring || purchasing}
            style={styles.restoreButton}
            labelStyle={styles.restoreButtonText}
          >
            Restore Purchases
          </Button>

          {/* Info text */}
          <Text variant="bodySmall" style={styles.infoText}>
            Credits are used for AI Coach conversations and premium features. 
            Purchases are processed securely through your app store.
          </Text>
        </ScrollView>

        {/* Purchase button */}
        <View style={styles.purchaseContainer}>
          <Button
            mode="contained"
            onPress={handlePurchase}
            disabled={!selectedPackage || purchasing}
            loading={purchasing}
            style={styles.purchaseButton}
            labelStyle={styles.purchaseButtonText}
            contentStyle={styles.purchaseButtonContent}
          >
            {selectedPackage 
              ? `Buy ${getCreditPackageInfo(selectedPackage.product.identifier)?.displayName || 'Credits'}`
              : 'Select a package'
            }
          </Button>
        </View>

        {/* Purchase modal */}
        <Portal>
          <Modal
            visible={showPurchaseModal}
            dismissable={false}
            contentContainerStyle={styles.purchaseModal}
          >
            <View style={styles.modalContent}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.modalText}>
                Processing purchase...
              </Text>
              <Text variant="bodyMedium" style={styles.modalSubtext}>
                Please don't close the app
              </Text>
            </View>
          </Modal>
        </Portal>
      </SafeAreaView>
    </LinearGradient>
  );
};

/**
 * Styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    margin: 0,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: -10,
  },
  headerTitle: {
    color: theme.colors.onPrimary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: theme.colors.onPrimary,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 16,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  balanceText: {
    color: theme.colors.onPrimary,
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  packageCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
    elevation: 4,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPackageCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryContainer,
  },
  packageContent: {
    padding: 20,
    position: 'relative',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageTitle: {
    fontWeight: '700',
    flex: 1,
  },
  savingsChip: {
    backgroundColor: theme.colors.tertiary,
    marginLeft: 12,
  },
  savingsText: {
    color: theme.colors.onTertiary,
    fontSize: 12,
    fontWeight: '600',
  },
  tokenAmount: {
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  packageDescription: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: 8,
  },
  bestForText: {
    color: theme.colors.tertiary,
    fontWeight: '500',
    marginBottom: 12,
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  priceText: {
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  priceSubtext: {
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  selectionIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  restoreButton: {
    marginVertical: 16,
    borderColor: theme.colors.onPrimary,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  restoreButtonText: {
    color: theme.colors.onPrimary,
  },
  infoText: {
    textAlign: 'center',
    color: theme.colors.onPrimary,
    opacity: 0.8,
    lineHeight: 20,
    marginTop: 8,
  },
  purchaseContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  purchaseButton: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 12,
  },
  purchaseButtonContent: {
    paddingVertical: 8,
  },
  purchaseButtonText: {
    color: theme.colors.onSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  purchaseModal: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 40,
    borderRadius: 16,
    elevation: 8,
  },
  modalContent: {
    padding: 32,
    alignItems: 'center',
  },
  modalText: {
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalSubtext: {
    marginTop: 8,
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
  },
});

export default CreditsPurchaseScreen; 