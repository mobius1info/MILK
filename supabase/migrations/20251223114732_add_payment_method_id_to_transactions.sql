/*
  # Add Payment Method ID to Transactions

  1. Changes
    - Add payment_method_id column to transactions table
    - Add foreign key constraint to payment_methods table
    - Add index for faster lookups
    
  2. Security
    - Existing RLS policies remain unchanged
*/

-- Add payment_method_id column to transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'payment_method_id'
  ) THEN
    ALTER TABLE transactions 
    ADD COLUMN payment_method_id uuid REFERENCES payment_methods(id);
  END IF;
END $$;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method_id 
  ON transactions(payment_method_id);
