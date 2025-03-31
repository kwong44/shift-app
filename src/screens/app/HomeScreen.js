import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
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
  FAB
} from 'react-native-paper';
import { SPACING } from '../../config/theme';
import { signOut } from '../../api/auth';
import { fetchRoadmap } from '../../api/roadmap';
import { supabase } from '../../config/supabase';

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState(null);
  const theme = useTheme();

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
    <Card key={goal.id} style={styles.goalCard} mode="outlined">
      <Card.Content>
        <Title>{goal.description}</Title>
        <Paragraph style={styles.goalTimeline}>Timeline: {goal.timeline}</Paragraph>
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
          textStyle={{
            color: goal.status === 'completed' 
              ? theme.colors.success
              : theme.colors.primary
          }}
        >
          {goal.status}
        </Chip>
      </Card.Content>
    </Card>
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
      
      <ScrollView style={styles.content}>
        {error ? (
          <Card 
            style={[styles.errorCard, { backgroundColor: theme.colors.errorContainer }]} 
            mode="outlined"
          >
            <Card.Content>
              <Text style={{ color: theme.colors.error }}>
                Error loading your roadmap. Please try again later.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <>
            <Surface 
              style={[styles.progressCard, { backgroundColor: theme.colors.surfaceVariant }]} 
              elevation={0}
            >
              <Title>Your Progress</Title>
              <ProgressBar 
                progress={(roadmap?.progress?.completed_goals || 0) / (roadmap?.progress?.total_goals || 1)}
                style={styles.progressBar}
              />
              <Paragraph style={styles.progressText}>
                {roadmap?.progress?.completed_goals || 0} of {roadmap?.progress?.total_goals || 0} goals completed
              </Paragraph>
            </Surface>

            <View style={styles.goalsSection}>
              <Title style={styles.sectionTitle}>Your Goals</Title>
              {roadmap?.goals?.length > 0 ? (
                roadmap.goals.map(renderGoal)
              ) : (
                <Text style={styles.noContentText}>No goals found in your roadmap</Text>
              )}
            </View>

            <View style={styles.milestonesSection}>
              <Title style={styles.sectionTitle}>Upcoming Milestones</Title>
              {roadmap?.milestones?.length > 0 ? (
                roadmap.milestones.map(milestone => (
                  <Card key={milestone.goal_id} style={styles.milestoneCard} mode="outlined">
                    <Card.Content>
                      <Paragraph>{milestone.description}</Paragraph>
                      <Text style={styles.milestoneDate}>
                        Target: {new Date(milestone.target_date).toLocaleDateString()}
                      </Text>
                    </Card.Content>
                  </Card>
                ))
              ) : (
                <Text style={styles.noContentText}>No upcoming milestones</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <FAB
        icon="meditation"
        label="Daily Exercises"
        onPress={() => navigation.navigate('Exercises')}
        style={[
          styles.fab,
          { backgroundColor: theme.colors.primary }
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  errorCard: {
    marginBottom: SPACING.lg,
  },
  progressCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 8,
  },
  progressBar: {
    marginVertical: SPACING.md,
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
  },
  goalsSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  goalCard: {
    marginBottom: SPACING.md,
  },
  goalTimeline: {
    marginBottom: SPACING.xs,
  },
  statusChip: {
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  milestonesSection: {
    marginBottom: SPACING.xl,
  },
  milestoneCard: {
    marginBottom: SPACING.sm,
  },
  milestoneDate: {
    marginTop: SPACING.xs,
    opacity: 0.7,
  },
  noContentText: {
    textAlign: 'center',
    marginTop: SPACING.md,
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen; 