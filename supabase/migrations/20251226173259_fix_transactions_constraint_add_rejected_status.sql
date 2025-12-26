/*
  # Fix transactions status constraint
  
  Updates the transactions_status_check constraint to include 'rejected' status
  which is needed for withdrawal rejection functionality.
  
  1. Changes
    - Drop old constraint that only allows: pending, approved, completed
    - Add new constraint that allows: pending, approved, completed, rejected
*/

ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_status_check 
CHECK (status IN ('pending', 'approved', 'completed', 'rejected'));
