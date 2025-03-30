import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { COLORS, FONT, SPACING } from '../../config/theme';
import CustomButton from '../../components/common/CustomButton';
import OnboardingHeader from '../../components/onboarding/OnboardingHeader';
import ProgressBar from '../../components/onboarding/ProgressBar';
import OptionSelector from '../../components/common/OptionSelector';
import CustomInput from '../../components/common/CustomInput';

const habitOptions = [
  'Regular Exercise',
  'Healthy Eating',
  'Reading',
  'Meditation',
  'Journaling',
  'Early Rising',
  'Yoga',
  'Deep Work',
  'Digital Detox',
  'Hydration',
  'Sleep Hygiene',
];

const HabitsScreen = ({ navigation, route }) => {
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [otherHabit, setOtherHabit] = useState('');
  
  const handleContinue = () => {
    const habits = [...selectedHabits];
    if (otherHabit.trim()) {
      habits.push(otherHabit.trim());
    }
    
    // Store habits in a context or redux store for later submission
    // For simplicity, we'll pass it as a parameter for now
    navigation.navigate('ImprovementAreas', { currentHabits: habits });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProgressBar currentStep={1} totalSteps={4} />
        
        <OnboardingHeader
          title="Your Current Habits"
          subtitle="Select the positive habits you already practice regularly."
        />
        
        <View style={styles.content}>
          <OptionSelector
            options={habitOptions}
            selectedOptions={selectedHabits}
            onSelect={setSelectedHabits}
            multiple={true}
            label="Select all that apply:"
          />
          
          <View style={styles.otherContainer}>
            <Text style={styles.otherLabel}>
              Other habits not listed above:
            </Text>
            <CustomInput
              placeholder="E.g., Gratitude practice, Cold showers, etc."
              value={otherHabit}
              onChangeText={setOtherHabit}
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
            disabled={selectedHabits.length === 0 && !otherHabit.trim()}
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

export default HabitsScreen; 