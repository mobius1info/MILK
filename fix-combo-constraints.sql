-- Drop ALL existing combo-related constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS combo_multiplier_check CASCADE;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS combo_deposit_percent_check CASCADE;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS combo_product_position_check CASCADE;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_combo_multiplier_check CASCADE;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_combo_deposit_percent_check CASCADE;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_combo_product_position_check CASCADE;

-- Ensure columns exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS combo_product_position INTEGER DEFAULT 9;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS combo_multiplier NUMERIC(10,2) DEFAULT 3;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS combo_deposit_percent NUMERIC(10,2) DEFAULT 50;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS combo_enabled BOOLEAN DEFAULT false;

-- Create new constraints with correct ranges
ALTER TABLE profiles ADD CONSTRAINT profiles_combo_product_position_check CHECK (combo_product_position >= 1 AND combo_product_position <= 25);
ALTER TABLE profiles ADD CONSTRAINT profiles_combo_multiplier_check CHECK (combo_multiplier >= 1 AND combo_multiplier <= 500);
ALTER TABLE profiles ADD CONSTRAINT profiles_combo_deposit_percent_check CHECK (combo_deposit_percent >= 5 AND combo_deposit_percent <= 5000);

-- Update any existing rows with invalid values
UPDATE profiles SET combo_multiplier = 3 WHERE combo_multiplier IS NOT NULL AND (combo_multiplier < 1 OR combo_multiplier > 500);
UPDATE profiles SET combo_deposit_percent = 50 WHERE combo_deposit_percent IS NOT NULL AND (combo_deposit_percent < 5 OR combo_deposit_percent > 5000);
UPDATE profiles SET combo_product_position = 9 WHERE combo_product_position IS NOT NULL AND (combo_product_position < 1 OR combo_product_position > 25);
