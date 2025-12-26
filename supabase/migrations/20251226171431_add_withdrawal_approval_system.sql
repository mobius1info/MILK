/*
  # Add Withdrawal Approval System

  1. Changes to `transactions` table
    - Add `rejection_reason` column to store rejection reason for withdrawals

  2. New Functions
    - `approve_withdrawal` - Function to approve withdrawal and deduct balance
      - Updates transaction status to 'approved'
      - Deducts amount from user's balance
      - Returns new balance

  3. Security
    - Function requires admin role to execute
*/

-- Add rejection_reason column to transactions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE transactions ADD COLUMN rejection_reason text;
  END IF;
END $$;

-- Create function to approve withdrawal
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
  -- Check if user is admin
  IF (SELECT raw_app_metadata->>'role' FROM auth.users WHERE id = auth.uid()) != 'admin' THEN
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
