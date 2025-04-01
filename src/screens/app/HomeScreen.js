import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Animated, ImageBackground, Dimensions } from 'react-native';
import { 
  Text, 
  Button, 
  Card, 
  Title, 
  Paragraph, 
  ActivityIndicator,
  ProgressBar,
  Chip,
  useTheme,
  Appbar,
  Surface,
  FAB,
  IconButton,
  List,
  Avatar,
  TouchableRipple,
  Portal,
  Modal,
  Divider
} from 'react-native-paper';
import { SPACING, COLORS } from '../../config/theme';
import { signOut } from '../../api/auth';
import { fetchRoadmap } from '../../api/roadmap';
import { supabase } from '../../config/supabase';
import { getVisualizations, getTasks, getJournalEntries } from '../../api/exercises';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const triggerHaptic = async (type = 'selection') => {
  try {
    switch (type) {
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'selection':
      default:
        await Haptics.selectionAsync();
        break;
    }
  } catch (error) {
    // Silently fail if haptics aren't available
    console.debug('Haptics not available:', error);
  }
};

const MOODS = [
  { id: 'great', icon: '😊', label: 'Great' },
  { id: 'good', icon: '🙂', label: 'Good' },
  { id: 'okay', icon: '😐', label: 'Okay' },
  { id: 'low', icon: '😕', label: 'Low' },
  { id: 'bad', icon: '😢', label: 'Bad' }
];

const DAILY_EXERCISES = [
  {
    id: 'mindfulness',
    title: 'Mindfulness',
    icon: 'meditation',
    duration: '5-10 min',
    route: 'Mindfulness',
    benefit: 'Reduce stress and improve focus'
  },
  {
    id: 'visualization',
    title: 'Visualization',
    icon: 'eye',
    duration: '5 min',
    route: 'Visualization',
    benefit: 'Strengthen your goal achievement mindset'
  },
  {
    id: 'tasks',
    title: 'Task Planning',
    icon: 'checkbox-marked-outline',
    duration: '10 min',
    route: 'TaskPlanner',
    benefit: 'Stay organized and productive'
  },
  {
    id: 'deepwork',
    title: 'Deep Work',
    icon: 'timer-outline',
    duration: '25 min',
    route: 'DeepWork',
    benefit: 'Maximum focus and productivity'
  },
  {
    id: 'journaling',
    title: 'Journaling',
    icon: 'book-outline',
    duration: '10 min',
    route: 'Journaling',
    benefit: 'Process thoughts and emotions'
  }
];

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const [dailyProgress, setDailyProgress] = useState(0);
  const [animatedProgress] = useState(new Animated.Value(0));
  const [streak, setStreak] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [insights, setInsights] = useState(null);
  const [currentMood, setCurrentMood] = useState(null);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [recommendedExercises, setRecommendedExercises] = useState([]);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const [scrollY] = useState(new Animated.Value(0));
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  useEffect(() => {
    loadUserData();
    checkDailyMood();
  }, []);

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: dailyProgress || 0,
      duration: 1000,
      useNativeDriver: false
    }).start();
  }, [dailyProgress]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const checkDailyMood = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: moodLog } = await supabase
        .from('mood_logs')
        .select('mood')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString())
        .single();

      if (!moodLog) {
        setShowMoodModal(true);
      } else {
        setCurrentMood(moodLog.mood);
      }
    } catch (error) {
      console.error('Error checking mood:', error);
    }
  };

  const handleMoodSelect = async (mood) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('mood_logs')
        .insert({
          user_id: user.id,
          mood: mood.id
        });

      setCurrentMood(mood.id);
      setShowMoodModal(false);
      await triggerHaptic('success');
    } catch (error) {
      console.error('Error logging mood:', error);
      await triggerHaptic('error');
    }
  };

  const calculateStreak = (logs) => {
    if (!logs || !logs.length) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    // Sort logs by date descending
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // Check if user has logged anything today
    const latestLog = sortedLogs[0];
    const latestLogDate = new Date(latestLog.created_at);
    latestLogDate.setHours(0, 0, 0, 0);
    
    // If no log today, start checking from yesterday
    if (latestLogDate.getTime() !== today.getTime()) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = new Date(sortedLogs[i].created_at);
      logDate.setHours(0, 0, 0, 0);
      
      if (logDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (logDate.getTime() < currentDate.getTime()) {
        // Break if we find a gap
        break;
      }
    }
    
    return streak;
  };

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Load all data in parallel
      const [roadmapData, tasksData, visualizations, journalEntries, userData, streakData] = await Promise.all([
        fetchRoadmap(user.id),
        getTasks(user.id),
        getVisualizations(user.id),
        getJournalEntries(user.id, new Date()),
        supabase.from('users').select('name').eq('id', user.id).single(),
        supabase.from('progress_logs').select('created_at').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      setRoadmap(roadmapData);
      setTasks(tasksData);
      setUserName(userData?.data?.name || '');

      // Calculate streak using the new function
      const currentStreak = calculateStreak(streakData.data || []);
      setStreak(currentStreak);

      // Calculate daily progress with safety checks
      const completedTasks = (tasksData || []).filter(task => task.completed).length;
      const totalActivities = DAILY_EXERCISES.length + (tasksData || []).length;
      let progress = 0;
      
      if (totalActivities > 0) {
        progress = (completedTasks + (visualizations || []).length + (journalEntries || []).length) / totalActivities;
      }
      
      // Ensure progress is a valid number between 0 and 1
      progress = Math.min(Math.max(Number(progress) || 0, 0), 1);
      setDailyProgress(progress);

      // Get latest AI insight and generate recommendations with null checks
      if (journalEntries?.length > 0 && journalEntries[0]?.insights) {
        setInsights({
          text: journalEntries[0].insights,
          recommendations: generateRecommendations(journalEntries[0].insights, roadmapData?.goals || [])
        });
      }

      // Set recommended exercises based on goals and time of day
      setRecommendedExercises(getRecommendedExercises(roadmapData?.goals || []));

    } catch (error) {
      console.error('Error loading user data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendedExercises = (goals) => {
    const hour = new Date().getHours();
    let recommended = [...DAILY_EXERCISES];

    // Morning focus on mindfulness and planning
    if (hour < 12) {
      recommended = recommended.sort((a, b) => {
        if (a.id === 'mindfulness' || a.id === 'tasks') return -1;
        if (b.id === 'mindfulness' || b.id === 'tasks') return 1;
        return 0;
      });
    }
    // Afternoon focus on deep work and visualization
    else if (hour < 17) {
      recommended = recommended.sort((a, b) => {
        if (a.id === 'deepwork' || a.id === 'visualization') return -1;
        if (b.id === 'deepwork' || b.id === 'visualization') return 1;
        return 0;
      });
    }
    // Evening focus on reflection and journaling
    else {
      recommended = recommended.sort((a, b) => {
        if (a.id === 'journaling') return -1;
        if (b.id === 'journaling') return 1;
        return 0;
      });
    }

    return recommended.slice(0, 3);
  };

  const generateRecommendations = (insight, goals) => {
    // Simple recommendation logic based on insights and goals
    const recommendations = [];
    
    if (insight.toLowerCase().includes('stress') || insight.toLowerCase().includes('anxiety')) {
      recommendations.push('Try a mindfulness session to reduce stress');
    }
    
    if (insight.toLowerCase().includes('focus') || insight.toLowerCase().includes('productivity')) {
      recommendations.push('Schedule a deep work session');
    }
    
    if (goals?.length > 0) {
      recommendations.push(`Visualize achieving your goal: ${goals[0].description}`);
    }
    
    return recommendations;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderHeader = () => {
    const headerOpacity = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [1, 0.9],
      extrapolate: 'clamp',
    });

    const headerScale = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [1, 0.95],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View 
        style={[
          styles.headerContainer,
          {
            opacity: headerOpacity,
            transform: [{ scale: headerScale }]
          }
        ]}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.welcomeHeader}>
            <View>
              <Text variant="titleLarge" style={styles.greetingText}>{getGreeting()},</Text>
              <Text variant="headlineMedium" style={styles.nameText}>{userName}</Text>
              <View style={styles.streakContainer}>
                <MaterialCommunityIcons name="fire" size={22} color={COLORS.accent} />
                <Text variant="bodyMedium" style={styles.streakText}>{streak} Day Streak!</Text>
              </View>
            </View>
            
            <View style={styles.moodContainer}>
              {currentMood ? (
                <TouchableRipple onPress={() => setShowMoodModal(true)} style={styles.moodButton}>
                  <View style={styles.moodContent}>
                    <Text style={styles.moodEmoji}>{MOODS.find(m => m.id === currentMood)?.icon || '😊'}</Text>
                    <Text style={styles.moodLabel}>{MOODS.find(m => m.id === currentMood)?.label}</Text>
                  </View>
                </TouchableRipple>
              ) : (
                <TouchableRipple onPress={() => setShowMoodModal(true)} style={styles.moodButton}>
                  <View style={styles.moodContent}>
                    <Text style={styles.moodEmoji}>😶</Text>
                    <Text style={styles.moodLabel}>Add Mood</Text>
                  </View>
                </TouchableRipple>
              )}
            </View>
          </View>

          <View style={styles.dailyProgressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressTitle}>Daily Progress</Text>
                <Text style={styles.progressPercentage}>{Math.round((dailyProgress || 0) * 100)}% Complete</Text>
              </View>
              <View style={styles.progressCircle}>
                <Text style={styles.progressCircleText}>{Math.round((dailyProgress || 0) * 100)}%</Text>
              </View>
            </View>
            
            <View style={styles.progressBarContainer}>
              <Animated.View 
                style={[
                  styles.progressBarFill,
                  {
                    width: animatedProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]}
              />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderDailyFocus = () => (
    <Card style={styles.focusCard} elevation={3}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title style={styles.cardTitle}>Today's Focus</Title>
          <IconButton 
            icon="star-four-points" 
            size={24} 
            iconColor={COLORS.accent}
            style={styles.focusIcon}
          />
        </View>
        
        <View style={styles.exerciseList}>
          {recommendedExercises.map((exercise, index) => (
            <React.Fragment key={exercise.id}>
              <TouchableRipple
                onPress={async () => {
                  await triggerHaptic();
                  navigation.navigate(exercise.route);
                }}
                style={styles.exerciseButton}
              >
                <View style={styles.exerciseItemContainer}>
                  <View style={styles.exerciseIconContainer}>
                    <MaterialCommunityIcons name={exercise.icon} size={28} color={COLORS.primary} />
                  </View>
                  <View style={styles.exerciseContent}>
                    <Text variant="titleMedium" style={styles.exerciseTitle}>{exercise.title}</Text>
                    <Text variant="bodyMedium" style={styles.exerciseDescription}>{exercise.duration} • {exercise.benefit}</Text>
                  </View>
                  <IconButton icon="chevron-right" iconColor={COLORS.secondary} size={24} />
                </View>
              </TouchableRipple>
              {index < recommendedExercises.length - 1 && <Divider style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderInsights = () => (
    insights && (
      <Card style={styles.insightCard} elevation={3}>
        <LinearGradient
          colors={[COLORS.primary + '20', COLORS.secondary + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.insightGradient}
        >
          <Card.Content>
            <View style={styles.cardHeader}>
              <Title style={styles.cardTitle}>AI Insights</Title>
              <IconButton 
                icon="lightbulb-outline" 
                size={24}
                iconColor={COLORS.accent}
                style={styles.insightIcon}
              />
            </View>
            <Paragraph style={styles.insightText}>"{insights.text}"</Paragraph>
            
            {insights.recommendations?.length > 0 && (
              <View style={styles.recommendationsList}>
                <Text variant="titleSmall" style={styles.recommendationsTitle}>
                  Recommended Actions:
                </Text>
                {insights.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <MaterialCommunityIcons name="star" size={16} color={COLORS.accent} />
                    <Text variant="bodyMedium" style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </LinearGradient>
      </Card>
    )
  );

  const renderGoals = () => (
    <Card style={styles.goalsCard} elevation={3}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title style={styles.cardTitle}>Current Goals</Title>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('TaskPlanner')}
            style={styles.viewAllButton}
            labelStyle={styles.viewAllButtonLabel}
          >
            View All
          </Button>
        </View>
        
        {roadmap?.goals?.slice(0, 3).map((goal, index) => (
          <TouchableRipple key={goal.id} style={styles.goalItemTouchable}>
            <View style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <Chip 
                  mode="outlined"
                  style={[
                    styles.statusChip,
                    { 
                      backgroundColor: goal.status === 'completed' 
                        ? COLORS.success + '30'
                        : COLORS.primary + '20'
                    }
                  ]}
                  textStyle={{
                    color: goal.status === 'completed' ? COLORS.success : COLORS.primary,
                    fontWeight: '600'
                  }}
                >
                  {goal.status}
                </Chip>
                {goal.status === 'completed' && 
                  <MaterialCommunityIcons name="check-circle" size={22} color={COLORS.success} />
                }
              </View>
              <Paragraph style={styles.goalText}>{goal.description}</Paragraph>
              {index < roadmap?.goals?.slice(0, 3).length - 1 && <Divider style={styles.goalDivider} />}
            </View>
          </TouchableRipple>
        ))}
      </Card.Content>
    </Card>
  );

  const renderMoodModal = () => (
    <Portal>
      <Modal
        visible={showMoodModal}
        onDismiss={() => setShowMoodModal(false)}
        contentContainerStyle={[
          styles.moodModal,
          { backgroundColor: COLORS.background }
        ]}
      >
        <Title style={styles.moodTitle}>How are you feeling today?</Title>
        <View style={styles.moodGrid}>
          {MOODS.map((mood) => (
            <TouchableRipple
              key={mood.id}
              onPress={() => handleMoodSelect(mood)}
              style={styles.moodSelectItem}
            >
              <View style={styles.moodSelectContent}>
                <Text style={styles.moodSelectEmoji}>{mood.icon}</Text>
                <Text style={styles.moodSelectLabel}>{mood.label}</Text>
              </View>
            </TouchableRipple>
          ))}
        </View>
      </Modal>
    </Portal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[COLORS.primary + '40', COLORS.background]}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your personalized journey...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.appbar} elevated>
        <Appbar.Content title="RealityShift" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon="cog" onPress={() => {}} />
        <Appbar.Action icon="logout" onPress={handleSignOut} />
      </Appbar.Header>
      
      <Animated.ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {error ? (
          <Card 
            style={[styles.errorCard, { backgroundColor: COLORS.errorLight }]} 
            mode="outlined"
          >
            <Card.Content>
              <Text style={{ color: COLORS.error }}>
                Error loading your data. Please try again later.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <>
            {renderHeader()}
            <View style={styles.cardsContainer}>
              {renderDailyFocus()}
              {renderInsights()}
              {renderGoals()}
            </View>
          </>
        )}
        
        {/* Bottom padding to ensure content is visible above FAB */}
        <View style={{ height: 80 }} />
      </Animated.ScrollView>

      <FAB
        icon="play"
        label="Start Exercise"
        onPress={async () => {
          await triggerHaptic();
          navigation.navigate('Exercises');
        }}
        style={styles.fab}
        color={COLORS.background}
      />

      {renderMoodModal()}
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
    fontWeight: '700',
    fontSize: 22,
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  cardsContainer: {
    padding: SPACING.lg,
  },
  headerContainer: {
    marginBottom: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  greetingText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  nameText: {
    color: COLORS.background,
    fontWeight: '700',
    marginTop: -5,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  streakText: {
    color: COLORS.background,
    marginLeft: 4,
    fontWeight: '500',
  },
  moodContainer: {
    alignItems: 'center',
  },
  moodButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  moodContent: {
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  moodLabel: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: '500',
  },
  dailyProgressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressTitle: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
  progressPercentage: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleText: {
    color: COLORS.background,
    fontWeight: '700',
    fontSize: 14,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginTop: SPACING.xs,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  errorCard: {
    margin: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  focusCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    backgroundColor: COLORS.background,
  },
  insightCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  insightGradient: {
    borderRadius: 16,
  },
  goalsCard: {
    marginBottom: SPACING.xl,
    borderRadius: 16,
    backgroundColor: COLORS.background,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  focusIcon: {
    backgroundColor: COLORS.accent + '20',
    borderRadius: 12,
  },
  insightIcon: {
    backgroundColor: COLORS.accent + '20',
    borderRadius: 12,
  },
  exerciseButton: {
    borderRadius: 12,
  },
  exerciseItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  exerciseIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseTitle: {
    fontWeight: '600',
    color: COLORS.text,
  },
  exerciseDescription: {
    color: COLORS.textLight,
    marginTop: 2,
  },
  divider: {
    marginVertical: SPACING.sm,
  },
  insightText: {
    fontStyle: 'italic',
    marginTop: SPACING.xs,
    color: COLORS.text,
    lineHeight: 22,
    fontSize: 15,
  },
  recommendationsList: {
    marginTop: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: SPACING.md,
  },
  recommendationsTitle: {
    marginBottom: SPACING.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xxs,
  },
  recommendationText: {
    marginLeft: 8,
    flex: 1,
    color: COLORS.text,
  },
  goalItemTouchable: {
    borderRadius: 12,
  },
  goalItem: {
    paddingVertical: SPACING.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    height: 28,
    alignSelf: 'flex-start',
  },
  goalText: {
    marginTop: SPACING.xs,
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },
  goalDivider: {
    marginTop: SPACING.md,
  },
  viewAllButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    height: 36,
  },
  viewAllButtonLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginVertical: 0,
    marginHorizontal: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
  },
  moodModal: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 16,
    backgroundColor: COLORS.background,
  },
  moodTitle: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.text,
    fontWeight: '700',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodSelectItem: {
    width: '18%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.backgroundLight,
    marginBottom: SPACING.md,
  },
  moodSelectContent: {
    alignItems: 'center',
    padding: SPACING.xs,
  },
  moodSelectEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  moodSelectLabel: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
});

export default HomeScreen; 