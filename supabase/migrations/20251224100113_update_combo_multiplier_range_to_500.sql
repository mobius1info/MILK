/*
  # Update combo multiplier range to 1-500

  1. Changes
    - Update vip_combo_settings table constraint to allow multiplier from 1 to 500
    - Remove old constraint and add new one

  2. Notes
    - This allows much higher commission multipliers for flexibility
    - Admins can now set any multiplier from 1x to 500x
*/

-- Drop old constraint
ALTER TABLE vip_combo_settings 
DROP CONSTRAINT IF EXISTS vip_combo_settings_combo_multiplier_check;

-- Add new constraint with range 1-500
ALTER TABLE vip_combo_settings 
ADD CONSTRAINT vip_combo_settings_combo_multiplier_check 
CHECK (combo_multiplier >= 1 AND combo_multiplier <= 500);