import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../../config/theme';
import { useUser } from '../../../../hooks/useUser';
import { getExerciseBreakdown } from '../../../../api/exercises';

// Exercise type to icon mapping
const EXERCISE_TYPE_ICONS = {
  'Mindfulness': 'meditation',
  'Visualization': 'eye',
  'Deep Work': 'brain',
  'Binaural Beats': 'waveform',
  'Task Planning': 'checkbox-marked-outline',
  'Journaling': 'book-edit-outline'
};

// Exercise type to color mapping
const EXERCISE_TYPE_COLORS = {
  'Mindfulness': ['#00B894', '#007E66'],
  'Visualization': ['#FF7675', '#FF5D5D'],
  'Deep Work': ['#5AC8FA', '#4B9EF8'],
  'Binaural Beats': ['#7D8CC4', '#5D6CAF'],
  'Task Planning': ['#6C63FF', '#5F52EE'],
  'Journaling': ['#FDCB6E', '#E17055']
};

const ExerciseBreakdown = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [breakdownData, setBreakdownData] = useState([]);

  console.debug('[ExerciseBreakdown] Component initialized. User:', user?.id);
  console.debug('[ExerciseBreakdown] Added marginHorizontal for width consistency with other components');

  useEffect(() => {
    const fetchBreakdownData = async () => {
      if (!user?.id) {
        console.debug('[ExerciseBreakdown] No user ID available, skipping data fetch');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.debug('[ExerciseBreakdown] Fetching exercise breakdown data for user:', user.id);
        
        const data = await getExerciseBreakdown(user.id);
        console.debug('[ExerciseBreakdown] Received breakdown data:', data);
        
        setBreakdownData(data);
      } catch (err) {
        console.error('[ExerciseBreakdown] Error fetching breakdown data:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBreakdownData();
  }, [user?.id]);

  const renderExerciseItem = (item, index) => {
    const icon = EXERCISE_TYPE_ICONS[item.type] || 'dumbbell';
    const colors = EXERCISE_TYPE_COLORS[item.type] || ['#CCCCCC', '#999999'];
    
    return (
      <View key={item.type} style={styles.exerciseItem}>
        <LinearGradient
          colors={colors}
          style={styles.exerciseIcon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons 
            name={icon} 
            size={20} 
            color={COLORS.white} 
          />
        </LinearGradient>
        
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseType}>{item.type}</Text>
          <Text style={styles.exerciseStats}>
            {item.count} session{item.count !== 1 ? 's' : ''} • {item.totalDurationMinutes}min
          </Text>
        </View>
        
        <View style={styles.exercisePercentage}>
          <Text style={styles.percentageText}>{item.percentage}%</Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons 
        name="chart-pie" 
        size={48} 
        color={COLORS.textSecondary} 
      />
      <Text style={styles.emptyTitle}>No Exercise Data</Text>
      <Text style={styles.emptySubtitle}>
        Complete some exercises to see your breakdown here
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons 
        name="alert-circle-outline" 
        size={48} 
        color={COLORS.error} 
      />
      <Text style={styles.emptyTitle}>Unable to Load Data</Text>
      <Text style={styles.emptySubtitle}>{error}</Text>
    </View>
  );

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <MaterialCommunityIcons 
          name="chart-donut" 
          size={24} 
          color={COLORS.primary} 
        />
        <Text style={styles.title}>Exercise Breakdown</Text>
        <Text style={styles.subtitle}>Last 30 days</Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading exercise data...</Text>
          </View>
        ) : error ? (
          renderErrorState()
        ) : breakdownData.length === 0 ? (
          renderEmptyState()
        ) : (
          <ScrollView 
            style={styles.exerciseList}
            showsVerticalScrollIndicator={false}
          >
            {breakdownData.map((item, index) => renderExerciseItem(item, index))}
          </ScrollView>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semiBold,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  subtitle: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT.weight.regular,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    minHeight: 120, // Ensure consistent height during loading
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },
  loadingText: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  exerciseList: {
    maxHeight: 200, // Limit height to prevent excessive scrolling
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  exerciseIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseType: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.medium,
    color: COLORS.text,
    marginBottom: 2,
  },
  exerciseStats: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
  },
  exercisePercentage: {
    alignItems: 'flex-end',
  },
  percentageText: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semiBold,
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semiBold,
    color: COLORS.text,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ExerciseBreakdown;
