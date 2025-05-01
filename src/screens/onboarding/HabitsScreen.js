import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { OnboardingLayout } from '../../components/onboarding';
import HabitCategoryCard from '../../components/onboarding/HabitCategoryCard';
import { SPACING } from '../../config/theme';

// Debug logger
const debug = {
  log: (message) => {
    console.log(`[HabitsScreen] ${message}`);
  }
};

// Define unique categories from habitOptions
const habitCategories = [
  {
    id: 'health',
    label: 'Physical Health',
    icon: 'heart-pulse',
    description: 'Exercise, nutrition, sleep, and overall wellness'
  },
  {
    id: 'growth',
    label: 'Personal Growth',
    icon: 'trending-up',
    description: 'Learning, reading, and skill development'
  },
  {
    id: 'wellbeing',
    label: 'Mental Wellbeing',
    icon: 'meditation',
    description: 'Meditation, mindfulness, and stress management'
  },
  {
    id: 'productivity',
    label: 'Productivity',
    icon: 'lightning-bolt',
    description: 'Focus, time management, and efficiency'
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    icon: 'sun',
    description: 'Daily routines and life balance'
  }
];

const HabitsScreen = ({ navigation, route }) => {
  const { satisfactionBaseline } = route.params || {};
  const [selectedCategories, setSelectedCategories] = useState([]);
  const theme = useTheme();
  
  // Handle category selection
  const handleCategorySelect = (category) => {
    debug.log(`Toggling category: ${category.id}`);
    if (selectedCategories.includes(category.id)) {
      setSelectedCategories(prev => prev.filter(id => id !== category.id));
    } else {
      setSelectedCategories(prev => [...prev, category.id]);
    }
  };

  const handleContinue = () => {
    debug.log('Proceeding to preferences with categories:', selectedCategories);
    navigation.navigate('Preferences', { 
      satisfactionBaseline,
      currentHabits: selectedCategories,
      improvementAreas: [] // Providing empty array since we're skipping improvement areas
    });
  };

  return (
    <OnboardingLayout
      title="Choose Your Focus Areas"
      subtitle="Select the areas where you'd like to develop better habits"
      currentStep={3}
      totalSteps={6}
      onBack={() => navigation.goBack()}
      onNext={handleContinue}
      nextDisabled={selectedCategories.length === 0}
    >
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {habitCategories.map((category) => (
          <HabitCategoryCard
            key={category.id}
            category={category}
            selected={selectedCategories.includes(category.id)}
            onPress={handleCategorySelect}
          />
        ))}
      </ScrollView>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
 
});

export default HabitsScreen; 