import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Appbar,
  IconButton,
  Button,
  Snackbar,
  Card
} from 'react-native-paper';
import { SPACING, COLORS, RADIUS, SHADOWS, FONT } from '../../../config/theme';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useUser } from '../../../hooks/useUser';
import { getExerciseById } from '../../../constants/masterExerciseList';

// Import local components and constants
import { MindfulnessTypeSelector } from './components/MindfulnessTypeSelector';
import EmotionPicker from '../../../components/exercises/EmotionPicker';
import { MINDFULNESS_TYPES } from './constants';
import SetupScreenButton from '../../../components/common/SetupScreenButton';
import SetupScreenButtonContainer from '../../../components/common/SetupScreenButtonContainer';

// Debug logging
console.debug('[MindfulnessSetupScreen] File loaded.');

const SetupScreen = ({ navigation, route }) => {
  const params = route.params || {};
  const { masterExerciseId } = params;
  const { user } = useUser();

  // Initial state determination
  // If masterExerciseId is present, try to get initial settings from MASTER_EXERCISE_LIST
  // This adds robustness if DailyFocus sends more specific initial settings beyond just type/duration.
  const initialExerciseDetails = masterExerciseId ? getExerciseById(masterExerciseId) : null;
  const defaultInitialType = initialExerciseDetails?.defaultSettings?.mindfulnessType || 'breath';
  const defaultInitialDuration = initialExerciseDetails?.defaultSettings?.duration || SESSION_DURATION_SECONDS; 

  const [currentMindfulnessType, setCurrentMindfulnessType] = useState(
    params.mindfulnessType || defaultInitialType
  );
  const [sessionDuration, setSessionDuration] = useState(
    params.duration || defaultInitialDuration
  );
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    console.debug('[MindfulnessSetupScreen] Received params on mount/update:', params);
    if (params.masterExerciseId) {
        console.debug('[MindfulnessSetupScreen] Master Exercise ID received:', params.masterExerciseId);
    }
    // Use params if explicitly passed, otherwise stick to defaults or master list derived defaults
    if (params.mindfulnessType && params.mindfulnessType !== currentMindfulnessType) {
      setCurrentMindfulnessType(params.mindfulnessType);
    }
    if (params.duration && params.duration !== sessionDuration) {
      setSessionDuration(params.duration);
    }
  }, [params]);

  // Get the selected mindfulness type data (this will re-calculate when mindfulnessType changes)
  const selectedType = MINDFULNESS_TYPES.find(type => type.value === currentMindfulnessType) || MINDFULNESS_TYPES[0];
  
  console.debug('[MindfulnessSetupScreen] State:', {
    initialParams: params,
    currentMindfulnessType: currentMindfulnessType,
    selectedEmotionsCount: selectedEmotions.length,
  });

  const handleStart = async () => {
    if (selectedEmotions.length === 0) {
      setSnackbarMessage('Please select at least one emotion');
      setSnackbarVisible(true);
      return;
    }
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const selectedTypeData = PRACTICE_TYPES[currentMindfulnessType];
    if (!selectedTypeData) {
      console.error('[MindfulnessSetupScreen] Invalid mindfulness type selected:', currentMindfulnessType);
      setSnackbarMessage('Invalid practice type selected.');
      setSnackbarVisible(true);
      return;
    }
    
    // Ensure masterExerciseId is passed to the player screen
    // Also pass the exerciseType from the master list if available, or default to 'Mindfulness'
    const exerciseDetailsForPlayer = masterExerciseId ? getExerciseById(masterExerciseId) : null;
    const exerciseTypeForPlayer = exerciseDetailsForPlayer?.type || 'Mindfulness';

    console.debug('[MindfulnessSetupScreen] Navigating to MindfulnessPlayer with params:', {
        mindfulnessType: currentMindfulnessType,
        selectedEmotions,
        typeData: {
          ...selectedTypeData, // from PRACTICE_TYPES constant
          duration: sessionDuration, // ensure updated duration is passed
        },
        masterExerciseId: masterExerciseId, // Pass it through
        exerciseType: exerciseTypeForPlayer, // Pass the determined exercise type
    });

    navigation.navigate('MindfulnessPlayer', {
      mindfulnessType: currentMindfulnessType,
      selectedEmotions,
      typeData: { 
        ...selectedTypeData, 
        duration: sessionDuration, 
      },
      masterExerciseId: masterExerciseId, // Crucial for logging in daily_exercise_logs
      exerciseType: exerciseTypeForPlayer,
    });
  };

  const handleTypeChange = (type) => {
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentMindfulnessType(type);
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
            title="Mindfulness Exercise" 
            titleStyle={styles.appbarTitle}
            subtitle="Focus & Awareness"
            subtitleStyle={styles.appbarSubtitle}
          />
          <IconButton
            icon="information"
            iconColor={COLORS.text}
            size={24}
            onPress={() => {
              // TODO: Show info modal about mindfulness
            }}
          />
        </Appbar.Header>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, styles.firstSectionTitle]}>Choose Your Practice</Text>
          
          <MindfulnessTypeSelector 
            mindfulnessTypes={MINDFULNESS_TYPES}
            selectedType={selectedType}
            onSelectType={handleTypeChange}
          />
          
          <Text style={styles.sectionTitle}>Current Emotional State</Text>
          
          <Card style={styles.emotionsCard} elevation={3}>
            <Card.Content>
              <EmotionPicker
                selectedEmotions={selectedEmotions}
                onSelectEmotion={setSelectedEmotions}
                maxSelections={3}
                helperText="Select up to 3 emotions you're feeling right now"
              />
            </Card.Content>
          </Card>
        </ScrollView>

        <SetupScreenButtonContainer>
          <SetupScreenButton
            label="Begin Practice"
            onPress={handleStart}
            icon="meditation"
            backgroundColor={COLORS.tealGradient.start}
          />
        </SetupScreenButtonContainer>

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
          {snackbarMessage}
        </Snackbar>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl + 80, // Extra padding for button
  },
  infoCard: {
    backgroundColor: COLORS.background,
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
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.xl * 1.5,
  },
  firstSectionTitle: {
    marginTop: SPACING.md, // Less margin for first section
  },
  emotionsCard: {
    borderRadius: RADIUS.lg,
    ...SHADOWS.medium,
  },
  snackbar: {
    bottom: SPACING.md,
  },
});

export default SetupScreen; 