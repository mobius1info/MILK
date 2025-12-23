/*
  # Add Admin Policies for Product Progress

  1. Purpose
    - Allow admin to view all product progress records
    - Enables admin to monitor client VIP task progress

  2. Security
    - Only admin can view all progress records
    - Uses app_metadata role check
*/

-- Allow admin to view all product progress
CREATE POLICY "Admin can view all product progress"
  ON product_progress FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->'app_metadata'->>'role') = 'admin'
  );
