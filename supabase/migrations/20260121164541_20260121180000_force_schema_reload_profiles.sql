/*
  # Force Schema Reload for profiles table
  
  1. Purpose
    - Force Supabase to reload the profiles table schema
    - Clear any cached constraints
    - Ensure combo_multiplier has NO constraint
    
  2. Changes
    - Alter profiles table with NO-OP changes to force schema reload
    - Add comment to invalidate cache
    - Explicitly verify no combo_multiplier constraints exist
*/

-- Drop ANY constraint with combo_multiplier in its definition
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    FOR constraint_rec IN
        SELECT 
            con.conname,
            rel.relname as table_name
        FROM pg_constraint con
        INNER JOIN pg_class rel ON rel.oid = con.conrelid
        INNER JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'public'
        AND pg_get_constraintdef(con.oid) LIKE '%combo_multiplier%'
        AND con.contype = 'c'
    LOOP
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I CASCADE', 
            constraint_rec.table_name, constraint_rec.conname);
        RAISE NOTICE 'Dropped constraint % from table %', 
            constraint_rec.conname, constraint_rec.table_name;
    END LOOP;
END $$;

-- Force schema cache invalidation with table alteration
ALTER TABLE profiles ALTER COLUMN combo_multiplier SET DEFAULT 3;

-- Add table comment to force cache refresh
COMMENT ON TABLE profiles IS 'User profiles - combo_multiplier has NO constraints - updated 2026-01-21';

-- Add column comment
COMMENT ON COLUMN profiles.combo_multiplier IS 'Commission multiplier for combo products - accepts any integer value >= 1';

-- Verify: Show that combo_multiplier column has NO constraints
DO $$
DECLARE
    constraint_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO constraint_count
    FROM pg_constraint con
    INNER JOIN pg_class rel ON rel.oid = con.conrelid
    INNER JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
    AND rel.relname = 'profiles'
    AND pg_get_constraintdef(con.oid) LIKE '%combo_multiplier%';
    
    IF constraint_count > 0 THEN
        RAISE EXCEPTION 'ERROR: Found % combo_multiplier constraints on profiles table!', constraint_count;
    ELSE
        RAISE NOTICE 'SUCCESS: No combo_multiplier constraints found on profiles table';
    END IF;
END $$;
