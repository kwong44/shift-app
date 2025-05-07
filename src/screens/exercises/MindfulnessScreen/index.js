import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  useTheme,
  Appbar,
  Button,
  Portal,
  Dialog,
  Snackbar
} from 'react-native-paper';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../config/theme';
import { supabase } from '../../../config/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Import local components and constants
import { MindfulnessTypeSelector } from './components/MindfulnessTypeSelector';
import { PracticeInstructions } from './components/PracticeInstructions';
import { SessionCard } from './components/SessionCard';
import Timer from '../../../components/exercises/Timer';
import EmotionPicker from '../../../components/exercises/EmotionPicker';
import { MINDFULNESS_TYPES } from './constants';

// Debug logging
console.debug('MindfulnessScreen mounted');

const MindfulnessScreen = ({ navigation }) => {
  const [mindfulnessType, setMindfulnessType] = useState('breath');
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);
  const [pulseAnim] = useState(new Animated.Value(1));
  const theme = useTheme();

  // Get the selected mindfulness type data
  const selectedType = MINDFULNESS_TYPES.find(type => type.value === mindfulnessType);
  
  // Debug logging for state changes
  console.debug('MindfulnessScreen state:', {
    mindfulnessType,
    selectedEmotions,
    isSessionStarted
  });
  
  // Pulse animation
  useEffect(() => {
    if (isSessionStarted) {
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
  }, [isSessionStarted, pulseAnim]);

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
          duration: selectedType.duration,
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
            duration: selectedType.duration,
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

  const handleStart = async () => {
    if (selectedEmotions.length === 0) {
      setError('Please select at least one emotion');
      setSnackbarVisible(true);
      return;
    }
    
    // Provide haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSessionStarted(true);
  };

  const handleSessionCancel = async () => {
    // Provide haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSessionStarted(false);
  };

  const handleFinish = async () => {
    // Provide haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDialog(false);
    navigation.goBack();
  };

  const handleTypeChange = (type) => {
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMindfulnessType(type);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[selectedType.color, selectedType.colorSecondary]}
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
              title="Mindfulness Exercise" 
              titleStyle={styles.appbarTitle} 
              subtitle={selectedType.label}
              subtitleStyle={styles.appbarSubtitle}
            />
          </Appbar.Header>

          {!isSessionStarted ? (
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Practice Awareness</Text>
                <Text style={styles.infoText}>
                  Mindfulness helps you stay present and aware. Choose a practice, 
                  select your current emotions, and begin your session to 
                  reduce stress and improve mental clarity.
                </Text>
              </View>
              
              <Text style={styles.sectionTitle}>Choose Your Practice</Text>
              
              <MindfulnessTypeSelector 
                mindfulnessTypes={MINDFULNESS_TYPES}
                selectedType={selectedType}
                onSelectType={handleTypeChange}
              />
              
              <PracticeInstructions selectedType={selectedType} />
              
              <Text style={styles.sectionTitle}>Current Emotional State</Text>
              
              <View style={styles.emotionsCard}>
                <EmotionPicker
                  selectedEmotions={selectedEmotions}
                  onSelectEmotion={setSelectedEmotions}
                  maxSelections={3}
                  helperText="Select up to 3 emotions you're feeling right now"
                />
                
                <Button
                  mode="contained"
                  onPress={handleStart}
                  style={[styles.startButton, { backgroundColor: selectedType.color }]}
                  labelStyle={styles.startButtonLabel}
                  icon="meditation"
                  loading={loading}
                >
                  Begin Practice
                </Button>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.timerContainer}>
              <Animated.View 
                style={[
                  styles.waveCircle,
                  {
                    backgroundColor: `${selectedType.color}30`,
                    transform: [{ scale: pulseAnim }]
                  }
                ]}
              >
                <View style={styles.innerCircle}>
                  <MaterialCommunityIcons 
                    name={selectedType.icon} 
                    size={48} 
                    color={selectedType.color}
                  />
                </View>
              </Animated.View>
              
              <Text style={styles.practiceTitle}>
                {selectedType.label}
              </Text>
              
              <Timer
                duration={selectedType.duration}
                onComplete={handleComplete}
                onCancel={handleSessionCancel}
                color={selectedType.color}
              />
              
              <SessionCard
                selectedType={selectedType}
                selectedEmotions={selectedEmotions}
              />
            </View>
          )}
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
  },
  appbarTitle: {
    color: COLORS.background,
    fontWeight: FONT.weight.bold,
  },
  appbarSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  infoTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONT.size.md,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    color: COLORS.background,
    marginBottom: SPACING.md,
  },
  emotionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  startButton: {
    marginTop: SPACING.md,
    borderRadius: RADIUS.md,
    paddingVertical: 4,
    ...SHADOWS.medium,
  },
  startButtonLabel: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
  },
  timerContainer: {
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

export default MindfulnessScreen; 