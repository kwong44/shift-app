import { supabase } from '../../config/supabase';

/**
 * Create a new task
 * @param {string} userId - The user's ID
 * @param {string} description - Task description
 * @param {number|string} priority - Task priority (number 1-3 or string 'high', 'medium', 'low')
 * @param {Date} dueDate - Optional due date
 * @returns {Promise} - The created task
 */
export const createTask = async (userId, description, priority, dueDate = null) => {
  try {
    // Convert numeric priority to string if needed
    let priorityString = priority;
    if (typeof priority === 'number') {
      if (priority === 1) priorityString = 'high';
      else if (priority === 2) priorityString = 'medium';
      else priorityString = 'low';
    }
    
    console.debug('[createTask] Creating task:', { 
      userId, 
      description, 
      priority: priorityString, 
      dueDate 
    });
    
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        description,
        priority: priorityString,
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
    // Convert numeric priority to string if needed
    if (updates.priority !== undefined) {
      let priorityString = updates.priority;
      if (typeof updates.priority === 'number') {
        if (updates.priority === 1) priorityString = 'high';
        else if (updates.priority === 2) priorityString = 'medium';
        else priorityString = 'low';
        
        updates = { ...updates, priority: priorityString };
      }
    }
    
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