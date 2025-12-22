/*
  # Fix Admin COMBO Update Policy

  1. Problem
    - Admin can't update combo settings for clients
    - UPDATE policy checks `auth.jwt() ->> 'role'` (wrong path)
    - Role is actually stored in `auth.jwt() -> 'app_metadata' ->> 'role'`
    - This causes permission denied when saving combo settings

  2. Solution
    - Drop incorrect policy
    - Create new policy with correct JWT path to role
    - Match the same pattern as SELECT policy

  3. Changes
    - Drop policy "Admins can update combo settings"
    - Create new policy with correct app_metadata path
*/

-- Drop the incorrect policy
DROP POLICY IF EXISTS "Admins can update combo settings" ON profiles;

-- Create correct policy that checks role in app_metadata
CREATE POLICY "Admins can update combo settings"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    ((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin'
  )
  WITH CHECK (
    ((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin'
  );
