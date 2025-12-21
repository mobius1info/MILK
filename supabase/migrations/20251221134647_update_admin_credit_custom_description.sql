/*
  # Update admin credit balance to use custom description

  1. Changes
    - Update admin_credit_balance function to use admin's note directly as description
    - If no note provided, use default message
    - Description is shown to client in their transaction history

  2. Security
    - Maintains existing security through SECURITY DEFINER
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

  -- Use admin note as description, or default message
  IF admin_note IS NOT NULL AND admin_note != '' THEN
    v_description := admin_note;
  ELSE
    IF credit_amount > 0 THEN
      v_description := 'Balance credited by administrator';
    ELSE
      v_description := 'Balance deducted by administrator';
    END IF;
  END IF;

  -- Credit/debit balance using existing function
  v_result := add_balance_to_user(v_user_id, credit_amount, v_description);

  -- Check if operation was successful
  IF (v_result->>'success')::boolean THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Successfully updated balance',
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
