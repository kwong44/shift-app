-- Ensure user_credits table exists
-- This migration checks if the user_credits table exists and creates it if not

-- Create the user_credits table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tokens INTEGER NOT NULL DEFAULT 10000, -- Default to 10,000 tokens (10 credits)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Add RLS policies for the table if they don't exist
DO $$
BEGIN
  -- Check if the policy exists before trying to create it
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'user_credits' AND policyname = 'Users can view their own token balance'
  ) THEN
    -- Create policy for users to view their own token balance
    CREATE POLICY "Users can view their own token balance" 
    ON user_credits
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
  
  -- Enable RLS on the table
  ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
END
$$; 