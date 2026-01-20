/*
  # Fix combo constraints in profiles table - Final Fix
  
  1. Problem
    - Old migration created combo_multiplier_check constraint with range 2-10
    - This prevents admin from setting combo_multiplier to values like 30
    - Old combo_deposit_percent constraint was 0-100, but should be 5-5000
    
  2. Solution
    - Drop old constraints
    - Recreate with correct ranges:
      - combo_multiplier: 1-500 (was 2-10)
      - combo_deposit_percent: 5-5000 (was 0-100)
      - combo_product_position: 1-25 (unchanged)
      
  3. Impact
    - Allows admin to set any combo_multiplier from 1 to 500
    - Allows deposit percent from 5% to 5000%
    - Fixes "violates check constraint" error when approving VIP purchases
*/

-- Drop old constraints and recreate with correct ranges
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS combo_multiplier_check;
ALTER TABLE profiles ADD CONSTRAINT combo_multiplier_check 
  CHECK (combo_multiplier >= 1 AND combo_multiplier <= 500);

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS combo_deposit_percent_check;
ALTER TABLE profiles ADD CONSTRAINT combo_deposit_percent_check 
  CHECK (combo_deposit_percent >= 5 AND combo_deposit_percent <= 5000);

-- Verify combo_product_position constraint (should already be correct)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS combo_product_position_check;
ALTER TABLE profiles ADD CONSTRAINT combo_product_position_check 
  CHECK (combo_product_position >= 1 AND combo_product_position <= 25);
