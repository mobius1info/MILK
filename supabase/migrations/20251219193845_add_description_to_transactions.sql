/*
  # Add description column to transactions table

  ## Overview
  This migration adds a description column to the transactions table to store
  additional information about each transaction.

  ## Changes
  
  ### 1. New Column: `description`
  - `description` (text, nullable) - Human-readable description of the transaction
  - Used for earning descriptions, deposit notes, withdrawal notes, etc.

  ## Purpose
  - Provide clear transaction history for users
  - Enable detailed tracking of commission earnings
  - Improve transaction audit trail

  ## Security
  - No RLS changes needed (inherits existing transaction policies)
*/

-- Add description column to transactions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'description'
  ) THEN
    ALTER TABLE transactions ADD COLUMN description text;
  END IF;
END $$;