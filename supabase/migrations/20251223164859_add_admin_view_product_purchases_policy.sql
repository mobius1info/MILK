/*
  # Add Admin Policy for Product Purchases

  1. Purpose
    - Allow admin to view all product purchases
    - Enables admin to see client VIP task progress details

  2. Security
    - Only admin can view all product purchases
    - Uses app_metadata role check
*/

-- Allow admin to view all product purchases
CREATE POLICY "Admin can view all product purchases"
  ON product_purchases FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
  );
