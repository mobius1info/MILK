/*
  # Add combo_product_position and combo_multiplier to profiles
  
  1. Changes
    - Add combo_product_position (integer) - position where COMBO product appears
    - Add combo_multiplier (integer) - commission multiplier for COMBO
    
  2. Notes
    - These columns are required by the frontend for per-user COMBO settings
    - No constraints to allow any valid integer values
    - Default values match the typical COMBO configuration
*/

-- Add combo columns to profiles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'combo_product_position'
  ) THEN
    ALTER TABLE profiles ADD COLUMN combo_product_position INTEGER DEFAULT 9;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'combo_multiplier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN combo_multiplier INTEGER DEFAULT 3;
  END IF;
END $$;

-- Update existing profiles with default values
UPDATE profiles
SET 
  combo_product_position = COALESCE(combo_product_position, 9),
  combo_multiplier = COALESCE(combo_multiplier, 3)
WHERE combo_product_position IS NULL OR combo_multiplier IS NULL;
