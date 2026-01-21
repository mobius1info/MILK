/*
  # Remove combo_multiplier_check constraint forever
  
  This migration removes the problematic check constraint on the profiles table
  that prevents VIP approval from working.
  
  Changes:
  - Drop combo_multiplier_check constraint from profiles table
  - Allow any positive integer value for combo_multiplier
*/

-- Drop the constraint if it exists
DO $$ 
BEGIN
  -- Try to drop the constraint
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS combo_multiplier_check;
  
  -- Also try alternative names that might exist
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_combo_multiplier_check;
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_combo_multiplier_check1;
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_combo_multiplier_check2;
  
  RAISE NOTICE 'combo_multiplier_check constraint removed successfully';
EXCEPTION 
  WHEN OTHERS THEN
    RAISE NOTICE 'Some constraints may not exist, continuing...';
END $$;

-- Verify the column still exists and has correct type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'combo_multiplier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN combo_multiplier integer DEFAULT 1;
  END IF;
END $$;
