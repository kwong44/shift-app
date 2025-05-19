-- Fix the function to return conversation history in ascending order (oldest first)
-- This matches what the app expects for displaying the conversation chronologically
CREATE OR REPLACE FUNCTION get_recent_conversation(
  p_user_id UUID,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  is_user BOOLEAN,
  token_usage INT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- We need to get the most recent messages but return them in ascending order
  -- So we get most recent N messages using a subquery with DESC order
  -- Then sort the final results in ASC order for display
  RETURN QUERY
  SELECT 
    ch.id,
    ch.content,
    ch.is_user,
    ch.token_usage,
    ch.created_at
  FROM (
    SELECT * FROM conversation_history 
    WHERE user_id = p_user_id
    ORDER BY created_at DESC 
    LIMIT p_limit
  ) ch
  ORDER BY ch.created_at ASC; -- Final sort in ascending order
END;
$$;

-- Increase default RPC timeout to handle larger conversation histories
ALTER ROLE service_role SET statement_timeout = '30s'; 