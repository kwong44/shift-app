import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Appbar,
  Card,
  Button,
  IconButton
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../config/theme';
import { PromptTypeSelector } from './components/PromptTypeSelector';
import EmotionPicker from '../../../components/exercises/EmotionPicker';
import { PROMPT_TYPES } from './constants';

const JournalingSetupScreen = ({ navigation }) => {
  const [promptType, setPromptType] = useState('gratitude');
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  
  // Get the selected prompt type data
  const selectedPromptType = PROMPT_TYPES.find(type => type.value === promptType);

  const handlePromptTypeChange = (newType) => {
    if (newType !== promptType) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPromptType(newType);
    }
  };

  const handleContinue = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('JournalingEntry', {
      promptType,
      selectedEmotions
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={selectedPromptType.gradient[0]} />
      <LinearGradient
        colors={selectedPromptType.gradient}
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
              title="Journaling" 
              titleStyle={styles.appbarTitle} 
              subtitle="Setup your session"
              subtitleStyle={styles.appbarSubtitle}
            />
          </Appbar.Header>

          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Card style={styles.instructionCard} elevation={3}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Daily Journal</Text>
                  <IconButton 
                    icon="book-open-page-variant" 
                    size={24} 
                    iconColor={selectedPromptType.color}
                    style={styles.headerIcon}
                  />
                </View>
                <Text style={styles.instruction}>
                  Take a moment to reflect on your experiences and feelings. Choose a focus area and identify your emotions.
                </Text>
              </Card.Content>
            </Card>
            
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

          <View style={styles.bottomContainer}>
            <Button
              mode="contained"
              onPress={handleContinue}
              style={[styles.continueButton, { backgroundColor: selectedPromptType.color }]}
              labelStyle={styles.continueButtonLabel}
              icon="arrow-right"
            >
              Continue to Journal
            </Button>
          </View>
        </SafeAreaView>
      </LinearGradient>
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
    paddingBottom: SPACING.md,
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
  bottomContainer: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  continueButton: {
    borderRadius: RADIUS.md,
    paddingVertical: 4,
    ...SHADOWS.medium,
  },
  continueButtonLabel: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
  },
});

export default JournalingSetupScreen; 