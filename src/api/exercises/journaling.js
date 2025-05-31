import { supabase } from '../../config/supabase';

/**
 * Create a journal entry
 * @param {string} userId - The user's ID
 * @param {object} entryData - The journal entry data
 * @param {string} entryData.content - The journal entry content
 * @param {string} entryData.insights - AI-generated insights about the entry
 * @param {object} entryData.aiMetadata - Metadata about the AI processing
 * @param {string} entryData.aiMetadata.model - The AI model used
 * @param {number} entryData.aiMetadata.tokensUsed - Number of tokens used
 * @param {number} entryData.aiMetadata.processingTimeMs - Processing time in milliseconds
 * @param {number} entryData.aiMetadata.confidenceScore - AI confidence score
 * @param {object} entryData.aiMetadata.promptInfo - Information about the prompt used
 * @param {string[]} entryData.aiMetadata.emotions - Detected emotions
 * @returns {Promise} - The created entry
 */
export const createJournalEntry = async (userId, entryData) => {
  try {
    // Input validation
    if (!userId) throw new Error('User ID is required');
    if (!entryData?.content?.trim()) throw new Error('Entry content is required');

    console.debug('[createJournalEntry] Creating entry:', { 
      userId,
      contentLength: entryData.content.length,
      hasInsights: Boolean(entryData.insights),
      hasAiMetadata: Boolean(entryData.aiMetadata)
    });

    // Prepare AI metadata
    const aiMetadata = entryData.aiMetadata ? {
      model: entryData.aiMetadata.model,
      tokens_used: entryData.aiMetadata.tokensUsed,
      processing_time_ms: entryData.aiMetadata.processingTimeMs,
      confidence_score: entryData.aiMetadata.confidenceScore,
      prompt_info: entryData.aiMetadata.promptInfo,
      emotions: entryData.aiMetadata.emotions,
      analysis_timestamp: new Date().toISOString()
    } : null;

    // Create entry
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userId,
        content: entryData.content.trim(),
        insights: entryData.insights,
        ai_metadata: aiMetadata,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[createJournalEntry] Database error:', error);
      throw error;
    }

    console.debug('[createJournalEntry] Entry created successfully:', { 
      entryId: data.id,
      hasAiMetadata: Boolean(data.ai_metadata)
    });
    
    return data;
  } catch (error) {
    console.error('[createJournalEntry] Error:', error.message);
    throw error;
  }
};

/**
 * Update a journal entry with insights
 * @param {string} entryId - The entry ID
 * @param {string} insights - The insights to add
 * @returns {Promise} - The updated entry
 */
export const updateJournalEntry = async (entryId, insights) => {
  try {
    console.debug('[updateJournalEntry] Updating entry:', { entryId });
    
    const { data, error } = await supabase
      .from('journal_entries')
      .update({ insights })
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating journal entry:', error.message);
    throw error;
  }
};

/**
 * Get journal entries
 * @param {string} userId - The user's ID
 * @param {number} limit - Number of entries to fetch
 * @param {number} offset - Offset for pagination
 * @param {string} [searchQuery] - Optional search query to filter by content
 * @returns {Promise} - Array of entries
 */
export const getJournalEntries = async (userId, limit = 10, offset = 0, searchQuery = '') => {
  try {
    console.debug('[getJournalEntries] Fetching entries:', { userId, limit, offset, searchQuery });
    
    let query = supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId);

    // If a search query is provided, add a filter for the content
    // We use ilike for case-insensitive partial matching.
    // Ensure the column 'content' exists and is of a text type in your 'journal_entries' table.
    if (searchQuery && searchQuery.trim() !== '') {
      query = query.ilike('content', `%${searchQuery.trim()}%`);
    }

    // Add ordering and pagination
    query = query.order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;
    console.debug('[getJournalEntries] Successfully fetched entries:', data?.length);
    return data;
  } catch (error) {
    console.error('Error fetching journal entries:', error.message);
    throw error;
  }
};

/**
 * Get recent journal insights
 * @param {string} userId - The user's ID
 * @param {number} limit - Maximum number of insights to fetch (default: 1)
 * @returns {Promise} Array of journal entries with insights
 */
export const getRecentJournalInsights = async (userId, limit = 1) => {
  try {
    console.debug('[getRecentJournalInsights] Fetching insights:', { userId, limit });

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .not('insights', 'is', null) // Only entries with insights
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[getRecentJournalInsights] Error:', error);
      throw error;
    }

    console.debug('[getRecentJournalInsights] Found insights:', { 
      count: data?.length,
      latestDate: data?.[0]?.created_at 
    });

    return data;
  } catch (error) {
    console.error('Error fetching journal insights:', error.message);
    throw error;
  }
}; 