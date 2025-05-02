import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  Text, 
  useTheme,
  IconButton,
  TouchableRipple
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, FONT } from '../../config/theme';
import Slider from '@react-native-community/slider';
import { OnboardingLayout, OnboardingCard } from '../../components/onboarding';

// Debug logger
const debug = {
  log: (message) => {
    console.log(`[LifeSatisfactionScreen] ${message}`);
  }
};

const LIFE_AREAS = [
  {
    id: 'health',
    title: 'Health & Vitality',
    icon: 'heart-pulse',
    description: 'Physical health, energy levels, sleep quality'
  },
  {
    id: 'relationships',
    title: 'Relationships',
    icon: 'account-group',
    description: 'Family, friends, romantic relationships'
  },
  {
    id: 'career',
    title: 'Career & Work',
    icon: 'briefcase',
    description: 'Job satisfaction, growth, achievements'
  },
  {
    id: 'finances',
    title: 'Financial Wellbeing',
    icon: 'currency-usd',
    description: 'Income, savings, financial security'
  },
  {
    id: 'personal_growth',
    title: 'Personal Growth',
    icon: 'school',
    description: 'Learning, skills development, self-improvement'
  },
  {
    id: 'mental_wellbeing',
    title: 'Mental Wellbeing',
    icon: 'brain',
    description: 'Stress management, emotional balance, mindfulness'
  },
  {
    id: 'purpose',
    title: 'Purpose & Meaning',
    icon: 'compass',
    description: 'Life direction, values alignment, fulfillment'
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle & Recreation',
    icon: 'palm-tree',
    description: 'Work-life balance, hobbies, enjoyment'
  }
];

const LifeSatisfactionScreen = ({ navigation }) => {
  const [satisfactionLevels, setSatisfactionLevels] = useState(
    LIFE_AREAS.reduce((acc, area) => ({ ...acc, [area.id]: 5 }), {})
  );
  const [motivationLevel, setMotivationLevel] = useState(5);
  const theme = useTheme();

  const handleSatisfactionChange = (areaId, value) => {
    debug.log(`Updating satisfaction for ${areaId}: ${value}`);
    setSatisfactionLevels(prev => ({
      ...prev,
      [areaId]: value
    }));
  };

  const handleContinue = () => {
    debug.log('Proceeding to habits screen');
    const overallScore = getOverallSatisfaction();
    debug.log(`Calculated overall satisfaction: ${overallScore}`);
    navigation.navigate('Habits', {
      satisfactionBaseline: {
        overallScore: overallScore.toFixed(1),
        areas: satisfactionLevels,
        motivation: motivationLevel,
        timestamp: new Date().toISOString()
      }
    });
  };

  const getOverallSatisfaction = () => {
    const values = Object.values(satisfactionLevels);
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };

  return (
    <OnboardingLayout
      subtitle="Rate your current satisfaction in each life area from 1-10"
      currentStep={1}
      totalSteps={5}
      onNext={handleContinue}
      hideBackButton
    >
      <OnboardingCard>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="chart-areaspline"
            size={24}
            color={theme.colors.primary}
          />
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Overall Life Satisfaction
          </Text>
        </View>
        <Text style={[styles.overallScore, { color: theme.colors.primary }]}>
          {getOverallSatisfaction().toFixed(1)}
        </Text>
      </OnboardingCard>

      {LIFE_AREAS.map((area) => (
        <OnboardingCard key={area.id}>
          <TouchableRipple>
            <View style={styles.areaHeader}>
              <IconButton
                icon={area.icon}
                size={24}
                iconColor={theme.colors.primary}
              />
              <View style={styles.areaTitleContainer}>
                <Text variant="titleMedium" style={styles.areaTitle}>{area.title}</Text>
                <Text 
                  variant="bodyMedium" 
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {area.description}
                </Text>
              </View>
              <Text 
                variant="titleLarge" 
                style={{ color: theme.colors.primary }}
              >
                {satisfactionLevels[area.id]}
              </Text>
            </View>
          </TouchableRipple>
          
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={satisfactionLevels[area.id]}
            onValueChange={(value) => handleSatisfactionChange(area.id, value)}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.surfaceVariant}
          />
          
          <View style={styles.sliderLabels}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Needs Work
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Excellent
            </Text>
          </View>
        </OnboardingCard>
      ))}

      <OnboardingCard>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="rocket-launch"
            size={24}
            color={theme.colors.primary}
          />
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Motivation to Change
          </Text>
        </View>
        <Text 
          variant="bodyMedium" 
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          How motivated are you to improve these areas?
        </Text>
        
        <View style={styles.motivationContainer}>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={motivationLevel}
            onValueChange={setMotivationLevel}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.surfaceVariant}
          />
          <Text 
            variant="headlineMedium" 
            style={[styles.motivationScore, { color: theme.colors.primary }]}
          >
            {motivationLevel}
          </Text>
        </View>
        
        <View style={styles.sliderLabels}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Low
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            High
          </Text>
        </View>
      </OnboardingCard>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    marginLeft: SPACING.sm,
    fontWeight: FONT.weight.semiBold,
  },
  areaTitle: {
    fontWeight: FONT.weight.semiBold,
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  areaTitleContainer: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  motivationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  motivationScore: {
    marginLeft: SPACING.md,
    fontWeight: 'bold',
  },
  overallScore: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
});

export default LifeSatisfactionScreen; 