/*
  # Fix COMBO Constraints Completely - Final Solution

  1. Problem
    - Multiple migrations created conflicting constraints on profiles table
    - combo_multiplier_check exists with range 2-10 (from old migration)
    - New code expects range 1-500
    - Columns are integer but need to be numeric for decimal values

  2. Solution
    - Drop ALL existing combo constraints (by searching and dropping them)
    - Change column types from integer to numeric
    - Create new constraints with correct ranges:
      - combo_product_position: 1-25
      - combo_multiplier: 1-500
      - combo_deposit_percent: 5-5000

  3. Impact
    - Fixes "violates check constraint combo_multiplier_check" error
    - Allows admin to set any valid combo values
    - Supports decimal values for multiplier and deposit percent
*/

-- Step 1: Drop ALL existing combo-related constraints
DO $$
DECLARE
  constraint_record RECORD;
BEGIN
  -- Find and drop all combo constraints
  FOR constraint_record IN
    SELECT constraint_name
    FROM information_schema.table_constraints
    WHERE table_name = 'profiles'
      AND constraint_type = 'CHECK'
      AND (constraint_name LIKE '%combo%' OR constraint_name LIKE '%multiplier%')
  LOOP
    EXECUTE format('ALTER TABLE profiles DROP CONSTRAINT IF EXISTS %I CASCADE', constraint_record.constraint_name);
  END LOOP;
END $$;

-- Step 2: Ensure columns exist and have correct types
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS combo_product_position INTEGER DEFAULT 9,
ADD COLUMN IF NOT EXISTS combo_multiplier NUMERIC(10,2) DEFAULT 3,
ADD COLUMN IF NOT EXISTS combo_deposit_percent NUMERIC(10,2) DEFAULT 50,
ADD COLUMN IF NOT EXISTS combo_enabled BOOLEAN DEFAULT false;

-- Step 3: Convert integer columns to numeric if they exist
DO $$
BEGIN
  -- Change combo_multiplier from integer to numeric if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles'
      AND column_name = 'combo_multiplier'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE profiles ALTER COLUMN combo_multiplier TYPE NUMERIC(10,2);
  END IF;

  -- Change combo_deposit_percent from integer to numeric if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles'
      AND column_name = 'combo_deposit_percent'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE profiles ALTER COLUMN combo_deposit_percent TYPE NUMERIC(10,2);
  END IF;
END $$;

-- Step 4: Create new constraints with correct ranges
ALTER TABLE profiles
ADD CONSTRAINT profiles_combo_product_position_check
  CHECK (combo_product_position >= 1 AND combo_product_position <= 25);

ALTER TABLE profiles
ADD CONSTRAINT profiles_combo_multiplier_check
  CHECK (combo_multiplier >= 1 AND combo_multiplier <= 500);

ALTER TABLE profiles
ADD CONSTRAINT profiles_combo_deposit_percent_check
  CHECK (combo_deposit_percent >= 5 AND combo_deposit_percent <= 5000);

-- Step 5: Update any existing rows with invalid values
UPDATE profiles
SET combo_multiplier = 3
WHERE combo_multiplier IS NOT NULL AND (combo_multiplier < 1 OR combo_multiplier > 500);

UPDATE profiles
SET combo_deposit_percent = 50
WHERE combo_deposit_percent IS NOT NULL AND (combo_deposit_percent < 5 OR combo_deposit_percent > 5000);

UPDATE profiles
SET combo_product_position = 9
WHERE combo_product_position IS NOT NULL AND (combo_product_position < 1 OR combo_product_position > 25);
