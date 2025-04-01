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
  SegmentedButtons,
  TouchableRipple,
  IconButton
} from 'react-native-paper';
import { SPACING, COLORS } from '../../config/theme';
import Timer from '../../components/exercises/Timer';
import { supabase } from '../../config/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FREQUENCIES = [
  { 
    value: 'focus', 
    label: 'Focus (Beta)', 
    description: 'Enhance concentration and mental alertness', 
    duration: 600,
    icon: 'brain',
    color: '#4C63B6'
  },
  { 
    value: 'relax', 
    label: 'Relax (Alpha)', 
    description: 'Promote relaxation and reduce stress', 
    duration: 900,
    icon: 'waves',
    color: '#7D8CC4'
  },
  { 
    value: 'meditate', 
    label: 'Meditate (Theta)', 
    description: 'Deep meditation and creativity', 
    duration: 1200,
    icon: 'meditation',
    color: '#6A8EAE'
  },
];

const BinauralScreen = ({ navigation }) => {
  const [selectedFrequency, setSelectedFrequency] = useState('focus');
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);
  const [animatedValue] = useState(new Animated.Value(0));
  const theme = useTheme();

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Save binaural session
      const { error: sessionError } = await supabase
        .from('binaural_sessions')
        .insert({
          user_id: user.id,
          frequency_type: selectedFrequency,
          duration: FREQUENCIES.find(f => f.value === selectedFrequency).duration,
          completed: true
        });

      if (sessionError) throw sessionError;

      // Update progress log
      const { error: progressError } = await supabase
        .from('progress_logs')
        .insert({
          user_id: user.id,
          exercise_type: 'binaural',
          details: {
            frequency_type: selectedFrequency,
            duration: FREQUENCIES.find(f => f.value === selectedFrequency).duration
          },
        });

      if (progressError) throw progressError;

      setShowDialog(true);
    } catch (error) {
      console.error('Error saving binaural session:', error);
      setError(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionCancel = () => {
    setIsSessionStarted(false);
  };

  const handleFinish = () => {
    setShowDialog(false);
    navigation.goBack();
  };

  const selectedFrequencyData = FREQUENCIES.find(f => f.value === selectedFrequency);

  const renderFrequencyOption = (frequency) => {
    const isSelected = selectedFrequency === frequency.value;
    
    return (
      <TouchableRipple
        key={frequency.value}
        onPress={() => setSelectedFrequency(frequency.value)}
        style={styles.frequencyOptionContainer}
      >
        <Card 
          style={[
            styles.frequencyOption,
            isSelected && { 
              borderColor: frequency.color,
              borderWidth: 2
            }
          ]} 
          elevation={isSelected ? 4 : 2}
        >
          <LinearGradient
            colors={[`${frequency.color}20`, `${frequency.color}05`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.optionGradient}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${frequency.color}30` }]}>
              <MaterialCommunityIcons name={frequency.icon} size={32} color={frequency.color} />
            </View>
            
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{frequency.label}</Text>
              <Text style={styles.optionDescription}>{frequency.description}</Text>
              <Text style={[styles.optionDuration, { color: frequency.color }]}>
                {frequency.duration / 60} minutes
              </Text>
            </View>
            
            {isSelected && (
              <View style={styles.checkContainer}>
                <MaterialCommunityIcons name="check-circle" size={24} color={frequency.color} />
              </View>
            )}
          </LinearGradient>
        </Card>
      </TouchableRipple>
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      <Text style={styles.headerTitle}>Binaural Beats</Text>
      <Text style={styles.headerSubtitle}>
        Enhance your mental state through audio entrainment
      </Text>
    </LinearGradient>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header style={styles.appbar} elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={COLORS.primary} />
        <Appbar.Content title="Binaural Beats Session" titleStyle={styles.appbarTitle} />
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
                  <Text variant="titleMedium" style={styles.cardTitle}>Select Your Session Type</Text>
                  <IconButton 
                    icon="headphones" 
                    size={24} 
                    iconColor={COLORS.accent}
                    style={styles.headerIcon}
                  />
                </View>
                <Text style={styles.instruction}>
                  Choose the type of binaural beats that best matches your current needs.
                </Text>
              </Card.Content>
            </Card>

            <View style={styles.frequencyOptions}>
              {FREQUENCIES.map(renderFrequencyOption)}
            </View>

            <Button
              mode="contained"
              onPress={() => setIsSessionStarted(true)}
              style={styles.startButton}
              labelStyle={styles.startButtonLabel}
              icon="play"
            >
              Start Session
            </Button>
          </ScrollView>
        ) : (
          <LinearGradient
            colors={[`${selectedFrequencyData.color}30`, COLORS.background]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.7 }}
            style={styles.timerContainer}
          >
            <Timer
              duration={selectedFrequencyData.duration}
              onComplete={handleComplete}
              onCancel={handleSessionCancel}
            />
            
            <Card style={styles.sessionCard} elevation={3}>
              <Card.Content>
                <View style={styles.sessionTypeContainer}>
                  <View style={[styles.sessionIconContainer, { backgroundColor: `${selectedFrequencyData.color}30` }]}>
                    <MaterialCommunityIcons 
                      name={selectedFrequencyData.icon} 
                      size={28} 
                      color={selectedFrequencyData.color} 
                    />
                  </View>
                  <Text style={styles.sessionType}>{selectedFrequencyData.label}</Text>
                </View>
                
                <Text style={styles.timerText}>
                  Find a comfortable position, put on your headphones, and close your eyes.
                </Text>
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
            <Dialog.Title>Session Complete</Dialog.Title>
            <Dialog.Content>
              <View style={styles.dialogContent}>
                <MaterialCommunityIcons name="check-circle-outline" size={48} color={COLORS.primary} style={styles.dialogIcon} />
                <Text style={styles.dialogText}>
                  Great work completing your binaural beats session! Regular practice can help improve your focus, relaxation, and mental clarity.
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
  frequencyOptions: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  frequencyOptionContainer: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  frequencyOption: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionGradient: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 6,
  },
  optionDuration: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkContainer: {
    marginLeft: SPACING.sm,
  },
  startButton: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
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
  sessionCard: {
    marginTop: SPACING.xl,
    borderRadius: 16,
  },
  sessionTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sessionIconContainer: {
    width: 44,
    height: 44,
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
  timerText: {
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 15,
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

export default BinauralScreen; 