/*
  # Fix admin_credit_balance function signature
  
  1. Changes
    - Drop existing admin_credit_balance function
    - Recreate with correct signature that accepts email instead of user_id
    - Parameters: user_email, credit_amount, admin_note
    - Returns JSONB with success status
    
  2. Security
    - SECURITY DEFINER to allow admin to credit any user
    - search_path set to public for security
*/

-- Drop existing function
DROP FUNCTION IF EXISTS admin_credit_balance(uuid, numeric, text);

-- Create function with correct signature
CREATE OR REPLACE FUNCTION admin_credit_balance(
  user_email TEXT,
  credit_amount DECIMAL(10,2),
  admin_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
  v_description TEXT;
  v_new_balance DECIMAL(10,2);
  v_transaction_type TEXT;
BEGIN
  -- Find user by email
  SELECT id INTO v_user_id
  FROM profiles
  WHERE email = user_email;

  -- Check if user exists
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not found with email: ' || user_email
    );
  END IF;

  -- Prepare description
  IF admin_note IS NOT NULL AND admin_note != '' THEN
    v_description := admin_note;
  ELSE
    v_description := 'Balance credited by administrator';
  END IF;

  -- Determine transaction type
  IF credit_amount > 0 THEN
    v_transaction_type := 'deposit';
  ELSE
    v_transaction_type := 'withdrawal';
  END IF;

  -- Update user balance
  UPDATE profiles 
  SET balance = balance + credit_amount,
      updated_at = now()
  WHERE id = v_user_id
  RETURNING balance INTO v_new_balance;

  -- Create transaction record
  INSERT INTO transactions (user_id, amount, type, description, status)
  VALUES (v_user_id, ABS(credit_amount), v_transaction_type, v_description, 'completed');

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Successfully credited balance',
    'new_balance', v_new_balance
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error: ' || SQLERRM
    );
END;
$$;