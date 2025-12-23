/*
  # Fix VIP Levels SELECT Policy - Use Correct JWT Path

  1. Problem
    - Admin SELECT policy uses: auth.jwt() ->> 'role'
    - Should use: auth.jwt() -> 'app_metadata' ->> 'role'
  
  2. Changes
    - Drop and recreate admin SELECT policy with correct path
*/

-- Drop existing admin SELECT policy
DROP POLICY IF EXISTS "Admins can view all VIP levels" ON vip_levels;

-- Recreate with correct JWT path
CREATE POLICY "Admins can view all VIP levels"
  ON vip_levels FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
