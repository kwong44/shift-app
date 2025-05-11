import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Appbar,
  Portal,
  Dialog,
  Button,
  Snackbar
} from 'react-native-paper';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../config/theme';
import { supabase } from '../../../config/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Import local components
import Timer from '../../../components/exercises/Timer';
import { SessionCard } from './components/SessionCard';

// Debug logging
console.debug('MindfulnessPlayerScreen mounted');

const PlayerScreen = ({ navigation, route }) => {
  const { mindfulnessType, selectedEmotions, typeData } = route.params;
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  // Debug logging for props
  console.debug('MindfulnessPlayerScreen props:', {
    type: mindfulnessType,
    emotionsCount: selectedEmotions.length
  });

  // Pulse animation
  useEffect(() => {
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
    
    return () => {
      Animated.timing(pulseAnim).stop();
    };
  }, [pulseAnim]);

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Provide haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Save mindfulness session
      const { error: sessionError } = await supabase
        .from('mindfulness_sessions')
        .insert({
          user_id: user.id,
          type: mindfulnessType,
          duration: typeData.duration,
          emotions: selectedEmotions,
          completed: true
        });

      if (sessionError) throw sessionError;

      // Update progress log
      const { error: progressError } = await supabase
        .from('progress_logs')
        .insert({
          user_id: user.id,
          exercise_type: 'mindfulness',
          details: {
            type: mindfulnessType,
            duration: typeData.duration,
            emotions: selectedEmotions
          },
        });

      if (progressError) throw progressError;

      console.debug('Mindfulness session saved successfully');
      setShowDialog(true);
    } catch (error) {
      console.error('Error saving mindfulness session:', error);
      setError(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionCancel = async () => {
    // Provide haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleFinish = async () => {
    // Provide haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDialog(false);
    navigation.navigate('ExercisesDashboard');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[typeData.color, typeData.colorSecondary]}
        style={styles.screenGradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <Appbar.Header style={styles.appbar} statusBarHeight={0}>
            <Appbar.BackAction 
              onPress={handleSessionCancel} 
              color={COLORS.background} 
            />
            <View>
              <Text style={styles.appbarTitle}>Mindfulness</Text>
              <Text style={styles.appbarSubtitle}>{typeData.label}</Text>
            </View>
          </Appbar.Header>

          <View style={styles.content}>
            <Animated.View 
              style={[
                styles.waveCircle,
                {
                  backgroundColor: `${typeData.color}30`,
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            >
              <View style={styles.innerCircle}>
                <MaterialCommunityIcons 
                  name={typeData.icon} 
                  size={48} 
                  color={typeData.color}
                />
              </View>
            </Animated.View>
            
            <Text style={styles.practiceTitle}>
              {typeData.label}
            </Text>
            
            <Timer
              duration={typeData.duration}
              onComplete={handleComplete}
              onCancel={handleSessionCancel}
              color={typeData.color}
            />
            
            <SessionCard
              selectedType={typeData}
              selectedEmotions={selectedEmotions}
            />
          </View>
        </SafeAreaView>

        <Portal>
          <Dialog visible={showDialog} onDismiss={handleFinish}>
            <LinearGradient
              colors={[`${COLORS.primary}10`, `${COLORS.secondary}05`]}
              style={styles.dialogGradient}
            >
              <Dialog.Title style={styles.dialogTitle}>Practice Complete</Dialog.Title>
              <Dialog.Content>
                <View style={styles.dialogContent}>
                  <MaterialCommunityIcons 
                    name="check-circle-outline" 
                    size={48} 
                    color={COLORS.primary} 
                    style={styles.dialogIcon} 
                  />
                  <Text style={styles.dialogText}>
                    Well done! Regular mindfulness practice can help reduce stress, improve focus, and enhance emotional well-being. Try to incorporate these moments of awareness throughout your day.
                  </Text>
                </View>
              </Dialog.Content>
              <Dialog.Actions>
                <Button 
                  onPress={handleFinish} 
                  mode="contained" 
                  style={styles.dialogButton}
                >
                  Done
                </Button>
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
  screenGradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  appbar: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  appbarTitle: {
    color: COLORS.background,
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
  },
  appbarSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  waveCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  innerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    ...SHADOWS.medium,
  },
  practiceTitle: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.background,
    marginBottom: SPACING.lg,
  },
  dialogGradient: {
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
  },
  dialogTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
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
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  dialogButton: {
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  snackbar: {
    bottom: SPACING.md,
  },
});

export default PlayerScreen; 