/*
  # Update combo deposit percent range to 5% - 5000%

  Changes constraints on combo_deposit_percent fields:
  - profiles.combo_deposit_percent: 5% - 5000%
  - vip_combo_settings.combo_deposit_percent: 5% - 5000%
  
  Allows admin to set any percentage from 5% to 5000% manually in admin panel.
*/

-- Drop old constraints
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS combo_deposit_percent_check;

ALTER TABLE vip_combo_settings
DROP CONSTRAINT IF EXISTS vip_combo_settings_combo_deposit_percent_check;

-- Add new constraints with wider range (5% - 5000%)
ALTER TABLE profiles
ADD CONSTRAINT combo_deposit_percent_check 
CHECK (combo_deposit_percent >= 5 AND combo_deposit_percent <= 5000);

ALTER TABLE vip_combo_settings
ADD CONSTRAINT vip_combo_settings_combo_deposit_percent_check 
CHECK (combo_deposit_percent >= 5 AND combo_deposit_percent <= 5000);
