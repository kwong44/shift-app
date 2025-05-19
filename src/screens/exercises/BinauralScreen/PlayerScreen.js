import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Appbar,
  Portal,
  Dialog,
  Button,
} from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT } from '../../../config/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import CustomDialog from '../../../components/common/CustomDialog';

// Import local components and hooks
import PlayerCard from './components/PlayerCard';
import { useBinauralAudio } from './hooks/useBinauralAudio';

// Debug logging
console.debug('BinauralPlayerScreen mounted');

const PlayerScreen = ({ navigation, route }) => {
  const { frequencyData } = route.params;
  const { 
    isPlaying,
    progress,
    timeElapsed,
    error,
    handlePlayPause,
    handleStop,
    resetAudio,
  } = useBinauralAudio(frequencyData);

  // Debug logging for props and state
  console.debug('BinauralPlayerScreen state:', {
    frequencyData,
    isPlaying,
    progress,
    timeElapsed,
    error,
    waveform: frequencyData.waveform,
    frequencyCategory: frequencyData.category
  });

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

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.screenGradient}
        >
          <Appbar.Header style={styles.appbar} statusBarHeight={0}>
            <Appbar.BackAction onPress={handleBack} color={COLORS.background} />
            <View>
              <Text style={styles.appbarTitle}>Binaural Beats</Text>
              <Text style={styles.appbarSubtitle}>{frequencyData.name}</Text>
            </View>
          </Appbar.Header>

          <View style={styles.content}>
            <PlayerCard
              frequency={frequencyData.frequency}
              duration={frequencyData.duration}
              isPlaying={isPlaying}
              progress={progress}
              timeElapsed={timeElapsed}
              onPlayPause={handlePlayPause}
              onStop={handleStop}
              waveform={frequencyData.waveform}
              frequencyCategory={frequencyData.category}
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
    color: COLORS.background,
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
});

export default PlayerScreen; 