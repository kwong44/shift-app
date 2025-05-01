import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, FONT } from '../../config/theme';
import { OnboardingLayout, OnboardingCard } from '../../components/onboarding';

// Debug logger
const debug = {
  log: (message) => {
    console.log(`[OnboardingStart] ${message}`);
  }
};

const OnboardingStart = ({ navigation }) => {
  const bulletPoints = [
    { text: 'Your current habits', icon: 'checkbox-marked-circle-outline' },
    { text: 'Areas you want to improve', icon: 'target' },
    { text: 'Your long-term goals', icon: 'flag' },
    { text: 'Your preferences for engagement', icon: 'clock-outline' }
  ];

  const handleStart = () => {
    debug.log('Starting assessment');
    navigation.navigate('LifeSatisfaction');
  };

  return (
    <OnboardingLayout
      title="Let's Get to Know You"
      subtitle="Complete this assessment to help us create your personalized transformation roadmap."
      icon="rocket-launch"
      onNext={handleStart}
      nextLabel="Start Assessment"
      hideBackButton
      showProgress={false}
    >
      <OnboardingCard>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          What to Expect
        </Text>
        <Text 
          variant="bodyLarge" 
          style={[styles.sectionText, { color: COLORS.textLight }]}
        >
          This assessment will take about 5 minutes to complete. We'll ask you about:
        </Text>
        
        <View style={styles.bulletPoints}>
          {bulletPoints.map((point, index) => (
            <TouchableRipple
              key={index}
              style={styles.bulletItem}
            >
              <View style={styles.bulletContent}>
                <MaterialCommunityIcons
                  name={point.icon}
                  size={24}
                  color={COLORS.primary}
                />
                <Text style={styles.bulletText}>
                  {point.text}
                </Text>
              </View>
            </TouchableRipple>
          ))}
        </View>
      </OnboardingCard>
      
      <OnboardingCard>
        <View style={styles.infoSection}>
          <MaterialCommunityIcons
            name="lightbulb-on"
            size={24}
            color={COLORS.primary}
          />
          <View style={styles.infoContent}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              How It Works
            </Text>
            <Text 
              variant="bodyLarge" 
              style={[styles.sectionText, { color: COLORS.textLight }]}
            >
              Based on your responses, our AI will create a personalized roadmap to help you achieve your goals. 
              Your roadmap will include daily exercises, challenges, and insights tailored to your needs.
            </Text>
          </View>
        </View>
      </OnboardingCard>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: SPACING.sm,
    fontWeight: FONT.weight.semiBold,
  },
  sectionText: {
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  bulletPoints: {
    marginTop: SPACING.md,
  },
  bulletItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    marginBottom: SPACING.xs,
    padding: SPACING.sm,
  },
  bulletContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletText: {
    marginLeft: SPACING.sm,
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.medium,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
});

export default OnboardingStart; 