/*
  # Fix Transactions Table Type Constraint - Add Missing Types

  ## Overview
  This migration updates the transactions table type constraint to include
  all transaction types used in the application.

  ## Changes
  1. Drop existing constraint from transactions table
  2. Add new constraint with complete list of transaction types:
     - deposit (deposits from users)
     - withdrawal (withdrawals to users)
     - purchase (generic purchases)
     - refund (refunds to users)
     - commission (earnings from product purchases)
     - referral_commission (earnings from referrals)
     - referral_bonus (bonuses from referrals)
     - manual_credit (admin manual balance additions)
     - vip_purchase (VIP level purchases)
     - product_purchase (individual product purchases)

  ## Purpose
  - Allow all transaction types to be recorded properly
  - Fix issue where VIP purchase transactions were being rejected
  - Enable complete transaction history tracking
  - Support balance history display for all transaction types
*/

-- Drop existing constraint if it exists
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;

-- Add new constraint with all valid transaction types
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
CHECK (type IN (
  'deposit',
  'withdrawal',
  'purchase',
  'refund',
  'commission',
  'referral_commission',
  'referral_bonus',
  'manual_credit',
  'vip_purchase',
  'product_purchase'
));