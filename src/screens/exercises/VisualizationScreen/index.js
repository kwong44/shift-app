import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Appbar,
  Card,
  Button,
  Portal,
  Dialog,
  Snackbar,
  IconButton
} from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../config/theme';
import { supabase } from '../../../config/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Import local components and constants
import { VisualizationTypeSelector } from './components/VisualizationTypeSelector';
import { AffirmationInput } from './components/AffirmationInput';
import { SessionCard } from './components/SessionCard';
import Timer from '../../../components/exercises/Timer';
import EmotionPicker from '../../../components/exercises/EmotionPicker';
import { VISUALIZATION_TYPES, SESSION_DURATION, getAffirmationPlaceholder } from './constants';

// Debug logging
console.debug('VisualizationScreen mounted');

const VisualizationScreen = ({ navigation }) => {
  const [visualizationType, setVisualizationType] = useState('goals');
  const [affirmation, setAffirmation] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);
  const [textInputHeight, setTextInputHeight] = useState(120);

  // Get the selected visualization type data
  const selectedType = VISUALIZATION_TYPES.find(t => t.value === visualizationType);
  
  // Debug logging for state changes
  console.debug('VisualizationScreen state:', {
    visualizationType,
    affirmationLength: affirmation.length,
    selectedEmotions,
    isSessionStarted
  });

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Provide haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Save visualization session
      const { error: sessionError } = await supabase
        .from('visualizations')
        .insert({
          user_id: user.id,
          type: visualizationType,
          affirmation: affirmation.trim(),
          emotions: selectedEmotions,
          duration: SESSION_DURATION,
          completed: true
        });

      if (sessionError) throw sessionError;

      // Update progress log
      const { error: progressError } = await supabase
        .from('progress_logs')
        .insert({
          user_id: user.id,
          exercise_type: 'visualization',
          details: {
            type: visualizationType,
            emotions: selectedEmotions,
            duration: SESSION_DURATION
          },
        });

      if (progressError) throw progressError;

      console.debug('Visualization session saved successfully');
      setShowDialog(true);
    } catch (error) {
      console.error('Error saving visualization session:', error);
      setError(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!affirmation.trim()) {
      setError('Please enter an affirmation');
      setSnackbarVisible(true);
      return;
    }
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
    setVisualizationType(type);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={selectedType.gradient || [COLORS.primary, COLORS.secondary]}
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
              title="Visualization" 
              titleStyle={styles.appbarTitle}
              subtitle={selectedType.label}
              subtitleStyle={styles.appbarSubtitle}
            />
          </Appbar.Header>

          {!isSessionStarted ? (
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Card style={styles.instructionCard} elevation={3}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Create Your Visualization</Text>
                    <IconButton 
                      icon="brain" 
                      size={24} 
                      iconColor={selectedType.color}
                      style={styles.headerIcon}
                    />
                  </View>
                  <Text style={styles.instruction}>
                    Choose a focus area, write an affirmation, and select emotions you want to cultivate during your practice.
                  </Text>
                </Card.Content>
              </Card>

              <Text style={styles.sectionTitle}>Focus Area</Text>
              
              <VisualizationTypeSelector 
                visualizationTypes={VISUALIZATION_TYPES}
                selectedType={selectedType}
                onSelectType={handleTypeChange}
              />

              <Text style={styles.sectionTitle}>Your Affirmation</Text>
              
              <AffirmationInput 
                affirmation={affirmation}
                setAffirmation={setAffirmation}
                placeholder={getAffirmationPlaceholder(visualizationType)}
                textInputHeight={textInputHeight}
                setTextInputHeight={setTextInputHeight}
              />

              <Text style={styles.sectionTitle}>Emotions to Cultivate</Text>
              
              <Card style={styles.emotionsCard} elevation={3}>
                <Card.Content>
                  <EmotionPicker
                    selectedEmotions={selectedEmotions}
                    onSelectEmotion={setSelectedEmotions}
                    maxSelections={3}
                    helperText="Select up to 3 emotions you want to embody"
                  />
                </Card.Content>
              </Card>

              <Button
                mode="contained"
                onPress={handleStart}
                style={[styles.startButton, { backgroundColor: selectedType.color }]}
                labelStyle={styles.startButtonLabel}
                icon="meditation"
                loading={loading}
              >
                Start Visualization
              </Button>
            </ScrollView>
          ) : (
            <View style={styles.sessionContainer}>
              <LinearGradient
                colors={[`${selectedType.color}30`, COLORS.background]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0.7 }}
                style={styles.timerContainer}
              >
                <Timer
                  duration={SESSION_DURATION}
                  onComplete={handleComplete}
                  onCancel={handleSessionCancel}
                  color={selectedType.color}
                />
                
                <SessionCard 
                  visualizationType={selectedType}
                  affirmation={affirmation}
                  selectedEmotions={selectedEmotions}
                />
              </LinearGradient>
            </View>
          )}
        </SafeAreaView>

        <Portal>
          <Dialog visible={showDialog} onDismiss={handleFinish}>
            <LinearGradient
              colors={[`${selectedType.color}15`, `${selectedType.color}05`]}
              style={styles.dialogGradient}
            >
              <Dialog.Title style={styles.dialogTitle}>Visualization Complete</Dialog.Title>
              <Dialog.Content>
                <View style={styles.dialogContent}>
                  <MaterialCommunityIcons 
                    name="check-circle-outline" 
                    size={48} 
                    color={selectedType.color} 
                    style={styles.dialogIcon} 
                  />
                  <Text style={styles.dialogText}>
                    Excellent work! Regular visualization practice can help strengthen your mindset and bring you closer to your goals. Remember to carry this positive energy throughout your day.
                  </Text>
                </View>
              </Dialog.Content>
              <Dialog.Actions>
                <Button 
                  onPress={handleFinish} 
                  mode="contained" 
                  buttonColor={selectedType.color}
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
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
  },
  appbarSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: FONT.size.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  instructionCard: {
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
  },
  headerIcon: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: RADIUS.sm,
  },
  instruction: {
    color: COLORS.textLight,
    lineHeight: 20,
    fontSize: FONT.size.sm,
  },
  sectionTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    color: COLORS.background,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  emotionsCard: {
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.lg,
    ...SHADOWS.medium,
  },
  startButton: {
    borderRadius: RADIUS.md,
    paddingVertical: 4,
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  startButtonLabel: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
  },
  sessionContainer: {
    flex: 1,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
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
  },
  snackbar: {
    bottom: SPACING.md,
  },
});

export default VisualizationScreen; 