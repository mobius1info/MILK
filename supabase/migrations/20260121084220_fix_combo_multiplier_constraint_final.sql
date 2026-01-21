/*
  # Fix combo_multiplier constraint - Final Fix

  ## Problem
  Error: "new row for relation profiles violates check constraint combo_multiplier_check"
  when setting multiplier > 10 in VIP approval modal.

  ## Root Cause
  Old constraint with name 'combo_multiplier_check' (without table prefix) 
  may still exist with range 2-10 from earlier migrations.

  ## Solution
  Drop ALL possible constraint names and recreate with correct range 1-500.

  ## Changes
  1. Drop constraint 'combo_multiplier_check' (old name without prefix)
  2. Drop constraint 'profiles_combo_multiplier_check' (current name)
  3. Create new constraint with range 1-500
*/

-- Drop ALL possible constraint names on profiles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS combo_multiplier_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_combo_multiplier_check;

-- Create the correct constraint with range 1-500
ALTER TABLE profiles ADD CONSTRAINT profiles_combo_multiplier_check 
  CHECK (combo_multiplier >= 1 AND combo_multiplier <= 500);

-- Also fix vip_combo_settings just in case
ALTER TABLE vip_combo_settings DROP CONSTRAINT IF EXISTS combo_multiplier_check;
ALTER TABLE vip_combo_settings DROP CONSTRAINT IF EXISTS vip_combo_settings_combo_multiplier_check;

ALTER TABLE vip_combo_settings ADD CONSTRAINT vip_combo_settings_combo_multiplier_check 
  CHECK (combo_multiplier >= 1 AND combo_multiplier <= 500);