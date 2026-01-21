/*
  # Fix Admin Profiles View Policy

  1. Problem
    - Admin policy checks (auth.jwt()->>'role') but role is in app_metadata
    - This prevents admin from seeing client profiles
  
  2. Solution
    - Update policy to check auth.jwt()->'app_metadata'->>'role'
*/

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING ((auth.jwt()->'app_metadata'->>'role')::text = 'admin');
