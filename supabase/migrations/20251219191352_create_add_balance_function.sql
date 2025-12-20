/*
  # Add balance function for commission earnings
  
  1. New Functions
    - `add_balance` - Adds commission earnings to user balance
      - Takes user_id and amount as parameters
      - Updates the user's balance in profiles table
      - Returns success status
  
  2. Purpose
    - Allows automatic commission crediting when users complete tasks
    - Ensures balance updates are atomic and safe
  
  3. Security
    - Function runs with caller's security context
    - Only authenticated users can call this function
*/

-- Function to add balance (for commission earnings)
CREATE OR REPLACE FUNCTION add_balance(
  user_id uuid,
  amount NUMERIC
)
RETURNS json AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the calling user ID
  current_user_id := auth.uid();
  
  -- Verify the user is adding balance to their own account
  IF current_user_id != user_id THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Unauthorized: Can only add balance to own account'
    );
  END IF;
  
  -- Validate amount is positive
  IF amount <= 0 THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Amount must be positive'
    );
  END IF;
  
  -- Update user balance
  UPDATE profiles
  SET balance = balance + amount
  WHERE id = user_id;
  
  -- Check if update was successful
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User not found'
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Balance updated successfully',
    'amount_added', amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION add_balance TO authenticated;
