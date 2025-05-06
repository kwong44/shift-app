import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Animated, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Appbar,
  Button,
  Portal,
  Dialog,
  Snackbar,
} from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT } from '../../../config/theme';
import { supabase } from '../../../config/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Import local components and hooks
import { PlayerCard } from './components/PlayerCard';
import { FrequencySelector } from './components/FrequencySelector';
import { useBinauralAudio } from './hooks/useBinauralAudio';
import { FREQUENCIES } from './constants';

// Debug logging
console.debug('BinauralScreen mounted');

const BinauralScreen = ({ navigation }) => {
  const [selectedFrequency, setSelectedFrequency] = useState('focus');
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);
  const [pulseAnim] = useState(new Animated.Value(1));
  
  const selectedFrequencyData = FREQUENCIES.find(f => f.value === selectedFrequency);
  
  const {
    isPlaying,
    progress,
    timeElapsed,
    error: audioError,
    handlePlayPause,
    handleStop,
    resetAudio,
  } = useBinauralAudio(selectedFrequencyData);

  // Debug logging for state changes
  console.debug('BinauralScreen state:', {
    selectedFrequency,
    isPlaying,
    loading,
    progress
  });

  // Pulse animation
  useEffect(() => {
    if (isPlaying) {
      const pulsate = Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ]);
      
      Animated.loop(pulsate).start();
    } else {
      pulseAnim.setValue(1);
      Animated.timing(pulseAnim).stop();
    }
    
    return () => {
      Animated.timing(pulseAnim).stop();
    };
  }, [isPlaying, pulseAnim]);

  useEffect(() => {
    if (audioError) {
      setError(audioError);
      setSnackbarVisible(true);
    }
  }, [audioError]);

  const handleFrequencyChange = async (frequencyValue) => {
    if (frequencyValue !== selectedFrequency) {
      setSelectedFrequency(frequencyValue);
      resetAudio();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      console.debug('Saving binaural session');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Save binaural session
      const { error: sessionError } = await supabase
        .from('binaural_sessions')
        .insert({
          user_id: user.id,
          frequency_type: selectedFrequency,
          duration: selectedFrequencyData.duration,
          completed: true
        });

      if (sessionError) throw sessionError;

      // Update progress log
      const { error: progressError } = await supabase
        .from('progress_logs')
        .insert({
          user_id: user.id,
          exercise_type: 'binaural',
          details: {
            frequency_type: selectedFrequency,
            duration: selectedFrequencyData.duration
          },
        });

      if (progressError) throw progressError;

      console.debug('Session saved successfully');
      setShowDialog(true);
    } catch (error) {
      console.error('Error saving binaural session:', error);
      setError(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDialog(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={selectedFrequencyData.gradient}
        style={styles.screenGradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <Appbar.Header style={styles.appbar} statusBarHeight={0}>
            <Appbar.BackAction 
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.goBack();
              }} 
              color={COLORS.background} 
            />
            <Appbar.Content 
              title="Binaural Beats" 
              titleStyle={styles.appbarTitle} 
              subtitle={selectedFrequencyData.label}
              subtitleStyle={styles.appbarSubtitle}
            />
          </Appbar.Header>

          <View style={styles.content}>
            <View style={styles.mainContent}>
              <PlayerCard 
                frequencyData={selectedFrequencyData}
                isPlaying={isPlaying}
                progress={progress}
                timeElapsed={timeElapsed}
                pulseAnim={pulseAnim}
                onPlayPause={handlePlayPause}
                onStop={handleStop}
                onComplete={handleComplete}
              />
              
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>How to Use</Text>
                <Text style={styles.infoText}>
                  Find a comfortable position, put on your headphones, and close your eyes.
                  Binaural beats work best with stereo headphones in a quiet environment.
                </Text>
              </View>
            </View>
            
            <FrequencySelector 
              selectedFrequency={selectedFrequency}
              onFrequencyChange={handleFrequencyChange}
              loading={loading}
            />
          </View>
        </SafeAreaView>

        <Portal>
          <Dialog visible={showDialog} onDismiss={handleFinish}>
            <LinearGradient
              colors={[`${COLORS.primary}10`, `${COLORS.secondary}05`]}
              style={styles.dialogGradient}
            >
              <Dialog.Title style={styles.dialogTitle}>Session Complete</Dialog.Title>
              <Dialog.Content>
                <View style={styles.dialogContent}>
                  <MaterialCommunityIcons name="check-circle-outline" size={48} color={COLORS.primary} style={styles.dialogIcon} />
                  <Text style={styles.dialogText}>
                    Great work completing your binaural beats session! Regular practice can help improve your focus, relaxation, and mental clarity.
                  </Text>
                </View>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={handleFinish} mode="contained" style={styles.dialogButton}>Done</Button>
              </Dialog.Actions>
            </LinearGradient>
          </Dialog>
        </Portal>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          action={{
            label: 'OK',
            onPress: () => setSnackbarVisible(false),
          }}
          style={styles.snackbar}
        >
          {error || 'An error occurred. Please try again.'}
        </Snackbar>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
    justifyContent: 'space-between',
  },
  mainContent: {
    padding: SPACING.md,
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  infoTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semiBold,
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: FONT.size.sm,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  dialogGradient: {
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
  },
  dialogTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.semiBold,
    color: COLORS.text,
    textAlign: 'center',
  },
  dialogContent: {
    alignItems: 'center',
  },
  dialogIcon: {
    marginBottom: SPACING.md,
  },
  dialogText: {
    textAlign: 'center',
    lineHeight: 22,
    fontSize: FONT.size.md,
    color: COLORS.textLight,
  },
  dialogButton: {
    borderRadius: RADIUS.md,
    marginLeft: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  snackbar: {
    bottom: SPACING.md,
  },
});

export default BinauralScreen; 