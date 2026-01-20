/*
  # Fix combo constraints - expand position range

  1. Changes
    - Update combo_product_position_check to allow values 1-100 (was 1-25)
    - This fixes "violates check constraint combo_multiplier_check" errors
    
  2. Reason
    - UI allows setting combo position from 1-100
    - Database constraint was incorrectly limiting to 1-25
*/

-- Drop old constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_combo_product_position_check;

-- Add new constraint with correct range (1-100)
ALTER TABLE profiles ADD CONSTRAINT profiles_combo_product_position_check 
  CHECK (combo_product_position >= 1 AND combo_product_position <= 100);
