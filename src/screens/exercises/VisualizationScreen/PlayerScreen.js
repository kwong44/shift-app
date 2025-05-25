import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Snackbar, Text, Appbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../config/theme';
import * as Haptics from 'expo-haptics';
import CustomDialog from '../../../components/common/CustomDialog';

// Import local components and hooks
import PlayerCard from './components/PlayerCard';
import { useVisualizationAudio } from './hooks/useVisualizationAudio';
import { VISUALIZATION_TYPES } from './constants';

// Debug logging
console.debug('VisualizationPlayerScreen mounted');

const PlayerScreen = ({ route, navigation }) => {
  // Destructure route params - including visualizationId, typeData, and content
  const { visualizationId, visualizationType, duration, typeData, content } = route.params;
  // const selectedType = VISUALIZATION_TYPES.find(t => t.value === visualizationType); // typeData is now passed directly
  const selectedType = typeData; // Use typeData directly from params
  
  // Use our custom hook for audio playback
  const { 
    isPlaying,
    progress,
    timeElapsed,
    error,
    loading,
    handlePlayPause,
    handleStop, // This stop should now handle API call via the hook
    resetAudio,
  } = useVisualizationAudio(selectedType, duration, visualizationId); // Pass visualizationId to the hook

  // Debug logging for props and state
  console.debug('[VisualizationPlayerScreen] State & Props:', {
    visualizationId,
    visualizationType,
    content, // Log the content being visualized
    selectedTypeLabel: selectedType?.label,
    duration, // Planned duration
    isPlaying,
    progress,
    timeElapsed, // Actual time elapsed from hook
    error,
    loading // Loading state from hook
  });

  // Auto-stop when complete (This might be redundant if hook's handleStop is robust)
  // Consider if this useEffect is still needed or if the hook manages completion fully.
  useEffect(() => {
    if (progress >= 1 && !loading) { // Ensure not already in a loading state (e.g. from API call)
      // handleStop(); // The hook's handleStop should be called by the timer or player events directly
      // For now, let's assume the hook or PlayerCard's onStop will trigger the hook's handleStop.
      console.debug('[VisualizationPlayerScreen] Progress reached 1. Hook should handle completion.');
    }
  }, [progress, loading]); // Removed handleStop from dependencies to avoid re-triggering

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // handleStop(); // Call the hook's handleStop which now includes API call
    // The hook's handleStop should also manage navigation or signal completion for navigation.
    // For now, let PlayerCard's onStop call the hook's handleStop, or if hook needs explicit call:
    if (handleStop) {
        await handleStop(); // Ensure it handles async nature if any
    }
    navigation.goBack(); // Navigation might occur after hook processes stop
  };

  // Display loading indicator if loading
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.coralGradient.start} />
        <Text style={styles.loadingText}>Setting up your visualization...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.coralGradient.start} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LinearGradient
          colors={[COLORS.coralGradient.start, COLORS.coralGradient.end]}
          style={styles.screenGradient}
        >
          <Appbar.Header style={styles.appbar} statusBarHeight={0}>
            <Appbar.BackAction onPress={handleBack} color={COLORS.textOnColor} />
            <View>
              <Text style={styles.appbarTitle}>Visualization</Text>
              <Text style={styles.appbarSubtitle}>{selectedType.label}</Text>
            </View>
          </Appbar.Header>

          <View style={styles.content}>
            <PlayerCard
              visualizationType={selectedType}
              duration={duration}
              isPlaying={isPlaying}
              progress={progress}
              timeElapsed={timeElapsed}
              onPlayPause={handlePlayPause}
              onStop={handleStop}
            />
          </View>

          <CustomDialog
            visible={!!error}
            onDismiss={resetAudio}
            title="Error"
            content={error}
            confirmText="OK"
            onConfirm={resetAudio}
            icon="alert-circle"
            iconColor={COLORS.error}
            iconBackgroundColor="rgba(255,59,48,0.1)"
          />
        </LinearGradient>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textLight,
    fontSize: FONT.size.md,
  },
  safeArea: {
    flex: 1,
  },
  screenGradient: {
    flex: 1,
  },
  appbar: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  appbarTitle: {
    color: COLORS.textOnColor,
    fontWeight: FONT.weight.bold,
    fontSize: FONT.size.lg,
  },
  appbarSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: FONT.weight.medium,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  dialogTitle: {
    textAlign: 'center',
    color: COLORS.text,
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
  },
  dialogContent: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  snackbar: {
    bottom: SPACING.md,
  },
});

export default PlayerScreen; 