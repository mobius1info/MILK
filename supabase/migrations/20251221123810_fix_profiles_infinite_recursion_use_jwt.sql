/*
  # Fix infinite recursion in profiles RLS policy

  1. Problem
    - The "Admins can view all profiles" policy queries the profiles table within itself
    - This causes infinite recursion when checking permissions
    
  2. Solution
    - Drop the problematic policy
    - Create a new policy that uses JWT metadata instead of querying profiles table
    - Store role in auth.users app_metadata which is accessible via JWT
    
  3. Changes
    - Drop "Admins can view all profiles" policy
    - Create new policy using (auth.jwt() -> 'app_metadata' ->> 'role') to check admin role
    - Also update VIP purchases policy to use JWT metadata
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create new admin policy using JWT metadata
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = id) OR 
    ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  );

-- Also update VIP purchases policies to use JWT metadata instead
DROP POLICY IF EXISTS "Admins can view all VIP purchases" ON vip_purchases;
DROP POLICY IF EXISTS "Admins can update VIP purchases" ON vip_purchases;

CREATE POLICY "Admins can view all VIP purchases"
  ON vip_purchases FOR SELECT
  TO authenticated
  USING (
    (user_id = auth.uid()) OR 
    ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  );

CREATE POLICY "Admins can update VIP purchases"
  ON vip_purchases FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );