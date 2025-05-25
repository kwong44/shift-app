import React, { useState } from 'react';
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

// Debug logging
console.debug('[BinauralSetupScreen] Mounted');

const SetupScreen = ({ navigation }) => {
  const { user } = useUser();
  const [selectedFrequency, setSelectedFrequency] = useState('focus');
  const [customDuration, setCustomDuration] = useState(300); // 5 minutes default in seconds
  const [isLoading, setIsLoading] = useState(false); // Added loading state

  const handleStartSession = async () => {
    if (!user) {
      console.error('[BinauralSetupScreen] User not found, cannot start session.');
      // TODO: Show error to user
      return;
    }
    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const selectedFrequencyDetails = FREQUENCIES[selectedFrequency];
    // The 'duration' in FREQUENCIES seems to be a default, we use customDuration from picker
    const durationInSeconds = customDuration; 
    const durationInMinutes = Math.floor(durationInSeconds / 60); // API might expect minutes

    // TODO: Determine actual audioUrl based on selection or a fixed one for now
    const audioUrlPlaceholder = selectedFrequencyDetails.audioUrl || 'placeholder_audio_url.mp3';
    const purpose = selectedFrequencyDetails.name; // e.g., "Focus", "Relaxation"

    try {
      console.debug('[BinauralSetupScreen] Attempting to start session with:', {
        userId: user.id,
        audioUrl: audioUrlPlaceholder,
        duration: durationInMinutes, // Sending duration in minutes as per original API design
        purpose,
      });

      const session = await startBinauralSession(
        user.id,
        audioUrlPlaceholder,
        durationInMinutes, 
        purpose
      );

      if (session && session.id) {
        console.debug('[BinauralSetupScreen] Session started successfully:', session);
        const frequencyData = {
          ...selectedFrequencyDetails,
          duration: durationInSeconds, // Pass duration in seconds to PlayerScreen for timer
          sessionId: session.id, // Pass the sessionId
          purpose: purpose,
          // audioUrl: session.audio_url, // Use the URL from the session if it's dynamic
        };
        navigation.navigate('BinauralPlayer', { frequencyData });
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