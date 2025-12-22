/*
  # Add COMBO Settings to Profiles

  1. Changes
    - Add `combo_product_position` column (default 9) - which product position triggers COMBO
    - Add `combo_multiplier` column (default 3) - commission multiplier for COMBO products
    - Add `combo_deposit_percent` column (default 50) - % of VIP price required as deposit to continue

  2. Notes
    - These settings are per-client and controlled by admin
    - combo_product_position: every Nth product will be COMBO (e.g., 9th, 18th, 27th)
    - combo_multiplier: ranges from 2x to 10x
    - combo_deposit_percent: 0-100%, client must deposit this % of VIP price to continue
*/

-- Add COMBO settings columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS combo_product_position integer DEFAULT 9,
ADD COLUMN IF NOT EXISTS combo_multiplier integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS combo_deposit_percent integer DEFAULT 50;

-- Add check constraints
ALTER TABLE profiles 
ADD CONSTRAINT combo_product_position_check CHECK (combo_product_position >= 1 AND combo_product_position <= 25);

ALTER TABLE profiles 
ADD CONSTRAINT combo_multiplier_check CHECK (combo_multiplier >= 2 AND combo_multiplier <= 10);

ALTER TABLE profiles 
ADD CONSTRAINT combo_deposit_percent_check CHECK (combo_deposit_percent >= 0 AND combo_deposit_percent <= 100);
