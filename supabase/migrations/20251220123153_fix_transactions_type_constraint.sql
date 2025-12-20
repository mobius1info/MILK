/*
  # Fix Transactions Type Constraint
  
  ## Overview
  This migration updates the transactions table type constraint to allow
  all transaction types used in the application.
  
  ## Changes
  1. Drop existing transactions_type_check constraint
  2. Add new constraint with all valid transaction types:
     - deposit
     - withdrawal
     - commission
     - referral_commission
     - referral_bonus
     - manual_credit
     - vip_purchase
     - product_purchase
  
  ## Purpose
  - Fix constraint that was preventing commission transactions
  - Allow proper tracking of all transaction types
  - Enable complete transaction history
*/

-- Drop old constraint
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;

-- Add new constraint with all valid types
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
CHECK (type IN (
  'deposit',
  'withdrawal',
  'commission',
  'referral_commission',
  'referral_bonus',
  'manual_credit',
  'vip_purchase',
  'product_purchase'
));