/*
  # Add Missing Critical Functions
  
  1. Functions Added:
    - admin_credit_balance - Admin function to credit/debit user balance
    - request_withdrawal - User function to request withdrawal
    - approve_withdrawal - Admin function to approve withdrawal
    - reject_withdrawal - Admin function to reject withdrawal
    - grant_demo_access - Admin function to grant demo VIP access
    
  2. Security:
    - All functions use SECURITY DEFINER with proper search_path
    - Role checks implemented within functions
*/

-- Admin credit balance function
CREATE OR REPLACE FUNCTION admin_credit_balance(
  p_user_id uuid,
  p_amount numeric,
  p_description text DEFAULT 'Admin balance adjustment'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_role text;
  v_new_balance numeric;
  v_transaction_type text;
BEGIN
  SELECT role INTO v_admin_role FROM profiles WHERE id = auth.uid();
  
  IF v_admin_role != 'admin' THEN
    RETURN json_build_object('success', false, 'error', 'Access denied');
  END IF;
  
  IF p_amount > 0 THEN
    v_transaction_type := 'deposit';
  ELSE
    v_transaction_type := 'withdrawal';
  END IF;
  
  UPDATE profiles 
  SET balance = balance + p_amount,
      updated_at = now()
  WHERE id = p_user_id
  RETURNING balance INTO v_new_balance;
  
  INSERT INTO transactions (user_id, amount, type, description, status)
  VALUES (p_user_id, ABS(p_amount), v_transaction_type, p_description, 'completed');
  
  RETURN json_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'amount', p_amount
  );
END;
$$;

