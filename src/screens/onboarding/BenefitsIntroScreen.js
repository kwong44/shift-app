import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Title, Paragraph, Button, Card } from 'react-native-paper';
import { OnboardingLayout } from '../../components/onboarding';
import { SPACING, FONT, COLORS, RADIUS } from '../../config/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[BenefitsIntroScreen] ${message}`, data);
  }
};

// Example benefit points - customize these extensively!
const BENEFIT_POINTS = [
  {
    icon: 'creation', // Example icon, choose appropriate ones
    title: 'Personalized Growth Roadmap',
    text: "Based on your aspirations, we'll help you build a clear path forward with actionable weekly goals."
  },
  {
    icon: 'brain',
    title: 'Targeted Exercises & Tools',
    text: 'Access a library of exercises for mindfulness, focus, visualization, and more, all tailored to support your journey.'
  },
  {
    icon: 'headset',
    title: 'AI-Powered Coaching',
    text: 'Your AI coach is here to provide guidance, help you overcome obstacles, and keep you motivated.'
  },
  {
    icon: 'chart-line',
    title: 'Track Your Progress',
    text: 'See your growth unfold and stay accountable with intuitive progress tracking towards your aspirations.'
  }
];

const BenefitsIntroScreen = ({ navigation, route }) => {
  const { satisfactionBaseline, engagementPrefs, selectedGrowthAreas, definedLTAs } = route.params || {};

  useEffect(() => {
    debug.log('Screen loaded. Route params:', route.params);
    // Log the LTAs to see what we're working with
    debug.log('Defined LTAs received:', definedLTAs);
  }, [route.params]);

  const handleContinue = () => {
    debug.log('Proceeding to Preferences screen.');
    navigation.navigate('Preferences', {
      satisfactionBaseline,
      engagementPrefs,
      selectedGrowthAreas,
      definedLTAs,
    });
  };

  // Optional: Create a small summary of their selected areas or aspirations
  const renderAspirationSummary = () => {
    if (!definedLTAs || definedLTAs.length === 0) return null;

    const firstLTA = definedLTAs[0];
    let summaryText = `You're aiming for goals like "${firstLTA.text.substring(0, 50)}${firstLTA.text.length > 50 ? '...' : ''}".`;
    if (definedLTAs.length > 1) {
      summaryText += ` and ${definedLTAs.length - 1} other aspiration${definedLTAs.length - 1 > 1 ? 's' : ''}!`;
    }

    return (
      <Paragraph style={styles.summaryText}>
        {summaryText} That's fantastic!
      </Paragraph>
    );
  };

  return (
    <OnboardingLayout
      title="You're All Set to Transform!"
      subtitle="Here's how Shift App will empower your journey to achieve your aspirations:"
      currentStep={4} // Adjust step numbering
      totalSteps={5}  // Adjust total steps
      onBack={() => navigation.goBack()} // Go back to AspirationsScreen
      onNext={handleContinue}
      nextButtonLabel="Let's Get Started!"
    >
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderAspirationSummary()} 

        <View style={styles.benefitsContainer}>
          {BENEFIT_POINTS.map((benefit, index) => (
            <Card key={index} style={styles.benefitCard}>
              <Card.Content style={styles.benefitCardContent}>
                <MaterialCommunityIcons name={benefit.icon} size={30} color={COLORS.primary} style={styles.benefitIcon} />
                <Title style={styles.benefitTitle}>{benefit.title}</Title>
                <Paragraph style={styles.benefitText}>{benefit.text}</Paragraph>
              </Card.Content>
            </Card>
          ))}
        </View>

        <Paragraph style={styles.finalEncouragement}>
          We're excited to be a part of your growth. Get ready to unlock your potential!
        </Paragraph>

      </ScrollView>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  summaryText: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontStyle: 'italic',
  },
  benefitsContainer: {
    marginBottom: SPACING.lg,
  },
  benefitCard: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface, // Or a slightly different shade like COLORS.lightGray
    borderRadius: RADIUS.md,
    elevation: 2,
  },
  benefitCardContent: {
    padding: SPACING.md,
    alignItems: 'flex-start', // Align items to the start for a list feel
  },
  benefitIcon: {
    marginBottom: SPACING.sm,
    alignSelf: 'center', // Center icon within its space if desired, or keep left
  },
  benefitTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.semiBold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    // textAlign: 'center',
  },
  benefitText: {
    fontSize: FONT.size.sm,
    color: COLORS.text,
    lineHeight: FONT.size.sm * 1.5,
    // textAlign: 'center',
  },
  finalEncouragement: {
    fontSize: FONT.size.md,
    color: COLORS.textHeader,
    fontWeight: FONT.weight.medium,
    textAlign: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
});

export default BenefitsIntroScreen; 