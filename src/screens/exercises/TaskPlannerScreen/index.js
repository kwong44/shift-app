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
  IconButton
} from 'react-native-paper';
import { SPACING, COLORS, RADIUS, FONT, SHADOWS } from '../../../config/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { createTask, updateTask, deleteTask, getTasks } from '../../../api/exercises';
import { useUser } from '../../../hooks/useUser';

// Import local components and constants
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';
import { PRIORITY_LEVELS } from './constants';

// Debug logging
console.debug('TaskPlannerScreen mounted', { priorityLevelsCount: PRIORITY_LEVELS.length });

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

  // Get the selected priority level data
  const selectedPriorityData = PRIORITY_LEVELS.find(p => p.value === selectedPriority);
  
  // Debug logging for state changes
  console.debug('TaskPlannerScreen state:', {
    taskCount: tasks.length,
    selectedPriority,
    loading
  });

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Load tasks when user is available
  useEffect(() => {
    if (user) {
      console.debug('User available, loading tasks');
      loadTasks();
    } else {
      console.debug('No user available, waiting...');
      setLoading(false);
    }
  }, [user]); // Add user as dependency

  const loadTasks = async () => {
    try {
      // Check if user exists
      if (!user) {
        console.debug('No user found, skipping task load');
        setTasks([]);
        setLoading(false);
        return;
      }

      console.debug('Loading tasks for user:', user.id);
      // Set includeCompleted to true to fetch both active and completed tasks
      const data = await getTasks(user.id, true);
      console.debug('Tasks loaded successfully', { count: data?.length || 0 });
      console.debug('Task data structure:', JSON.stringify(data));
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
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
      // Provide haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const data = await createTask(
        user.id,
        newTask.trim(),
        PRIORITY_LEVELS.findIndex(p => p.value === selectedPriority) + 1
      );

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
      
      const updatedTask = await updateTask(taskId, { completed });
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      ));

      if (completed) {
        // Set completed task ID for dialog
        setCompletedTaskId(taskId);
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
      
      await deleteTask(taskId);
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
    if (!completedTaskId) return null;
    const task = tasks.find(t => t.id === completedTaskId);
    if (!task) return null;
    return task;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
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
            subtitle="Organize & Focus"
            subtitleStyle={styles.appbarSubtitle}
          />
          <IconButton
            icon="information"
            iconColor={COLORS.text}
            size={24}
            onPress={() => {
              // TODO: Show info modal about task planning
            }}
          />
        </Appbar.Header>

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

        <Portal>
          <Dialog visible={showDialog} onDismiss={handleDismissDialog}>
            <LinearGradient
              colors={[`${COLORS.primary}10`, `${COLORS.secondary}05`]}
              style={styles.dialogGradient}
            >
              <Dialog.Title style={styles.dialogTitle}>Task Complete!</Dialog.Title>
              <Dialog.Content>
                <View style={styles.dialogContent}>
                  <MaterialCommunityIcons 
                    name="check-circle-outline" 
                    size={48} 
                    color={COLORS.primary} 
                    style={styles.dialogIcon} 
                  />
                  <Text style={styles.dialogText}>
                    Great job completing your task! Keep up the momentum and tackle your next priority.
                  </Text>
                </View>
              </Dialog.Content>
              <Dialog.Actions>
                <Button 
                  onPress={handleDismissDialog} 
                  mode="contained" 
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
  appbar: {
    backgroundColor: COLORS.background,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
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
    padding: SPACING.lg,
  },
  inputContainer: {
    elevation: 2,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  dialogGradient: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  dialogTitle: {
    textAlign: 'center',
    color: COLORS.text,
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
  },
  dialogContent: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  dialogIcon: {
    marginBottom: SPACING.sm,
  },
  dialogText: {
    textAlign: 'center',
    color: COLORS.textLight,
    lineHeight: 22,
  },
  dialogButton: {
    marginTop: SPACING.md,
  },
  snackbar: {
    bottom: SPACING.md,
  },
});

export default TaskPlannerScreen; 