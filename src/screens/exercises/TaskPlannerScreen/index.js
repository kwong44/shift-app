import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Appbar,
  Surface,
  Snackbar,
  Portal,
  Dialog,
  Button,
  Text
} from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../config/theme';
import { supabase } from '../../../config/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Import local components and constants
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';
import { PRIORITY_LEVELS } from './constants';

// Debug logging
console.debug('TaskPlannerScreen mounted');

const TaskPlannerScreen = ({ navigation }) => {
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

  // Get the selected priority level data
  const selectedPriorityData = PRIORITY_LEVELS.find(p => p.value === selectedPriority);
  
  // Debug logging for state changes
  console.debug('TaskPlannerScreen state:', {
    taskCount: tasks.length,
    selectedPriority,
    loading
  });

  // Load tasks when component mounts
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.debug('Tasks loaded successfully', { count: data?.length || 0 });
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError(error.message);
      setSnackbarVisible(true);
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
      // Provide haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          description: newTask.trim(),
          priority: selectedPriority,
          completed: false
        })
        .select()
        .single();

      if (error) throw error;

      console.debug('Task added successfully', { taskId: data.id });
      setTasks([data, ...tasks]);
      setNewTask('');
      setSelectedPriority('medium');
    } catch (error) {
      console.error('Error adding task:', error);
      setError(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId, completed) => {
    try {
      // Provide haptic feedback
      await Haptics.impactAsync(
        completed ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
      );
      
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      ));

      if (completed) {
        // Set completed task ID for dialog
        setCompletedTaskId(taskId);
        
        // Update progress log
        const { error: progressError } = await supabase
          .from('progress_logs')
          .insert({
            user_id: tasks.find(t => t.id === taskId).user_id,
            exercise_type: 'task-completion',
            details: {
              task_id: taskId,
              description: tasks.find(t => t.id === taskId).description,
              priority: tasks.find(t => t.id === taskId).priority
            },
          });

        if (progressError) throw progressError;
        
        // Show completion dialog
        setShowDialog(true);
      }
      
      console.debug('Task updated successfully', { taskId, completed });
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error.message);
      setSnackbarVisible(true);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      // Provide haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.filter(task => task.id !== taskId));
      setMenuVisible(false);
      
      console.debug('Task deleted successfully', { taskId });
    } catch (error) {
      console.error('Error deleting task:', error);
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
    if (!completedTaskId) return { description: '', priority: PRIORITY_LEVELS[1] };
    
    const task = tasks.find(t => t.id === completedTaskId);
    if (!task) return { description: '', priority: PRIORITY_LEVELS[1] };
    
    return { 
      description: task.description,
      priority: PRIORITY_LEVELS.find(p => p.value === task.priority)
    };
  };

  const completedTask = getCompletedTaskInfo();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#5C6BC0', '#3949AB']}
        style={styles.screenGradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <Appbar.Header style={styles.appbar} statusBarHeight={0}>
            <Appbar.BackAction 
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.goBack();
              }} 
              color={COLORS.background} 
            />
            <Appbar.Content 
              title="Task Planner" 
              titleStyle={styles.appbarTitle}
              subtitle="Organize your priorities"
              subtitleStyle={styles.appbarSubtitle}
            />
          </Appbar.Header>

          <Surface style={styles.surface} elevation={0}>
            <View style={styles.contentContainer}>
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
            </View>
          </Surface>
        </SafeAreaView>

        <Portal>
          <Dialog visible={showDialog} onDismiss={handleDismissDialog}>
            <LinearGradient
              colors={[`${completedTask.priority?.color || COLORS.primary}15`, `${completedTask.priority?.color || COLORS.primary}05`]}
              style={styles.dialogGradient}
            >
              <Dialog.Title style={styles.dialogTitle}>Task Completed! 🎉</Dialog.Title>
              <Dialog.Content>
                <View style={styles.dialogContent}>
                  <MaterialCommunityIcons 
                    name="check-circle-outline" 
                    size={48} 
                    color={completedTask.priority?.color || COLORS.primary} 
                    style={styles.dialogIcon} 
                  />
                  <Text style={styles.dialogText}>
                    Great job completing:
                  </Text>
                  <Text style={[styles.completedTaskText, { color: completedTask.priority?.color }]}>
                    "{completedTask.description}"
                  </Text>
                  <Text style={styles.dialogText}>
                    Keep up the momentum and continue building productive habits!
                  </Text>
                </View>
              </Dialog.Content>
              <Dialog.Actions>
                <Button 
                  onPress={handleDismissDialog} 
                  mode="contained" 
                  buttonColor={completedTask.priority?.color || COLORS.primary}
                  style={styles.dialogButton}
                >
                  Continue
                </Button>
              </Dialog.Actions>
            </LinearGradient>
          </Dialog>
        </Portal>
        
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
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
  },
  screenGradient: {
    flex: 1,
  },
  appbar: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  appbarTitle: {
    color: COLORS.background,
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
  },
  appbarSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: FONT.size.sm,
  },
  surface: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: SPACING.lg,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    ...SHADOWS.large,
  },
  contentContainer: {
    flex: 1,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  dialogGradient: {
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
  },
  dialogTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    textAlign: 'center',
  },
  dialogContent: {
    alignItems: 'center',
  },
  dialogIcon: {
    marginBottom: SPACING.md,
  },
  dialogText: {
    textAlign: 'center',
    lineHeight: 22,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  completedTaskText: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    textAlign: 'center',
    marginVertical: SPACING.sm,
    fontStyle: 'italic',
  },
  dialogButton: {
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.md,
  },
  snackbar: {
    bottom: SPACING.md,
  },
});

export default TaskPlannerScreen; 