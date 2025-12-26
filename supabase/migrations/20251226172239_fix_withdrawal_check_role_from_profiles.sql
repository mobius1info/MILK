/*
  # Fix Withdrawal Approval - Check Role from Profiles

  1. Changes
    - Update approve_withdrawal function to check admin role from profiles table
    - More reliable than JWT which may not be immediately updated

  2. Security
    - Function checks profiles.role for admin access
    - Only authenticated users with role='admin' can approve
*/

-- Drop and recreate the approve_withdrawal function
DROP FUNCTION IF EXISTS approve_withdrawal(uuid);

CREATE OR REPLACE FUNCTION approve_withdrawal(withdrawal_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_amount numeric;
  v_current_balance numeric;
  v_new_balance numeric;
  v_status text;
  v_is_admin boolean;
BEGIN
  -- Check if current user is admin from profiles table
  SELECT (role = 'admin') INTO v_is_admin
  FROM profiles
  WHERE id = auth.uid();

  IF NOT COALESCE(v_is_admin, false) THEN
    RAISE EXCEPTION 'Only admins can approve withdrawals';
  END IF;

  -- Get transaction details
  SELECT user_id, amount, status
  INTO v_user_id, v_amount, v_status
  FROM transactions
  WHERE id = withdrawal_id AND type = 'withdrawal';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal not found';
  END IF;

  IF v_status != 'pending' THEN
    RAISE EXCEPTION 'Withdrawal is not pending';
  END IF;

  -- Get current balance
  SELECT balance INTO v_current_balance
  FROM profiles
  WHERE id = v_user_id;

  IF v_current_balance < v_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance - v_amount;

  -- Update transaction status
  UPDATE transactions
  SET status = 'approved'
  WHERE id = withdrawal_id;

  -- Update user balance
  UPDATE profiles
  SET balance = v_new_balance
  WHERE id = v_user_id;

  -- Return result
  RETURN json_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'amount', v_amount
  );
END;
$$;
