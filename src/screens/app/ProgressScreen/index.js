import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { supabase } from '../../../config/supabase';
import { SPACING, COLORS } from '../../../config/theme';

// Import components
import ProgressHeader from './components/ProgressHeader';
import StatCard from './components/StatCard';
import GoalsProgress from './components/GoalsProgress';
import MoodTrend from './components/MoodTrend';
import ExerciseBreakdown from './components/ExerciseBreakdown';

// Import helpers
import { calculateMoodTrend } from './helpers/moodHelpers';
import { 
  calculateWeeklyStreak,
  calculateWeeklyProgress,
  calculateExerciseBreakdown,
  calculateFocusTime,
  calculateMindfulMinutes 
} from './helpers/statsCalculator';

// Debug logger
const debug = {
  log: (message, data = '') => {
    console.log(`[ProgressScreen] ${message}`, data);
  }
};

const ProgressScreen = () => {
  debug.log('Component mounted');
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    debug.log('useEffect triggered: Loading user stats');
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      debug.log('Attempting to load user statistics');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        debug.log('User not found');
        throw new Error('User not found');
      }
      debug.log('User found:', user.id);

      // Fetching data in parallel
      const [
        { data: exercises },
        { data: goals },
        { data: moods },
        { data: journals }
      ] = await Promise.all([
        supabase.from('exercise_logs').select('*').eq('user_id', user.id),
        supabase.from('goals').select('*').eq('user_id', user.id),
        supabase.from('mood_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(7),
        supabase.from('journal_entries').select('*').eq('user_id', user.id)
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
    } finally {
      setLoading(false);
      debug.log('Loading finished');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ProgressHeader />

        {/* Key Stats Overview Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Weekly Streak"
            value={`${stats.weeklyStreak}`}
            icon="fire"
            color={COLORS.orange}
            unit="weeks"
          />
          <StatCard
            title="Total Exercises"
            value={`${stats.totalExercises}`}
            icon="dumbbell"
            color={COLORS.purple}
            unit="completed"
          />
          <StatCard
            title="Focus Time"
            value={`${stats.focusTime}m`}
            icon="brain"
            color={COLORS.blue}
          />
          <StatCard
            title="Mindful Minutes"
            value={`${stats.mindfulMinutes}m`}
            icon="meditation"
            color={COLORS.teal}
          />
        </View>

        <GoalsProgress 
          completedGoals={stats.completedGoals}
          totalGoals={stats.totalGoals}
        />

        <MoodTrend trend={stats.moodTrend} />

        <ExerciseBreakdown exerciseBreakdown={stats.exerciseBreakdown} />
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
});

export default ProgressScreen; 