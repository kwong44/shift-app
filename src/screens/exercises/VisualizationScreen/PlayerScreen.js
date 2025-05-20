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
  // Destructure route params
  const { visualizationType, duration } = route.params;
  const selectedType = VISUALIZATION_TYPES.find(t => t.value === visualizationType);
  
  // Use our custom hook for audio playback
  const { 
    isPlaying,
    progress,
    timeElapsed,
    error,
    loading,
    handlePlayPause,
    handleStop,
    resetAudio,
  } = useVisualizationAudio(selectedType, duration);

  // Debug logging for props and state
  console.debug('VisualizationPlayerScreen state:', {
    visualizationType,
    selectedTypeLabel: selectedType?.label,
    isPlaying,
    progress,
    timeElapsed,
    error,
    loading
  });

  // Auto-stop when complete
  useEffect(() => {
    if (progress >= 1) {
      handleStop();
    }
  }, [progress]);

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleStop();
    navigation.goBack();
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