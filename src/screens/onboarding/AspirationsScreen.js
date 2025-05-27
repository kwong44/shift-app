import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TextInput } from 'react-native';
import { Text, Card, Title, Paragraph, Button, HelperText } from 'react-native-paper';
import { OnboardingLayout } from '../../components/onboarding';
import { SPACING, FONT, COLORS, RADIUS } from '../../config/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[AspirationsScreen] ${message}`, data);
  }
};

const AspirationsScreen = ({ navigation, route }) => {
  const { satisfactionBaseline, engagementPrefs, selectedGrowthAreas } = route.params || {};
  // State to hold aspirations, keyed by growth area ID
  // Example: { health_wellness: ['Run a 5k', 'Meditate 15 mins daily'], career_work: ['Get a promotion'] }
  const [aspirations, setAspirations] = useState({});
  const [currentAreaIndex, setCurrentAreaIndex] = useState(0);

  const currentGrowthArea = selectedGrowthAreas && selectedGrowthAreas[currentAreaIndex];

  useEffect(() => {
    debug.log('Screen loaded. Route params:', route.params);
    if (!selectedGrowthAreas || selectedGrowthAreas.length === 0) {
      debug.log('No growth areas selected, navigating back or showing error.');
      // Potentially navigate back or show an error message
      // For now, just log it. You might want to redirect to AreasForGrowthScreen.
      if (navigation.canGoBack()) navigation.goBack();
    }
  }, [selectedGrowthAreas, navigation]);

  const handleAspirationChange = (areaId, index, text) => {
    setAspirations(prev => {
      const areaAspirations = [...(prev[areaId] || [])];
      areaAspirations[index] = text;
      // Prevent empty strings from being kept if user clears input, unless it's the only input
      // Or, filter out empty strings on continue
      return { ...prev, [areaId]: areaAspirations }; 
    });
  };

  const addAspirationInput = (areaId) => {
    setAspirations(prev => {
      const areaAspirations = [...(prev[areaId] || [])];
      if (areaAspirations.length < 2) { // Limit to 2 aspirations per area for now
        areaAspirations.push(''); // Add a new empty input field
      }
      return { ...prev, [areaId]: areaAspirations };
    });
  };
  
  const getAspirationsForArea = (areaId) => {
    return aspirations[areaId] || ['']; // Ensure at least one input field
  };

  const handleNextArea = () => {
    // Validate current area's aspirations before proceeding (optional)
    const currentAspirations = (aspirations[currentGrowthArea.id] || []).filter(asp => asp.trim() !== '');
    if (currentAspirations.length === 0) {
      debug.log(`No aspirations defined for ${currentGrowthArea.label}. Prompting user.`);
      // You could show a helper text or alert here
      // For simplicity, we allow proceeding but this is a point for UX improvement.
    }

    if (currentAreaIndex < selectedGrowthAreas.length - 1) {
      setCurrentAreaIndex(prev => prev + 1);
    } else {
      // All areas processed, navigate to the next screen in onboarding
      handleContinueToNextScreen();
    }
  };

  const handlePreviousArea = () => {
    if (currentAreaIndex > 0) {
      setCurrentAreaIndex(prev => prev - 1);
    }
  };

  const handleContinueToNextScreen = () => {
    // Consolidate all defined aspirations
    const definedLTAs = [];
    selectedGrowthAreas.forEach(area => {
      const areaAspirations = (aspirations[area.id] || []).filter(asp => asp.trim() !== '');
      areaAspirations.forEach(aspText => {
        definedLTAs.push({
          text: aspText,
          areaId: area.id,       // Link LTA to its growth area ID
          areaLabel: area.label,  // Keep label for easier display if needed
          type: 'user_defined', // Mark as user-defined LTA
          status: 'pending',      // Default status
          // timeline: 'flexible' // Or derive/ask later
        });
      });
    });

    if (definedLTAs.length === 0) {
      debug.log('No LTAs defined overall. Prompting user.');
      // Add an alert here, perhaps?
      alert('Please define at least one aspiration to continue.');
      return;
    }

    debug.log('Proceeding to BenefitsIntro screen with LTAs:', definedLTAs);
    navigation.navigate('BenefitsIntro', { // New screen we'll create
      satisfactionBaseline,
      engagementPrefs,
      selectedGrowthAreas,
      definedLTAs, // Pass the collected Long-Term Aspirations
    });
  };

  if (!currentGrowthArea) {
    // This case should ideally be handled by the useEffect redirecting or parent component
    return (
      <OnboardingLayout title="Loading...">
        <View style={styles.loadingContainer}>
          <Text>Loading growth areas...</Text>
        </View>
      </OnboardingLayout>
    );
  }

  const currentAreaAspirations = getAspirationsForArea(currentGrowthArea.id);
  const canAddMoreAspirations = currentAreaAspirations.length < 2;
  const isLastArea = currentAreaIndex === selectedGrowthAreas.length - 1;

  return (
    <OnboardingLayout
      title={`Aspirations for:`}
      titleDynamic={currentGrowthArea.label}
      subtitle={`What long-term aspirations do you have in this area? (1-2 goals)`}
      currentStep={3} // Adjust step numbering
      totalSteps={5}  // Adjust total steps
      onBack={currentAreaIndex === 0 ? () => navigation.goBack() : handlePreviousArea}
      backButtonLabel={currentAreaIndex === 0 ? 'Back to Areas' : 'Previous Area'}
      onNext={handleNextArea}
      nextButtonLabel={isLastArea ? 'Review & Continue' : 'Next Area'}
      // nextDisabled={currentAreaAspirations.every(asp => asp.trim() === '')}
    >
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.areaCard}>
          <Card.Content style={styles.cardContent}>
            <MaterialCommunityIcons name={currentGrowthArea.icon || 'bullseye-arrow'} size={36} color={COLORS.primary} style={styles.areaIcon} />
            <Title style={styles.areaTitle}>{currentGrowthArea.label}</Title>
            <Paragraph style={styles.areaDescription}>{currentGrowthArea.description}</Paragraph>
          </Card.Content>
        </Card>

        <Text style={styles.inputPrompt}>
          For "{currentGrowthArea.label}", define 1 or 2 key aspirations you want to achieve.
          Think big! These are your long-term goals.
        </Text>

        {currentAreaAspirations.map((aspirationText, index) => (
          <View key={index} style={styles.inputContainer}>
            <TextInput
              label={`Aspiration ${index + 1} for ${currentGrowthArea.label}`}
              value={aspirationText}
              onChangeText={(text) => handleAspirationChange(currentGrowthArea.id, index, text)}
              placeholder={`e.g., Run a marathon, Master a new skill for my career`}
              style={styles.textInput}
              // activeOutlineColor={COLORS.primary}
              // mode="outlined"
              maxLength={150}
            />
            {/* Basic character count example, can be enhanced */}
            <HelperText type="info" visible={true} style={styles.charCount}>
              {aspirationText.length} / 150
            </HelperText>
          </View>
        ))}

        {canAddMoreAspirations && (
          <Button 
            icon="plus-circle-outline"
            mode="text" 
            onPress={() => addAspirationInput(currentGrowthArea.id)}
            style={styles.addButton}
            labelStyle={styles.addButtonLabel}
          >
            Add Another Aspiration for {currentGrowthArea.label}
          </Button>
        )}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  areaCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    elevation: 2,
    borderRadius: RADIUS.md,
  },
  cardContent: {
    alignItems: 'center', // Center content in card
    padding: SPACING.md,
  },
  areaIcon: {
    marginBottom: SPACING.sm,
  },
  areaTitle: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  areaDescription: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  inputPrompt: {
    fontSize: FONT.size.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
    paddingHorizontal: SPACING.sm,
    lineHeight: FONT.size.md * 1.4,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  textInput: {
    backgroundColor: COLORS.background, // Ensure input background matches theme
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT.size.md,
    minHeight: 50,
  },
  addButton: {
    marginTop: SPACING.sm,
    alignSelf: 'center',
  },
  addButtonLabel: {
    fontSize: FONT.size.sm,
    color: COLORS.primary,
  },
  charCount: {
    textAlign: 'right',
    fontSize: FONT.size.xs,
  }
});

export default AspirationsScreen; 