import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Text, Card, useTheme, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../config/supabase';
import { SPACING, COLORS, RADIUS, FONT } from '../../config/theme';
import CircularProgress from '../../components/common/CircularProgress';

// Debug logger
const debug = {
  log: (message) => {
    console.log(`[ProgressScreen] ${message}`);
  }
};

const ProgressScreen = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExercises: 0,
    weeklyStreak: 0,
    completedGoals: 0,
    totalGoals: 0,
    moodTrend: 'positive',
    focusTime: 0,
    mindfulMinutes: 0,
    journalEntries: 0,
    exerciseBreakdown: {},
    weeklyProgress: []
  });
  const theme = useTheme();

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      debug.log('Loading user statistics');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Get completed exercises
      const { data: exercises } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('user_id', user.id);

      // Get goals
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);

      // Get mood logs
      const { data: moods } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(7);

      // Get journal entries
      const { data: journals } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id);

      // Calculate exercise breakdown
      const breakdown = (exercises || []).reduce((acc, exercise) => {
        acc[exercise.type] = (acc[exercise.type] || 0) + 1;
        return acc;
      }, {});

      // Calculate mood trend
      const moodTrend = calculateMoodTrend(moods || []);

      // Calculate total focus time (in minutes)
      const totalFocusTime = (exercises || [])
        .filter(ex => ex.type === 'deep_work' || ex.type === 'focus')
        .reduce((total, ex) => total + (ex.duration || 0), 0);

      // Calculate mindful minutes
      const mindfulMinutes = (exercises || [])
        .filter(ex => ex.type === 'mindfulness' || ex.type === 'meditation')
        .reduce((total, ex) => total + (ex.duration || 0), 0);

      setStats({
        totalExercises: (exercises || []).length,
        weeklyStreak: calculateWeeklyStreak(exercises || []),
        completedGoals: (goals || []).filter(g => g.status === 'completed').length,
        totalGoals: (goals || []).length,
        moodTrend,
        focusTime: Math.round(totalFocusTime),
        mindfulMinutes,
        journalEntries: (journals || []).length,
        exerciseBreakdown: breakdown,
        weeklyProgress: calculateWeeklyProgress(exercises || [])
      });

      debug.log('Statistics loaded successfully');
    } catch (error) {
      debug.log('Error loading statistics:', error.message);
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMoodTrend = (moods) => {
    if (!moods.length) return 'neutral';
    const recentMoods = moods.slice(0, 7);
    const moodScores = recentMoods.map(m => parseInt(m.mood));
    const average = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;
    return average > 3 ? 'positive' : average < 3 ? 'negative' : 'neutral';
  };

  const calculateWeeklyStreak = (exercises) => {
    if (!exercises.length) return 0;
    // Implementation of weekly streak calculation
    // This is a simplified version - you might want to make it more sophisticated
    const weeks = new Set(exercises.map(ex => {
      const date = new Date(ex.created_at);
      return `${date.getFullYear()}-${date.getWeek()}`;
    }));
    return weeks.size;
  };

  const calculateWeeklyProgress = (exercises) => {
    // Group exercises by week and calculate totals
    const weeklyData = exercises.reduce((acc, ex) => {
      const date = new Date(ex.created_at);
      const week = `${date.getFullYear()}-${date.getWeek()}`;
      acc[week] = (acc[week] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(weeklyData)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 8)
      .reverse();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[COLORS.primary + '40', COLORS.background]}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>Your Progress</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Track your transformation journey
          </Text>
        </View>

        {/* Overview Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Weekly Streak"
            value={`${stats.weeklyStreak}`}
            icon="fire"
            color={COLORS.orange}
          />
          <StatCard
            title="Total Exercises"
            value={`${stats.totalExercises}`}
            icon="dumbbell"
            color={COLORS.purple}
          />
          <StatCard
            title="Focus Time"
            value={`${stats.focusTime}m`}
            icon="clock-focus"
            color={COLORS.blue}
          />
          <StatCard
            title="Mindful Minutes"
            value={`${stats.mindfulMinutes}m`}
            icon="meditation"
            color={COLORS.teal}
          />
        </View>

        {/* Goals Progress */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>Goals Progress</Text>
            <View style={styles.goalsContainer}>
              <CircularProgress
                percentage={(stats.completedGoals / stats.totalGoals) * 100}
                size={80}
                strokeWidth={8}
              />
              <View style={styles.goalsText}>
                <Text variant="headlineMedium">{stats.completedGoals}/{stats.totalGoals}</Text>
                <Text variant="bodyMedium">Goals Completed</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Mood Trend */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>Mood Trend</Text>
            <View style={styles.moodContainer}>
              <MaterialCommunityIcons
                name={getMoodIcon(stats.moodTrend)}
                size={40}
                color={getMoodColor(stats.moodTrend)}
              />
              <Text variant="bodyLarge" style={{ color: getMoodColor(stats.moodTrend) }}>
                {stats.moodTrend.charAt(0).toUpperCase() + stats.moodTrend.slice(1)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Exercise Breakdown */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>Exercise Breakdown</Text>
            {Object.entries(stats.exerciseBreakdown).map(([type, count]) => (
              <View key={type} style={styles.breakdownItem}>
                <Text variant="bodyMedium">{formatExerciseType(type)}</Text>
                <Text variant="bodyMedium">{count}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper Components
const StatCard = ({ title, value, icon, color }) => (
  <Card style={[styles.statCard, { borderLeftColor: color }]}>
    <Card.Content style={styles.statContent}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text variant="titleLarge" style={[styles.statValue, { color }]}>{value}</Text>
      <Text variant="bodySmall" style={styles.statTitle}>{title}</Text>
    </Card.Content>
  </Card>
);

// Helper Functions
const getMoodIcon = (trend) => {
  switch (trend) {
    case 'positive': return 'emoticon-happy-outline';
    case 'negative': return 'emoticon-sad-outline';
    default: return 'emoticon-neutral-outline';
  }
};

const getMoodColor = (trend) => {
  switch (trend) {
    case 'positive': return COLORS.success;
    case 'negative': return COLORS.error;
    default: return COLORS.textLight;
  }
};

const formatExerciseType = (type) => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Add week number calculation to Date prototype
Date.prototype.getWeek = function() {
  const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
  },
  title: {
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
  },
  subtitle: {
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderLeftWidth: 4,
  },
  statContent: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontWeight: FONT.weight.bold,
    marginVertical: SPACING.xs,
  },
  statTitle: {
    color: COLORS.textLight,
  },
  card: {
    margin: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  cardTitle: {
    marginBottom: SPACING.md,
    fontWeight: FONT.weight.semiBold,
  },
  goalsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  goalsText: {
    flex: 1,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
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
});

export default ProgressScreen; 