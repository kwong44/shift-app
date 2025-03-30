import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { COLORS, FONT, SPACING } from '../../config/theme';
import CustomButton from '../../components/common/CustomButton';
import OnboardingHeader from '../../components/onboarding/OnboardingHeader';
import ProgressBar from '../../components/onboarding/ProgressBar';
import OptionSelector from '../../components/common/OptionSelector';
import CustomInput from '../../components/common/CustomInput';

const improvementOptions = [
  'Focus & Concentration',
  'Stress Management',
  'Work-Life Balance',
  'Sleep Quality',
  'Physical Fitness',
  'Nutrition',
  'Mental Health',
  'Time Management',
  'Productivity',
  'Social Connections',
  'Financial Wellness',
  'Creativity',
];

const ImprovementAreasScreen = ({ navigation, route }) => {
  const { currentHabits } = route.params || { currentHabits: [] };
  
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [otherArea, setOtherArea] = useState('');
  
  const handleContinue = () => {
    const areas = [...selectedAreas];
    if (otherArea.trim()) {
      areas.push(otherArea.trim());
    }
    
    navigation.navigate('Goals', { 
      currentHabits,
      improvementAreas: areas 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProgressBar currentStep={2} totalSteps={4} />
        
        <OnboardingHeader
          title="Areas to Improve"
          subtitle="Select the areas of your life you'd like to enhance or transform."
        />
        
        <View style={styles.content}>
          <OptionSelector
            options={improvementOptions}
            selectedOptions={selectedAreas}
            onSelect={setSelectedAreas}
            multiple={true}
            label="Select up to 5 areas:"
          />
          
          {selectedAreas.length > 5 && (
            <Text style={styles.warningText}>
              You've selected more than 5 areas. Consider focusing on your top priorities.
            </Text>
          )}
          
          <View style={styles.otherContainer}>
            <Text style={styles.otherLabel}>
              Other areas not listed above:
            </Text>
            <CustomInput
              placeholder="E.g., Public speaking, Relationship skills, etc."
              value={otherArea}
              onChangeText={setOtherArea}
              multiline={true}
              numberOfLines={2}
            />
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Back"
            onPress={() => navigation.goBack()}
            type="secondary"
            style={styles.backButton}
          />
          <CustomButton
            title="Continue"
            onPress={handleContinue}
            disabled={selectedAreas.length === 0 && !otherArea.trim()}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  content: {
    flex: 1,
  },
  warningText: {
    color: COLORS.accent,
    fontSize: FONT.size.sm,
    marginTop: SPACING.sm,
  },
  otherContainer: {
    marginTop: SPACING.xl,
  },
  otherLabel: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: SPACING.md,
  },
});

export default ImprovementAreasScreen; 