import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { supabase } from '../../../config/supabase';
import { SPACING, COLORS } from '../../../config/theme';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../../hooks/useUser';
import { getProgressSummary } from '../../../api/progress';

// Import components
import ProfileTabHeader from './components/ProfileTabHeader';
import ProfileInfo from './components/ProfileInfo';
import StatCard from './components/StatCard';
import GoalsProgress from './components/GoalsProgress';
import MoodTrend from './components/MoodTrend';
import ExerciseBreakdown from './components/ExerciseBreakdown';
import FavoritesSection from './components/FavoritesSection';

// Import helpers
import { calculateMoodTrend } from './helpers/moodHelpers';
import { 
  calculateWeeklyStreak,
  calculateWeeklyProgress,
  calculateExerciseBreakdown,
  calculateFocusTime,
  calculateMindfulMinutes 
} from './helpers/statsCalculator';

// Import profile API
import { getProfile, updateProfile, updateAvatar } from '../../../api/profile';

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[ProfileScreen] ${message}`, data);
  }
};

const ProgressScreen = () => {
  const { user } = useUser();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({
    totalExercises: 0,
    weeklyStreak: 0,
    completedGoals: 0,
    totalGoals: 1,
    moodTrend: 'neutral',
    focusTime: 0,
    mindfulMinutes: 0,
    journalEntries: 0,
    exerciseBreakdown: {},
    weeklyProgress: []
  });
  const [progressData, setProgressData] = useState({
    focusTimeMinutes: 0,
    mindfulMinutes: 0,
    totalExercisesCompleted: 0,
    activeDays: 0,
  });
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  console.debug('[ProgressScreen] Initializing. User:', user?.id);
  console.debug('[ProgressScreen] FavoritesSection integrated into Progress tab');

  const fetchSummaryData = useCallback(async () => {
    if (!user?.id) {
      console.debug('[ProgressScreen] No user ID, skipping fetch.');
      setLoading(false); // Stop loading if no user
      // Optionally set progressData to 0 or keep as is, depends on desired behavior before login
      setProgressData({ focusTimeMinutes: 0, mindfulMinutes: 0, totalExercisesCompleted: 0, activeDays: 0 });
      return;
    }

    console.debug(`[ProgressScreen] Fetching summary data for user: ${user.id}`);
    setError(null); // Reset error before new fetch
    // Do not set loading to true if it's a refresh, refreshing state handles UI
    if (!refreshing) {
        setLoading(true);
    }

    try {
      const summary = await getProgressSummary(user.id);
      console.debug('[ProgressScreen] Summary data received:', summary);
      setProgressData(summary);
    } catch (err) {
      console.error('[ProgressScreen] Error fetching progress summary:', err.message);
      setError('Failed to load progress. Please try again.');
      // Set to 0 on error as per requirement
      setProgressData({ focusTimeMinutes: 0, mindfulMinutes: 0, totalExercisesCompleted: 0, activeDays: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, refreshing]);

  useEffect(() => {
    fetchSummaryData();
  }, [fetchSummaryData]); // fetchSummaryData is memoized with useCallback

  const onRefresh = useCallback(() => {
    console.debug('[ProgressScreen] Refresh initiated.');
    setRefreshing(true);
    // fetchSummaryData will be called due to 'refreshing' changing, 
    // or call it directly if you prefer explicit control after setting refreshing true.
    // await fetchSummaryData(); // Not strictly needed if refreshing is in fetchSummaryData deps
  }, []);

  useEffect(() => {
    debug.log(`useEffect triggered: Loading ${activeTab} data`);
    
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Get user data
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          debug.log('User not found');
          throw new Error('User not found');
        }
        debug.log('User found:', user.id);
        
        // Load profile data
        if (activeTab === 'profile') {
          const profile = await getProfile();
          debug.log('Profile loaded:', profile);
          
          // Merge user email with profile data
          setProfileData({
            ...profile,
            email: user.email,
          });
        }
        
        // Load stats for the progress tab
        if (activeTab === 'progress') {
          await loadUserStats(user.id);
        }
        
      } catch (error) {
        debug.log('Error loading data:', error.message);
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
        debug.log('Loading finished');
      }
    };
    
    loadData();
  }, [activeTab]);

  const loadUserStats = async (userId) => {
    try {
      debug.log('Attempting to load user statistics');

      // Fetching data in parallel
      const [
        { data: exercises },
        { data: goals },
        { data: moods },
        { data: journals }
      ] = await Promise.all([
        supabase.from('exercise_logs').select('*').eq('user_id', userId),
        supabase.from('goals').select('*').eq('user_id', userId),
        supabase.from('mood_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(7),
        supabase.from('journal_entries').select('*').eq('user_id', userId)
      ]);
      debug.log('Data fetched:', { exercises: exercises?.length, goals: goals?.length, moods: moods?.length, journals: journals?.length });

      const newTotalGoals = (goals || []).length;
      const safeExercises = exercises || [];

      setStats({
        totalExercises: safeExercises.length,
        weeklyStreak: calculateWeeklyStreak(safeExercises),
        completedGoals: (goals || []).filter(g => g.status === 'completed').length,
        totalGoals: newTotalGoals > 0 ? newTotalGoals : 1,
        moodTrend: calculateMoodTrend(moods || []),
        focusTime: calculateFocusTime(safeExercises),
        mindfulMinutes: calculateMindfulMinutes(safeExercises),
        journalEntries: (journals || []).length,
        exerciseBreakdown: calculateExerciseBreakdown(safeExercises),
        weeklyProgress: calculateWeeklyProgress(safeExercises)
      });

      debug.log('Statistics loaded and state updated successfully');
    } catch (error) {
      debug.log('Error loading statistics:', error.message);
      console.error('Error loading statistics:', error);
    }
  };
  
  const handleEditProfile = async (field) => {
    debug.log('Edit profile field:', field);
    // In a real implementation, this would show modals/forms for editing different profile fields
    // For now, we'll just log the action
    
    if (field === 'avatar') {
      // Implement image picker and avatar update
      debug.log('Opening image picker for avatar update');
    } else if (field === 'name') {
      // Implement name update
      debug.log('Opening dialog for name update');
    } else if (field === 'settings') {
      // Navigate to settings
      debug.log('Navigating to settings');
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    debug.log('Logging out user');
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      debug.log('User logged out successfully');
      // The auth state change listener in navigation/index.js will handle the redirect
    } catch (error) {
      debug.log('Error logging out:', error.message);
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            Loading {activeTab === 'profile' ? 'profile' : 'progress'}...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProfileTabHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]}/>}
      >
        {activeTab === 'profile' ? (
          <ProfileInfo 
            profile={profileData}
            onEditProfile={handleEditProfile}
            onLogout={handleLogout}
          />
        ) : (
          // Progress Screen Content
          <>
            {/* Key Stats Overview Grid */}
            <View style={styles.statsGrid}>
              <StatCard
                title="Focus Time"
                value={progressData.focusTimeMinutes}
                unit="mins"
                icon="brain"
              />
              <StatCard
                title="Mindful Minutes"
                value={progressData.mindfulMinutes}
                unit="mins"
                icon="meditation"
              />
              <StatCard
                title="Total Exercises"
                value={progressData.totalExercisesCompleted}
                unit="completed"
                icon="dumbbell"
              />
              <StatCard
                title="Active Days"
                value={progressData.activeDays}
                unit="days"
                icon="calendar-check"
              />
            </View>

            {/* Favorites Section */}
            <FavoritesSection />

            <GoalsProgress 
              completedGoals={stats.completedGoals}
              totalGoals={stats.totalGoals}
            />

            <MoodTrend trend={stats.moodTrend} />

            <ExerciseBreakdown exerciseBreakdown={stats.exerciseBreakdown} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.primary,
  },
  statUnit: {
    fontSize: 16, // Slightly smaller for the unit
    fontWeight: 'normal',
    color: COLORS.textSecondary, // Corrected from text nhẹ
  },
  statTitle: {
    // ... existing code ...
  },
});

export default ProgressScreen; 