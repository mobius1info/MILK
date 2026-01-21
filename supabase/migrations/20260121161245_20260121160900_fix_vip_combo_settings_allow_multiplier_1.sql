/*
  # Fix VIP Combo Settings - Allow Multiplier = 1
  
  1. Changes
    - Remove constraint on combo_multiplier in vip_combo_settings table
    - Allow any positive integer value for combo_multiplier (1 to 500)
  
  2. Why
    - Admin should be able to set combo_multiplier = 1 (no combo, normal purchase)
    - Current constraint requires >= 2, causing errors when approving VIP with multiplier = 1
*/

-- Drop old constraint
ALTER TABLE vip_combo_settings
DROP CONSTRAINT IF EXISTS vip_combo_settings_combo_multiplier_check;

-- Add new constraint allowing 1 to 500
ALTER TABLE vip_combo_settings
ADD CONSTRAINT vip_combo_settings_combo_multiplier_check 
CHECK (combo_multiplier >= 1 AND combo_multiplier <= 500);
