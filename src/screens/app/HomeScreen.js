import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS, FONT, SPACING } from '../../config/theme';
import { signOut } from '../../api/auth';
import { fetchRoadmap } from '../../api/roadmap';
import { supabase } from '../../config/supabase';

const HomeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const roadmapData = await fetchRoadmap(user.id);
      setRoadmap(roadmapData);
    } catch (error) {
      console.error('Error loading roadmap:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // The main navigation component will handle the redirect
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderGoal = (goal) => (
    <View key={goal.id} style={styles.goalCard}>
      <Text style={styles.goalTitle}>{goal.description}</Text>
      <Text style={styles.goalTimeline}>Timeline: {goal.timeline}</Text>
      <View style={styles.statusContainer}>
        <Text style={[
          styles.statusText,
          { color: goal.status === 'completed' ? COLORS.success : COLORS.primary }
        ]}>
          Status: {goal.status}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your roadmap...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>RealityShift</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Error loading your roadmap. Please try again later.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.progressCard}>
              <Text style={styles.progressTitle}>Your Progress</Text>
              <Text style={styles.progressText}>
                {roadmap?.progress?.completed_goals || 0} of {roadmap?.progress?.total_goals || 0} goals completed
              </Text>
            </View>

            <View style={styles.goalsSection}>
              <Text style={styles.sectionTitle}>Your Goals</Text>
              {roadmap?.goals?.length > 0 ? (
                roadmap.goals.map(renderGoal)
              ) : (
                <Text style={styles.noGoalsText}>No goals found in your roadmap</Text>
              )}
            </View>

            <View style={styles.milestonesSection}>
              <Text style={styles.sectionTitle}>Upcoming Milestones</Text>
              {roadmap?.milestones?.length > 0 ? (
                roadmap.milestones.map(milestone => (
                  <View key={milestone.goal_id} style={styles.milestoneCard}>
                    <Text style={styles.milestoneText}>{milestone.description}</Text>
                    <Text style={styles.milestoneDate}>
                      Target: {new Date(milestone.target_date).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noMilestonesText}>No upcoming milestones</Text>
              )}
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: COLORS.primary,
  },
  signOutButton: {
    padding: SPACING.sm,
  },
  signOutText: {
    fontSize: FONT.size.sm,
    color: COLORS.primary,
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
    fontSize: FONT.size.md,
    color: COLORS.primary,
  },
  errorContainer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.errorLight,
    borderRadius: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT.size.md,
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: COLORS.background,
    borderRadius: SPACING.sm,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  progressText: {
    fontSize: FONT.size.md,
    color: COLORS.primary,
    fontWeight: FONT.weight.medium,
  },
  goalsSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  goalCard: {
    backgroundColor: COLORS.background,
    borderRadius: SPACING.sm,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  goalTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  goalTimeline: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  statusContainer: {
    marginTop: SPACING.xs,
  },
  statusText: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
  },
  milestonesSection: {
    marginBottom: SPACING.xl,
  },
  milestoneCard: {
    backgroundColor: COLORS.background,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  milestoneText: {
    fontSize: FONT.size.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  milestoneDate: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
  },
  noGoalsText: {
    fontSize: FONT.size.md,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  noMilestonesText: {
    fontSize: FONT.size.md,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});

export default HomeScreen; 