/*
  # Add admin policies for VIP levels table

  1. Security Changes
    - Add UPDATE policy for admins on vip_levels table
    - Add INSERT policy for admins on vip_levels table
    - Add DELETE policy for admins on vip_levels table
    
  2. Notes
    - Admins are identified by (auth.jwt()->>'role') = 'admin'
    - These policies allow full CRUD operations for admins
    - Existing SELECT policy for authenticated users remains unchanged
*/

-- Policy for admins to update VIP levels
CREATE POLICY "Admins can update VIP levels"
  ON vip_levels
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'role') = 'admin')
  WITH CHECK ((auth.jwt()->>'role') = 'admin');

-- Policy for admins to insert VIP levels
CREATE POLICY "Admins can insert VIP levels"
  ON vip_levels
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt()->>'role') = 'admin');

-- Policy for admins to delete VIP levels
CREATE POLICY "Admins can delete VIP levels"
  ON vip_levels
  FOR DELETE
  TO authenticated
  USING ((auth.jwt()->>'role') = 'admin');

-- Policy for admins to view all VIP levels (including inactive)
CREATE POLICY "Admins can view all VIP levels"
  ON vip_levels
  FOR SELECT
  TO authenticated
  USING ((auth.jwt()->>'role') = 'admin');
