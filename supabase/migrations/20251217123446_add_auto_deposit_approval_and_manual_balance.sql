/*
  # Auto-Approve Deposits and Manual Balance Credit System

  ## Overview
  This migration adds automatic balance crediting when deposits are approved
  and provides admin capability to manually credit balance to users by email.

  ## Changes

  ### 1. Function: `process_deposit_approval()`
  Automatically credits user balance when a deposit transaction is approved.
  - Triggered when transaction status changes to 'approved'
  - Only processes deposit transactions
  - Updates user's balance by adding the transaction amount
  - Updates transaction's updated_at timestamp

  ### 2. Trigger: `on_deposit_approved`
  Executes `process_deposit_approval()` after transaction status update

  ### 3. Function: `admin_credit_balance(user_email TEXT, credit_amount NUMERIC)`
  Allows admins to manually credit balance to a user by email.
  - Validates admin permissions
  - Finds user by email
  - Credits the specified amount
  - Creates a transaction record for audit trail
  - Returns success/error messages

  ## Security
  - Only processes approved deposits
  - Prevents duplicate processing
  - Manual credit function requires admin role
  - All operations are logged in transactions table
*/

-- Function to automatically credit balance when deposit is approved
CREATE OR REPLACE FUNCTION process_deposit_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is a deposit transaction being approved
  IF NEW.type = 'deposit' 
     AND NEW.status = 'approved' 
     AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    -- Credit the user's balance
    UPDATE profiles
    SET balance = balance + NEW.amount,
        updated_at = now()
    WHERE id = NEW.user_id;
    
    -- Update transaction timestamp
    NEW.updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for deposit approval
DROP TRIGGER IF EXISTS on_deposit_approved ON transactions;
CREATE TRIGGER on_deposit_approved
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION process_deposit_approval();

-- Function for admin to manually credit balance by email
CREATE OR REPLACE FUNCTION admin_credit_balance(
  user_email TEXT,
  credit_amount NUMERIC,
  admin_note TEXT DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  target_user_id uuid;
  admin_user_id uuid;
  transaction_id uuid;
BEGIN
  -- Get the calling user ID
  admin_user_id := auth.uid();
  
  -- Verify admin permissions
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = admin_user_id
    AND role = 'admin'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Unauthorized: Admin access required'
    );
  END IF;
  
  -- Validate amount
  IF credit_amount <= 0 THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Amount must be greater than 0'
    );
  END IF;
  
  -- Find user by email
  SELECT id INTO target_user_id
  FROM profiles
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User not found with email: ' || user_email
    );
  END IF;
  
  -- Credit the balance
  UPDATE profiles
  SET balance = balance + credit_amount,
      updated_at = now()
  WHERE id = target_user_id;
  
  -- Create transaction record for audit trail
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    status,
    rejection_reason
  ) VALUES (
    target_user_id,
    'deposit',
    credit_amount,
    'approved',
    COALESCE(admin_note, 'Manual credit by admin')
  )
  RETURNING id INTO transaction_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Balance credited successfully',
    'user_id', target_user_id,
    'transaction_id', transaction_id,
    'new_balance', (SELECT balance FROM profiles WHERE id = target_user_id)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Error: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;