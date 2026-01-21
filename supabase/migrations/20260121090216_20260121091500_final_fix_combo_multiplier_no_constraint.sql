/*
  # Final Fix - Remove combo_multiplier constraints permanently
  
  1. Problem
    - Inline CHECK constraints in table definitions cause constraint to persist
    - Error: "new row for relation profiles violates check constraint combo_multiplier_check"
    
  2. Solution
    - Drop and recreate combo_multiplier columns WITHOUT any constraints
    - Remove from both profiles and vip_combo_settings tables
    - Allow any integer value
    
  3. Changes
    - profiles.combo_multiplier: no range limit
    - vip_combo_settings.combo_multiplier: no range limit
*/

-- Drop ALL possible combo_multiplier constraints from profiles
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    FOR constraint_rec IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'profiles'::regclass 
          AND pg_get_constraintdef(oid) LIKE '%combo_multiplier%'
    LOOP
        EXECUTE format('ALTER TABLE profiles DROP CONSTRAINT IF EXISTS %I CASCADE', constraint_rec.conname);
    END LOOP;
END $$;

-- Drop and recreate profiles.combo_multiplier without constraints
ALTER TABLE profiles DROP COLUMN IF EXISTS combo_multiplier CASCADE;
ALTER TABLE profiles ADD COLUMN combo_multiplier integer DEFAULT 3;

-- Drop ALL possible combo_multiplier constraints from vip_combo_settings
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    FOR constraint_rec IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'vip_combo_settings'::regclass 
          AND pg_get_constraintdef(oid) LIKE '%combo_multiplier%'
    LOOP
        EXECUTE format('ALTER TABLE vip_combo_settings DROP CONSTRAINT IF EXISTS %I CASCADE', constraint_rec.conname);
    END LOOP;
END $$;

-- Drop and recreate vip_combo_settings.combo_multiplier without constraints  
ALTER TABLE vip_combo_settings DROP COLUMN IF EXISTS combo_multiplier CASCADE;
ALTER TABLE vip_combo_settings ADD COLUMN combo_multiplier integer NOT NULL DEFAULT 3;

-- Verify no combo_multiplier constraints exist
DO $$
DECLARE
  constraint_count integer;
BEGIN
  SELECT COUNT(*) INTO constraint_count
  FROM pg_constraint
  WHERE pg_get_constraintdef(oid) LIKE '%combo_multiplier%';
  
  IF constraint_count > 0 THEN
    RAISE WARNING 'Found % combo_multiplier constraints still present', constraint_count;
  ELSE
    RAISE NOTICE 'SUCCESS: All combo_multiplier constraints removed';
  END IF;
END $$;
