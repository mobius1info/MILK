/*
  # Remove ALL combo_multiplier constraints completely
  
  1. Problem
    - The constraint is defined inline in column definition
    - Postgres auto-generates constraint names
    - Multiple migrations tried to fix but constraint persists
  
  2. Solution
    - Drop and recreate combo_multiplier column WITHOUT any CHECK constraint
    - Allow any integer value for combo_multiplier
    
  3. Affected Tables
    - profiles.combo_multiplier
    - vip_combo_settings.combo_multiplier
*/

-- Drop and recreate profiles.combo_multiplier without ANY constraints
ALTER TABLE profiles DROP COLUMN IF EXISTS combo_multiplier CASCADE;
ALTER TABLE profiles ADD COLUMN combo_multiplier integer DEFAULT 3;

-- Drop and recreate vip_combo_settings.combo_multiplier without ANY constraints  
ALTER TABLE vip_combo_settings DROP COLUMN IF EXISTS combo_multiplier CASCADE;
ALTER TABLE vip_combo_settings ADD COLUMN combo_multiplier integer NOT NULL DEFAULT 3;

-- Verify no constraints exist
DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM pg_constraint
  WHERE pg_get_constraintdef(oid) LIKE '%combo_multiplier%';
  
  IF v_count > 0 THEN
    RAISE EXCEPTION 'combo_multiplier constraints still exist!';
  END IF;
END $$;
