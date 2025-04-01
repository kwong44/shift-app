import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Animated } from 'react-native';
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
  Snackbar,
  TextInput,
  IconButton,
  Chip,
  TouchableRipple
} from 'react-native-paper';
import { SPACING, COLORS } from '../../config/theme';
import EmotionPicker from '../../components/exercises/EmotionPicker';
import { supabase } from '../../config/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const REFLECTION_TOPICS = [
  { 
    value: 'accomplishments', 
    label: 'Accomplishments', 
    description: 'Reflect on your achievements and progress',
    icon: 'trophy',
    color: '#4C63B6' 
  },
  { 
    value: 'challenges', 
    label: 'Challenges', 
    description: 'Examine difficulties and how you\'ve overcome them',
    icon: 'mountain',
    color: '#7D8CC4' 
  },
  { 
    value: 'growth', 
    label: 'Personal Growth', 
    description: 'Explore how you\'ve evolved over time',
    icon: 'sprout',
    color: '#5C96AE' 
  },
];

const REFLECTION_QUESTIONS = {
  accomplishments: [
    "What achievement are you most proud of lately and why?",
    "What obstacles did you overcome to reach a recent goal?",
    "How has achieving something recently changed your perspective?",
  ],
  challenges: [
    "What's been your biggest challenge recently and how did you approach it?",
    "What lessons have you learned from a recent difficulty?",
    "How has a recent challenge changed how you view yourself?",
  ],
  growth: [
    "In what ways have you grown in the last few months?",
    "What new strength or quality have you discovered in yourself recently?",
    "How have your priorities or values shifted over time?",
  ],
};

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

      setShowDialog(true);
    } catch (error) {
      console.error('Error saving reflection:', error);
      setError(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < REFLECTION_QUESTIONS[topic].length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    setShowDialog(false);
    navigation.goBack();
  };

  const selectedTopic = REFLECTION_TOPICS.find(t => t.value === topic);

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      <Text style={styles.headerTitle}>Self-Reflection Exercise</Text>
      <Text style={styles.headerSubtitle}>
        Deepen your self-awareness and personal insights
      </Text>
    </LinearGradient>
  );

  const renderTopicOption = (topicOption) => {
    const isSelected = topic === topicOption.value;
    
    return (
      <TouchableRipple
        key={topicOption.value}
        onPress={() => {
          setTopic(topicOption.value);
          setCurrentQuestionIndex(0);
        }}
      >
        <Card 
          style={[
            styles.topicOption,
            isSelected && { 
              borderColor: topicOption.color,
              borderWidth: 2
            }
          ]} 
          elevation={isSelected ? 4 : 2}
        >
          <LinearGradient
            colors={[`${topicOption.color}15`, `${topicOption.color}05`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.optionGradient}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${topicOption.color}25` }]}>
              <MaterialCommunityIcons name={topicOption.icon} size={28} color={topicOption.color} />
            </View>
            
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{topicOption.label}</Text>
              <Text style={styles.optionDescription}>{topicOption.description}</Text>
            </View>
            
            {isSelected && (
              <MaterialCommunityIcons name="check-circle" size={22} color={topicOption.color} />
            )}
          </LinearGradient>
        </Card>
      </TouchableRipple>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header style={styles.appbar} elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={COLORS.primary} />
        <Appbar.Content title="Self-Reflection" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <Surface style={styles.content} elevation={0}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          
          <Card style={styles.instructionCard} elevation={3}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Reflective Practice</Text>
                <IconButton 
                  icon="lightbulb-on" 
                  size={24} 
                  iconColor={COLORS.accent}
                  style={styles.headerIcon}
                />
              </View>
              <Text style={styles.instruction}>
                Choose a topic, respond to thought-provoking questions, and track your emotions. Regular self-reflection promotes personal growth and self-awareness.
              </Text>
            </Card.Content>
          </Card>

          <Text style={styles.sectionTitle}>Choose a Topic</Text>
          
          <View style={styles.topicsContainer}>
            {REFLECTION_TOPICS.map(renderTopicOption)}
          </View>

          <Card style={styles.questionCard} elevation={3}>
            <LinearGradient
              colors={[`${selectedTopic.color}15`, `${selectedTopic.color}05`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.questionGradient}
            >
              <Card.Content>
                <View style={styles.questionHeader}>
                  <IconButton
                    icon="chevron-left"
                    iconColor={COLORS.text}
                    size={24}
                    onPress={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    style={[
                      styles.questionNavButton,
                      currentQuestionIndex === 0 && styles.questionNavButtonDisabled
                    ]}
                  />
                  <Text style={styles.questionCount}>
                    Question {currentQuestionIndex + 1} of {REFLECTION_QUESTIONS[topic].length}
                  </Text>
                  <IconButton
                    icon="chevron-right"
                    iconColor={COLORS.text}
                    size={24}
                    onPress={handleNextQuestion}
                    disabled={currentQuestionIndex === REFLECTION_QUESTIONS[topic].length - 1}
                    style={[
                      styles.questionNavButton,
                      currentQuestionIndex === REFLECTION_QUESTIONS[topic].length - 1 && styles.questionNavButtonDisabled
                    ]}
                  />
                </View>
                
                <View style={styles.questionTextContainer}>
                  <MaterialCommunityIcons
                    name="format-quote-open"
                    size={20}
                    color={selectedTopic.color}
                    style={styles.quoteIcon}
                  />
                  <Text style={styles.questionText}>
                    {REFLECTION_QUESTIONS[topic][currentQuestionIndex]}
                  </Text>
                  <MaterialCommunityIcons
                    name="format-quote-close"
                    size={20}
                    color={selectedTopic.color}
                    style={[styles.quoteIcon, styles.quoteIconRight]}
                  />
                </View>

                <TextInput
                  mode="outlined"
                  placeholder="Write your thoughts here..."
                  value={response}
                  onChangeText={setResponse}
                  multiline
                  style={[styles.responseInput, {height: Math.max(150, textInputHeight)}]}
                  onContentSizeChange={(e) => setTextInputHeight(e.nativeEvent.contentSize.height)}
                />
              </Card.Content>
            </LinearGradient>
          </Card>

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
            <Dialog.Title>Reflection Saved</Dialog.Title>
            <Dialog.Content>
              <View style={styles.dialogContent}>
                <MaterialCommunityIcons name="check-circle-outline" size={48} color={COLORS.primary} style={styles.dialogIcon} />
                <Text style={styles.dialogText}>
                  Excellent reflection! Regular self-reflection helps you develop deeper self-awareness, recognize patterns in your life, and make conscious choices aligned with your values and goals.
                </Text>
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={handleFinish} mode="contained" style={styles.dialogButton}>Done</Button>
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
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  headerGradient: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.sm,
  },
  instructionCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerIcon: {
    backgroundColor: COLORS.accent + '20',
    borderRadius: 12,
  },
  instruction: {
    color: COLORS.textLight,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  topicsContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  topicOption: {
    marginBottom: SPACING.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  optionDescription: {
    color: COLORS.textLight,
    fontSize: 14,
  },
  questionCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  questionGradient: {
    borderRadius: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  questionNavButton: {
    margin: -SPACING.xs,
  },
  questionNavButtonDisabled: {
    opacity: 0.3,
  },
  questionCount: {
    fontWeight: '500',
    color: COLORS.text,
    fontSize: 14,
  },
  questionTextContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    position: 'relative',
  },
  questionText: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
    color: COLORS.text,
  },
  quoteIcon: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    opacity: 0.6,
  },
  quoteIconRight: {
    left: 'auto',
    right: SPACING.sm,
    top: 'auto',
    bottom: SPACING.sm,
  },
  responseInput: {
    backgroundColor: COLORS.background,
    minHeight: 150,
  },
  emotionsCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: 16,
  },
  saveButton: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 4,
    marginBottom: SPACING.xl,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  dialogGradient: {
    borderRadius: 16,
    padding: SPACING.sm,
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
  },
  dialogButton: {
    borderRadius: 8,
    marginLeft: SPACING.md,
  },
  snackbar: {
    bottom: SPACING.md,
  },
});

export default SelfReflectionScreen; 