-- =====================================================
-- FIX: combo_multiplier_check constraint error
-- Run this SQL directly in Supabase Dashboard SQL Editor
-- =====================================================

-- Step 1: Drop ALL possible old constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS combo_multiplier_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_combo_multiplier_check;

-- Step 2: Create correct constraint with range 1-500
ALTER TABLE profiles ADD CONSTRAINT profiles_combo_multiplier_check
  CHECK (combo_multiplier >= 1 AND combo_multiplier <= 500);

-- Step 3: Also fix vip_combo_settings table
ALTER TABLE vip_combo_settings DROP CONSTRAINT IF EXISTS combo_multiplier_check;
ALTER TABLE vip_combo_settings DROP CONSTRAINT IF EXISTS vip_combo_settings_combo_multiplier_check;

ALTER TABLE vip_combo_settings ADD CONSTRAINT vip_combo_settings_combo_multiplier_check
  CHECK (combo_multiplier >= 1 AND combo_multiplier <= 500);

-- Step 4: Verify the fix
SELECT
  t.relname as table_name,
  c.conname as constraint_name,
  pg_get_constraintdef(c.oid) as constraint_def
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE c.conname LIKE '%combo_multiplier%'
ORDER BY t.relname;
