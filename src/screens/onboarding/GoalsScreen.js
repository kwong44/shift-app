import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { COLORS, FONT, SPACING } from '../../config/theme';
import CustomButton from '../../components/common/CustomButton';
import OnboardingHeader from '../../components/onboarding/OnboardingHeader';
import ProgressBar from '../../components/onboarding/ProgressBar';
import CustomInput from '../../components/common/CustomInput';

const GoalsScreen = ({ navigation, route }) => {
  const { currentHabits, improvementAreas } = route.params || { 
    currentHabits: [],
    improvementAreas: [] 
  };
  
  const [personalGoal, setPersonalGoal] = useState('');
  const [professionalGoal, setProfessionalGoal] = useState('');
  const [healthGoal, setHealthGoal] = useState('');
  const [otherGoal, setOtherGoal] = useState('');
  
  const handleContinue = () => {
    const longTermGoals = {
      personal: personalGoal.trim(),
      professional: professionalGoal.trim(),
      health: healthGoal.trim(),
      other: otherGoal.trim()
    };
    
    // Filter out empty goals
    const filteredGoals = Object.entries(longTermGoals)
      .filter(([_, value]) => value.length > 0)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
      
    navigation.navigate('Preferences', {
      currentHabits,
      improvementAreas,
      longTermGoals: filteredGoals
    });
  };
  
  // Check if at least one goal is entered
  const hasAtLeastOneGoal = () => {
    return personalGoal.trim().length > 0 || 
           professionalGoal.trim().length > 0 || 
           healthGoal.trim().length > 0 || 
           otherGoal.trim().length > 0;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProgressBar currentStep={3} totalSteps={4} />
        
        <OnboardingHeader
          title="Your Long-Term Goals"
          subtitle="What do you hope to achieve in the next 3-12 months? Be specific about what success looks like."
        />
        
        <View style={styles.content}>
          <CustomInput
            label="Personal Development Goal"
            placeholder="E.g., Develop a daily meditation practice of 20 minutes"
            value={personalGoal}
            onChangeText={setPersonalGoal}
            multiline={true}
            numberOfLines={2}
          />
          
          <CustomInput
            label="Professional/Career Goal"
            placeholder="E.g., Complete a certification in my field"
            value={professionalGoal}
            onChangeText={setProfessionalGoal}
            multiline={true}
            numberOfLines={2}
          />
          
          <CustomInput
            label="Health & Wellness Goal"
            placeholder="E.g., Run a 5K race or establish a consistent exercise routine"
            value={healthGoal}
            onChangeText={setHealthGoal}
            multiline={true}
            numberOfLines={2}
          />
          
          <CustomInput
            label="Other Goal (Optional)"
            placeholder="Any other important goal not covered above"
            value={otherGoal}
            onChangeText={setOtherGoal}
            multiline={true}
            numberOfLines={2}
          />
          
          <Text style={styles.tipText}>
            Tip: Specific, measurable goals are more likely to be achieved. Instead of "exercise more," try "exercise 3 times per week for 30 minutes."
          </Text>
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
            disabled={!hasAtLeastOneGoal()}
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
  tipText: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: SPACING.md,
    lineHeight: 20,
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

export default GoalsScreen; 