/*
  # Fix Transactions Table Constraints
  
  1. Changes:
    - Update type constraint to include all transaction types
    - Update status constraint to include rejected status
*/

ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
  CHECK (type = ANY (ARRAY['deposit'::text, 'withdrawal'::text, 'purchase'::text, 'refund'::text, 'referral_bonus'::text, 'commission'::text, 'admin_credit'::text, 'admin_debit'::text]));

ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_status_check 
  CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'rejected'::text]));
