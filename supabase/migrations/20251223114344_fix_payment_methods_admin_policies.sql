/*
  # Fix Admin Policies for Payment Methods

  1. Changes
    - Drop existing admin policies with incorrect JWT path
    - Recreate policies with correct JWT path: app_metadata->role
    
  2. Security
    - Admins identified by checking auth.jwt()->'app_metadata'->>'role' = 'admin'
    - Full CRUD access for admins only
*/

-- Drop existing incorrect policies
DROP POLICY IF EXISTS "Admins can view all payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Admins can insert payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Admins can update payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Admins can delete payment methods" ON payment_methods;

-- Create corrected policies with proper JWT path

-- Allow admins to view all payment methods (including inactive)
CREATE POLICY "Admins can view all payment methods"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

-- Allow admins to insert payment methods
CREATE POLICY "Admins can insert payment methods"
  ON payment_methods
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

-- Allow admins to update payment methods
CREATE POLICY "Admins can update payment methods"
  ON payment_methods
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

-- Allow admins to delete payment methods
CREATE POLICY "Admins can delete payment methods"
  ON payment_methods
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
  );
