/*
  # Add admin policies for vip_purchases and profiles tables

  1. Changes
    - Add admin SELECT policy to vip_purchases table so admins can view all VIP purchase requests
    - Add admin UPDATE policy to vip_purchases table so admins can approve/reject requests
    - Add admin SELECT policy to profiles table so admins can view all user profiles
    
  2. Security
    - Policies check that user has role='admin' in profiles table
    - Existing user policies remain unchanged
*/

-- Add admin policy to view all VIP purchases
CREATE POLICY "Admins can view all VIP purchases"
  ON vip_purchases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Add admin policy to update VIP purchases (approve/reject)
CREATE POLICY "Admins can update VIP purchases"
  ON vip_purchases FOR UPDATE
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

-- Add admin policy to view all profiles (needed for JOIN queries in admin panel)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid() 
      AND p.role = 'admin'
    )
  );