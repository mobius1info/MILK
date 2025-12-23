/*
  # Add Admin Update Policy for Transactions

  1. Changes
    - Add UPDATE policy for admins on transactions table
    - Allows admins to update transaction status (approve/reject withdrawals)

  2. Security
    - Only users with role='admin' in app_metadata can update transactions
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'transactions' 
    AND policyname = 'Admins can update all transactions'
  ) THEN
    CREATE POLICY "Admins can update all transactions"
      ON transactions
      FOR UPDATE
      TO authenticated
      USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      )
      WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      );
  END IF;
END $$;
