import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  useTheme, 
  Surface,
  Appbar,
  Card,
  Button,
  Portal,
  Dialog,
  Snackbar,
  ProgressBar,
  IconButton,
  TouchableRipple,
  Divider,
} from 'react-native-paper';
import { SPACING, COLORS } from '../../config/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../config/supabase';

const EXERCISES = [
  {
    id: 'binaural',
    title: 'Binaural Beats',
    description: 'Enhance focus and relaxation through audio entrainment',
    icon: 'headphones',
    duration: '10-15 min',
    route: 'BinauralBeats',
    color: '#7D8CC4'
  },
  {
    id: 'visualization',
    title: 'Visualization',
    description: 'Strengthen your mindset through guided visualization',
    icon: 'eye',
    duration: '5 min',
    route: 'Visualization',
    color: '#6A8EAE'
  },
  {
    id: 'tasks',
    title: 'Task Planner',
    description: 'Break down your goals into actionable tasks',
    icon: 'checkbox-marked-outline',
    duration: '5-10 min',
    route: 'TaskPlanner',
    color: '#5C5C8E'
  },
  {
    id: 'deepwork',
    title: 'Deep Work',
    description: 'Focus intensely on important tasks without distractions',
    icon: 'timer-outline',
    duration: '25-50 min',
    route: 'DeepWork',
    color: '#9067C6'
  },
  {
    id: 'mindfulness',
    title: 'Mindfulness',
    description: 'Practice presence and emotional awareness',
    icon: 'meditation',
    duration: '5-10 min',
    route: 'Mindfulness',
    color: '#4C63B6'
  },
  {
    id: 'journaling',
    title: 'Journaling',
    description: 'Process thoughts and emotions through writing',
    icon: 'book-outline',
    duration: '10-15 min',
    route: 'Journaling',
    color: '#5C96AE'
  },
  {
    id: 'reflection',
    title: 'Self-Reflection',
    description: 'Review progress and gain deeper insights',
    icon: 'lightbulb-outline',
    duration: '15-20 min',
    route: 'SelfReflection',
    color: '#7D8CC4'
  },
];

const ExercisesDashboard = ({ navigation }) => {
  const [completedExercises, setCompletedExercises] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const [progressAnimation] = useState(new Animated.Value(0));
  const windowWidth = Dimensions.get('window').width;
  const theme = useTheme();

  useEffect(() => {
    loadCompletedExercises();
  }, []);

  useEffect(() => {
    const completedCount = Object.keys(completedExercises).length;
    const progressValue = completedCount / EXERCISES.length;
    
    Animated.timing(progressAnimation, {
      toValue: progressValue,
      duration: 1000,
      useNativeDriver: false
    }).start();
  }, [completedExercises]);

  const loadCompletedExercises = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get today's progress logs
      const { data: logs, error } = await supabase
        .from('progress_logs')
        .select('exercise_type')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString());

      if (error) throw error;

      // Create a map of completed exercises
      const completed = {};
      logs.forEach(log => {
        completed[log.exercise_type] = true;
      });

      setCompletedExercises(completed);
    } catch (error) {
      console.error('Error loading completed exercises:', error);
      setError(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleExercisePress = (exercise) => {
    navigation.navigate(exercise.route);
  };

  const renderHeader = () => {
    const completedCount = Object.keys(completedExercises).length;
    const progressPercentage = (completedCount / EXERCISES.length) * 100;
    
    const headerOpacity = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [1, 0.9],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>Daily Exercises</Text>
          <Text style={styles.headerSubtitle}>
            Develop habits that transform your life
          </Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {completedCount} of {EXERCISES.length} completed
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <Animated.View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: progressAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    }) 
                  }
                ]} 
              />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderExerciseCard = (exercise) => {
    const isCompleted = completedExercises[exercise.id];
    
    return (
      <TouchableRipple
        key={exercise.id}
        onPress={() => handleExercisePress(exercise)}
        style={styles.exerciseCardContainer}
        borderless
      >
        <Card style={styles.exerciseCard} elevation={3}>
          <View style={styles.exerciseContent}>
            <View 
              style={[
                styles.exerciseIconContainer, 
                { backgroundColor: `${exercise.color}20` }
              ]}
            >
              <MaterialCommunityIcons 
                name={exercise.icon} 
                size={28} 
                color={exercise.color} 
              />
            </View>
            
            <View style={styles.exerciseTextContainer}>
              <View style={styles.exerciseHeaderRow}>
                <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                {isCompleted && (
                  <MaterialCommunityIcons 
                    name="check-circle" 
                    size={22} 
                    color={COLORS.success} 
                  />
                )}
              </View>
              
              <Text style={styles.exerciseDescription}>
                {exercise.description}
              </Text>
              
              <View style={styles.exerciseFooter}>
                <View style={styles.durationContainer}>
                  <MaterialCommunityIcons 
                    name="clock-outline" 
                    size={14} 
                    color={COLORS.textLight} 
                  />
                  <Text style={styles.durationText}>{exercise.duration}</Text>
                </View>
                
                <IconButton 
                  icon="arrow-right" 
                  size={20} 
                  iconColor={COLORS.primary}
                  style={styles.arrowButton} 
                />
              </View>
            </View>
          </View>
        </Card>
      </TouchableRipple>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header style={styles.appbar} elevated>
        <Appbar.BackAction 
          onPress={() => navigation.goBack()} 
          color={COLORS.primary}
        />
        <Appbar.Content 
          title="Exercises" 
          titleStyle={styles.appbarTitle} 
        />
      </Appbar.Header>

      <Animated.ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {renderHeader()}
        
        <View style={styles.exercisesContainer}>
          {EXERCISES.map(exercise => renderExerciseCard(exercise))}
        </View>
      </Animated.ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
        style={styles.snackbar}
      >
        {error || 'An error occurred. Please try again.'}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  appbar: {
    backgroundColor: COLORS.background,
  },
  appbarTitle: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  headerContainer: {
    marginBottom: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.lg,
  },
  progressContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressText: {
    color: COLORS.background,
    fontWeight: '600',
    fontSize: 16,
  },
  progressPercentage: {
    color: COLORS.background,
    fontWeight: '700',
    fontSize: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  exercisesContainer: {
    paddingHorizontal: SPACING.lg,
  },
  exerciseCardContainer: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  exerciseCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  exerciseContent: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  exerciseIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  exerciseTextContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  exerciseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  exerciseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    marginLeft: 4,
    fontSize: 13,
    color: COLORS.textLight,
  },
  arrowButton: {
    margin: 0,
    backgroundColor: `${COLORS.primary}15`,
  },
  snackbar: {
    bottom: SPACING.md,
  },
});

export default ExercisesDashboard; 