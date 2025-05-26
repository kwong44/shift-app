import React, { useState, useEffect } from 'react';
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
console.debug('[VisualizationSetupScreen] File loaded.');

const SetupScreen = ({ navigation, route }) => {
  const params = route.params || {};
  const { user } = useUser();

  // Initialize state with values from params if available, otherwise defaults
  const [visualizationType, setVisualizationType] = useState(params.visualizationType || 'goals');
  const [sessionDuration, setSessionDuration] = useState(params.duration || SESSION_DURATION);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Effect to log params and update state if they change after initial mount
  useEffect(() => {
    if (Object.keys(params).length > 0) {
      console.debug('[VisualizationSetupScreen] Received params on mount/update:', params);
      if (params.visualizationType && params.visualizationType !== visualizationType) {
        console.debug('[VisualizationSetupScreen] Setting visualizationType from route params:', params.visualizationType);
        setVisualizationType(params.visualizationType);
      }
      if (params.duration && params.duration !== sessionDuration) {
        console.debug('[VisualizationSetupScreen] Setting sessionDuration from route params (seconds):', params.duration);
        setSessionDuration(params.duration);
      }
      // Note: MASTER_EXERCISE_LIST defaultSettings for visualization currently includes type and duration.
      // If it included other settings like a specific `affirmationText`, we could initialize state for that here too.
    }
  }, [params]); // Rerun if params object changes

  // Get the selected visualization type data based on the current state
  const selectedTypeData = VISUALIZATION_TYPES.find(t => t.value === visualizationType);
  
  // Debug logging for state changes
  console.debug('[VisualizationSetupScreen] State:', {
    initialParams: params,
    currentVisualizationType: visualizationType,
    currentSessionDurationSeconds: sessionDuration,
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
    
    const visualizationContent = selectedTypeData.label || visualizationType;
    const durationInSeconds = sessionDuration;

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
          visualizationType,
          typeData: selectedTypeData,
          duration: durationInSeconds,
          content: visualizationContent,
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