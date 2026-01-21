/*
  # Fix VIP Levels Admin Policy

  1. Changes
    - Drop old admin policy that checks jwt role incorrectly
    - Create new admin policy that checks app_metadata.role like profiles table
    
  2. Security
    - Admins can now properly read and manage VIP levels
    - Uses same auth check pattern as profiles table
*/

-- Drop the old incorrect policy
DROP POLICY IF EXISTS "Admins can manage vip levels" ON vip_levels;

-- Create correct admin policy
CREATE POLICY "Admins can manage vip levels"
  ON vip_levels
  FOR ALL
  TO authenticated
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text);
