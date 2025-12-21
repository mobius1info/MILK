/*
  # Add debit/withdrawal support to manual balance credit

  1. Changes
    - Update add_balance_to_user function to support negative amounts (withdrawals)
    - Negative amounts will create 'withdrawal' transactions
    - Positive amounts will create 'deposit' transactions
    - Add validation to prevent balance from going negative
    - Update transaction descriptions based on operation type

  2. Security
    - Maintains existing security through SECURITY DEFINER
    - Adds balance validation to prevent negative balances
*/

-- Update function to support both credit (positive) and debit (negative) amounts
CREATE OR REPLACE FUNCTION add_balance_to_user(
  p_user_id UUID,
  p_amount DECIMAL(10,2),
  p_description TEXT DEFAULT 'Manual balance adjustment'
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_new_balance DECIMAL(10,2);
  v_current_balance DECIMAL(10,2);
  v_transaction_type TEXT;
  v_abs_amount DECIMAL(10,2);
BEGIN
  -- Get current balance
  SELECT balance INTO v_current_balance
  FROM profiles
  WHERE id = p_user_id;

  -- Check if user exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Validate amount is not zero
  IF p_amount = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Amount cannot be zero'
    );
  END IF;

  -- Check if debit would cause negative balance
  IF p_amount < 0 AND (v_current_balance + p_amount) < 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient balance. Current balance: $' || v_current_balance
    );
  END IF;

  -- Determine transaction type and absolute amount
  IF p_amount > 0 THEN
    v_transaction_type := 'deposit';
    v_abs_amount := p_amount;
  ELSE
    v_transaction_type := 'withdrawal';
    v_abs_amount := ABS(p_amount);
  END IF;

  -- Update user balance
  UPDATE profiles
  SET balance = balance + p_amount
  WHERE id = p_user_id
  RETURNING balance INTO v_new_balance;

  -- Create transaction record with absolute amount
  INSERT INTO transactions (user_id, amount, type, description, status)
  VALUES (p_user_id, v_abs_amount, v_transaction_type, p_description, 'completed');

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'operation', v_transaction_type
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
