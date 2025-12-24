/*
  # Update profiles combo_multiplier range to 1-500

  1. Changes
    - Update profiles table constraint to allow combo_multiplier from 1 to 500
    - Remove old constraint and add new one

  2. Notes
    - This matches the vip_combo_settings table constraint
    - Allows same flexibility for user-level combo settings
*/

-- Check if constraint exists before dropping
DO $$
BEGIN
  -- Drop old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_combo_multiplier_check' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_combo_multiplier_check;
  END IF;
END $$;

-- Add new constraint with range 1-500
ALTER TABLE profiles 
ADD CONSTRAINT profiles_combo_multiplier_check 
CHECK (combo_multiplier >= 1 AND combo_multiplier <= 500);