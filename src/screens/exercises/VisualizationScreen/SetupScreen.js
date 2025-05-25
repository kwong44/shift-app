import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Appbar,
  IconButton,
  Snackbar,
  ActivityIndicator
} from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../config/theme';
import * as Haptics from 'expo-haptics';

// Import local components and constants
import VisualizationTypeSelector from './components/VisualizationTypeSelector';
import { VISUALIZATION_TYPES, SESSION_DURATION } from './constants';
import SetupScreenButton from '../../../components/common/SetupScreenButton';
import SetupScreenButtonContainer from '../../../components/common/SetupScreenButtonContainer';

// Import API and hooks
import { createVisualization } from '../../../api/exercises/visualization';
import { useUser } from '../../../hooks/useUser';

// Debug logging
console.debug('[VisualizationSetupScreen] Mounted');

const SetupScreen = ({ navigation }) => {
  const { user } = useUser();
  const [visualizationType, setVisualizationType] = useState('goals');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get the selected visualization type data
  const selectedTypeData = VISUALIZATION_TYPES.find(t => t.value === visualizationType);
  
  // Debug logging for state changes
  console.debug('[VisualizationSetupScreen] State:', {
    visualizationType,
    selectedTypeName: selectedTypeData?.label,
    userId: user?.id
  });

  const handleStart = async () => {
    if (!user) {
      console.error('[VisualizationSetupScreen] User not found, cannot start session.');
      setSnackbarMessage('User not identified. Please restart the app.');
      setSnackbarVisible(true);
      return;
    }
    if (!selectedTypeData) {
        console.error('[VisualizationSetupScreen] Selected visualization type data not found.');
        setSnackbarMessage('Invalid visualization type selected.');
        setSnackbarVisible(true);
        return;
    }

    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // The content for the visualization can be its type/label or a more detailed description if available
    // For now, using the label of the selected type as content.
    const visualizationContent = selectedTypeData.label || visualizationType;
    const durationInSeconds = SESSION_DURATION; // From constants, assumed to be in seconds

    try {
      console.debug('[VisualizationSetupScreen] Attempting to create visualization:', {
        userId: user.id,
        content: visualizationContent,
      });

      const createdViz = await createVisualization(user.id, visualizationContent);

      if (createdViz && createdViz.id) {
        console.debug('[VisualizationSetupScreen] Visualization created successfully in DB:', createdViz);
        navigation.navigate('VisualizationPlayer', {
          visualizationId: createdViz.id,
          visualizationType, // Pass the type key
          typeData: selectedTypeData, // Pass the full data object for the player
          duration: durationInSeconds, // Pass duration in seconds for the timer
          content: visualizationContent, // Pass the content that was saved
        });
      } else {
        console.error('[VisualizationSetupScreen] Failed to create visualization or ID missing.');
        setSnackbarMessage('Could not start visualization. Please try again.');
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('[VisualizationSetupScreen] Error creating visualization:', error.message);
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarVisible(true);
    } finally {
      setIsLoading(false);
    }
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
          <Text style={styles.sectionTitle}>Choose Your Visualization</Text>
          
          <VisualizationTypeSelector 
            visualizationTypes={VISUALIZATION_TYPES}
            selectedType={selectedTypeData}
            onSelectType={handleTypeChange}
          />
        </ScrollView>

        <SetupScreenButtonContainer>
          <SetupScreenButton
            label="Start Visualization"
            onPress={handleStart}
            icon="meditation"
            backgroundColor={COLORS.coralGradient.start}
            disabled={isLoading}
            loading={isLoading}
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
          {snackbarMessage}
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
  snackbar: {
    bottom: SPACING.md,
  },
});

export default SetupScreen; 