/*
  # Fix VIP Levels RLS - Use Correct JWT Path for Admin Role

  1. Problem
    - Current policy checks: auth.jwt() ->> 'role'
    - Actual location: auth.jwt() -> 'app_metadata' ->> 'role'
    - Result: Admin updates are blocked by RLS
  
  2. Changes
    - Drop existing admin policies
    - Recreate with correct JWT path: auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  
  3. Security
    - Maintains admin-only access
    - Uses correct JWT structure from Supabase Auth
*/

-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins can update VIP levels" ON vip_levels;
DROP POLICY IF EXISTS "Admins can insert VIP levels" ON vip_levels;
DROP POLICY IF EXISTS "Admins can delete VIP levels" ON vip_levels;

-- Recreate with correct JWT path
CREATE POLICY "Admins can update VIP levels"
  ON vip_levels FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can insert VIP levels"
  ON vip_levels FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can delete VIP levels"
  ON vip_levels FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
