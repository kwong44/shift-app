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
  SegmentedButtons,
  IconButton,
  Chip,
  TouchableRipple
} from 'react-native-paper';
import { SPACING, COLORS } from '../../config/theme';
import EmotionPicker from '../../components/exercises/EmotionPicker';
import { supabase } from '../../config/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const JOURNAL_PROMPTS = {
  gratitude: [
    "What are three things you're grateful for today?",
    "Who made a positive impact on your day and why?",
    "What opportunity or challenge are you thankful for?",
  ],
  reflection: [
    "What was the most meaningful part of your day?",
    "What did you learn about yourself today?",
    "How did you handle challenges that arose?",
  ],
  growth: [
    "What progress did you make toward your goals today?",
    "What would you like to improve or do differently tomorrow?",
    "What new insight or skill did you gain today?",
  ],
};

const PROMPT_TYPES = [
  { value: 'gratitude', label: 'Gratitude', icon: 'heart', color: '#4C63B6' },
  { value: 'reflection', label: 'Reflection', icon: 'thought-bubble', color: '#7D8CC4' },
  { value: 'growth', label: 'Growth', icon: 'sprout', color: '#5C96AE' },
];

const JournalingScreen = ({ navigation }) => {
  const [promptType, setPromptType] = useState('gratitude');
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [entry, setEntry] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);
  const [textInputHeight, setTextInputHeight] = useState(150);
  const theme = useTheme();

  useEffect(() => {
    // Reset entry when prompt type changes
    setEntry('');
    setCurrentPrompt(0);
  }, [promptType]);

  const handleSaveEntry = async () => {
    if (!entry.trim()) {
      setError('Please write something in your journal');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Save journal entry
      const { error: entryError } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          content: entry.trim(),
          prompt_type: promptType,
          prompt: JOURNAL_PROMPTS[promptType][currentPrompt],
          emotions: selectedEmotions,
        });

      if (entryError) throw entryError;

      // Update progress log
      const { error: progressError } = await supabase
        .from('progress_logs')
        .insert({
          user_id: user.id,
          exercise_type: 'journaling',
          details: {
            prompt_type: promptType,
            emotions: selectedEmotions,
          },
        });

      if (progressError) throw progressError;

      setShowDialog(true);
    } catch (error) {
      console.error('Error saving journal entry:', error);
      setError(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPrompt = () => {
    if (currentPrompt < JOURNAL_PROMPTS[promptType].length - 1) {
      setCurrentPrompt(prev => prev + 1);
      setEntry('');
    }
  };

  const handlePreviousPrompt = () => {
    if (currentPrompt > 0) {
      setCurrentPrompt(prev => prev - 1);
      setEntry('');
    }
  };

  const handleFinish = () => {
    setShowDialog(false);
    navigation.goBack();
  };

  const selectedPromptType = PROMPT_TYPES.find(type => type.value === promptType);

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      <Text style={styles.headerTitle}>Journaling Exercise</Text>
      <Text style={styles.headerSubtitle}>
        Reflect on your experiences and process your thoughts
      </Text>
    </LinearGradient>
  );

  const renderPromptTypeOption = (type) => {
    const isSelected = promptType === type.value;
    
    return (
      <TouchableRipple
        key={type.value}
        onPress={() => setPromptType(type.value)}
      >
        <Card 
          style={[
            styles.typeOption,
            isSelected && { 
              borderColor: type.color,
              borderWidth: 2
            }
          ]} 
          elevation={isSelected ? 4 : 2}
        >
          <LinearGradient
            colors={[`${type.color}15`, `${type.color}05`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.optionGradient}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${type.color}25` }]}>
              <MaterialCommunityIcons name={type.icon} size={28} color={type.color} />
            </View>
            
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{type.label}</Text>
              <Text style={styles.optionDescription}>
                {type.value === 'gratitude' ? 'Express appreciation for positive aspects of your life' : 
                 type.value === 'reflection' ? 'Explore your thoughts and experiences' : 
                 'Focus on personal progress and future improvement'}
              </Text>
            </View>
            
            {isSelected && (
              <MaterialCommunityIcons name="check-circle" size={22} color={type.color} />
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
        <Appbar.Content title="Journaling Exercise" titleStyle={styles.appbarTitle} />
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
                <Text style={styles.cardTitle}>Daily Journal</Text>
                <IconButton 
                  icon="book-open-page-variant" 
                  size={24} 
                  iconColor={COLORS.accent}
                  style={styles.headerIcon}
                />
              </View>
              <Text style={styles.instruction}>
                Take a moment to reflect on your experiences and feelings. Choose a focus area and follow the prompts.
              </Text>
            </Card.Content>
          </Card>

          <Text style={styles.sectionTitle}>Choose Your Focus</Text>
          
          <View style={styles.typesContainer}>
            {PROMPT_TYPES.map(renderPromptTypeOption)}
          </View>

          <Card style={styles.promptCard} elevation={3}>
            <LinearGradient
              colors={[`${selectedPromptType.color}15`, `${selectedPromptType.color}05`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.promptGradient}
            >
              <Card.Content>
                <View style={styles.promptHeader}>
                  <IconButton
                    icon="chevron-left"
                    iconColor={COLORS.text}
                    size={24}
                    onPress={handlePreviousPrompt}
                    disabled={currentPrompt === 0}
                    style={[
                      styles.promptNavButton,
                      currentPrompt === 0 && styles.promptNavButtonDisabled
                    ]}
                  />
                  <Text style={styles.promptCount}>
                    Prompt {currentPrompt + 1} of {JOURNAL_PROMPTS[promptType].length}
                  </Text>
                  <IconButton
                    icon="chevron-right"
                    iconColor={COLORS.text}
                    size={24}
                    onPress={handleNextPrompt}
                    disabled={currentPrompt === JOURNAL_PROMPTS[promptType].length - 1}
                    style={[
                      styles.promptNavButton,
                      currentPrompt === JOURNAL_PROMPTS[promptType].length - 1 && styles.promptNavButtonDisabled
                    ]}
                  />
                </View>
                
                <View style={styles.promptTextContainer}>
                  <MaterialCommunityIcons
                    name="format-quote-open"
                    size={20}
                    color={selectedPromptType.color}
                    style={styles.quoteIcon}
                  />
                  <Text style={[styles.promptText, { color: COLORS.text }]}>
                    {JOURNAL_PROMPTS[promptType][currentPrompt]}
                  </Text>
                  <MaterialCommunityIcons
                    name="format-quote-close"
                    size={20}
                    color={selectedPromptType.color}
                    style={[styles.quoteIcon, styles.quoteIconRight]}
                  />
                </View>

                <TextInput
                  mode="outlined"
                  placeholder="Write your thoughts here..."
                  value={entry}
                  onChangeText={setEntry}
                  multiline
                  style={[styles.journalInput, {height: Math.max(150, textInputHeight)}]}
                  onContentSizeChange={(e) => setTextInputHeight(e.nativeEvent.contentSize.height)}
                />
              </Card.Content>
            </LinearGradient>
          </Card>

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

          <Button
            mode="contained"
            onPress={handleSaveEntry}
            style={styles.saveButton}
            labelStyle={styles.saveButtonLabel}
            icon="content-save"
            loading={loading}
          >
            Save Journal Entry
          </Button>
        </ScrollView>
      </Surface>

      <Portal>
        <Dialog visible={showDialog} onDismiss={handleFinish}>
          <LinearGradient
            colors={[`${COLORS.primary}10`, `${COLORS.secondary}05`]}
            style={styles.dialogGradient}
          >
            <Dialog.Title>Journal Entry Saved</Dialog.Title>
            <Dialog.Content>
              <View style={styles.dialogContent}>
                <MaterialCommunityIcons name="check-circle-outline" size={48} color={COLORS.primary} style={styles.dialogIcon} />
                <Text style={styles.dialogText}>
                  Great work on your reflection! Regular journaling can help you process emotions, track growth, and maintain mindfulness in your daily life.
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
  typesContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  typeOption: {
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
  promptCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  promptGradient: {
    borderRadius: 16,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  promptNavButton: {
    margin: -SPACING.xs,
  },
  promptNavButtonDisabled: {
    opacity: 0.3,
  },
  promptCount: {
    fontWeight: '500',
    color: COLORS.text,
    fontSize: 14,
  },
  promptTextContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    position: 'relative',
  },
  promptText: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
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
  journalInput: {
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

export default JournalingScreen; 