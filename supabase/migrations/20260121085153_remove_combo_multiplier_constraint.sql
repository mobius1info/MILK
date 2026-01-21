/*
  # Remove combo_multiplier constraint

  1. Changes
    - Remove ALL check constraints on combo_multiplier from profiles table
    - Remove ALL check constraints on combo_multiplier from vip_combo_settings table
    - Allow any integer value for combo_multiplier without restrictions

  2. Security
    - No security changes, only constraint removal
*/

-- Remove all combo_multiplier constraints from profiles table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS combo_multiplier_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_combo_multiplier_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_combo_multiplier_check1;

-- Remove all combo_multiplier constraints from vip_combo_settings table
ALTER TABLE vip_combo_settings DROP CONSTRAINT IF EXISTS combo_multiplier_check;
ALTER TABLE vip_combo_settings DROP CONSTRAINT IF EXISTS vip_combo_settings_combo_multiplier_check;
ALTER TABLE vip_combo_settings DROP CONSTRAINT IF EXISTS vip_combo_settings_combo_multiplier_check1;
