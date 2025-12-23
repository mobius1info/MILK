/*
  # Add Rejected Status to Transactions

  1. Changes
    - Drop existing status check constraint
    - Recreate with 'rejected' status included
    - This allows withdrawal rejections to be saved properly

  2. Status Values
    - pending: Transaction awaiting approval
    - approved: Transaction approved
    - completed: Transaction completed
    - rejected: Transaction rejected by admin
*/

-- Drop existing constraint
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_status_check;

-- Add new constraint with rejected status
ALTER TABLE transactions 
ADD CONSTRAINT transactions_status_check 
CHECK (status IN ('pending', 'approved', 'completed', 'rejected'));
