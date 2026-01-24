/*
  # Fix Payment Methods Admin Policy
  
  1. Changes
    - Drop old admin policy that checks JWT role
    - Create new admin policy that checks role from profiles table
    - This ensures admins can properly update payment methods
  
  2. Security
    - Only users with role='admin' in profiles table can manage payment methods
    - All authenticated users can view payment methods
*/

DROP POLICY IF EXISTS "Admins can manage payment methods" ON payment_methods;

CREATE POLICY "Admins can manage payment methods"
  ON payment_methods
  FOR ALL
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
