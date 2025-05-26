import React, { useState, useEffect, useMemo } from 'react';
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

// Default type if nothing else is specified
const DEFAULT_MINDFULNESS_TYPE_VALUE = 'breath';

const SetupScreen = ({ navigation, route }) => {
  const params = route.params || {};
  const { masterExerciseId, originRouteName } = params;
  const { user } = useUser();

  // Get details if navigating from DailyFocus or similar
  const initialExerciseDetails = useMemo(() => 
    masterExerciseId ? getExerciseById(masterExerciseId) : null
  , [masterExerciseId]);

  // Determine initial type
  const initialTypeValue = params.mindfulnessType || initialExerciseDetails?.defaultSettings?.mindfulnessType || DEFAULT_MINDFULNESS_TYPE_VALUE;
  
  // Find the full object for the initial type from MINDFULNESS_TYPES
  const initialTypeData = MINDFULNESS_TYPES.find(t => t.value === initialTypeValue) || MINDFULNESS_TYPES.find(t => t.value === DEFAULT_MINDFULNESS_TYPE_VALUE);

  // Determine initial duration
  const initialDuration = 
    params.duration || 
    initialExerciseDetails?.defaultSettings?.duration || 
    initialTypeData?.duration || // Duration from the selected MINDFULNESS_TYPES object
    300; // Fallback duration (5 mins)

  const [currentMindfulnessType, setCurrentMindfulnessType] = useState(initialTypeValue);
  const [sessionDuration, setSessionDuration] = useState(initialDuration);
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Effect to update state if masterExerciseId or specific params change after initial load
  useEffect(() => {
    console.debug('[MindfulnessSetupScreen] Params or masterExerciseId changed:', params);
    if (masterExerciseId && initialExerciseDetails) {
      const newType = initialExerciseDetails.defaultSettings?.mindfulnessType || DEFAULT_MINDFULNESS_TYPE_VALUE;
      const newDuration = initialExerciseDetails.defaultSettings?.duration || MINDFULNESS_TYPES.find(t=>t.value === newType)?.duration || 300;
      setCurrentMindfulnessType(newType);
      setSessionDuration(newDuration);
      console.debug(`[MindfulnessSetupScreen] Updated from masterExerciseId: type=${newType}, duration=${newDuration}`);
    } else if (params.mindfulnessType || params.duration) {
      // If no masterExerciseId, but specific params are given
      const newTypeFromParam = params.mindfulnessType || currentMindfulnessType;
      const typeDataFromParam = MINDFULNESS_TYPES.find(t => t.value === newTypeFromParam) || initialTypeData;
      const newDurationFromParam = params.duration || typeDataFromParam?.duration || sessionDuration;
      
      setCurrentMindfulnessType(newTypeFromParam);
      setSessionDuration(newDurationFromParam);
      console.debug(`[MindfulnessSetupScreen] Updated from direct params: type=${newTypeFromParam}, duration=${newDurationFromParam}`);
    }
  }, [params.mindfulnessType, params.duration, masterExerciseId, initialExerciseDetails]); // Rerun if specific params or masterId changes

  // Memoize selectedTypeData to prevent re-finding it on every render
  const selectedTypeData = useMemo(() => 
    MINDFULNESS_TYPES.find(type => type.value === currentMindfulnessType) || initialTypeData
  , [currentMindfulnessType, initialTypeData]);
  
  console.debug('[MindfulnessSetupScreen] Current state:', {
    params,
    masterExerciseId,
    initialExerciseDetails: initialExerciseDetails ? {id: initialExerciseDetails.id, type: initialExerciseDetails.defaultSettings?.mindfulnessType, duration: initialExerciseDetails.defaultSettings?.duration} : null,
    initialTypeValue,
    initialDuration,
    currentMindfulnessType,
    sessionDuration, // This should now reflect the selected type's duration or master default
    selectedTypeDataLabel: selectedTypeData?.label,
    selectedTypeDataDuration: selectedTypeData?.duration,
  });

  const handleStart = async () => {
    if (selectedEmotions.length === 0) {
      setSnackbarMessage('Please select at least one emotion');
      setSnackbarVisible(true);
      return;
    }
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!selectedTypeData) {
      console.error('[MindfulnessSetupScreen] Critical: selectedTypeData is undefined.');
      setSnackbarMessage('Invalid practice type selected. Please try again.');
      setSnackbarVisible(true);
      return;
    }
    
    // Ensure the sessionDuration from state is used for the player
    // selectedTypeData from MINDFULNESS_TYPES already contains the correct duration, icon, colors etc for that type.
    // We just override its duration with our state `sessionDuration` IF it was set by masterExerciseId or specific param.
    const finalTypeDataForPlayer = {
        ...selectedTypeData, // Base properties from MINDFULNESS_TYPES (icon, label, color, etc.)
        duration: sessionDuration, // Crucially, use the sessionDuration from state
    };

    const exerciseTypeForPlayer = masterExerciseId ? (getExerciseById(masterExerciseId)?.type || 'Mindfulness') : 'Mindfulness';

    const playerParams = {
        mindfulnessType: currentMindfulnessType, // The value string, e.g., 'breath'
        selectedEmotions,
        typeData: finalTypeDataForPlayer, // Pass the rich object with correct duration
        masterExerciseId: masterExerciseId, // Pass if available
        exerciseType: exerciseTypeForPlayer,
        originRouteName: originRouteName
    };

    console.debug('[MindfulnessSetupScreen] Navigating to MindfulnessPlayer with params:', playerParams);
    navigation.navigate('MindfulnessPlayer', playerParams);
  };

  const handleTypeChange = (typeValue) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newTypeData = MINDFULNESS_TYPES.find(t => t.value === typeValue);
    if (newTypeData) {
      setCurrentMindfulnessType(newTypeData.value);
      // IMPORTANT: Update sessionDuration based on the new type, unless a masterExerciseId is dictating duration
      if (!masterExerciseId) { 
        setSessionDuration(newTypeData.duration);
        console.debug(`[MindfulnessSetupScreen] Type changed to ${newTypeData.label}, duration updated to ${newTypeData.duration}s (no masterId).`);
      } else {
        // If masterExerciseId is present, duration is typically fixed by it. 
        // However, if the type changes, we might want to reconsider. For now, masterId duration takes precedence.
        console.debug(`[MindfulnessSetupScreen] Type changed to ${newTypeData.label}. Duration remains ${sessionDuration}s due to masterExerciseId.`);
      }
    } else {
      console.warn('[MindfulnessSetupScreen] Could not find data for selected type value:', typeValue);
    }
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
            selectedType={selectedTypeData}
            onSelectType={(typeValue) => handleTypeChange(typeValue)}
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