/*
  # Fix VIP Purchases Admin Policy
  
  1. Changes
    - Drop old admin policies that check JWT
    - Create new admin policies that check role from profiles table
    - More reliable as profiles table is always up to date
    
  2. Security
    - Admin can view all VIP purchases
    - Admin can update all VIP purchases
*/

-- Drop old policies
DROP POLICY IF EXISTS "Admins can view all vip purchases" ON vip_purchases;
DROP POLICY IF EXISTS "Admins can update all vip purchases" ON vip_purchases;

-- Create new policies that check profiles table
CREATE POLICY "Admins can view all vip purchases"
  ON vip_purchases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all vip purchases"
  ON vip_purchases FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );