import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Animated } from 'react-native';
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
  Modal
} from 'react-native-paper';
import { SPACING, COLORS } from '../../config/theme';
import { signOut } from '../../api/auth';
import { fetchRoadmap } from '../../api/roadmap';
import { supabase } from '../../config/supabase';
import { getVisualizations, getTasks, getJournalEntries } from '../../api/exercises';
import * as Haptics from 'expo-haptics';

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

  const renderHeader = () => (
    <Card style={styles.welcomeCard} mode="outlined">
      <Card.Content>
        <View style={styles.welcomeHeader}>
          <View>
            <Text variant="titleLarge">{getGreeting()}, {userName}</Text>
            <View style={styles.streakContainer}>
              <IconButton icon="fire" size={20} iconColor={theme.colors.primary} />
              <Text variant="bodyMedium">{streak} Day Streak!</Text>
            </View>
          </View>
          {currentMood && (
            <TouchableRipple onPress={() => setShowMoodModal(true)}>
              <Avatar.Text 
                size={40} 
                label={MOODS.find(m => m.id === currentMood)?.icon || '😊'} 
                style={styles.moodAvatar}
              />
            </TouchableRipple>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderDailyFocus = () => (
    <Card style={styles.focusCard} mode="outlined">
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title>Today's Focus</Title>
          <Chip 
            mode="outlined" 
            style={[styles.progressChip, { backgroundColor: COLORS.backgroundLight }]}
          >
            {Math.round((dailyProgress || 0) * 100)}% Complete
          </Chip>
        </View>
        
        <View style={styles.progressBarContainer}>
          <Animated.View 
            style={[
              styles.progressBarFill,
              {
                width: animatedProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                }),
                backgroundColor: COLORS.primary
              }
            ]}
          />
        </View>

        <View style={styles.exerciseList}>
          {recommendedExercises.map((exercise) => (
            <TouchableRipple
              key={exercise.id}
              onPress={async () => {
                await triggerHaptic();
                navigation.navigate(exercise.route);
              }}
            >
              <List.Item
                title={exercise.title}
                description={`${exercise.duration} • ${exercise.benefit}`}
                left={props => <List.Icon {...props} icon={exercise.icon} color={COLORS.primary} />}
                right={props => <List.Icon {...props} icon="arrow-right" color={COLORS.secondary} />}
                style={styles.exerciseItem}
              />
            </TouchableRipple>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderInsights = () => (
    insights && (
      <Card style={styles.insightCard} mode="outlined">
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>AI Insights</Title>
            <IconButton 
              icon="lightbulb-outline" 
              size={24}
              iconColor={theme.colors.primary}
            />
          </View>
          <Paragraph style={styles.insightText}>{insights.text}</Paragraph>
          
          {insights.recommendations?.length > 0 && (
            <View style={styles.recommendationsList}>
              <Text variant="titleSmall" style={styles.recommendationsTitle}>
                Recommended Actions:
              </Text>
              {insights.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <IconButton icon="star" size={16} />
                  <Text variant="bodyMedium">{rec}</Text>
                </View>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
    )
  );

  const renderGoals = () => (
    <Card style={styles.goalsCard} mode="outlined">
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title>Current Goals</Title>
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('TaskPlanner')}
          >
            View All
          </Button>
        </View>
        
        {roadmap?.goals?.slice(0, 3).map((goal) => (
          <TouchableRipple key={goal.id}>
            <View style={styles.goalItem}>
              <Chip 
                mode="outlined"
                style={[
                  styles.statusChip,
                  { 
                    backgroundColor: goal.status === 'completed' 
                      ? theme.colors.success + '20'
                      : theme.colors.primary + '20'
                  }
                ]}
              >
                {goal.status}
              </Chip>
              <Paragraph style={styles.goalText}>{goal.description}</Paragraph>
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
          { backgroundColor: theme.colors.surface }
        ]}
      >
        <Title style={styles.moodTitle}>How are you feeling?</Title>
        <View style={styles.moodGrid}>
          {MOODS.map((mood) => (
            <TouchableRipple
              key={mood.id}
              onPress={() => handleMoodSelect(mood)}
              style={styles.moodItem}
            >
              <View style={styles.moodContent}>
                <Text style={styles.moodEmoji}>{mood.icon}</Text>
                <Text>{mood.label}</Text>
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading your roadmap...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="RealityShift" />
        <Appbar.Action icon="logout" onPress={handleSignOut} />
      </Appbar.Header>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
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
            {renderDailyFocus()}
            {renderInsights()}
            {renderGoals()}
          </>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        label="Start Exercise"
        onPress={async () => {
          await triggerHaptic();
          navigation.navigate('Exercises');
        }}
        style={[
          styles.fab,
          { backgroundColor: COLORS.primary }
        ]}
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
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textLight,
  },
  errorCard: {
    marginBottom: SPACING.lg,
  },
  welcomeCard: {
    marginBottom: SPACING.lg,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  moodAvatar: {
    backgroundColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  focusCard: {
    marginBottom: SPACING.lg,
  },
  progressChip: {
    height: 28,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 4,
    marginVertical: SPACING.md,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  exerciseList: {
    marginTop: SPACING.md,
  },
  exerciseItem: {
    paddingVertical: SPACING.xs,
  },
  insightCard: {
    marginBottom: SPACING.lg,
  },
  insightText: {
    fontStyle: 'italic',
    marginTop: SPACING.xs,
    color: COLORS.text,
  },
  recommendationsList: {
    marginTop: SPACING.md,
  },
  recommendationsTitle: {
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xxs,
  },
  goalsCard: {
    marginBottom: SPACING.xl,
  },
  goalItem: {
    marginBottom: SPACING.md,
  },
  statusChip: {
    marginBottom: SPACING.xs,
    alignSelf: 'flex-start',
  },
  goalText: {
    marginLeft: SPACING.xs,
    color: COLORS.text,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
  },
  moodModal: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  moodTitle: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.text,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  moodItem: {
    width: '18%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  moodContent: {
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
});

export default HomeScreen; 