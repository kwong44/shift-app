import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { OnboardingLayout } from '../../components/onboarding';
import HabitCategoryCard from '../../components/onboarding/HabitCategoryCard'; // Reusing this component for consistency
import { SPACING, FONT, COLORS } from '../../config/theme';

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[AreasForGrowthScreen] ${message}`, data);
  }
};

// Define Areas for Growth
// These can be expanded or refined
const GROWTH_AREAS = [
  {
    id: 'health_wellness',
    label: 'Health & Wellness',
    icon: 'heart-pulse', // Make sure these icons are available in MaterialCommunityIcons
    description: 'Physical fitness, nutrition, sleep, and stress management.'
  },
  {
    id: 'personal_development',
    label: 'Personal Development',
    icon: 'school-outline',
    description: 'Learning new skills, reading, and self-improvement.'
  },
  {
    id: 'career_work',
    label: 'Career & Work',
    icon: 'briefcase-outline',
    description: 'Job performance, skill enhancement, and career progression.'
  },
  {
    id: 'relationships',
    label: 'Relationships',
    icon: 'account-group-outline',
    description: 'Connecting with family, friends, and partners.'
  },
  {
    id: 'mindfulness_peace',
    label: 'Mindfulness & Peace',
    icon: 'meditation',
    description: 'Meditation, reducing anxiety, and finding inner calm.'
  },
  {
    id: 'financial_wellbeing',
    label: 'Financial Wellbeing',
    icon: 'cash-multiple',
    description: 'Budgeting, saving, and financial planning.'
  },
  {
    id: 'creativity_hobbies',
    label: 'Creativity & Hobbies',
    icon: 'palette-outline',
    description: 'Exploring creative outlets and engaging in hobbies.'
  }
];

const AreasForGrowthScreen = ({ navigation, route }) => {
  const { satisfactionBaseline, engagementPrefs } = route.params || {}; // Assuming engagementPrefs might be collected earlier or passed along
  const [selectedAreas, setSelectedAreas] = useState([]);

  debug.log('Screen loaded. Route params:', route.params);

  const handleAreaSelect = (area) => {
    debug.log(`Toggling area: ${area.id}`);
    setSelectedAreas(prevSelectedAreas => {
      if (prevSelectedAreas.some(a => a.id === area.id)) {
        return prevSelectedAreas.filter(a => a.id !== area.id);
      } else {
        // Allow selection of multiple, e.g., up to 3 or 4
        if (prevSelectedAreas.length < 4) { // Example limit
          return [...prevSelectedAreas, area];
        }
        return prevSelectedAreas; // Limit reached
      }
    });
  };

  const handleContinue = () => {
    if (selectedAreas.length === 0) {
      debug.log('No areas selected, cannot continue.');
      // Optionally show an alert or message to the user
      return;
    }
    // Pass the selected area objects (id, label, icon, description)
    debug.log('Proceeding to Aspirations screen with selected areas:', selectedAreas);
    navigation.navigate('Aspirations', { 
      satisfactionBaseline,
      engagementPrefs, // Pass this along if it exists
      selectedGrowthAreas: selectedAreas, // Pass the array of selected area objects
    });
  };

  return (
    <OnboardingLayout
      title="Where Do You Want to Grow?"
      subtitle={`Select up to 4 areas you're most interested in focusing on right now.`}
      currentStep={2} // Adjusted step numbering as per new flow
      totalSteps={5}   // Adjusted total steps
      onBack={() => navigation.goBack()}
      onNext={handleContinue}
      nextDisabled={selectedAreas.length === 0 || selectedAreas.length > 4}
      nextButtonLabel={selectedAreas.length > 0 ? `Next (${selectedAreas.length} selected)` : 'Next'}
    >
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.instructionText}>
          Your journey of transformation starts by identifying key areas for personal growth. 
          These will become the foundation for your long-term aspirations.
        </Text>
        {GROWTH_AREAS.map((area) => (
          <HabitCategoryCard // Reusing HabitCategoryCard, ensure its props match
            key={area.id}
            category={{id: area.id, label: area.label, icon: area.icon, description: area.description}} // Adapt to HabitCategoryCard's expected prop structure
            selected={selectedAreas.some(a => a.id === area.id)}
            onPress={() => handleAreaSelect(area)}
          />
        ))}
      </ScrollView>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: SPACING.lg, // Ensure space for the last card
  },
  instructionText: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    lineHeight: FONT.size.md * 1.5,
  }
});

export default AreasForGrowthScreen; 