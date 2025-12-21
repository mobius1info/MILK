/*
  # Add admin policy to view all transactions

  1. Changes
    - Add SELECT policy for admins to view all transactions in the system
    - This allows admins to see deposit, withdrawal, and commission transactions from all users

  2. Security
    - Policy only applies to authenticated users with role = 'admin'
    - Uses auth.jwt() to check role from user metadata
*/

-- Create policy for admins to view all transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'transactions' 
    AND policyname = 'Admins can view all transactions'
  ) THEN
    CREATE POLICY "Admins can view all transactions"
      ON transactions
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;
