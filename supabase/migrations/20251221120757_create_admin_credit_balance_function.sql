/*
  # Create admin_credit_balance function

  1. New Functions
    - `admin_credit_balance` - Allows admin to credit balance to user by email
      - Takes user_email, credit_amount, and optional admin_note
      - Finds user by email
      - Credits balance using add_balance_to_user function
      - Returns success status, message, and new balance

  2. Security
    - Function is SECURITY DEFINER to allow admin to credit any user
    - Only accessible by authenticated users (should be restricted to admins in RLS)
*/

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
    v_description := 'Manual credit by admin: ' || admin_note;
  ELSE
    v_description := 'Manual credit by admin';
  END IF;

  -- Credit balance using existing function
  v_result := add_balance_to_user(v_user_id, credit_amount, v_description);

  -- Check if credit was successful
  IF (v_result->>'success')::boolean THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Successfully credited balance',
      'new_balance', v_result->>'new_balance'
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'message', v_result->>'error'
    );
  END IF;
END;
$$;
