/*
  # Force Remove combo_multiplier_check Constraint
  
  This migration forcefully removes any combo_multiplier_check constraint
  that might exist on profiles, vip_combo_settings, or vip_purchases tables.
  
  Using DO blocks with exception handling to ignore errors if constraints don't exist.
*/

DO $$
BEGIN
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS combo_multiplier_check;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_combo_multiplier_check;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE vip_combo_settings DROP CONSTRAINT IF EXISTS combo_multiplier_check;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE vip_combo_settings DROP CONSTRAINT IF EXISTS vip_combo_settings_combo_multiplier_check;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE vip_purchases DROP CONSTRAINT IF EXISTS combo_multiplier_check;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE vip_purchases DROP CONSTRAINT IF EXISTS vip_purchases_combo_multiplier_check;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE vip_purchases DROP CONSTRAINT IF EXISTS vip_purchases_combo_multiplier_at_approval_check;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
