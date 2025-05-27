import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Title, Paragraph, Card } from 'react-native-paper';
import { OnboardingLayout } from '../../components/onboarding';
import { SPACING, FONT, COLORS, RADIUS } from '../../config/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[ScienceIntroThinkersScreen] ${message}`, data);
  }
};

// Content for this specific screen
const POINT_CONTENT = {
  icon: 'head-lightbulb-outline',
  title: 'Inspired by Leading Thinkers',
  text: 'The app framework is inspired by the work of leaders like Tony Robbins, Naval Ravikant, Vishen Lakhiani, and Eckhart Tolle.'
};

const ScienceIntroThinkersScreen = ({ navigation }) => {
  debug.log('Screen loaded');

  const handleContinue = () => {
    debug.log('Navigating to LifeSatisfactionScreen');
    navigation.navigate('LifeSatisfaction'); 
  };

  return (
    <OnboardingLayout
      title="The Science Behind Shift"
      subtitle="Inspired by Leading Thinkers & Proven Models"
      currentStep={5}
      totalSteps={12}
      onBack={() => navigation.goBack()}
      onNext={handleContinue}
      nextButtonLabel="Start Your Assessment"
    >
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.pointCard}>
          <Card.Content style={styles.pointCardContent}>
            <MaterialCommunityIcons name={POINT_CONTENT.icon} size={40} color={COLORS.primary} style={styles.pointIcon} />
            <Paragraph style={styles.pointText}>{POINT_CONTENT.text}</Paragraph>
          </Card.Content>
        </Card>
        <Paragraph style={styles.footerText}>
          We stand on the shoulders of giants to bring you effective strategies for growth.
        </Paragraph>
      </ScrollView>
    </OnboardingLayout>
  );
};

// Using similar styles for consistency
const styles = StyleSheet.create({
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl, 
    justifyContent: 'center',
    flexGrow: 1,
  },
  pointCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface, 
    borderRadius: RADIUS.md,
    elevation: 2,
    paddingVertical: SPACING.md,
  },
  pointCardContent: {
    alignItems: 'center', 
    paddingHorizontal: SPACING.md,
  },
  pointIcon: {
    marginBottom: SPACING.lg,
  },
  pointText: {
    fontSize: FONT.size.md,
    color: COLORS.text,
    lineHeight: FONT.size.md * 1.6,
    textAlign: 'center',
    paddingHorizontal: SPACING.sm,
  },
  footerText: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
    fontStyle: 'italic',
  },
});

export default ScienceIntroThinkersScreen; 