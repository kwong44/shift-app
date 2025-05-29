import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Text, Button, Card, IconButton, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, FONT } from '../config/theme';
import { checkUserTokens } from '../api/aiCoach';
import { useUser } from '../hooks/useUser';
import * as Haptics from 'expo-haptics';

const CreditsPurchaseScreen = ({ navigation, route }) => {
  const { user } = useUser();
  const [userCredits, setUserCredits] = useState(null);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  // Load user's credit balance
  useEffect(() => {
    const loadUserCredits = async () => {
      if (!user?.id) return;
      
      setLoadingCredits(true);
      try {
        const creditsResponse = await checkUserTokens();
        if (creditsResponse.success) {
          setUserCredits(creditsResponse.credits);
          console.debug('[CreditsPurchaseScreen] User credits loaded:', creditsResponse.credits);
        } else {
          console.warn('[CreditsPurchaseScreen] Failed to load user credits:', creditsResponse.error);
        }
      } catch (error) {
        console.error('[CreditsPurchaseScreen] Error loading user credits:', error);
      } finally {
        setLoadingCredits(false);
      }
    };

    loadUserCredits();
  }, [user?.id]);

  const handlePurchaseCredits = async (packageType) => {
    setPurchasing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // TODO: Integrate with purchase-credits Edge Function
      console.log('Purchasing credits package:', packageType);
      
      // For now, simulate purchase
      setTimeout(() => {
        setPurchasing(false);
        // Navigate back or show success
        navigation.goBack();
      }, 2000);
      
    } catch (error) {
      console.error('[CreditsPurchaseScreen] Purchase error:', error);
      setPurchasing(false);
    }
  };

  const benefitsData = [
    {
      icon: 'brain',
      title: 'Personalized AI Insights',
      description: 'Get tailored analysis of your journal entries to understand emotional patterns and growth opportunities.',
      impact: 'Increase self-awareness by 3x faster'
    },
    {
      icon: 'chart-line',
      title: 'Smart Pattern Detection',
      description: 'AI identifies recurring themes and recommends specific exercises when you need them most.',
      impact: 'Achieve goals 40% more effectively'
    },
    {
      icon: 'target',
      title: 'Intelligent Recommendations',
      description: 'Receive exercise suggestions based on your emotional state, history, and proven success patterns.',
      impact: 'Save 2+ hours per week on planning'
    },
    {
      icon: 'robot',
      title: 'AI Life Coach',
      description: 'Access personalized coaching conversations to overcome challenges and maintain motivation.',
      impact: 'Stay motivated 5x longer'
    }
  ];

  const creditPackages = [
    {
      id: 'starter',
      credits: 5000,
      price: '$4.99',
      value: 'Best for trying AI features',
      popular: false
    },
    {
      id: 'power_user',
      credits: 15000,
      price: '$9.99',
      value: 'Most popular - Great value',
      popular: true
    },
    {
      id: 'unlimited',
      credits: 50000,
      price: '$19.99',
      value: 'Ultimate AI experience',
      popular: false
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary + '20', COLORS.background]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={COLORS.text}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>AI Features</Text>
          <View style={styles.headerRight}>
            {loadingCredits ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <View style={styles.creditsBadge}>
                <MaterialCommunityIcons name="coin" size={16} color={COLORS.primary} />
                <Text style={styles.creditsText}>{userCredits || 0}</Text>
              </View>
            )}
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Benefits Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Unlock Your Full Potential</Text>
            <Text style={styles.sectionSubtitle}>
              AI features are designed to accelerate your personal growth and help you achieve your goals faster.
            </Text>

            {benefitsData.map((benefit, index) => (
              <Card key={index} style={styles.benefitCard}>
                <Card.Content style={styles.benefitContent}>
                  <View style={styles.benefitIconContainer}>
                    <MaterialCommunityIcons
                      name={benefit.icon}
                      size={24}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.benefitTextContainer}>
                    <Text style={styles.benefitTitle}>{benefit.title}</Text>
                    <Text style={styles.benefitDescription}>{benefit.description}</Text>
                    <Text style={styles.benefitImpact}>✨ {benefit.impact}</Text>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>

          {/* Pricing Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Your Package</Text>
            
            {creditPackages.map((pkg) => (
              <Card 
                key={pkg.id} 
                style={[
                  styles.packageCard,
                  pkg.popular && styles.popularPackage
                ]}
              >
                {pkg.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                  </View>
                )}
                
                <Card.Content style={styles.packageContent}>
                  <View style={styles.packageHeader}>
                    <Text style={styles.packageCredits}>{pkg.credits.toLocaleString()} Credits</Text>
                    <Text style={styles.packagePrice}>{pkg.price}</Text>
                  </View>
                  
                  <Text style={styles.packageValue}>{pkg.value}</Text>
                  
                  <Button
                    mode="contained"
                    onPress={() => handlePurchaseCredits(pkg.id)}
                    loading={purchasing}
                    disabled={purchasing}
                    style={[
                      styles.purchaseButton,
                      pkg.popular && styles.popularPurchaseButton
                    ]}
                    labelStyle={styles.purchaseButtonText}
                  >
                    {purchasing ? 'Processing...' : 'Purchase'}
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </View>

          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How Credits Work</Text>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>💡 What do credits do?</Text>
              <Text style={styles.faqAnswer}>
                Credits power AI analysis of your journal entries, pattern detection, and coaching conversations. Each feature uses credits based on complexity.
              </Text>
            </View>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>📊 How many credits do I need?</Text>
              <Text style={styles.faqAnswer}>
                Journal analysis: 5-15 credits • AI coaching: 10-30 credits • Pattern analysis: 15-25 credits
              </Text>
            </View>
            
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>⚡ Do credits expire?</Text>
              <Text style={styles.faqAnswer}>
                No! Your credits never expire and roll over indefinitely.
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
  },
  headerRight: {
    width: 60,
    alignItems: 'flex-end',
  },
  creditsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
  },
  creditsText: {
    color: COLORS.primary,
    fontWeight: FONT.weight.semiBold,
    fontSize: FONT.size.sm,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: FONT.size.md,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  benefitCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: RADIUS.lg,
  },
  benefitContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  benefitIconContainer: {
    backgroundColor: `${COLORS.primary}15`,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  benefitDescription: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  benefitImpact: {
    fontSize: FONT.size.sm,
    color: COLORS.primary,
    fontWeight: FONT.weight.semiBold,
  },
  packageCard: {
    marginBottom: SPACING.md,
    elevation: 3,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  popularPackage: {
    borderColor: COLORS.primary,
    elevation: 5,
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xs,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    zIndex: 1,
  },
  popularBadgeText: {
    color: COLORS.surface,
    fontWeight: FONT.weight.bold,
    fontSize: FONT.size.xs,
    textAlign: 'center',
  },
  packageContent: {
    paddingTop: SPACING.lg,
  },
  packageHeader: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  packageCredits: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  packagePrice: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.primary,
  },
  packageValue: {
    fontSize: FONT.size.md,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  purchaseButton: {
    backgroundColor: COLORS.primary,
  },
  popularPurchaseButton: {
    backgroundColor: COLORS.secondary,
  },
  purchaseButtonText: {
    color: COLORS.surface,
    fontWeight: FONT.weight.bold,
  },
  faqItem: {
    marginBottom: SPACING.lg,
  },
  faqQuestion: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  faqAnswer: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
    lineHeight: 20,
  },
});

export default CreditsPurchaseScreen; 