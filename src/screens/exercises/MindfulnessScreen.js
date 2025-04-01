import React, { useState } from 'react';
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
  Chip,
  TouchableRipple,
  IconButton
} from 'react-native-paper';
import { SPACING, COLORS } from '../../config/theme';
import Timer from '../../components/exercises/Timer';
import EmotionPicker from '../../components/exercises/EmotionPicker';
import { supabase } from '../../config/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MINDFULNESS_TYPES = [
  { 
    value: 'breath', 
    label: 'Breath Focus', 
    description: 'Focus your attention on your breathing',
    icon: 'weather-windy',
    color: '#4C63B6',
    duration: 300, // 5 minutes
    instructions: 'Breathe deeply and focus on the sensation of air moving in and out of your body. Notice the rise and fall of your chest and abdomen. When your mind wanders, gently bring your attention back to your breath.'
  },
  { 
    value: 'body', 
    label: 'Body Scan', 
    description: 'Bring awareness to each part of your body',
    icon: 'human',
    color: '#7D8CC4',
    duration: 480, // 8 minutes
    instructions: 'Start from the top of your head and slowly move down to your toes, paying attention to sensations in each part of your body. If you notice tension, consciously try to release it.'
  },
  { 
    value: 'senses', 
    label: 'Five Senses', 
    description: 'Connect with your surroundings through your senses',
    icon: 'eye',
    color: '#5C96AE',
    duration: 240, // 4 minutes
    instructions: 'Notice 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. This exercise will anchor you in the present moment.'
  },
];

