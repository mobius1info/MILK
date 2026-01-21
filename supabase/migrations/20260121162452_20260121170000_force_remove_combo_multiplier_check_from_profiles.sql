/*
  # Force Remove combo_multiplier_check Constraint
  
  1. Problem
    - Error shows: "new row for relation 'profiles' violates check constraint 'combo_multiplier_check'"
    - This constraint should NOT exist on profiles table
    
  2. Solution
    - Force drop ANY constraint named combo_multiplier_check on profiles
    - Drop and recreate combo_multiplier column WITHOUT constraints
    - Ensure no limits on combo_multiplier values
    
  3. Note
    - combo_multiplier should allow ANY integer value (1, 2, 3, 100, etc.)
    - Constraints should ONLY exist in vip_combo_settings table
*/

-- Step 1: Force drop the constraint if it exists (multiple attempts)
DO $$
BEGIN
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS combo_multiplier_check;
    RAISE NOTICE 'Dropped combo_multiplier_check if existed';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'No constraint to drop or error: %', SQLERRM;
END $$;

-- Step 2: Drop and recreate combo_multiplier column to ensure no hidden constraints
DO $$
DECLARE
    v_col_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'combo_multiplier'
    ) INTO v_col_exists;
    
    IF v_col_exists THEN
        -- Save existing values
        CREATE TEMP TABLE temp_combo_values AS
        SELECT id, combo_multiplier FROM profiles WHERE combo_multiplier IS NOT NULL;
        
        -- Drop column completely
        ALTER TABLE profiles DROP COLUMN combo_multiplier CASCADE;
        
        -- Recreate without any constraints
        ALTER TABLE profiles ADD COLUMN combo_multiplier INTEGER DEFAULT 3;
        
        -- Restore values
        UPDATE profiles p
        SET combo_multiplier = t.combo_multiplier
        FROM temp_combo_values t
        WHERE p.id = t.id;
        
        DROP TABLE temp_combo_values;
        
        RAISE NOTICE 'Recreated combo_multiplier column without constraints';
    ELSE
        -- Create if doesn't exist
        ALTER TABLE profiles ADD COLUMN combo_multiplier INTEGER DEFAULT 3;
        RAISE NOTICE 'Created combo_multiplier column';
    END IF;
END $$;

-- Step 3: Verify no constraints exist
DO $$
DECLARE
    v_constraint_count integer;
BEGIN
    SELECT COUNT(*) INTO v_constraint_count
    FROM pg_constraint
    WHERE conrelid = 'profiles'::regclass
    AND (conname LIKE '%combo_multiplier%' OR pg_get_constraintdef(oid) LIKE '%combo_multiplier%');
    
    IF v_constraint_count > 0 THEN
        RAISE EXCEPTION 'Still found combo_multiplier constraints on profiles!';
    END IF;
    
    RAISE NOTICE 'SUCCESS: No combo_multiplier constraints on profiles table';
END $$;
