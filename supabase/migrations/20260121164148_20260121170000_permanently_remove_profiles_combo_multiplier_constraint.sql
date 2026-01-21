/*
  # Permanently Remove profiles.combo_multiplier Constraint
  
  1. Changes
    - Drop profiles_combo_multiplier_check constraint if it exists
    - Ensure combo_multiplier column accepts any integer value
    - No new constraints will be added
  
  2. Notes
    - This fixes the "combo_multiplier_check" error when approving VIP purchases
    - combo_multiplier can now be set to any value including 1
    - The constraint was being added by old migrations and needs to be removed permanently
*/

-- Drop the constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_combo_multiplier_check CASCADE;

-- Drop any other combo_multiplier constraints that might exist
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    FOR constraint_name IN 
        SELECT con.conname
        FROM pg_constraint con
        INNER JOIN pg_class rel ON rel.oid = con.conrelid
        INNER JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'public'
        AND rel.relname = 'profiles'
        AND con.contype = 'c'
        AND pg_get_constraintdef(con.oid) LIKE '%combo_multiplier%'
    LOOP
        EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS %I CASCADE', constraint_name);
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    END LOOP;
END $$;
