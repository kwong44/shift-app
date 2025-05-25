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
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { logMindfulnessSession } from '../../../api/exercises';
import { useUser } from '../../../hooks/useUser';

// Import local components
import Timer from '../../../components/exercises/Timer';
import { SessionCard } from './components/SessionCard';
import CustomDialog from '../../../components/common/CustomDialog';

// Debug logging
console.debug('MindfulnessPlayerScreen mounted');

const PlayerScreen = ({ navigation, route }) => {
  const { mindfulnessType, selectedEmotions, typeData } = route.params;
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [pulseAnim] = useState(new Animated.Value(1));

  // Debug logging for props
  console.debug('MindfulnessPlayerScreen props:', {
    type: mindfulnessType,
    emotionsCount: selectedEmotions.length,
    userId: user?.id
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

  const handleComplete = async (actualDurationSpent) => {
    if (!user) {
      console.error('MindfulnessPlayerScreen] User not found, cannot log session.');
      setSnackbarMessage('User not identified. Cannot save session.');
      setSnackbarVisible(true);
      return;
    }
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.debug(`[MindfulnessPlayerScreen] Session complete. Actual duration: ${actualDurationSpent}s, Planned: ${typeData.duration}s`);

      const sessionLogData = {
        duration_seconds: actualDurationSpent,
        completed: true,
        emotions: selectedEmotions,
        fullResponse: {
          type: mindfulnessType,
          planned_duration_seconds: typeData.duration,
          emotions_before: selectedEmotions,
          guidance_type: typeData.guidance,
          audio_url: typeData.audioUrl || null
        }
      };

      await logMindfulnessSession(user.id, sessionLogData);

      console.debug('[MindfulnessPlayerScreen] Mindfulness session logged successfully (completed).');
      setShowDialog(true);
    } catch (error) {
      console.error('[MindfulnessPlayerScreen] Error logging completed mindfulness session:', error.message);
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionCancel = async (actualDurationSpent) => {
    console.debug(`[MindfulnessPlayerScreen] Session cancelled by user. Actual duration: ${actualDurationSpent}s`);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (user && actualDurationSpent > 0) {
      setLoading(true);
      try {
        const sessionLogData = {
          duration_seconds: actualDurationSpent,
          completed: false,
          emotions: selectedEmotions,
          fullResponse: {
            type: mindfulnessType,
            planned_duration_seconds: typeData.duration,
            emotions_before: selectedEmotions,
            cancelled_at_seconds: actualDurationSpent
          }
        };
        await logMindfulnessSession(user.id, sessionLogData);
        console.debug('[MindfulnessPlayerScreen] Mindfulness session logged successfully (cancelled).');
      } catch (error) {
        console.error('[MindfulnessPlayerScreen] Error logging cancelled mindfulness session:', error.message);
        setSnackbarMessage(`Could not log cancelled session: ${error.message}`);
        setSnackbarVisible(true);
      } finally {
        setLoading(false);
      }
    }
    navigation.goBack();
  };

  const handleFinish = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDialog(false);
    console.debug('[MindfulnessPlayerScreen] Navigating to ExercisesDashboard.');
    navigation.navigate('ExercisesDashboard');
  };

  if (!user) {
    return (
      <View style={styles.container_loading}>
        <Appbar.Header style={styles.appbar_transparent}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Loading..." />
        </Appbar.Header>
        <Text style={styles.errorText}>User information not available. Please restart.</Text>
      </View>
    );
  }

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
              onPress={() => handleSessionCancel(0)} 
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

        <CustomDialog
          visible={showDialog}
          onDismiss={handleFinish}
          title="Practice Complete"
          content="Well done! Regular mindfulness practice can help reduce stress, improve focus, and enhance emotional well-being. Try to incorporate these moments of awareness throughout your day."
          icon="check-circle-outline"
          confirmText="Done"
          onConfirm={handleFinish}
          iconColor={COLORS.primary}
          iconBackgroundColor={`${COLORS.primary}15`}
        />

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
          {snackbarMessage || 'An error occurred. Please try again.'}
        </Snackbar>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container_loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  appbar_transparent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  errorText: {
    marginTop: SPACING.md,
    color: COLORS.error,
    textAlign: 'center',
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
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONT.size.sm,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.lg,
  },
  waveCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  practiceTitle: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.background,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  dialogGradient: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
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
  dialogIcon: {
    marginBottom: SPACING.sm,
  },
  dialogText: {
    textAlign: 'center',
    color: COLORS.textLight,
    lineHeight: 22,
  },
  dialogButton: {
    marginTop: SPACING.md,
  },
  snackbar: {
    bottom: SPACING.md,
  },
});

export default PlayerScreen; 