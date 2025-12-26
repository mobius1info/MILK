/*
  # Add Reject Withdrawal Function

  1. New Function
    - `reject_withdrawal` - Allows admins to reject withdrawal requests with a reason

  2. Security
    - Only admins can reject withdrawals
    - Checks role from profiles table
    - Updates transaction status to 'rejected' and stores rejection reason
*/

CREATE OR REPLACE FUNCTION reject_withdrawal(
  withdrawal_id uuid,
  reason text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_status text;
BEGIN
  -- Check if current user is admin from profiles table
  SELECT (role = 'admin') INTO v_is_admin
  FROM profiles
  WHERE id = auth.uid();

  IF NOT COALESCE(v_is_admin, false) THEN
    RAISE EXCEPTION 'Only admins can reject withdrawals';
  END IF;

  -- Get transaction status
  SELECT status INTO v_status
  FROM transactions
  WHERE id = withdrawal_id AND type = 'withdrawal';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal not found';
  END IF;

  IF v_status != 'pending' THEN
    RAISE EXCEPTION 'Withdrawal is not pending';
  END IF;

  -- Update transaction status and rejection reason
  UPDATE transactions
  SET 
    status = 'rejected',
    rejection_reason = reason
  WHERE id = withdrawal_id;

  -- Return result
  RETURN json_build_object(
    'success', true,
    'message', 'Withdrawal rejected successfully'
  );
END;
$$;
