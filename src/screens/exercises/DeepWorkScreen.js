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
  Chip,
  IconButton,
  TouchableRipple
} from 'react-native-paper';
import { SPACING, COLORS } from '../../config/theme';
import Timer from '../../components/exercises/Timer';
import { supabase } from '../../config/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SESSION_DURATIONS = [
  { 
    value: 1500, 
    label: '25 min', 
    description: 'Classic Pomodoro',
    color: '#4C63B6',
    icon: 'timer-outline'
  },
  { 
    value: 2700, 
    label: '45 min', 
    description: 'Extended Focus',
    color: '#7D8CC4',
    icon: 'timer-sand'
  },
  { 
    value: 3000, 
    label: '50 min', 
    description: 'Deep Work',
    color: '#5C96AE',
    icon: 'timer' 
  },
];

const DeepWorkScreen = ({ navigation }) => {
  const [selectedDuration, setSelectedDuration] = useState(1500);
  const [taskDescription, setTaskDescription] = useState('');
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);
  const [textInputHeight, setTextInputHeight] = useState(80);
  const theme = useTheme();

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Save deep work session
      const { error: sessionError } = await supabase
        .from('deep_work_sessions')
        .insert({
          user_id: user.id,
          task_description: taskDescription.trim(),
          duration: selectedDuration,
          completed: true
        });

      if (sessionError) throw sessionError;

      // Update progress log
      const { error: progressError } = await supabase
        .from('progress_logs')
        .insert({
          user_id: user.id,
          exercise_type: 'deep-work',
          details: {
            duration: selectedDuration,
            task: taskDescription.trim()
          },
        });

      if (progressError) throw progressError;

      setShowDialog(true);
    } catch (error) {
      console.error('Error saving deep work session:', error);
      setError(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (!taskDescription.trim()) {
      setError('Please describe your task');
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

  const selectedDurationData = SESSION_DURATIONS.find(d => d.value === selectedDuration);

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      <Text style={styles.headerTitle}>Deep Work Session</Text>
      <Text style={styles.headerSubtitle}>
        Focus intensely on important tasks without distractions
      </Text>
    </LinearGradient>
  );

  const renderDurationOption = (duration) => {
    const isSelected = selectedDuration === duration.value;
    
    return (
      <TouchableRipple
        key={duration.value}
        onPress={() => setSelectedDuration(duration.value)}
      >
        <Card 
          style={[
            styles.durationOption,
            isSelected && { 
              borderColor: duration.color,
              borderWidth: 2
            }
          ]} 
          elevation={isSelected ? 4 : 2}
        >
          <View style={styles.durationContent}>
            <View style={[styles.durationIconContainer, { backgroundColor: `${duration.color}20` }]}>
              <MaterialCommunityIcons name={duration.icon} size={24} color={duration.color} />
            </View>
            <View style={styles.durationTextContainer}>
              <Text style={styles.durationLabel}>{duration.label}</Text>
              <Text style={styles.durationDescription}>{duration.description}</Text>
            </View>
            {isSelected && (
              <MaterialCommunityIcons name="check-circle" size={22} color={duration.color} />
            )}
          </View>
        </Card>
      </TouchableRipple>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header style={styles.appbar} elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={COLORS.primary} />
        <Appbar.Content title="Deep Work Session" titleStyle={styles.appbarTitle} />
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
                  <Text style={styles.cardTitle}>Plan Your Session</Text>
                  <IconButton 
                    icon="clock-time-four" 
                    size={24} 
                    iconColor={COLORS.accent}
                    style={styles.headerIcon}
                  />
                </View>
                <Text style={styles.instruction}>
                  Remove all distractions, set a clear goal for your session, and select your preferred duration.
                </Text>
              </Card.Content>
            </Card>

            <Text style={styles.sectionTitle}>What will you work on?</Text>
            
            <Card style={styles.taskCard} elevation={3}>
              <Card.Content>
                <TextInput
                  mode="outlined"
                  placeholder="Describe your task or goal for this session..."
                  value={taskDescription}
                  onChangeText={setTaskDescription}
                  multiline
                  style={[styles.taskInput, {height: Math.max(80, textInputHeight)}]}
                  onContentSizeChange={(e) => setTextInputHeight(e.nativeEvent.contentSize.height)}
                />
              </Card.Content>
            </Card>

            <Text style={styles.sectionTitle}>Session Duration</Text>
            
            <View style={styles.durationContainer}>
              {SESSION_DURATIONS.map(renderDurationOption)}
            </View>

            <Button
              mode="contained"
              onPress={handleStart}
              style={styles.startButton}
              labelStyle={styles.startButtonLabel}
              icon="clock-start"
              loading={loading}
            >
              Start Deep Work Session
            </Button>
          </ScrollView>
        ) : (
          <LinearGradient
            colors={[`${selectedDurationData.color}30`, COLORS.background]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.7 }}
            style={styles.timerContainer}
          >
            <Timer
              duration={selectedDuration}
              onComplete={handleComplete}
              onCancel={handleSessionCancel}
            />
            
            <Card style={styles.focusCard} elevation={3}>
              <Card.Content>
                <View style={styles.focusHeader}>
                  <View style={[styles.focusIconContainer, { backgroundColor: `${selectedDurationData.color}20` }]}>
                    <MaterialCommunityIcons name="target" size={24} color={selectedDurationData.color} />
                  </View>
                  <Text style={styles.focusLabel}>Your Focus Goal</Text>
                </View>
                
                <Text style={styles.taskDescription}>
                  {taskDescription}
                </Text>
                
                <View style={styles.durationTag}>
                  <MaterialCommunityIcons 
                    name={selectedDurationData.icon} 
                    size={16} 
                    color={COLORS.text}
                    style={styles.durationIcon} 
                  />
                  <Text style={styles.durationText}>
                    {selectedDurationData.label} {selectedDurationData.description}
                  </Text>
                </View>
              </Card.Content>
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
            <Dialog.Title>Session Complete!</Dialog.Title>
            <Dialog.Content>
              <View style={styles.dialogContent}>
                <MaterialCommunityIcons name="check-circle-outline" size={48} color={COLORS.primary} style={styles.dialogIcon} />
                <Text style={styles.dialogText}>
                  Excellent work! You've successfully completed a focused deep work session. Regular deep work will help build your concentration and productivity.
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
    marginTop: SPACING.sm,
  },
  taskCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: 16,
  },
  taskInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    minHeight: 80,
  },
  durationContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  durationOption: {
    marginBottom: SPACING.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },
  durationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  durationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  durationTextContainer: {
    flex: 1,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  durationDescription: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  startButton: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 4,
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
  focusCard: {
    marginTop: SPACING.xl,
    borderRadius: 16,
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  focusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  focusLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  taskDescription: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.md,
    borderRadius: 8,
  },
  durationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  durationIcon: {
    marginRight: SPACING.xs,
  },
  durationText: {
    fontSize: 14,
    color: COLORS.text,
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

export default DeepWorkScreen; 