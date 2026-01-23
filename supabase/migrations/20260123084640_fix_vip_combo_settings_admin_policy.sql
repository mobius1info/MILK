/*
  # Fix VIP Combo Settings - Admin RLS Policy
  
  1. Changes
    - Drop old admin policy that checks auth.jwt()
    - Create new policy that checks role from profiles table
    - Allows admins to INSERT, UPDATE, DELETE combo settings
  
  2. Security
    - Admins can manage all combo settings
    - Users can only view their own settings
*/

-- Drop old policy
DROP POLICY IF EXISTS "Admins can manage combo settings" ON vip_combo_settings;

-- Create new admin policies (split by operation)
CREATE POLICY "Admins can insert combo settings"
  ON vip_combo_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update combo settings"
  ON vip_combo_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete combo settings"
  ON vip_combo_settings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to view all combo settings
CREATE POLICY "Admins can view all combo settings"
  ON vip_combo_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
