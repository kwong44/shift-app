import React, { useEffect, useState } from 'react';
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
  const { 
    visualizationId, 
    visualizationType, 
    duration, 
    typeData, 
    content,
    masterExerciseId,
    exerciseType,
    originRouteName
  } = route.params;
  const selectedType = typeData;
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  
  const handleSessionCompletionNavigation = () => {
    setShowCompletionDialog(false);
    const targetRoute = originRouteName || 'ExercisesDashboard';
    console.debug(`[VisualizationPlayerScreen] Navigating to ${targetRoute} after completion dialog.`);
    navigation.navigate(targetRoute);
  };

  const { 
    isPlaying,
    progress,
    timeElapsed,
    error,
    loading,
    handlePlayPause,
    handleStop,
    resetAudio,
    isSessionComplete
  } = useVisualizationAudio(
    selectedType, 
    duration, 
    visualizationId, 
    masterExerciseId, 
    exerciseType,
    () => setShowCompletionDialog(true)
  );

  console.debug('[VisualizationPlayerScreen] State & Props:', {
    visualizationId,
    visualizationType,
    content,
    selectedTypeLabel: selectedType?.label,
    duration,
    masterExerciseId,
    exerciseType,
    isPlaying,
    progress,
    timeElapsed,
    error,
    loading,
    originRouteName,
    isSessionComplete
  });

  useEffect(() => {
    if (isSessionComplete && !showCompletionDialog) {
      console.debug('[VisualizationPlayerScreen] isSessionComplete is true, ensuring dialog is shown.');
    }
  }, [isSessionComplete, showCompletionDialog]);

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (handleStop) {
        await handleStop();
    }
    navigation.goBack();
  };

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
            visible={showCompletionDialog}
            onDismiss={handleSessionCompletionNavigation}
            title="Visualization Complete!"
            content="You've successfully completed your visualization. Keep this feeling with you."
            confirmText="Awesome!"
            onConfirm={handleSessionCompletionNavigation}
            icon="check-circle"
            iconColor={COLORS.success}
          />

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