const MindfulnessScreen = ({ navigation }) => {
  const [mindfulnessType, setMindfulnessType] = useState('breath');
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Save mindfulness session
      const selectedType = MINDFULNESS_TYPES.find(type => type.value === mindfulnessType);
      const { error: sessionError } = await supabase
        .from('mindfulness_sessions')
        .insert({
          user_id: user.id,
          type: mindfulnessType,
          duration: selectedType.duration,
          emotions: selectedEmotions,
          completed: true
        });

      if (sessionError) throw sessionError;

      // Update progress log
      const { error: progressError } = await supabase
        .from('progress_logs')
        .insert({
          user_id: user.id,
          exercise_type: 'mindfulness',
          details: {
            type: mindfulnessType,
            duration: selectedType.duration,
            emotions: selectedEmotions
          },
        });

      if (progressError) throw progressError;

      setShowDialog(true);
    } catch (error) {
      console.error('Error saving mindfulness session:', error);
      setError(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (selectedEmotions.length === 0) {
      setError('Please select at least one emotion');
      setSnackbarVisible(true);
      return;
    }
    setIsSessionStarted(true);
  };

  const handleSessionCancel = () => {
    setIsSessionStarted(false);
  };

  const handleFinish = () => {
    setShowDialog(false);
    navigation.goBack();
  };

  const selectedType = MINDFULNESS_TYPES.find(type => type.value === mindfulnessType);

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      <Text style={styles.headerTitle}>Mindfulness Exercise</Text>
      <Text style={styles.headerSubtitle}>
        Practice awareness and live in the present moment
      </Text>
    </LinearGradient>
  );

  const renderMindfulnessTypeOption = (type) => {
    const isSelected = mindfulnessType === type.value;
    const minutes = Math.floor(type.duration / 60);
    
    return (
      <TouchableRipple
        key={type.value}
        onPress={() => setMindfulnessType(type.value)}
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
              <Text style={styles.optionDescription}>{type.description}</Text>
              <View style={styles.optionFooter}>
                <MaterialCommunityIcons name="clock-outline" size={14} color={COLORS.textLight} />
                <Text style={styles.optionDuration}>{minutes} min</Text>
              </View>
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
        <Appbar.Content title="Mindfulness Exercise" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <Surface style={styles.content} elevation={0}>
        {!isSessionStarted ? (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderHeader()}
            
            <Card style={styles.instructionCard} elevation={3}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Mindful Awareness</Text>
                  <IconButton 
                    icon="meditation" 
                    size={24} 
                    iconColor={COLORS.accent}
                    style={styles.headerIcon}
                  />
                </View>
                <Text style={styles.instruction}>
                  Choose a mindfulness practice, select your current emotions, and begin your session. Mindfulness helps reduce stress and improve mental clarity.
                </Text>
              </Card.Content>
            </Card>

            <Text style={styles.sectionTitle}>Choose Your Practice</Text>
            
            <View style={styles.typesContainer}>
              {MINDFULNESS_TYPES.map(renderMindfulnessTypeOption)}
            </View>

            <Card style={styles.instructionsCard} elevation={3}>
              <LinearGradient
                colors={[`${selectedType.color}15`, `${selectedType.color}05`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.instructionsGradient}
              >
                <Card.Content>
                  <View style={styles.instructionsHeader}>
                    <MaterialCommunityIcons 
                      name="information-outline" 
                      size={24} 
                      color={selectedType.color} 
                    />
                    <Text style={styles.instructionsTitle}>How to Practice</Text>
                  </View>
                  <Text style={styles.instructionsText}>
                    {selectedType.instructions}
                  </Text>
                </Card.Content>
              </LinearGradient>
            </Card>

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

            <Button
              mode="contained"
              onPress={handleStart}
              style={styles.startButton}
              labelStyle={styles.startButtonLabel}
              icon="meditation"
              loading={loading}
            >
              Begin Practice
            </Button>
          </ScrollView>
        ) : (
          <LinearGradient
            colors={[`${selectedType.color}30`, COLORS.background]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.7 }}
            style={styles.timerContainer}
          >
            <Timer
              duration={selectedType.duration}
              onComplete={handleComplete}
              onCancel={handleSessionCancel}
            />
            
            <Card style={styles.sessionCard} elevation={3}>
              <LinearGradient
                colors={[`${selectedType.color}10`, `${selectedType.color}02`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sessionGradient}
              >
                <Card.Content>
                  <View style={styles.sessionHeader}>
                    <View style={[styles.sessionIconContainer, { backgroundColor: `${selectedType.color}25` }]}>
                      <MaterialCommunityIcons name={selectedType.icon} size={24} color={selectedType.color} />
                    </View>
                    <Text style={styles.sessionType}>{selectedType.label}</Text>
                  </View>
                  
                  <View style={styles.instructionsContainer}>
                    <Text style={styles.sessionInstructions}>
                      {selectedType.instructions}
                    </Text>
                  </View>
                  
                  <View style={styles.emotionsRow}>
                    {selectedEmotions.map(emotion => (
                      <Chip 
                        key={emotion} 
                        style={styles.emotionChip}
                        textStyle={styles.emotionChipText}
                      >
                        {emotion}
                      </Chip>
                    ))}
                  </View>
                </Card.Content>
              </LinearGradient>
            </Card>
          </LinearGradient>
        )}
      </Surface>

      <Portal>
        <Dialog visible={showDialog} onDismiss={handleFinish}>
          <LinearGradient
            colors={[`${COLORS.primary}10`, `${COLORS.secondary}05`]}
            style={styles.dialogGradient}
          >
            <Dialog.Title>Practice Complete</Dialog.Title>
            <Dialog.Content>
              <View style={styles.dialogContent}>
                <MaterialCommunityIcons name="check-circle-outline" size={48} color={COLORS.primary} style={styles.dialogIcon} />
                <Text style={styles.dialogText}>
                  Well done! Regular mindfulness practice can help reduce stress, improve focus, and enhance emotional well-being. Try to incorporate these moments of awareness throughout your day.
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
    width: 50,
    height: 50,
    borderRadius: 12,
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
    marginBottom: 4,
  },
  optionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  optionDuration: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  instructionsCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  instructionsGradient: {
    borderRadius: 16,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  instructionsText: {
    color: COLORS.text,
    lineHeight: 20,
  },
  emotionsCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: 16,
  },
  startButton: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 4,
    marginBottom: SPACING.xl,
  },
  startButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  sessionCard: {
    marginTop: SPACING.xl,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sessionGradient: {
    padding: SPACING.sm,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sessionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  sessionType: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  instructionsContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sessionInstructions: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  emotionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: SPACING.xs,
  },
  emotionChip: {
    margin: 4,
    backgroundColor: COLORS.backgroundLight,
  },
  emotionChipText: {
    color: COLORS.text,
    fontSize: 12,
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

export default MindfulnessScreen; 