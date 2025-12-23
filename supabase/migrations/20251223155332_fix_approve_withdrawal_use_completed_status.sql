/*
  # Fix Approve Withdrawal Function - Use Completed Status

  1. Changes
    - Update approve_withdrawal function to use 'completed' status instead of 'approved'
    - 'completed' is the correct status for approved withdrawals per table constraint

  2. Security
    - No security changes, function still requires admin role
*/

CREATE OR REPLACE FUNCTION approve_withdrawal(
  withdrawal_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction transactions;
  v_profile profiles;
  v_admin_role TEXT;
BEGIN
  -- Check if caller is admin
  v_admin_role := auth.jwt() -> 'app_metadata' ->> 'role';
  IF v_admin_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can approve withdrawals';
  END IF;

  -- Get transaction details
  SELECT * INTO v_transaction
  FROM transactions
  WHERE id = withdrawal_id AND type = 'withdrawal' AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal not found or already processed';
  END IF;

  -- Get user profile
  SELECT * INTO v_profile
  FROM profiles
  WHERE id = v_transaction.user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Check balance
  IF v_profile.balance < v_transaction.amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Update user balance
  UPDATE profiles
  SET balance = balance - v_transaction.amount
  WHERE id = v_transaction.user_id;

  -- Update transaction status to completed (approved withdrawal)
  UPDATE transactions
  SET status = 'completed'
  WHERE id = withdrawal_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Withdrawal approved successfully',
    'amount', v_transaction.amount,
    'new_balance', v_profile.balance - v_transaction.amount
  );
END;
$$;
