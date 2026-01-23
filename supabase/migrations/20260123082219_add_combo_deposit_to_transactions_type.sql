/*
  # Add combo_deposit to transactions type constraint
  
  1. Changes
    - Add 'combo_deposit' to allowed transaction types
  
  2. Security
    - Maintains existing RLS policies
*/

ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
  CHECK (type = ANY (ARRAY['deposit'::text, 'withdrawal'::text, 'purchase'::text, 'refund'::text, 'referral_bonus'::text, 'commission'::text, 'admin_credit'::text, 'admin_debit'::text, 'combo_deposit'::text]));
