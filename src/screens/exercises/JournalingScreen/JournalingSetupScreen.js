import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Appbar,
  Card,
  IconButton
} from 'react-native-paper';
import * as Haptics from 'expo-haptics';

import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../config/theme';
import { PromptTypeSelector } from './components/PromptTypeSelector';
import EmotionPicker from '../../../components/exercises/EmotionPicker';
import { PROMPT_TYPES } from './constants';
import SetupScreenButton from '../../../components/common/SetupScreenButton';
import SetupScreenButtonContainer from '../../../components/common/SetupScreenButtonContainer';

// Debug logging
console.debug('JournalingSetupScreen mounted');

const JournalingSetupScreen = ({ navigation, route }) => {
  const params = route.params || {};
  const { masterExerciseId, exerciseType, originRouteName } = params;

  const [promptType, setPromptType] = useState('gratitude');
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  
  // Get the selected prompt type data
  const selectedPromptType = PROMPT_TYPES.find(type => type.value === promptType);

  useEffect(() => {
    console.debug('[JournalingSetupScreen] Params received:', {
      masterExerciseId,
      exerciseType,
      originRouteName,
    });
  }, [masterExerciseId, exerciseType, originRouteName, params]);

  const handlePromptTypeChange = (newType) => {
    if (newType !== promptType) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPromptType(newType);
    }
  };

  const handleContinue = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Determine the correct masterExerciseId based on prompt type
    let determinedMasterExerciseId = masterExerciseId; // Use passed one if available
    
    if (!determinedMasterExerciseId) {
      // Map prompt type to masterExerciseId
      const promptToIdMap = {
        'gratitude': 'journaling_gratitude',
        'reflection': 'journaling_reflection',
        'growth': 'journaling_growth',
        'free_write': 'journaling_free_write'
      };
      
      determinedMasterExerciseId = promptToIdMap[promptType] || 'journaling_gratitude';
      console.debug('[JournalingSetupScreen] Determined masterExerciseId:', determinedMasterExerciseId, 'for prompt type:', promptType);
    }
    
    const entryParams = {
      promptType,
      selectedEmotions,
      masterExerciseId: determinedMasterExerciseId,
      exerciseType: exerciseType || 'Journaling',
      originRouteName
    };
    console.debug('[JournalingSetupScreen] Navigating to JournalingEntry with params (including determined masterId):', entryParams);
    navigation.navigate('JournalingEntry', entryParams);
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
            title="Journaling" 
            titleStyle={styles.appbarTitle} 
            subtitle="Setup your session"
            subtitleStyle={styles.appbarSubtitle}
          />
          <IconButton
            icon="information"
            iconColor={COLORS.text}
            size={24}
            onPress={() => {
              // TODO: Show info modal about journaling
            }}
          />
        </Appbar.Header>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Choose Your Focus</Text>
          
          <PromptTypeSelector 
            promptTypes={PROMPT_TYPES}
            selectedPromptType={selectedPromptType}
            onSelectPromptType={handlePromptTypeChange}
          />
          
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
          
          <Card style={styles.emotionsCard} elevation={3}>
            <Card.Content>
              <EmotionPicker
                selectedEmotions={selectedEmotions}
                onSelectEmotion={setSelectedEmotions}
                maxSelections={3}
                helperText="Select up to 3 emotions that reflect your current state"
              />
            </Card.Content>
          </Card>
        </ScrollView>

        <SetupScreenButtonContainer>
          <SetupScreenButton
            label="Continue to Journal"
            onPress={handleContinue}
            icon="arrow-right"
            backgroundColor={COLORS.pinkGradient.start}
          />
        </SetupScreenButtonContainer>
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
  sectionTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  emotionsCard: {
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.lg,
    ...SHADOWS.medium,
  },
});

export default JournalingSetupScreen; 