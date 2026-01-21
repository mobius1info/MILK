/*
  # Drop combo_multiplier_check constraint permanently
  
  1. Problem
    - Old migration files created "combo_multiplier_check" constraint
    - Error: "new row for relation profiles violates check constraint combo_multiplier_check"
    
  2. Solution  
    - Drop the constraint by its exact name
    - Drop from both profiles and vip_combo_settings
    - Verify it's gone
    
  3. Changes
    - Remove combo_multiplier_check from profiles
    - Remove any combo_multiplier constraints from vip_combo_settings
*/

-- Drop the exact constraint name that appears in the error message
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS combo_multiplier_check CASCADE;

-- Drop any other variations
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_combo_multiplier_check CASCADE;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_new_combo_multiplier_check CASCADE;

-- Drop from vip_combo_settings
ALTER TABLE vip_combo_settings DROP CONSTRAINT IF EXISTS combo_multiplier_check CASCADE;
ALTER TABLE vip_combo_settings DROP CONSTRAINT IF EXISTS vip_combo_settings_combo_multiplier_check CASCADE;

-- Verify removal
DO $$
DECLARE
  v_constraint_count integer;
BEGIN
  SELECT COUNT(*) INTO v_constraint_count
  FROM pg_constraint
  WHERE pg_get_constraintdef(oid) LIKE '%combo_multiplier%';
  
  IF v_constraint_count > 0 THEN
    RAISE WARNING 'Still found % combo_multiplier constraints', v_constraint_count;
  ELSE
    RAISE NOTICE 'SUCCESS: All combo_multiplier constraints removed';
  END IF;
END $$;
