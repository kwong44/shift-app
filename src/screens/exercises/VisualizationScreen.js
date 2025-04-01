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
  TextInput,
  SegmentedButtons,
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

const VISUALIZATION_TYPES = [
  { 
    value: 'goals', 
    label: 'Goal Achievement', 
    description: 'Visualize successfully achieving your goals',
    icon: 'target',
    color: '#4C63B6' 
  },
  { 
    value: 'confidence', 
    label: 'Self-Confidence', 
    description: 'Build confidence and positive self-image',
    icon: 'account-star',
    color: '#7D8CC4'  
  },
  { 
    value: 'calm', 
    label: 'Inner Peace', 
    description: 'Find calmness and emotional balance',
    icon: 'wave',
    color: '#5C96AE'  
  },
];

const SESSION_DURATION = 300; // 5 minutes

const VisualizationScreen = ({ navigation }) => {
  const [visualizationType, setVisualizationType] = useState('goals');
  const [affirmation, setAffirmation] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);
  const [textInputHeight, setTextInputHeight] = useState(100);
  const theme = useTheme();

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Save visualization session
      const { error: sessionError } = await supabase
        .from('visualizations')
        .insert({
          user_id: user.id,
          type: visualizationType,
          affirmation: affirmation.trim(),
          emotions: selectedEmotions,
          duration: SESSION_DURATION,
          completed: true
        });

      if (sessionError) throw sessionError;

      // Update progress log
      const { error: progressError } = await supabase
        .from('progress_logs')
        .insert({
          user_id: user.id,
          exercise_type: 'visualization',
          details: {
            type: visualizationType,
            emotions: selectedEmotions,
            duration: SESSION_DURATION
          },
        });

      if (progressError) throw progressError;

      setShowDialog(true);
    } catch (error) {
      console.error('Error saving visualization session:', error);
      setError(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (!affirmation.trim()) {
      setError('Please enter an affirmation');
      setSnackbarVisible(true);
      return;
    }
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

  const selectedType = VISUALIZATION_TYPES.find(t => t.value === visualizationType);

  const getAffirmationPlaceholder = () => {
    switch (visualizationType) {
      case 'goals':
        return 'E.g., I am confidently working towards my goals and achieving success';
      case 'confidence':
        return 'E.g., I am capable, confident, and worthy of success';
      case 'calm':
        return 'E.g., I am calm, centered, and at peace with myself';
      default:
        return 'Enter your positive affirmation';
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      <Text style={styles.headerTitle}>Visualization Exercise</Text>
      <Text style={styles.headerSubtitle}>
        Strengthen your mindset through guided visualization
      </Text>
    </LinearGradient>
  );

  const renderVisualizationTypeOption = (type) => {
    const isSelected = visualizationType === type.value;
    
    return (
      <TouchableRipple
        key={type.value}
        onPress={() => setVisualizationType(type.value)}
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
        <Appbar.Content title="Visualization Exercise" titleStyle={styles.appbarTitle} />
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
                  <Text style={styles.cardTitle}>Create Your Visualization</Text>
                  <IconButton 
                    icon="brain" 
                    size={24} 
                    iconColor={COLORS.accent}
                    style={styles.headerIcon}
                  />
                </View>
                <Text style={styles.instruction}>
                  Choose a focus area, write an affirmation, and select emotions you want to cultivate during your practice.
                </Text>
              </Card.Content>
            </Card>

            <Text style={styles.sectionTitle}>Focus Area</Text>
            
            <View style={styles.typesContainer}>
              {VISUALIZATION_TYPES.map(renderVisualizationTypeOption)}
            </View>

            <Text style={styles.sectionTitle}>Your Affirmation</Text>
            
            <Card style={styles.affirmationCard} elevation={3}>
              <Card.Content>
                <TextInput
                  mode="outlined"
                  placeholder={getAffirmationPlaceholder()}
                  value={affirmation}
                  onChangeText={setAffirmation}
                  multiline
                  style={[styles.affirmationInput, {height: Math.max(100, textInputHeight)}]}
                  onContentSizeChange={(e) => setTextInputHeight(e.nativeEvent.contentSize.height)}
                />
              </Card.Content>
            </Card>

            <Text style={styles.sectionTitle}>Emotions to Cultivate</Text>
            
            <Card style={styles.emotionsCard} elevation={3}>
              <Card.Content>
                <EmotionPicker
                  selectedEmotions={selectedEmotions}
                  onSelectEmotion={setSelectedEmotions}
                  maxSelections={3}
                  helperText="Select up to 3 emotions you want to embody"
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
              Start Visualization
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
              duration={SESSION_DURATION}
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
                  
                  <View style={styles.affirmationContainer}>
                    <MaterialCommunityIcons 
                      name="format-quote-open" 
                      size={20} 
                      color={COLORS.primary}
                      style={styles.quoteIcon} 
                    />
                    <Text style={styles.affirmationText}>
                      {affirmation}
                    </Text>
                    <MaterialCommunityIcons 
                      name="format-quote-close" 
                      size={20} 
                      color={COLORS.primary}
                      style={[styles.quoteIcon, styles.quoteIconRight]} 
                    />
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
            <Dialog.Title>Visualization Complete</Dialog.Title>
            <Dialog.Content>
              <View style={styles.dialogContent}>
                <MaterialCommunityIcons name="check-circle-outline" size={48} color={COLORS.primary} style={styles.dialogIcon} />
                <Text style={styles.dialogText}>
                  Excellent work! Regular visualization practice can help strengthen your mindset and bring you closer to your goals. Remember to carry this positive energy throughout your day.
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
    marginBottom: SPACING.md,
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
  },
  affirmationCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  affirmationInput: {
    minHeight: 100,
    backgroundColor: COLORS.background,
  },
  emotionsCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: 16,
    paddingBottom: SPACING.sm,
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
  affirmationContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    position: 'relative',
  },
  affirmationText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: COLORS.text,
    lineHeight: 24,
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

export default VisualizationScreen; 