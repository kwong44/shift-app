import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Title, Paragraph, Card } from 'react-native-paper';
import { OnboardingLayout } from '../../components/onboarding';
import { SPACING, FONT, COLORS, RADIUS } from '../../config/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[ScienceIntroTechniquesScreen] ${message}`, data);
  }
};

// Content for this specific screen
const POINT_CONTENT = {
  icon: 'clipboard-check-multiple-outline',
  title: 'Evidence-Based Techniques',
  text: 'Our methods draw from cognitive behavioral therapy (CBT), neuroplasticity research (like Hebb\'s Rule), and meditation science for a guided path to growth.'
};

const ScienceIntroTechniquesScreen = ({ navigation }) => {
  debug.log('Screen loaded');

  const handleContinue = () => {
    debug.log('Navigating to ScienceIntroTransformationScreen');
    navigation.navigate('ScienceIntroTransformation'); 
  };

  return (
    <OnboardingLayout
      title="The Science Behind Shift"
      subtitle="Evidence-Based Techniques"
      currentStep={3}
      totalSteps={12}
      onBack={() => navigation.goBack()}
      onNext={handleContinue}
      nextButtonLabel="Next: How We Transform"
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
          These proven methods form the backbone of your personalized exercises and activities.
        </Paragraph>
      </ScrollView>
    </OnboardingLayout>
  );
};

// Using similar styles as ScienceIntroNeuroscienceScreen for consistency
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

export default ScienceIntroTechniquesScreen; 