import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Appbar,
  IconButton,
  ActivityIndicator
} from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../config/theme';
import * as Haptics from 'expo-haptics';

// Import local components
import FrequencySelector from './components/FrequencySelector';
import DurationPicker from './components/DurationPicker';
import { FREQUENCIES } from './constants';
import SetupScreenButton from '../../../components/common/SetupScreenButton';
import SetupScreenButtonContainer from '../../../components/common/SetupScreenButtonContainer';

// Import API and hooks
import { startBinauralSession } from '../../../api/exercises/binaural';
import { useUser } from '../../../hooks/useUser';
import { getExerciseById } from '../../../constants/masterExerciseList'; // Import helper

// Debug logging
console.debug('[BinauralSetupScreen] File loaded.');

const SetupScreen = ({ navigation, route }) => {
  const params = route.params || {};
  const { masterExerciseId, originRouteName } = params; // Added originRouteName
  const { user } = useUser();

  // Initial state from masterExerciseId or params or defaults
  const initialExerciseDetails = masterExerciseId ? getExerciseById(masterExerciseId) : null;
  const defaultInitialBinauralType = initialExerciseDetails?.defaultSettings?.binauralType || 'focus';
  const defaultInitialDuration = initialExerciseDetails?.defaultSettings?.duration || 300;

  const [selectedFrequency, setSelectedFrequency] = useState(
    params.binauralType || defaultInitialBinauralType
  );
  const [customDuration, setCustomDuration] = useState(
    params.duration || defaultInitialDuration
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.debug('[BinauralSetupScreen] Received params on mount/update:', params);
    if (params.masterExerciseId) {
        console.debug('[BinauralSetupScreen] Master Exercise ID received:', params.masterExerciseId);
    }
    if (params.originRouteName) { // Log originRouteName
        console.debug('[BinauralSetupScreen] Origin route name received:', params.originRouteName);
    }
    if (params.binauralType && params.binauralType !== selectedFrequency) {
      setSelectedFrequency(params.binauralType);
    }
    if (params.duration && params.duration !== customDuration) {
      setCustomDuration(params.duration);
    }
  }, [params]);

  console.debug('[BinauralSetupScreen] State:', {
    initialParams: params,
    currentSelectedFrequencyKey: selectedFrequency,
    currentCustomDurationSeconds: customDuration,
  });

  const handleStartSession = async () => {
    if (!user) {
      console.error('[BinauralSetupScreen] User not found, cannot start session.');
      return;
    }
    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Get the base details from FREQUENCIES constant using the state `selectedFrequency` (e.g., 'focus')
    const baseFrequencyDetails = FREQUENCIES[selectedFrequency];
    if (!baseFrequencyDetails) {
        console.error('[BinauralSetupScreen] Invalid selectedFrequency key:', selectedFrequency);
        setIsLoading(false);
        // TODO: Show error to user
        return;
    }

    // The duration for the API and PlayerScreen is customDuration (in seconds)
    const durationInSeconds = customDuration;
    const durationInMinutes = Math.floor(durationInSeconds / 60); // API might expect minutes

    // Purpose can be derived from the name in defaultSettings or baseFrequencyDetails
    const purpose = params.name || initialExerciseDetails?.defaultSettings?.name || baseFrequencyDetails.name; 
    // Audio URL might be part of params for specific pre-defined tracks, or a placeholder.
    // For now, master list doesn't define specific audio files, so placeholder logic remains.
    const audioUrlPlaceholder = params.audioUrl || initialExerciseDetails?.defaultSettings?.audioUrl || baseFrequencyDetails.audioUrl || 'placeholder_audio_url.mp3';

    try {
      console.debug('[BinauralSetupScreen] Attempting to start session with:', {
        userId: user.id,
        audioUrl: audioUrlPlaceholder,
        duration: durationInMinutes, 
        purpose: purpose,
      });

      const session = await startBinauralSession(
        user.id,
        audioUrlPlaceholder,
        durationInMinutes, 
        purpose
      );

      if (session && session.id) {
        console.debug('[BinauralSetupScreen] Session started successfully:', session);
        
        const exerciseDetailsForPlayer = masterExerciseId ? getExerciseById(masterExerciseId) : null;
        const exerciseTypeForPlayer = exerciseDetailsForPlayer?.type || 'Binaural Beats';
        
        const frequencyDataForPlayer = {
          name: purpose,
          description: params.description || initialExerciseDetails?.description || baseFrequencyDetails.description,
          frequency: params.frequency || initialExerciseDetails?.defaultSettings?.frequency || baseFrequencyDetails.frequency,
          baseFrequency: params.baseFrequency || initialExerciseDetails?.defaultSettings?.baseFrequency || baseFrequencyDetails.baseFrequency,
          waveform: params.waveform || initialExerciseDetails?.defaultSettings?.waveform || baseFrequencyDetails.waveform,
          category: params.category || initialExerciseDetails?.defaultSettings?.category || baseFrequencyDetails.category,
          duration: durationInSeconds,
          sessionId: session.id,
          masterExerciseId: masterExerciseId,
          exerciseType: exerciseTypeForPlayer,
          originRouteName: originRouteName // Pass originRouteName
        };
        console.debug('[BinauralSetupScreen] Navigating to BinauralPlayer with frequencyData (including masterId/type/origin):', frequencyDataForPlayer);
        navigation.navigate('BinauralPlayer', { frequencyData: frequencyDataForPlayer });
      } else {
        console.error('[BinauralSetupScreen] Failed to start session or session ID missing.');
        // TODO: Show error to user
      }
    } catch (error) {
      console.error('[BinauralSetupScreen] Error starting binaural session:', error);
      // TODO: Show error to user (e.g., a snackbar or dialog)
    } finally {
      setIsLoading(false);
    }
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
            title="Binaural Beats" 
            titleStyle={styles.appbarTitle}
            subtitle="Focus & Relaxation"
            subtitleStyle={styles.appbarSubtitle}
          />
          <IconButton
            icon="information"
            iconColor={COLORS.text}
            size={24}
            onPress={() => {
              // TODO: Show info modal about binaural beats
            }}
          />
        </Appbar.Header>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Frequency</Text>
              <FrequencySelector
                selectedFrequency={selectedFrequency}
                onSelectFrequency={setSelectedFrequency}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Session Duration</Text>
              <DurationPicker
                value={customDuration}
                onDurationChange={setCustomDuration}
              />
            </View>
          </View>
        </ScrollView>

        <SetupScreenButtonContainer>
          <SetupScreenButton
            label="Start Session"
            onPress={handleStartSession}
            icon="headphones"
            backgroundColor={COLORS.indigoGradient.start}
            disabled={isLoading} // Disable button when loading
            loading={isLoading} // Show loading indicator on button
          />
        </SetupScreenButtonContainer>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl + 80, // Extra padding for button
  },
  content: {
    gap: SPACING.xl,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
  },
});

export default SetupScreen; 