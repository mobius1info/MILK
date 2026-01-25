/*
  # Fix Products Admin Policy
  
  1. Changes
    - Drop old admin policy that checks JWT
    - Create new admin policy that checks profiles table
    - This allows admins to update products correctly
  
  2. Security
    - Maintains RLS security
    - Only users with role='admin' in profiles can manage products
*/

-- Drop old policy
DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- Create new policy that checks profiles table
CREATE POLICY "Admins can manage products"
  ON products
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
