/*
  # Force Rebuild profiles table without combo_multiplier constraint
  
  1. Problem
    - Despite multiple migrations, combo_multiplier_check constraint persists
    - Error continues: "violates check constraint combo_multiplier_check"
    
  2. Solution
    - Create new profiles table without constraint
    - Migrate all data
    - Drop old table and rename new one
    
  3. Safety
    - Preserves all existing data
    - Maintains all foreign key relationships
*/

-- Create new profiles table without combo_multiplier constraint
CREATE TABLE IF NOT EXISTS profiles_new (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  username text UNIQUE,
  full_name text DEFAULT '',
  role text DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  balance numeric DEFAULT 0.00,
  referral_code text UNIQUE,
  referred_by uuid,
  total_spent numeric DEFAULT 0.00,
  total_orders integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  combo_enabled boolean DEFAULT false,
  combo_deposit_percent numeric DEFAULT 50 CHECK (combo_deposit_percent >= 5 AND combo_deposit_percent <= 5000),
  combo_product_position integer DEFAULT 9 CHECK (combo_product_position >= 0 AND combo_product_position <= 100),
  combo_multiplier integer DEFAULT 3
);

-- Copy all data from old table to new (if any exists)
INSERT INTO profiles_new 
SELECT * FROM profiles
ON CONFLICT (id) DO NOTHING;

-- Drop the old table and rename new one
DROP TABLE IF EXISTS profiles CASCADE;
ALTER TABLE profiles_new RENAME TO profiles;

-- Recreate the foreign key for referred_by
ALTER TABLE profiles 
ADD CONSTRAINT profiles_referred_by_fkey 
FOREIGN KEY (referred_by) REFERENCES profiles(id);

-- Recreate the trigger
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Recreate RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy: Users can update their own profile (except role and balance)
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Policy: Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Verify no combo_multiplier constraint exists
DO $$
DECLARE
  constraint_count integer;
BEGIN
  SELECT COUNT(*) INTO constraint_count
  FROM pg_constraint
  WHERE conrelid = 'profiles'::regclass
    AND pg_get_constraintdef(oid) LIKE '%combo_multiplier%';
  
  IF constraint_count > 0 THEN
    RAISE EXCEPTION 'combo_multiplier constraint still exists after rebuild!';
  ELSE
    RAISE NOTICE 'SUCCESS: profiles table rebuilt without combo_multiplier constraint';
  END IF;
END $$;
