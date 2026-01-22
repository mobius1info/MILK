/*
  # Add admin RLS policy for product_purchases

  1. Security Changes
    - Add policy for admins to view all product purchases
    - This allows admin panel to display correct progress information

  2. Purpose
    - Admins need to see product purchase records to display VIP progress
    - Without this policy, admins cannot query product_purchases table due to RLS
*/

-- Add admin policy to view all product purchases
CREATE POLICY "Admins can view all product purchases"
  ON product_purchases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
