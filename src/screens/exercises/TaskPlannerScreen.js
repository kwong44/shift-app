import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
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
  TextInput,
  Checkbox,
  List,
  IconButton,
  SegmentedButtons,
  Menu,
  Divider
} from 'react-native-paper';
import { SPACING } from '../../config/theme';
import { supabase } from '../../config/supabase';

const PRIORITY_LEVELS = [
  { value: 'high', label: 'High', icon: 'flag' },
  { value: 'medium', label: 'Medium', icon: 'flag-outline' },
  { value: 'low', label: 'Low', icon: 'flag-variant-outline' },
];

const TaskPlannerScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [error, setError] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const theme = useTheme();

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
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      ));

      if (completed) {
        // Update progress log
        const { error: progressError } = await supabase
          .from('progress_logs')
          .insert({
            user_id: tasks.find(t => t.id === taskId).user_id,
            exercise_type: 'task-completion',
            details: {
              task_id: taskId,
              description: tasks.find(t => t.id === taskId).description
            },
          });

        if (progressError) throw progressError;
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error.message);
      setSnackbarVisible(true);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.filter(task => task.id !== taskId));
      setMenuVisible(false);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(error.message);
      setSnackbarVisible(true);
    }
  };

  const renderTask = (task) => {
    const priority = PRIORITY_LEVELS.find(p => p.value === task.priority);
    
    return (
      <Card 
        key={task.id} 
        style={[
          styles.taskCard,
          task.completed && { backgroundColor: theme.colors.surfaceVariant }
        ]} 
        mode="outlined"
      >
        <Card.Content style={styles.taskContent}>
          <View style={styles.taskLeft}>
            <Checkbox
              status={task.completed ? 'checked' : 'unchecked'}
              onPress={() => handleToggleTask(task.id, !task.completed)}
            />
            <Text 
              variant="bodyLarge"
              style={[
                styles.taskText,
                task.completed && styles.completedTask
              ]}
            >
              {task.description}
            </Text>
          </View>
          
          <View style={styles.taskRight}>
            <IconButton
              icon={priority.icon}
              iconColor={theme.colors.primary}
              size={20}
            />
            <Menu
              visible={menuVisible && selectedTaskId === task.id}
              onDismiss={() => {
                setMenuVisible(false);
                setSelectedTaskId(null);
              }}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  onPress={() => {
                    setSelectedTaskId(task.id);
                    setMenuVisible(true);
                  }}
                />
              }
            >
              <Menu.Item 
                onPress={() => handleDeleteTask(task.id)} 
                title="Delete"
                leadingIcon="delete"
              />
            </Menu>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Task Planner" />
      </Appbar.Header>

      <Surface style={styles.content} elevation={0}>
        <Card style={styles.inputCard} mode="outlined">
          <Card.Content>
            <TextInput
              mode="outlined"
              label="New Task"
              placeholder="What do you want to accomplish?"
              value={newTask}
              onChangeText={setNewTask}
              right={<TextInput.Icon icon="plus" onPress={handleAddTask} />}
              style={styles.input}
            />
            <SegmentedButtons
              value={selectedPriority}
              onValueChange={setSelectedPriority}
              buttons={PRIORITY_LEVELS.map(priority => ({
                value: priority.value,
                label: priority.label,
                icon: priority.icon,
              }))}
              style={styles.priorityButtons}
            />
          </Card.Content>
        </Card>

        <View style={styles.listHeader}>
          <Text variant="titleMedium">Your Tasks</Text>
          <Text 
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {tasks.filter(t => t.completed).length} of {tasks.length} completed
          </Text>
        </View>

        <ScrollView style={styles.taskList}>
          {tasks.length > 0 ? (
            tasks.map(renderTask)
          ) : (
            <Text 
              variant="bodyLarge" 
              style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
            >
              No tasks yet. Add your first task above!
            </Text>
          )}
        </ScrollView>
      </Surface>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {error || 'An error occurred. Please try again.'}
      </Snackbar>
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
  inputCard: {
    marginBottom: SPACING.lg,
  },
  input: {
    marginBottom: SPACING.md,
  },
  priorityButtons: {
    marginTop: SPACING.xs,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  taskList: {
    flex: 1,
  },
  taskCard: {
    marginBottom: SPACING.sm,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  taskLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  taskRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskText: {
    flex: 1,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});

export default TaskPlannerScreen; 