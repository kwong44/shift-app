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
import { Audio } from 'expo-av'; // Import Audio

// Import local components and constants
import VisualizationTypeSelector from './components/VisualizationTypeSelector';
import { VISUALIZATION_TYPES, SESSION_DURATION, VISUALIZATION_AUDIO_FILES } from './constants';
import SetupScreenButton from '../../../components/common/SetupScreenButton';
import SetupScreenButtonContainer from '../../../components/common/SetupScreenButtonContainer';

// Import API and hooks
import { createVisualization } from '../../../api/exercises/visualization';
import { useUser } from '../../../hooks/useUser';
import { getExerciseById } from '../../../constants/masterExerciseList'; // Import helper

// Debug logging
console.debug('[VisualizationSetupScreen] File loaded.');

const SetupScreen = ({ navigation, route }) => {
  const params = route.params || {};
  const { masterExerciseId, originRouteName } = params; // Added originRouteName
  const { user } = useUser();

  // Initial state from masterExerciseId or params or defaults
  const initialExerciseDetails = masterExerciseId ? getExerciseById(masterExerciseId) : null;
  const defaultInitialVisualizationType = initialExerciseDetails?.defaultSettings?.visualizationType || 'goals';
  // Default duration from master list or constant fallback. This will be refined by fetched audio duration.
  const fallbackDuration = initialExerciseDetails?.defaultSettings?.duration || SESSION_DURATION;

  const [visualizationType, setVisualizationType] = useState(
    params.visualizationType || defaultInitialVisualizationType
  );
  // Initialize sessionDuration. It will be updated by fetched duration or params.duration.
  const [sessionDuration, setSessionDuration] = useState(
    params.duration || fallbackDuration 
  );
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // For the main start action
  const [isFetchingDuration, setIsFetchingDuration] = useState(false); // For audio duration fetching

  // Effect to handle updates from route params
  useEffect(() => {
    console.debug('[VisualizationSetupScreen] Received params on mount/update:', params);
    if (params.masterExerciseId) {
        console.debug('[VisualizationSetupScreen] Master Exercise ID received:', params.masterExerciseId);
    }
    if (params.originRouteName) {
        console.debug('[VisualizationSetupScreen] Origin route name received:', params.originRouteName);
    }
    if (params.visualizationType && params.visualizationType !== visualizationType) {
      // If type changes via params, this will trigger the fetchAudioDurationEffect
      setVisualizationType(params.visualizationType); 
    }
    // If a duration is explicitly passed via params, it takes precedence.
    // The fetchAudioDurationEffect will respect this if params.duration is set.
    if (params.duration && params.duration !== sessionDuration) {
      console.debug(`[VisualizationSetupScreen] Overriding session duration with params.duration: ${params.duration}s`);
      setSessionDuration(params.duration);
    }
  }, [params]); // visualizationType removed from deps to avoid re-triggering fetch from this effect

  // Effect to fetch audio duration when visualizationType changes,
  // unless a duration is already provided by params.
  useEffect(() => {
    const fetchAudioDuration = async () => {
      // If params.duration is already set, respect it and don't fetch.
      if (params.duration) {
        console.debug('[VisualizationSetupScreen] Using duration from params, skipping fetch:', params.duration);
        setSessionDuration(params.duration); // Ensure it's set if params changed.
        return;
      }

      const audioSource = VISUALIZATION_AUDIO_FILES[visualizationType];
      if (!audioSource) {
        console.warn(`[VisualizationSetupScreen] No audio source found for type: ${visualizationType}. Using fallback duration: ${fallbackDuration}s.`);
        setSessionDuration(fallbackDuration);
        return;
      }

      console.debug(`[VisualizationSetupScreen] Fetching duration for type: ${visualizationType}`);
      setIsFetchingDuration(true);
      let soundObject = null;
      try {
        // Load sound minimally to get status
        soundObject = new Audio.Sound();
        const status = await soundObject.loadAsync(audioSource, { shouldPlay: false });
        
        if (status && status.isLoaded && status.durationMillis) {
          const durationInSeconds = Math.round(status.durationMillis / 1000);
          console.debug(`[VisualizationSetupScreen] Fetched audio duration: ${durationInSeconds}s for ${visualizationType}.`);
          setSessionDuration(durationInSeconds);
        } else {
          console.warn(`[VisualizationSetupScreen] Could not get duration for ${visualizationType}. Using fallback: ${fallbackDuration}s.`);
          setSessionDuration(fallbackDuration);
        }
      } catch (error) {
        console.error(`[VisualizationSetupScreen] Error fetching audio duration for ${visualizationType}:`, error.message);
        setSessionDuration(fallbackDuration); // Fallback on error
        setSnackbarMessage('Could not load audio information. Using default duration.');
        setSnackbarVisible(true);
      } finally {
        if (soundObject) {
          await soundObject.unloadAsync().catch(e => console.warn('[VisualizationSetupScreen] Error unloading sound object during duration fetch:', e.message));
        }
        setIsFetchingDuration(false);
      }
    };

    fetchAudioDuration();
    // Cleanup function to ensure sound is unloaded if component unmounts during fetch
    // This is mostly handled by the finally block, but good practice.
    return () => {
        // Any specific cleanup if needed, though unload is in finally.
    };
  }, [visualizationType, params.duration, fallbackDuration]); // Re-fetch if type changes or params.duration is removed

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

    // Determine the correct masterExerciseId based on visualization type and duration
    let determinedMasterExerciseId = masterExerciseId; // Use passed one if available
    
    if (!determinedMasterExerciseId) {
      // Map visualization type to masterExerciseId
      const typeToIdMap = {
        'goals': 'visualization_goals_5min',
        'ideal_life': 'visualization_ideal_life_5min', 
        'confidence': 'visualization_confidence_5min',
        'contentment': 'visualization_contentment_5min',
        'calm': 'visualization_calm_5min'
      };
      
      determinedMasterExerciseId = typeToIdMap[visualizationType] || 'visualization_goals_5min';
      console.debug('[VisualizationSetupScreen] Determined masterExerciseId:', determinedMasterExerciseId, 'for type:', visualizationType);
    }

    try {
      console.debug('[VisualizationSetupScreen] Attempting to create visualization:', {
        userId: user.id,
        content: visualizationContent,
      });

      const createdViz = await createVisualization(user.id, visualizationContent);

      if (createdViz && createdViz.id) {
        console.debug('[VisualizationSetupScreen] Visualization created successfully in DB:', createdViz);
        const exerciseDetailsForPlayer = determinedMasterExerciseId ? getExerciseById(determinedMasterExerciseId) : null;
        const exerciseTypeForPlayer = exerciseDetailsForPlayer?.type || 'Visualization';

        const playerParams = {
          visualizationId: createdViz.id,
          visualizationType,
          typeData: {
            ...selectedTypeData, // from VISUALIZATION_TYPES constant
            duration: durationInSeconds, // ensure updated duration from state is passed
          },
          content: visualizationContent,
          // Pass determined masterExerciseId and exerciseType to PlayerScreen
          masterExerciseId: determinedMasterExerciseId,
          exerciseType: exerciseTypeForPlayer,
          originRouteName: originRouteName // Pass originRouteName
        };
        console.debug('[VisualizationSetupScreen] Navigating to VisualizationPlayer with params (including determined masterId/type/origin):', playerParams);
        navigation.navigate('VisualizationPlayer', playerParams);
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
            disabled={isLoading || isFetchingDuration} // Disable if fetching duration or starting
            loading={isLoading || isFetchingDuration} // Show loading if fetching or starting
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