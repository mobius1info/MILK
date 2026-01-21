/*
  # Remove combo_multiplier constraint from production database

  1. Changes
    - Drop ALL combo_multiplier check constraints from profiles table
    - Drop ALL combo_multiplier check constraints from vip_combo_settings table
    - Verify no constraints remain

  2. Security
    - No security changes - just removing validation constraints
*/

-- Remove all possible combo_multiplier constraints from profiles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS combo_multiplier_check CASCADE;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_combo_multiplier_check CASCADE;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_new_combo_multiplier_check CASCADE;

-- Remove all possible combo_multiplier constraints from vip_combo_settings
ALTER TABLE vip_combo_settings DROP CONSTRAINT IF EXISTS combo_multiplier_check CASCADE;
ALTER TABLE vip_combo_settings DROP CONSTRAINT IF EXISTS vip_combo_settings_combo_multiplier_check CASCADE;

-- Verify result
DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM pg_constraint
  WHERE pg_get_constraintdef(oid) LIKE '%combo_multiplier%';
  
  IF v_count > 0 THEN
    RAISE WARNING 'Still found % constraints with combo_multiplier', v_count;
  ELSE
    RAISE NOTICE 'SUCCESS: No combo_multiplier constraints found';
  END IF;
END $$;