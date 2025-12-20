/*
  # Add 'completed' status to vip_purchases

  1. Changes
    - Drop existing status check constraint
    - Add new check constraint that includes 'completed' status
    - Update existing completed purchases to have 'completed' status
    
  2. Security
    - Maintains existing RLS policies
*/

ALTER TABLE vip_purchases DROP CONSTRAINT IF EXISTS vip_purchases_status_check;

ALTER TABLE vip_purchases ADD CONSTRAINT vip_purchases_status_check 
  CHECK (status IN ('pending', 'approved', 'rejected', 'completed'));

UPDATE vip_purchases
SET status = 'completed'
WHERE is_completed = true AND status = 'approved';