import React, { useState } from 'react';
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

// Import local components and constants
import { MindfulnessTypeSelector } from './components/MindfulnessTypeSelector';
import EmotionPicker from '../../../components/exercises/EmotionPicker';
import { MINDFULNESS_TYPES } from './constants';
import SetupScreenButton from '../../../components/common/SetupScreenButton';
import SetupScreenButtonContainer from '../../../components/common/SetupScreenButtonContainer';

// Debug logging
console.debug('MindfulnessSetupScreen mounted');

const SetupScreen = ({ navigation }) => {
  const [mindfulnessType, setMindfulnessType] = useState('breath');
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState('');

  // Get the selected mindfulness type data
  const selectedType = MINDFULNESS_TYPES.find(type => type.value === mindfulnessType);
  
  // Debug logging for state changes
  console.debug('MindfulnessSetupScreen state:', {
    mindfulnessType,
    selectedEmotions
  });

  const handleStart = async () => {
    if (selectedEmotions.length === 0) {
      setError('Please select at least one emotion');
      setSnackbarVisible(true);
      return;
    }
    
    // Provide haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Debug logging for navigation
    console.debug('Starting mindfulness session:', {
      type: mindfulnessType,
      emotionsCount: selectedEmotions.length
    });

    navigation.navigate('MindfulnessPlayer', {
      mindfulnessType,
      selectedEmotions,
      typeData: selectedType
    });
  };

  const handleTypeChange = (type) => {
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMindfulnessType(type);
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
            backgroundColor={selectedType.color}
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