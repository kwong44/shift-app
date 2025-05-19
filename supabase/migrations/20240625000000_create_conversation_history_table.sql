-- Create conversation history table for AI Coach
CREATE TABLE IF NOT EXISTS conversation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_user BOOLEAN NOT NULL,
  token_usage INT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT conversation_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS conversation_history_user_id_idx ON conversation_history(user_id);
CREATE INDEX IF NOT EXISTS conversation_history_created_at_idx ON conversation_history(created_at);

-- Add RLS policies
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

-- Allow users to only see their own messages
CREATE POLICY "Users can view their own conversation history"
  ON conversation_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own messages
CREATE POLICY "Users can insert their own messages"
  ON conversation_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add a function to get the most recent N messages for a user
CREATE OR REPLACE FUNCTION get_recent_conversation(
  p_user_id UUID,
  p_limit INT DEFAULT 20
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
  RETURN QUERY
  SELECT 
    ch.id,
    ch.content,
    ch.is_user,
    ch.token_usage,
    ch.created_at
  FROM conversation_history ch
  WHERE ch.user_id = p_user_id
  ORDER BY ch.created_at DESC
  LIMIT p_limit;
END;
$$; 