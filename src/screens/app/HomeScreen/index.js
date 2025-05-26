import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, Animated, ScrollView } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { SPACING, COLORS, RADIUS } from '../../../config/theme';
import { signOut } from '../../../api/auth';
import { fetchRoadmap } from '../../../api/roadmap';
import { supabase } from '../../../config/supabase';
import { 
  getVisualizations, 
  getTasks, 
  getJournalEntries,
  getRecentJournalInsights,
  getWeeklyGoals
} from '../../../api/exercises';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import AITestButton from '../../../components/common/AITestButton';
import { 
  MoodModal, 
  GrowthRoadmap, 
  DailyFocus,
  Insights,
  EMOTIONS
} from './components';
import { chatWithCoach } from '../../../api/aiCoach';

// Debug logging
console.debug('HomeScreen mounted');

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const [dailyProgress, setDailyProgress] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentMood, setCurrentMood] = useState(null);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [error, setError] = useState(null);
  const [scrollY] = useState(new Animated.Value(0));
  const [insights, setInsights] = useState(null);
  const [journalDate, setJournalDate] = useState(null);

  // Transformed roadmap data for GrowthRoadmap component
  const [focusAreas, setFocusAreas] = useState([]);
  const [weeklyGoals, setWeeklyGoals] = useState([]);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [nextMilestone, setNextMilestone] = useState('');
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    loadUserData();
    checkDailyMood();
    refreshInsights();
    fetchWeeklyGoals();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshInsights();
      fetchWeeklyGoals();
    });

    return unsubscribe;
  }, [navigation]);

  // Transform roadmap data when it changes
  useEffect(() => {
    if (roadmap) {
      // Transform focus areas
      const transformedFocusAreas = roadmap.goals
        ?.filter(goal => goal.type === 'focus_area')
        ?.map(goal => ({
          name: goal.description,
          // Calculate progress based on status or other metrics
          progress: goal.status === 'completed' ? 1 : 
                   goal.status === 'in_progress' ? 0.5 : 0.1
        })) || [];
      setFocusAreas(transformedFocusAreas);
      
      // We no longer transform weekly goals from roadmap data
      // as they will be user-inputted directly in the GrowthRoadmap component
      
      // Set current phase
      const activePhase = roadmap.phases?.find(phase => phase.status === 'active');
      setCurrentPhase(activePhase);
      
      // Find next milestone
      const pendingMilestone = roadmap.milestones?.find(m => m.status === 'pending');
      setNextMilestone(pendingMilestone?.description || 'Continue building habits');
      
      // Calculate overall progress
      const progressValue = roadmap.progress?.completed_goals / roadmap.progress?.total_goals || 0;
      setOverallProgress(progressValue);
    }
  }, [roadmap]);

  const fetchWeeklyGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.debug('[HomeScreen] Fetching weekly goals');
      const goals = await getWeeklyGoals(user.id);
      setWeeklyGoals(goals);
      console.debug(`[HomeScreen] Fetched ${goals?.length || 0} weekly goals`);
    } catch (error) {
      console.error('[HomeScreen] Error fetching weekly goals:', error);
    }
  };

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

      const { data: moodData } = await supabase
        .from('moods')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      console.debug('[HomeScreen] Daily mood check:', moodData);

      if (!moodData) {
        setShowMoodModal(true);
      } else {
        setCurrentMood(moodData.mood_type);
      }
    } catch (error) {
      console.error('[HomeScreen] Error checking mood:', error);
    }
  };

  const handleMoodSelect = async (emotion) => {
    try {
      console.debug('[HomeScreen] Selected emotion:', emotion);
      setCurrentMood(emotion.id);
      setShowMoodModal(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('[HomeScreen] Error handling emotion selection:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const calculateStreak = (logs) => {
    if (!logs || !logs.length) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    const latestLog = sortedLogs[0];
    const latestLogDate = new Date(latestLog.created_at);
    latestLogDate.setHours(0, 0, 0, 0);
    
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
        break;
      }
    }
    
    return streak;
  };

  const refreshInsights = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.debug('[HomeScreen] Refreshing insights');
      
      const latestInsights = await getRecentJournalInsights(user.id, 1);
      
      if (latestInsights?.length > 0) {
        const latestEntry = latestInsights[0];
        setInsights(latestEntry.insights);
        setJournalDate(latestEntry.created_at);
        console.debug('[HomeScreen] Insights updated:', { 
          hasInsights: Boolean(latestEntry.insights),
          date: latestEntry.created_at 
        });
      } else {
        setInsights(null);
        setJournalDate(null);
      }
    } catch (error) {
      console.error('[HomeScreen] Error refreshing insights:', error);
    }
  };

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const [roadmapData, tasksData, visualizations, userData, streakData] = await Promise.all([
        fetchRoadmap(user.id),
        getTasks(user.id),
        getVisualizations(user.id),
        supabase.from('users').select('name').eq('id', user.id).single(),
        supabase.from('progress_logs').select('created_at').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      setRoadmap(roadmapData);
      setUserName(userData?.data?.name || '');

      const currentStreak = calculateStreak(streakData.data || []);
      setStreak(currentStreak);

      const completedTasks = (tasksData || []).filter(task => task.completed).length;
      const totalActivities = (tasksData || []).length;
      let progress = 0;
      
      if (totalActivities > 0) {
        progress = (completedTasks + (visualizations || []).length) / totalActivities;
      }
      
      progress = Math.min(Math.max(Number(progress) || 0, 0), 1);
      setDailyProgress(progress);

      console.debug("[HomeScreen] Data loaded successfully");

    } catch (error) {
      console.error('[HomeScreen] Error loading user data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (insight, goals) => {
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

  const handleGoalUpdate = async (goalId, updates) => {
    try {
      console.debug('Updating goal:', { goalId, updates });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setRoadmap(prev => ({
        ...prev,
        goals: prev.goals.map(goal =>
          goal.id === goalId ? { ...goal, ...updates } : goal
        )
      }));

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error updating goal:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

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
      <LinearGradient
        colors={[COLORS.background, '#f5f5f5']}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GrowthRoadmap
            dailyProgress={dailyProgress}
            streak={streak}
            currentMood={currentMood}
            onMoodPress={() => setShowMoodModal(true)}
            emotions={EMOTIONS}
            currentPhase={currentPhase}
            focusAreas={focusAreas}
            weeklyGoals={weeklyGoals}
            nextMilestone={nextMilestone}
            overallProgress={overallProgress}
            onUpdate={handleGoalUpdate}
          />

          <Insights insights={insights} journalDate={journalDate} />
          
          <View style={styles.componentWrapper}>
            <DailyFocus 
              onExercisePress={(route, params) => {
                console.debug(`[HomeScreen] Navigating from DailyFocus. Route: ${route}, Params:`, params);
                navigation.navigate(route, params);
              }} 
            />
          </View>
          
          <AITestButton />
        </ScrollView>
      </LinearGradient>

      <MoodModal
        visible={showMoodModal}
        onDismiss={() => setShowMoodModal(false)}
        onMoodSelect={handleMoodSelect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  componentWrapper: {
    marginBottom: SPACING.lg,
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
  errorContainer: {
    margin: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.errorLight,
    borderRadius: RADIUS.md,
  },
  errorText: {
    color: COLORS.error,
  },
});

export default HomeScreen; 