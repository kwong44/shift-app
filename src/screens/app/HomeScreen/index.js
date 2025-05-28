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
  fetchAllUserWeeklyGoals
} from '../../../api/exercises';
import { getLongTermGoalsWithWeeklyGoals } from '../../../api/longTermGoals';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [allUserWeeklyGoals, setAllUserWeeklyGoals] = useState([]);
  const [longTermGoals, setLongTermGoals] = useState([]);

  useEffect(() => {
    loadUserData();
    checkDailyMood();
    refreshInsights();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.debug('[HomeScreen] Focus event: Refreshing data.');
      loadUserData();
      refreshInsights();
    });

    return unsubscribe;
  }, [navigation]);

  // Transform roadmap data when it changes
  useEffect(() => {
    if (roadmap) {
      console.debug('[HomeScreen] Roadmap data updated:', roadmap);
    }
  }, [roadmap]);

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
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      console.debug('[HomeScreen] Loading user data for:', user.id);

      // Clear roadmap cache to prevent stale data issues - Rule: Always add debug logs
      console.debug('[HomeScreen] Clearing roadmap cache to prevent stale data');
      try {
        const { clearLocalRoadmap } = await import('../../../api/roadmap');
        await clearLocalRoadmap();
        console.debug('[HomeScreen] Roadmap cache cleared successfully');
      } catch (cacheError) {
        console.warn('[HomeScreen] Could not clear roadmap cache:', cacheError);
      }

      const [roadmapData, tasksData, visualizationsData, userData, streakData, allGoalsData, longTermGoalsData] = await Promise.all([
        fetchRoadmap(user.id), // TRANSITIONAL: Still used for phases/milestones
        getTasks(user.id),
        getVisualizations(user.id),
        supabase.from('users').select('name').eq('id', user.id).single(),
        supabase.from('progress_logs').select('created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        fetchAllUserWeeklyGoals(user.id), // TRANSITIONAL: Contains old system goals
        getLongTermGoalsWithWeeklyGoals(user.id) // NEW: Primary long-term goals system
      ]);

      console.debug('[HomeScreen] Raw roadmap data:', roadmapData);
      console.debug('[HomeScreen] Roadmap ID being set:', roadmapData?.id);
      setRoadmap(roadmapData);
      
      console.debug('[HomeScreen] Raw allUserWeeklyGoals data:', allGoalsData);
      setAllUserWeeklyGoals(allGoalsData || []);
      
      console.debug('[HomeScreen] Raw longTermGoals data:', longTermGoalsData);
      setLongTermGoals(longTermGoalsData || []);
      
      setUserName(userData?.data?.name || '');

      const currentStreak = calculateStreak(streakData.data || []);
      console.debug('[HomeScreen] Calculated streak:', currentStreak);
      setStreak(currentStreak);

      const completedTasks = (tasksData || []).filter(task => task.completed).length;
      const completedVisualizations = (visualizationsData || []).filter(viz => viz.completed).length;
      const totalActivitiesToday = (tasksData || []).length + (visualizationsData || []).length;
      let progress = 0;
      if (totalActivitiesToday > 0) {
        progress = (completedTasks + completedVisualizations) / totalActivitiesToday;
      }
      
      progress = Math.min(Math.max(Number(progress) || 0, 0), 1);
      console.debug('[HomeScreen] Calculated daily progress:', progress);
      setDailyProgress(progress);

      console.debug("[HomeScreen] User data loaded successfully");

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

  const handleRoadmapUpdate = async () => {
    try {
      console.debug('[HomeScreen] handleRoadmapUpdate: Refreshing roadmap, weekly goals, and long-term goals.');
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('[HomeScreen] handleRoadmapUpdate: No user found to refresh data.');
        return;
      }
      
      // Fetch both old and new systems data
      const [roadmapData, allGoalsData, longTermGoalsData] = await Promise.all([
        fetchRoadmap(user.id),
        fetchAllUserWeeklyGoals(user.id),
        getLongTermGoalsWithWeeklyGoals(user.id)
      ]);

      console.debug('[HomeScreen] handleRoadmapUpdate: New roadmap data:', roadmapData);
      setRoadmap(roadmapData);
      
      console.debug('[HomeScreen] handleRoadmapUpdate: New allUserWeeklyGoals data:', allGoalsData);
      setAllUserWeeklyGoals(allGoalsData || []);
      
      console.debug('[HomeScreen] handleRoadmapUpdate: New longTermGoals data:', longTermGoalsData);
      setLongTermGoals(longTermGoalsData || []);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.debug('[HomeScreen] handleRoadmapUpdate: Data refresh complete.');
    } catch (error) {
      console.error('[HomeScreen] handleRoadmapUpdate: Error refreshing data:', error);
      setError('Failed to refresh roadmap data. Please try again.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
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
        colors={[COLORS.background, COLORS.background]}
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
            roadmap={roadmap}
            allUserWeeklyGoals={allUserWeeklyGoals}
            longTermGoals={longTermGoals}
            onUpdateRoadmapData={handleRoadmapUpdate}
          />

          <Insights insights={insights} journalDate={journalDate} />
          
          <View style={styles.componentWrapper}>
            <DailyFocus 
              onExercisePress={(route, params) => {
                console.debug(`[HomeScreen] Navigating from DailyFocus. Route: ${route}, Params:`, params);
                navigation.navigate(route, { ...params, originRouteName: 'Roadmap' });
              }} 
            />
          </View>
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