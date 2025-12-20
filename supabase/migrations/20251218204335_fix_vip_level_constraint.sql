/*
  # Fix VIP Level Constraint to Support 5 Levels
  
  1. Changes
    - Update vip_purchases table constraint to allow levels 1-5 instead of 1-3
    
  2. Notes
    - This allows users to purchase all 5 VIP levels
*/

-- Drop old constraint
ALTER TABLE vip_purchases DROP CONSTRAINT IF EXISTS vip_purchases_vip_level_check;

-- Add new constraint supporting levels 1-5
ALTER TABLE vip_purchases ADD CONSTRAINT vip_purchases_vip_level_check CHECK (vip_level >= 1 AND vip_level <= 5);