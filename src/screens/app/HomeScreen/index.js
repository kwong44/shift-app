import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { SPACING, COLORS, RADIUS } from '../../../config/theme';
import { signOut } from '../../../api/auth';
import { fetchRoadmap } from '../../../api/roadmap';
import { supabase } from '../../../config/supabase';
import { getVisualizations, getTasks, getJournalEntries } from '../../../api/exercises';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  MoodModal, 
  TopBar, 
  GrowthRoadmap, 
  DailyFocus,
  Insights,
  MOODS 
} from './components';

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

  useEffect(() => {
    loadUserData();
    checkDailyMood();
  }, []);

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
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error logging mood:', error);
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

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const [roadmapData, tasksData, visualizations, journalEntries, userData, streakData] = await Promise.all([
        fetchRoadmap(user.id),
        getTasks(user.id),
        getVisualizations(user.id),
        getJournalEntries(user.id, new Date()),
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
        progress = (completedTasks + (visualizations || []).length + (journalEntries || []).length) / totalActivities;
      }
      
      progress = Math.min(Math.max(Number(progress) || 0, 0), 1);
      setDailyProgress(progress);

      // Set insights if available
      if (journalEntries?.length > 0 && journalEntries[0]?.insights) {
        setInsights({
          text: journalEntries[0].insights,
          recommendations: generateRecommendations(journalEntries[0].insights, roadmapData?.goals || [])
        });
      }

      console.debug("Data loaded successfully");

    } catch (error) {
      console.error('Error loading user data:', error);
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
      <TopBar 
        userName={userName}
        onSignOut={signOut}
        greeting={getGreeting()}
      />
      
      <Animated.ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Error loading your data. Please try again later.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.componentWrapper}>
              <GrowthRoadmap 
                dailyProgress={dailyProgress}
                streak={streak}
                currentMood={currentMood}
                onMoodPress={() => setShowMoodModal(true)}
                MOODS={MOODS}
                currentPhase={roadmap?.currentPhase}
                focusAreas={roadmap?.focusAreas}
                weeklyGoals={roadmap?.weeklyGoals}
                nextMilestone={roadmap?.nextMilestone}
                overallProgress={roadmap?.overallProgress}
              />
            </View>
            
            <View style={styles.componentWrapper}>
              <DailyFocus 
                onExercisePress={(route) => navigation.navigate(route)} 
              />
            </View>
            
            <Insights insights={insights} />
          </>
        )}
      </Animated.ScrollView>

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
  content: {
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
  }
});

export default HomeScreen; 