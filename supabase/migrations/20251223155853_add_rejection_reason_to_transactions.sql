/*
  # Add Rejection Reason to Transactions

  1. Changes
    - Add `rejection_reason` column to transactions table
    - This will store admin's comment when rejecting a withdrawal
    - Column is nullable (only filled when transaction is rejected)

  2. Security
    - No RLS policy changes needed
    - Existing policies cover this column
*/

-- Add rejection_reason column to transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE transactions 
    ADD COLUMN rejection_reason TEXT;
  END IF;
END $$;
