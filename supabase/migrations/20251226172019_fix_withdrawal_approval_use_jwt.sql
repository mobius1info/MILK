/*
  # Fix Withdrawal Approval Function

  1. Changes
    - Update approve_withdrawal function to use auth.jwt() instead of raw_app_metadata
    - Add admin update policy for transactions table to allow rejection

  2. Security
    - Function checks JWT metadata for admin role
    - Only admins can update transaction status
*/

-- Drop and recreate the approve_withdrawal function with correct JWT check
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
BEGIN
  -- Check if user is admin using JWT
  IF COALESCE(
    (SELECT auth.jwt()->>'role'),
    (SELECT auth.jwt()->'app_metadata'->>'role')
  ) != 'admin' THEN
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

-- Add admin policy to update transactions (for rejection)
DROP POLICY IF EXISTS "Admins can update transactions" ON transactions;

CREATE POLICY "Admins can update transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE(
      (SELECT auth.jwt()->>'role'),
      (SELECT auth.jwt()->'app_metadata'->>'role')
    ) = 'admin'
  )
  WITH CHECK (
    COALESCE(
      (SELECT auth.jwt()->>'role'),
      (SELECT auth.jwt()->'app_metadata'->>'role')
    ) = 'admin'
  );
