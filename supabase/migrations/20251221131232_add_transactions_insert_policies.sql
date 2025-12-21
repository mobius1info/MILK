/*
  # Add INSERT Policies for Transactions Table

  ## Overview
  This migration adds RLS policies to allow users and admins to insert
  transactions into the transactions table.

  ## Changes
  1. Add policy for users to insert their own transactions
  2. Add policy for admins to insert any transactions

  ## Security
  - Users can only insert transactions for themselves (user_id = auth.uid())
  - Admins can insert transactions for any user
  - Both policies check authentication status

  ## Purpose
  - Enable VIP purchase transactions to be recorded
  - Allow product purchase transactions to be recorded
  - Support manual balance operations by admins
  - Maintain complete transaction history
*/

-- Allow users to insert their own transactions
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow admins to insert any transactions
CREATE POLICY "Admins can insert all transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );