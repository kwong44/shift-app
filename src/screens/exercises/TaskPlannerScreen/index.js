import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, Animated, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Appbar,
  Surface,
  Snackbar,
  Portal,
  Dialog,
  Button,
  Text,
  IconButton,
  ProgressBar,
  Chip
} from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../config/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { createTask, updateTask, deleteTask, getTasks } from '../../../api/exercises';
import { useUser } from '../../../hooks/useUser';
import { supabase } from '../../../config/supabase';
import { MASTER_EXERCISE_LIST } from '../../../constants/masterExerciseList';

// Import local components and constants
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';
import { PRIORITY_LEVELS } from './constants';
import CustomDialog from '../../../components/common/CustomDialog';

// Debug logging for improved TaskPlannerScreen
console.debug('🚀 TaskPlannerScreen v2.0 mounted with enhanced UX', { 
  priorityLevelsCount: PRIORITY_LEVELS.length,
  features: ['swipe-to-complete', 'visual-feedback', 'compact-header', 'progress-tracking']
});

// Find the generic task planner exercise details from the master list
const TASK_PLANNER_EXERCISE = MASTER_EXERCISE_LIST.find(ex => ex.id === 'tasks_planner');

const TaskPlannerScreen = ({ navigation }) => {
  const { user } = useUser();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [completedTaskId, setCompletedTaskId] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [headerHeight] = useState(new Animated.Value(120)); // For compact header animation

  // Enhanced progress tracking
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  const completionPercentage = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
  
  // Priority breakdown for better insights
  const tasksByPriority = {
    high: activeTasks.filter(task => (task.priority === 1 || task.priority === 'high')).length,
    medium: activeTasks.filter(task => (task.priority === 2 || task.priority === 'medium')).length,
    low: activeTasks.filter(task => (task.priority === 3 || task.priority === 'low')).length,
  };

  // Get the selected priority level data
  const selectedPriorityData = PRIORITY_LEVELS.find(p => p.value === selectedPriority);
  
  // Enhanced debug logging for state changes
  console.debug('📊 TaskPlannerScreen state updated:', {
    taskCount: tasks.length,
    activeTasks: activeTasks.length,
    completedTasks: completedTasks.length,
    completionPercentage: Math.round(completionPercentage),
    priorityBreakdown: tasksByPriority,
    selectedPriority,
    loading
  });

  // Fade in animation with staggered effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(headerHeight, {
        toValue: tasks.length > 0 ? 100 : 120, // Compact header when tasks exist
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
  }, [tasks.length]);

  // Load tasks when user is available
  useEffect(() => {
    if (user) {
      console.debug('✅ User available, loading tasks for enhanced experience');
      loadTasks();
    } else {
      console.debug('⏳ No user available, waiting...');
      setLoading(false);
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      // Check if user exists
      if (!user) {
        console.debug('❌ No user found, skipping task load');
        setTasks([]);
        setLoading(false);
        return;
      }

      console.debug('📚 Loading tasks for user:', user.id);
      // Set includeCompleted to true to fetch both active and completed tasks
      const data = await getTasks(user.id, true);
      console.debug('✅ Tasks loaded successfully', { count: data?.length || 0 });
      console.debug('📋 Task data structure:', JSON.stringify(data?.slice(0, 3))); // Only log first 3 for brevity
      setTasks(data || []);
    } catch (error) {
      console.error('❌ Error loading tasks:', error);
      setError(error.message || 'Failed to load tasks');
      setSnackbarVisible(true);
      setTasks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) {
      setError('Please enter a task description');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      // Enhanced haptic feedback for task creation
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const insertedTask = await createTask(
        user.id,
        newTask.trim(),
        PRIORITY_LEVELS.findIndex(p => p.value === selectedPriority) + 1
      );

      // Check if the task was actually created and returned
      if (insertedTask && insertedTask.id) {
        console.debug('✅ Task added successfully with enhanced feedback', { 
          taskId: insertedTask.id,
          priority: selectedPriority,
          description: newTask.trim().substring(0, 50) + '...'
        });
        setTasks([insertedTask, ...tasks]);
        setNewTask('');
        setSelectedPriority('medium');
        
        // Additional success feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        console.error('❌ Error adding task: createTask did not return a valid task object.', insertedTask);
        setError('Failed to add task. Please try again.');
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('❌ Error adding task catch block:', error.message, error);
      const errorMessage = typeof error?.message === 'string' ? error.message : 'An unexpected error occurred.';
      setError(errorMessage);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId, completed) => {
    try {
      // Enhanced haptic feedback for task completion
      await Haptics.impactAsync(
        completed ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light
      );
      
      const updatedTask = await updateTask(taskId, { completed });
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      ));

      if (completed) {
        // Enhanced completion feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Set completed task ID for enhanced dialog
        setCompletedTaskId(taskId);
        setShowDialog(true);

        // Log to daily_exercise_logs if a task is marked as complete
        if (user?.id && TASK_PLANNER_EXERCISE) {
          const completedTask = tasks.find(t => t.id === taskId);
          const dailyLogEntry = {
            user_id: user.id,
            exercise_id: TASK_PLANNER_EXERCISE.id,
            exercise_type: TASK_PLANNER_EXERCISE.type,
            duration_seconds: 0,
            completed_at: new Date().toISOString(),
            source: 'TaskPlannerScreen_v2',
            metadata: {
              task_id: taskId,
              task_description_length: completedTask?.description?.length || 0,
              priority: completedTask?.priority,
              completion_percentage: Math.round(((completedTasks.length + 1) / tasks.length) * 100)
            }
          };
          console.debug('📊 [TaskPlannerScreen] Enhanced logging for completed task:', dailyLogEntry);
          supabase.from('daily_exercise_logs').insert(dailyLogEntry)
            .then(({ error: dailyErr }) => {
              if (dailyErr) console.error('❌ [TaskPlannerScreen] Error inserting task completion to daily_exercise_logs:', dailyErr.message);
              else console.debug('✅ [TaskPlannerScreen] Task completion logged with enhanced metadata.');
            });
        }
      } else {
        // Task uncompleted feedback
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      console.debug('✅ Task updated successfully with enhanced UX', { taskId, completed, newCompletionRate: Math.round(completionPercentage) });
    } catch (error) {
      console.error('❌ Error updating task:', error);
      setError(error.message);
      setSnackbarVisible(true);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      // Enhanced haptic feedback for deletion
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      setMenuVisible(false);
      
      console.debug('✅ Task deleted successfully with enhanced feedback', { taskId });
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      setError(error.message);
      setSnackbarVisible(true);
    }
  };

  const handleDismissDialog = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDialog(false);
    setCompletedTaskId(null);
  };

  const getCompletedTaskInfo = () => {
    if (!completedTaskId) return null;
    const task = tasks.find(t => t.id === completedTaskId);
    if (!task) return null;
    return task;
  };

  // Enhanced completion message based on progress
  const getCompletionMessage = () => {
    const completedTask = getCompletedTaskInfo();
    if (!completedTask) return "Great job completing your task!";
    
    if (completionPercentage === 100) {
      return "🎉 Amazing! You've completed ALL your tasks! You're absolutely crushing it today!";
    } else if (completionPercentage >= 75) {
      return "🔥 Fantastic progress! You're almost done - keep that momentum going!";
    } else if (completionPercentage >= 50) {
      return "💪 Great work! You're halfway there - you've got this!";
    } else {
      return "✨ Excellent start! Every completed task brings you closer to your goals!";
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Enhanced Compact Header */}
        <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
          <Appbar.Header style={styles.appbar} statusBarHeight={0}>
            <Appbar.BackAction 
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.goBack();
              }} 
              color={COLORS.text} 
            />
            <Appbar.Content 
              title="Task Planner" 
              titleStyle={styles.appbarTitle}
              subtitle={tasks.length > 0 ? `${activeTasks.length} active • ${Math.round(completionPercentage)}% complete` : "Organize & Focus"}
              subtitleStyle={styles.appbarSubtitle}
            />
            <IconButton
              icon="chart-line"
              iconColor={COLORS.primary}
              size={24}
              onPress={() => {
                // TODO: Show productivity analytics modal
                console.debug('📈 Analytics button pressed - future feature');
              }}
            />
          </Appbar.Header>
          
          {/* Enhanced Progress Section - Simplified without problematic chips */}
          {tasks.length > 0 && (
            <View style={styles.progressSection}>
              <View style={styles.progressRow}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressText}>
                    {completedTasks.length} of {tasks.length} tasks complete
                    {tasksByPriority.high > 0 && ` • ${tasksByPriority.high} high priority`}
                    {tasksByPriority.medium > 0 && ` • ${tasksByPriority.medium} medium priority`}
                    {tasksByPriority.low > 0 && ` • ${tasksByPriority.low} low priority`}
                  </Text>
                  <ProgressBar 
                    progress={completionPercentage / 100} 
                    color={COLORS.primary}
                    style={styles.progressBar}
                  />
                </View>
              </View>
            </View>
          )}
        </Animated.View>

        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View 
              style={[
                styles.content,
                { opacity: fadeAnim }
              ]}
            >
              <TaskInput
                newTask={newTask}
                setNewTask={setNewTask}
                selectedPriority={selectedPriority}
                setSelectedPriority={setSelectedPriority}
                priorityLevels={PRIORITY_LEVELS}
                onAddTask={handleAddTask}
                loading={loading}
              />

              <TaskList
                tasks={tasks}
                priorityLevels={PRIORITY_LEVELS}
                onToggleComplete={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                menuVisible={menuVisible}
                selectedTaskId={selectedTaskId}
                setMenuVisible={setMenuVisible}
                setSelectedTaskId={setSelectedTaskId}
              />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Enhanced Completion Dialog */}
        <CustomDialog
          visible={showDialog}
          onDismiss={handleDismissDialog}
          title="Task Complete! 🎉"
          content={
            <View style={styles.dialogContent}>
              <Text style={styles.dialogText}>
                {getCompletionMessage()}
              </Text>
              <View style={styles.progressSummary}>
                <Text style={styles.progressSummaryText}>
                  Progress: {completedTasks.length}/{tasks.length} tasks ({Math.round(completionPercentage)}%)
                </Text>
                <ProgressBar 
                  progress={completionPercentage / 100} 
                  color={COLORS.primary}
                  style={styles.dialogProgressBar}
                />
              </View>
            </View>
          }
          icon="check-circle-outline"
          confirmText="Keep Going!"
          onConfirm={handleDismissDialog}
          iconColor={COLORS.primary}
          iconBackgroundColor={`${COLORS.primary}10`}
        />

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbar}
          action={{
            label: 'OK',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {error || 'An error occurred. Please try again.'}
        </Snackbar>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  // Enhanced header styles
  headerContainer: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  appbar: {
    backgroundColor: COLORS.background,
    elevation: 0,
  },
  appbarTitle: {
    color: COLORS.text,
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
  },
  appbarSubtitle: {
    color: COLORS.textLight,
    fontSize: FONT.size.sm,
  },
  // New progress section styles
  progressSection: {
    paddingHorizontal: SPACING.md, // Reduced from lg for consistency
    paddingBottom: SPACING.xs, // Tighter bottom padding
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  progressText: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: RADIUS.full,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.md, // Reduced from lg for better space efficiency
    paddingTop: SPACING.sm, // Tighter top padding
  },
  // Enhanced dialog styles
  dialogContent: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  dialogText: {
    textAlign: 'center',
    color: COLORS.text,
    lineHeight: 22,
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.medium,
  },
  progressSummary: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  progressSummaryText: {
    fontSize: FONT.size.sm,
    color: COLORS.textLight,
    fontWeight: FONT.weight.medium,
  },
  dialogProgressBar: {
    width: '100%',
    height: 8,
    borderRadius: RADIUS.full,
  },
  snackbar: {
    bottom: SPACING.md,
  },
});

export default TaskPlannerScreen; 