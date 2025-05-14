import { supabase } from '../../config/supabase';

/**
 * Create a new task
 * @param {string} userId - The user's ID
 * @param {string} description - Task description
 * @param {number} priority - Task priority (1-5)
 * @param {Date} dueDate - Optional due date
 * @returns {Promise} - The created task
 */
export const createTask = async (userId, description, priority, dueDate = null) => {
  try {
    console.debug('[createTask] Creating task:', { userId, description, priority, dueDate });
    
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        description,
        priority,
        due_date: dueDate,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating task:', error.message);
    throw error;
  }
};

/**
 * Update a task
 * @param {string} taskId - The task ID
 * @param {object} updates - The updates to apply
 * @returns {Promise} - The updated task
 */
export const updateTask = async (taskId, updates) => {
  try {
    console.debug('[updateTask] Updating task:', { taskId, updates });
    
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating task:', error.message);
    throw error;
  }
};

/**
 * Delete a task
 * @param {string} taskId - The task ID
 * @returns {Promise} - The deletion result
 */
export const deleteTask = async (taskId) => {
  try {
    console.debug('[deleteTask] Deleting task:', { taskId });
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting task:', error.message);
    throw error;
  }
};

/**
 * Get user's tasks
 * @param {string} userId - The user's ID
 * @param {boolean} includeCompleted - Whether to include completed tasks
 * @returns {Promise} - Array of tasks
 */
export const getTasks = async (userId, includeCompleted = false) => {
  try {
    console.debug('[getTasks] Fetching tasks:', { userId, includeCompleted });
    
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (!includeCompleted) {
      query = query.eq('completed', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching tasks:', error.message);
    throw error;
  }
}; 