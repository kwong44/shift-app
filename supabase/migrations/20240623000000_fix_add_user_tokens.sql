-- Fix token system functions
-- This migration adds the add_user_tokens RPC function that was missing

-- Create function to safely add/subtract tokens from a user's balance
CREATE OR REPLACE FUNCTION add_user_tokens(p_user_id UUID, p_amount INT) 
RETURNS INT 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance INT;
  new_balance INT;
BEGIN
  -- Check if user has a token record
  SELECT tokens INTO current_balance
  FROM user_credits
  WHERE user_id = p_user_id;
  
  -- If no record exists, initialize with default tokens
  IF current_balance IS NULL THEN
    INSERT INTO user_credits (user_id, tokens)
    VALUES (p_user_id, 10000) -- Match TOKENS_CONFIG.initialFreeTokens in the frontend
    RETURNING tokens INTO current_balance;
  END IF;
  
  -- Calculate new balance (prevent negative balance)
  IF p_amount < 0 AND ABS(p_amount) > current_balance THEN
    -- Don't allow going below zero
    new_balance := 0;
  ELSE
    new_balance := current_balance + p_amount;
  END IF;
  
  -- Update the balance
  UPDATE user_credits
  SET tokens = new_balance
  WHERE user_id = p_user_id;
  
  -- Return the new balance
  RETURN new_balance;
END;
$$; 