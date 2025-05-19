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
  console.debug('[conversationHistory] Getting conversation history');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Use the database function to get recent messages
    const { data, error } = await supabase
      .rpc('get_recent_conversation', {
        p_user_id: user.id,
        p_limit: limit
      });
    
    if (error) throw error;
    
    // Process the data to match our expected format
    const messages = data.map(item => ({
      id: item.id,
      content: item.content,
      isUser: item.is_user,
      tokenUsage: item.token_usage,
      timestamp: item.created_at
    })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Sort by time (oldest first)
    
    console.debug(`[conversationHistory] Retrieved ${messages.length} messages`);
    
    // If no messages were found, return an empty array
    if (messages.length === 0) {
      console.debug('[conversationHistory] No conversation history found');
      return [];
    }
    
    return messages;
  } catch (error) {
    console.error('[conversationHistory] Error getting conversation history:', error);
    throw error;
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