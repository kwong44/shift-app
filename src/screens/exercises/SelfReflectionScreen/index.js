import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  useTheme,
  Surface,
  Appbar,
  Card,
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
import { Header } from './components/Header';
import { InstructionCard } from './components/InstructionCard';
import { TopicSelector } from './components/TopicSelector';
import { QuestionCard } from './components/QuestionCard';
import EmotionPicker from '../../../components/exercises/EmotionPicker';
import { REFLECTION_TOPICS, REFLECTION_QUESTIONS } from './constants';

// Debug logging
console.debug('SelfReflectionScreen mounted');

const SelfReflectionScreen = ({ navigation }) => {
  const [topic, setTopic] = useState('accomplishments');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [response, setResponse] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);
  const [textInputHeight, setTextInputHeight] = useState(150);
  const theme = useTheme();

  // Get the selected topic data
  const selectedTopic = REFLECTION_TOPICS.find(t => t.value === topic);
  
  // Debug logging for state changes
  console.debug('SelfReflectionScreen state:', {
    topic,
    currentQuestionIndex,
    responseLength: response.length,
    selectedEmotions
  });

  useEffect(() => {
    // Reset response when changing questions
    setResponse('');
  }, [topic, currentQuestionIndex]);

  const handleSaveReflection = async () => {
    if (!response.trim()) {
      setError('Please write a response to the reflection question');
      setSnackbarVisible(true);
      return;
    }

    if (selectedEmotions.length === 0) {
      setError('Please select at least one emotion');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      // Provide haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Save reflection
      const { error: reflectionError } = await supabase
        .from('reflections')
        .insert({
          user_id: user.id,
          topic: topic,
          question: REFLECTION_QUESTIONS[topic][currentQuestionIndex],
          response: response.trim(),
          emotions: selectedEmotions,
        });

      if (reflectionError) throw reflectionError;

      // Update progress log
      const { error: progressError } = await supabase
        .from('progress_logs')
        .insert({
          user_id: user.id,
          exercise_type: 'reflection',
          details: {
            topic: topic,
            emotions: selectedEmotions,
          },
        });

      if (progressError) throw progressError;

      console.debug('Reflection saved successfully');
      setShowDialog(true);
    } catch (error) {
      console.error('Error saving reflection:', error);
      setError(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < REFLECTION_QUESTIONS[topic].length - 1) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = async () => {
    if (currentQuestionIndex > 0) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDialog(false);
    navigation.goBack();
  };

  const handleTopicChange = (newTopic) => {
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTopic(newTopic);
    setCurrentQuestionIndex(0);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header style={styles.appbar} elevated>
        <Appbar.BackAction 
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }} 
          color={COLORS.primary} 
        />
        <Appbar.Content title="Self-Reflection" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <Surface style={styles.content} elevation={0}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Header />
          
          <InstructionCard />

          <Text style={styles.sectionTitle}>Choose a Topic</Text>
          
          <View style={styles.topicsContainer}>
            <TopicSelector 
              topics={REFLECTION_TOPICS}
              selectedTopic={selectedTopic}
              onSelectTopic={handleTopicChange}
            />
          </View>

          <QuestionCard 
            selectedTopic={selectedTopic}
            questions={REFLECTION_QUESTIONS[topic]}
            currentQuestionIndex={currentQuestionIndex}
            response={response}
            setResponse={setResponse}
            onNextQuestion={handleNextQuestion}
            onPreviousQuestion={handlePreviousQuestion}
            textInputHeight={textInputHeight}
            setTextInputHeight={setTextInputHeight}
          />

          <Text style={styles.sectionTitle}>How do you feel about this reflection?</Text>
          
          <Card style={styles.emotionsCard} elevation={3}>
            <Card.Content>
              <EmotionPicker
                selectedEmotions={selectedEmotions}
                onSelectEmotion={setSelectedEmotions}
                maxSelections={3}
                helperText="Select up to 3 emotions that reflect how you feel"
              />
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={handleSaveReflection}
            style={styles.saveButton}
            labelStyle={styles.saveButtonLabel}
            icon="content-save"
            loading={loading}
          >
            Save Reflection
          </Button>
        </ScrollView>
      </Surface>

      <Portal>
        <Dialog visible={showDialog} onDismiss={handleFinish}>
          <LinearGradient
            colors={[`${COLORS.primary}10`, `${COLORS.secondary}05`]}
            style={styles.dialogGradient}
          >
            <Dialog.Title style={styles.dialogTitle}>Reflection Saved</Dialog.Title>
            <Dialog.Content>
              <View style={styles.dialogContent}>
                <MaterialCommunityIcons 
                  name="check-circle-outline" 
                  size={48} 
                  color={COLORS.primary} 
                  style={styles.dialogIcon} 
                />
                <Text style={styles.dialogText}>
                  Excellent reflection! Regular self-reflection helps you develop deeper self-awareness, recognize patterns in your life, and make conscious choices aligned with your values and goals.
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  appbar: {
    backgroundColor: COLORS.background,
  },
  appbarTitle: {
    color: COLORS.primary,
    fontWeight: FONT.weight.bold,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  topicsContainer: {
    marginHorizontal: SPACING.lg,
  },
  emotionsCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.lg,
    ...SHADOWS.medium,
  },
  saveButton: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 4,
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  saveButtonLabel: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
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

export default SelfReflectionScreen; 