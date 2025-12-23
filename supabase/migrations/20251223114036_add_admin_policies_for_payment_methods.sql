/*
  # Add Admin Policies for Payment Methods

  1. Changes
    - Add SELECT policy for admins to view all payment methods
    - Add INSERT policy for admins to create payment methods
    - Add UPDATE policy for admins to modify payment methods
    - Add DELETE policy for admins to remove payment methods

  2. Security
    - All policies check for admin role using auth.jwt()
    - Admins have full access to payment_methods table
*/

-- Allow admins to view all payment methods (including inactive)
CREATE POLICY "Admins can view all payment methods"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->>'role') = 'admin'
  );

-- Allow admins to insert payment methods
CREATE POLICY "Admins can insert payment methods"
  ON payment_methods
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt()->>'role') = 'admin'
  );

-- Allow admins to update payment methods
CREATE POLICY "Admins can update payment methods"
  ON payment_methods
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt()->>'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt()->>'role') = 'admin'
  );

-- Allow admins to delete payment methods
CREATE POLICY "Admins can delete payment methods"
  ON payment_methods
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt()->>'role') = 'admin'
  );
