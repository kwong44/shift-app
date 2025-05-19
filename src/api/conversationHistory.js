import { supabase } from '../config/supabase';

// Debug logging
console.debug('[conversationHistory] Initializing Conversation History API');

/**
 * Configuration for conversation history
 */
export const CONVERSATION_CONFIG = {
  // Maximum number of messages to load in the UI
  maxUIMessages: 50,
  
  // Maximum number of messages to send to the AI for context
  maxAIContextMessages: 10,
  
  // Default first message if no history exists
  defaultFirstMessage: "So, tell me about your goals. What are you supposedly 'working toward' but making excuses about?"
};

/**
 * Save a single message to the conversation history
 * @param {object} message - The message to save
 * @param {string} message.content - The message content
 * @param {boolean} message.isUser - Whether the message is from the user (true) or AI (false)
 * @param {number} [message.tokenUsage] - Token usage for AI messages
 * @param {object} [message.metadata] - Additional metadata for the message
 * @returns {Promise<object>} The saved message
 */
export const saveMessage = async (message) => {
  console.debug('[conversationHistory] Saving message to history');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('conversation_history')
      .insert({
        user_id: user.id,
        content: message.content,
        is_user: message.isUser,
        token_usage: message.tokenUsage || null,
        metadata: message.metadata || null
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.debug('[conversationHistory] Message saved successfully');
    return data;
  } catch (error) {
    console.error('[conversationHistory] Error saving message:', error);
    throw error;
  }
};

/**
 * Batch save multiple messages to the conversation history
 * @param {Array<object>} messages - The messages to save
 * @returns {Promise<Array<object>>} The saved messages
 */
export const saveMessages = async (messages) => {
  console.debug('[conversationHistory] Saving multiple messages to history');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Format messages for batch insert
    const messageRows = messages.map(msg => ({
      user_id: user.id,
      content: msg.content,
      is_user: msg.isUser,
      token_usage: msg.tokenUsage || null,
      metadata: msg.metadata || null
    }));
    
    const { data, error } = await supabase
      .from('conversation_history')
      .insert(messageRows)
      .select();
    
    if (error) throw error;
    
    console.debug(`[conversationHistory] ${data.length} messages saved successfully`);
    return data;
  } catch (error) {
    console.error('[conversationHistory] Error saving messages:', error);
    throw error;
  }
};

/**
 * Get conversation history for the current user
 * @param {number} [limit=CONVERSATION_CONFIG.maxUIMessages] - Number of messages to retrieve
 * @returns {Promise<Array<object>>} Messages in chronological order (oldest first)
 */
export const getConversationHistory = async (limit = CONVERSATION_CONFIG.maxUIMessages) => {
  console.debug('[conversationHistory] Getting conversation history with limit:', limit);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.debug('[conversationHistory] No authenticated user found');
      throw new Error('User not authenticated');
    }
    
    console.debug(`[conversationHistory] Getting history for user: ${user.id.substring(0, 8)}...`);
    
    // Try with a performance timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 8000);
    });
    
    // Actual database query
    const dbQueryPromise = supabase
      .rpc('get_recent_conversation', {
        p_user_id: user.id,
        p_limit: limit
      });
    
    // Race between timeout and actual query
    const { data, error } = await Promise.race([
      dbQueryPromise,
      timeoutPromise.then(() => { throw new Error('Database query timeout'); })
    ]);
    
    if (error) {
      console.error('[conversationHistory] Database error getting conversation:', error);
      throw error;
    }
    
    console.debug(`[conversationHistory] Raw database result contains ${data?.length || 0} messages`);
    
    if (!data || data.length === 0) {
      console.debug('[conversationHistory] No conversation history found in database');
      return [];
    }
    
    // Directly map the data without any sorting - the SQL function should handle this now
    const messages = data.map(item => {
      // Check timestamp format
      const timestamp = item.created_at;
      console.debug(`[conversationHistory] Message timestamp: ${timestamp}, id: ${item.id?.substring(0, 8) || 'unknown'}..., isUser: ${item.is_user}`);
      
      return {
        id: item.id || `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Generate id if missing
        content: item.content || '',
        isUser: !!item.is_user, // Ensure boolean
        tokenUsage: item.token_usage || 0,
        timestamp: timestamp || new Date().toISOString()
      };
    }).filter(item => item.content); // Remove empty messages
    
    // Check the order of messages by timestamps
    if (messages.length > 1) {
      const firstTime = new Date(messages[0].timestamp).getTime();
      const lastTime = new Date(messages[messages.length-1].timestamp).getTime();
      console.debug(`[conversationHistory] First message time: ${messages[0].timestamp}, Last message time: ${messages[messages.length-1].timestamp}`);
      console.debug(`[conversationHistory] Messages in correct order (first earlier than last): ${firstTime < lastTime}`);
      
      // Ensure proper order if database didn't sort correctly
      if (firstTime > lastTime) {
        console.debug('[conversationHistory] Messages in wrong order, sorting manually');
        messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      }
    }
    
    console.debug(`[conversationHistory] Retrieved and processed ${messages.length} messages`);
    if (messages.length > 0) {
      console.debug(`[conversationHistory] First message: ${messages[0].content?.substring(0, 30) || 'empty'}...`);
      console.debug(`[conversationHistory] Last message: ${messages[messages.length-1]?.content?.substring(0, 30) || 'empty'}...`);
    }
    
    return messages;
  } catch (error) {
    console.error('[conversationHistory] Error getting conversation history:', error);
    // Return empty array instead of throwing to improve app resilience
    return [];
  }
};

/**
 * Get the most recent N messages for AI context
 * @param {number} [limit=CONVERSATION_CONFIG.maxAIContextMessages] - Number of messages to retrieve
 * @returns {Promise<Array<object>>} Messages in chronological order (oldest first)
 */
export const getContextMessages = async (limit = CONVERSATION_CONFIG.maxAIContextMessages) => {
  console.debug('[conversationHistory] Getting context messages for AI');
  
  try {
    const messages = await getConversationHistory(limit);
    
    // Format messages for the AI context
    const contextMessages = messages.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.content
    }));
    
    console.debug(`[conversationHistory] Retrieved ${contextMessages.length} context messages for AI`);
    return contextMessages;
  } catch (error) {
    console.error('[conversationHistory] Error getting context messages:', error);
    return []; // Return empty array on error to allow conversation to continue
  }
};

/**
 * Clear all conversation history for the current user
 * @returns {Promise<boolean>} Success flag
 */
export const clearConversationHistory = async () => {
  console.debug('[conversationHistory] Clearing conversation history');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { error } = await supabase
      .from('conversation_history')
      .delete()
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    console.debug('[conversationHistory] Conversation history cleared successfully');
    return true;
  } catch (error) {
    console.error('[conversationHistory] Error clearing conversation history:', error);
    throw error;
  }
};

export default {
  getConversationHistory,
  getContextMessages,
  saveMessage,
  saveMessages,
  clearConversationHistory,
  config: CONVERSATION_CONFIG
}; 