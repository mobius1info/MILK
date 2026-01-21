-- =====================================================
-- REMOVE combo_multiplier constraint completely
-- Run this in Supabase Dashboard SQL Editor
-- =====================================================

-- Remove ALL combo_multiplier constraints from profiles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS combo_multiplier_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_combo_multiplier_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_combo_multiplier_check1;

-- Remove ALL combo_multiplier constraints from vip_combo_settings
ALTER TABLE vip_combo_settings DROP CONSTRAINT IF EXISTS combo_multiplier_check;
ALTER TABLE vip_combo_settings DROP CONSTRAINT IF EXISTS vip_combo_settings_combo_multiplier_check;
ALTER TABLE vip_combo_settings DROP CONSTRAINT IF EXISTS vip_combo_settings_combo_multiplier_check1;

-- Verify removal
SELECT
  t.relname as table_name,
  c.conname as constraint_name,
  pg_get_constraintdef(c.oid) as constraint_def
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE c.conname LIKE '%combo_multiplier%'
ORDER BY t.relname;