-- Request withdrawal function
CREATE OR REPLACE FUNCTION request_withdrawal(
  p_amount numeric,
  p_payment_method text,
  p_payment_details jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_balance numeric;
  v_withdrawal_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT balance INTO v_balance FROM profiles WHERE id = v_user_id;
  
  IF v_balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be positive');
  END IF;
  
  UPDATE profiles 
  SET balance = balance - p_amount,
      updated_at = now()
  WHERE id = v_user_id;
  
  INSERT INTO withdrawals (user_id, amount, payment_method, payment_details, status)
  VALUES (v_user_id, p_amount, p_payment_method, p_payment_details, 'pending')
  RETURNING id INTO v_withdrawal_id;
  
  INSERT INTO transactions (user_id, amount, type, description, status)
  VALUES (v_user_id, p_amount, 'withdrawal', 'Withdrawal request', 'pending');
  
  RETURN json_build_object(
    'success', true,
    'withdrawal_id', v_withdrawal_id,
    'amount', p_amount
  );
END;
$$;

-- Approve withdrawal function
CREATE OR REPLACE FUNCTION approve_withdrawal(p_withdrawal_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_role text;
  v_withdrawal_record withdrawals%ROWTYPE;
BEGIN
  SELECT role INTO v_admin_role FROM profiles WHERE id = auth.uid();
  
  IF v_admin_role != 'admin' THEN
    RETURN json_build_object('success', false, 'error', 'Access denied');
  END IF;
  
  SELECT * INTO v_withdrawal_record FROM withdrawals WHERE id = p_withdrawal_id;
  
  IF v_withdrawal_record.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Withdrawal not found');
  END IF;
  
  IF v_withdrawal_record.status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Withdrawal already processed');
  END IF;
  
  UPDATE withdrawals 
  SET status = 'approved', updated_at = now()
  WHERE id = p_withdrawal_id;
  
  UPDATE transactions 
  SET status = 'completed'
  WHERE user_id = v_withdrawal_record.user_id 
    AND type = 'withdrawal' 
    AND amount = v_withdrawal_record.amount
    AND status = 'pending';
  
  RETURN json_build_object('success', true, 'message', 'Withdrawal approved');
END;
$$;

-- Reject withdrawal function
CREATE OR REPLACE FUNCTION reject_withdrawal(p_withdrawal_id uuid, p_reason text DEFAULT '')
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_role text;
  v_withdrawal_record withdrawals%ROWTYPE;
BEGIN
  SELECT role INTO v_admin_role FROM profiles WHERE id = auth.uid();
  
  IF v_admin_role != 'admin' THEN
    RETURN json_build_object('success', false, 'error', 'Access denied');
  END IF;
  
  SELECT * INTO v_withdrawal_record FROM withdrawals WHERE id = p_withdrawal_id;
  
  IF v_withdrawal_record.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Withdrawal not found');
  END IF;
  
  IF v_withdrawal_record.status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Withdrawal already processed');
  END IF;
  
  UPDATE profiles 
  SET balance = balance + v_withdrawal_record.amount,
      updated_at = now()
  WHERE id = v_withdrawal_record.user_id;
  
  UPDATE withdrawals 
  SET status = 'rejected', 
      admin_notes = p_reason,
      updated_at = now()
  WHERE id = p_withdrawal_id;
  
  UPDATE transactions 
  SET status = 'failed'
  WHERE user_id = v_withdrawal_record.user_id 
    AND type = 'withdrawal' 
    AND amount = v_withdrawal_record.amount
    AND status = 'pending';
  
  RETURN json_build_object('success', true, 'message', 'Withdrawal rejected, balance restored');
END;
$$;

-- Grant demo access function
CREATE OR REPLACE FUNCTION grant_demo_access(
  p_user_id uuid,
  p_vip_level integer,
  p_initial_balance numeric DEFAULT 1000
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_role text;
  v_vip_level_record vip_levels%ROWTYPE;
  v_vip_purchase_id uuid;
  v_existing_active_purchase uuid;
BEGIN
  SELECT role INTO v_admin_role FROM profiles WHERE id = auth.uid();
  
  IF v_admin_role != 'admin' THEN
    RETURN json_build_object('success', false, 'error', 'Access denied');
  END IF;
  
  SELECT * INTO v_vip_level_record FROM vip_levels WHERE level = p_vip_level;
  
  IF v_vip_level_record.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'VIP level not found');
  END IF;
  
  SELECT id INTO v_existing_active_purchase 
  FROM vip_purchases 
  WHERE user_id = p_user_id 
    AND status = 'approved' 
    AND is_completed = false
  LIMIT 1;
  
  IF v_existing_active_purchase IS NOT NULL THEN
    UPDATE vip_purchases 
    SET is_completed = true, 
        status = 'completed',
        updated_at = now()
    WHERE id = v_existing_active_purchase;
  END IF;
  
  UPDATE profiles 
  SET balance = p_initial_balance,
      combo_enabled = true,
      updated_at = now()
  WHERE id = p_user_id;
  
  INSERT INTO vip_purchases (
    user_id, 
    vip_level_id, 
    vip_level,
    amount_paid, 
    vip_price,
    products_completed,
    total_products,
    completed_products_count,
    status,
    category_id,
    is_completed
  )
  VALUES (
    p_user_id,
    v_vip_level_record.id,
    p_vip_level,
    0,
    v_vip_level_record.price,
    0,
    v_vip_level_record.products_count,
    0,
    'approved',
    v_vip_level_record.category,
    false
  )
  RETURNING id INTO v_vip_purchase_id;
  
  IF v_vip_level_record.category IS NOT NULL THEN
    INSERT INTO category_access (user_id, category, is_enabled)
    VALUES (p_user_id, v_vip_level_record.category, true)
    ON CONFLICT DO NOTHING;
  END IF;
  
  INSERT INTO transactions (user_id, amount, type, description, status)
  VALUES (p_user_id, p_initial_balance, 'deposit', 'Demo access granted by admin', 'completed');
  
  RETURN json_build_object(
    'success', true,
    'vip_purchase_id', v_vip_purchase_id,
    'balance', p_initial_balance,
    'vip_level', p_vip_level
  );
END;
$$;
