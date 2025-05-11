import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Appbar,
  Card,
  IconButton,
  Snackbar
} from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../config/theme';
import * as Haptics from 'expo-haptics';

// Import local components and constants
import { SessionDurationSelector } from './components/SessionDurationSelector';
import { TaskInput } from './components/TaskInput';
import { SESSION_DURATIONS } from './constants';
import SetupScreenButton from '../../../components/common/SetupScreenButton';
import SetupScreenButtonContainer from '../../../components/common/SetupScreenButtonContainer';

// Debug logging
console.debug('DeepWorkSetupScreen mounted');

const SetupScreen = ({ navigation }) => {
  const [selectedDuration, setSelectedDuration] = useState(1500);
  const [taskDescription, setTaskDescription] = useState('');
  const [textInputHeight, setTextInputHeight] = useState(80);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState('');

  // Get the selected duration data
  const selectedDurationData = SESSION_DURATIONS.find(d => d.value === selectedDuration);
  
  // Debug logging for state changes
  console.debug('DeepWorkSetupScreen state:', {
    selectedDuration,
    taskLength: taskDescription.length
  });

  const handleStart = async () => {
    if (!taskDescription.trim()) {
      setError('Please describe your task');
      setSnackbarVisible(true);
      return;
    }
    
    // Provide haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Debug logging for navigation
    console.debug('Starting deep work session:', {
      taskLength: taskDescription.trim().length,
      duration: selectedDuration
    });

    navigation.navigate('DeepWorkPlayer', {
      taskDescription: taskDescription.trim(),
      duration: selectedDuration,
      durationData: selectedDurationData
    });
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
            title="Deep Work Session" 
            titleStyle={styles.appbarTitle}
            subtitle="Focus & Productivity"
            subtitleStyle={styles.appbarSubtitle}
          />
          <IconButton
            icon="information"
            iconColor={COLORS.text}
            size={24}
            onPress={() => {
              // TODO: Show info modal about deep work
            }}
          />
        </Appbar.Header>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>What will you work on?</Text>
          
          <TaskInput 
            taskDescription={taskDescription}
            setTaskDescription={setTaskDescription}
            textInputHeight={textInputHeight}
            setTextInputHeight={setTextInputHeight}
          />

          <Text style={styles.sectionTitle}>Session Duration</Text>
          
          <View style={styles.durationContainer}>
            <SessionDurationSelector 
              durations={SESSION_DURATIONS}
              selectedDuration={selectedDuration}
              onSelectDuration={setSelectedDuration}
            />
          </View>
        </ScrollView>

        <SetupScreenButtonContainer>
          <SetupScreenButton
            label="Start Deep Work Session"
            onPress={handleStart}
            icon="clock-start"
            backgroundColor={selectedDurationData.color}
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
          {error}
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
    paddingBottom: SPACING.xl + 80, // Extra padding for button
  },
  sectionTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  durationContainer: {
    marginHorizontal: SPACING.lg,
  },
  snackbar: {
    bottom: SPACING.md,
  },
});

export default SetupScreen; 