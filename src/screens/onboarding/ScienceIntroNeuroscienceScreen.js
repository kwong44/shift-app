import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Title, Paragraph, Card } from 'react-native-paper';
import { OnboardingLayout } from '../../components/onboarding';
import { SPACING, FONT, COLORS, RADIUS } from '../../config/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[ScienceIntroNeuroscienceScreen] ${message}`, data);
  }
};

// Content for this specific screen
const POINT_CONTENT = {
  icon: 'brain',
  title: 'Neuroscience & Psychology Driven',
  text: 'RealityShift™ integrates a structured, scientific, and habit-based approach, combining neuroscience, psychology, and mindfulness principles.'
};

const ScienceIntroNeuroscienceScreen = ({ navigation }) => {
  debug.log('Screen loaded');

  const handleContinue = () => {
    debug.log('Navigating to ScienceIntroTechniquesScreen');
    navigation.navigate('ScienceIntroTechniques'); 
  };

  return (
    <OnboardingLayout
      title="The Science Behind Shift"
      subtitle="Rooted in Neuroscience & Psychology"
      currentStep={2}
      totalSteps={12}
      onBack={() => navigation.goBack()}
      onNext={() => navigation.navigate('ScienceIntroTechniques')}
      nextButtonLabel="Next: Our Techniques"
    >
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.pointCard}>
          <Card.Content style={styles.pointCardContent}>
            <MaterialCommunityIcons name={POINT_CONTENT.icon} size={40} color={COLORS.primary} style={styles.pointIcon} />
            {/* <Title style={styles.pointTitle}>{POINT_CONTENT.title}</Title> */}
            <Paragraph style={styles.pointText}>{POINT_CONTENT.text}</Paragraph>
          </Card.Content>
        </Card>
        <Paragraph style={styles.footerText}>
          This core philosophy ensures a deep and effective path to personal change.
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
    justifyContent: 'center',
    flexGrow: 1,
  },
  pointCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface, 
    borderRadius: RADIUS.md,
    elevation: 2,
    paddingVertical: SPACING.md, // Add some vertical padding inside card
  },
  pointCardContent: {
    alignItems: 'center', 
    paddingHorizontal: SPACING.md,
  },
  pointIcon: {
    marginBottom: SPACING.lg, // Increased spacing
  },
  // pointTitle: { // Title is now in the subtitle of OnboardingLayout
  //   fontSize: FONT.size.lg,
  //   fontWeight: FONT.weight.semiBold,
  //   color: COLORS.primary,
  //   marginBottom: SPACING.md,
  //   textAlign: 'center',
  // },
  pointText: {
    fontSize: FONT.size.md, // Slightly larger text
    color: COLORS.text,
    lineHeight: FONT.size.md * 1.6,
    textAlign: 'center',
    paddingHorizontal: SPACING.sm, // Ensure text doesn't touch edges
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

export default ScienceIntroNeuroscienceScreen; 