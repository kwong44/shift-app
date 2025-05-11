import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Appbar,
  Card,
  IconButton,
  Snackbar
} from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../config/theme';
import * as Haptics from 'expo-haptics';

// Import local components and constants
import VisualizationTypeSelector from './components/VisualizationTypeSelector';
import AffirmationInput from './components/AffirmationInput';
import EmotionPicker from '../../../components/exercises/EmotionPicker';
import { VISUALIZATION_TYPES, SESSION_DURATION, getAffirmationPlaceholder } from './constants';
import SetupScreenButton from '../../../components/common/SetupScreenButton';
import SetupScreenButtonContainer from '../../../components/common/SetupScreenButtonContainer';

// Debug logging
console.debug('VisualizationSetupScreen mounted');

const SetupScreen = ({ navigation }) => {
  const [visualizationType, setVisualizationType] = useState('goals');
  const [affirmation, setAffirmation] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [textInputHeight, setTextInputHeight] = useState(120);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState('');

  // Get the selected visualization type data
  const selectedType = VISUALIZATION_TYPES.find(t => t.value === visualizationType);
  
  // Debug logging for state changes
  console.debug('VisualizationSetupScreen state:', {
    visualizationType,
    affirmationLength: affirmation.length,
    selectedEmotions
  });

  const handleStart = async () => {
    if (!affirmation.trim()) {
      setError('Please enter an affirmation');
      setSnackbarVisible(true);
      return;
    }
    if (selectedEmotions.length === 0) {
      setError('Please select at least one emotion');
      setSnackbarVisible(true);
      return;
    }
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Debug logging for navigation
    console.debug('Starting visualization session:', {
      type: visualizationType,
      affirmationLength: affirmation.trim().length,
      emotionsCount: selectedEmotions.length,
      duration: SESSION_DURATION
    });

    navigation.navigate('VisualizationPlayer', {
      visualizationType,
      affirmation: affirmation.trim(),
      selectedEmotions,
      duration: SESSION_DURATION
    });
  };

  const handleTypeChange = async (type) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVisualizationType(type);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Appbar.Header style={styles.appbar} statusBarHeight={0}>
          <Appbar.BackAction 
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }} 
            color={COLORS.text} 
          />
          <Appbar.Content 
            title="Visualization" 
            titleStyle={styles.appbarTitle}
            subtitle="Focus & Mindset"
            subtitleStyle={styles.appbarSubtitle}
          />
          <IconButton
            icon="information"
            iconColor={COLORS.text}
            size={24}
            onPress={() => {
              // TODO: Show info modal about visualization
            }}
          />
        </Appbar.Header>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Choose Your Focus</Text>
          
          <VisualizationTypeSelector 
            visualizationTypes={VISUALIZATION_TYPES}
            selectedType={selectedType}
            onSelectType={handleTypeChange}
          />

          <Text style={styles.sectionTitle}>Your Affirmation</Text>
          
          <AffirmationInput 
            affirmation={affirmation}
            setAffirmation={setAffirmation}
            placeholder={getAffirmationPlaceholder(visualizationType)}
            textInputHeight={textInputHeight}
            setTextInputHeight={setTextInputHeight}
          />

          <Text style={styles.sectionTitle}>Emotions to Cultivate</Text>
          
          <Card style={styles.emotionsCard} elevation={3}>
            <Card.Content>
              <EmotionPicker
                selectedEmotions={selectedEmotions}
                onSelectEmotion={setSelectedEmotions}
                maxSelections={3}
                helperText="Select up to 3 emotions you want to embody"
              />
            </Card.Content>
          </Card>
        </ScrollView>

        <SetupScreenButtonContainer>
          <SetupScreenButton
            label="Start Visualization"
            onPress={handleStart}
            icon="meditation"
            backgroundColor={selectedType.color}
          />
        </SetupScreenButtonContainer>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbar}
          action={{
            label: 'OK',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {error}
        </Snackbar>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  appbar: {
    backgroundColor: COLORS.background,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  appbarTitle: {
    color: COLORS.text,
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
  },
  appbarSubtitle: {
    color: COLORS.textLight,
    fontSize: FONT.size.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl + 80, // Extra padding for button
  },
  sectionTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  emotionsCard: {
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.lg,
    ...SHADOWS.medium,
  },
  snackbar: {
    bottom: SPACING.md,
  },
});

export default SetupScreen; 