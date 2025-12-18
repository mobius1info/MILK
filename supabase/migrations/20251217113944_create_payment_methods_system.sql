/*
  # Create Payment Methods System

  ## Overview
  This migration creates a comprehensive payment methods system for cryptocurrency deposits,
  allowing admins to manage multiple payment options and users to select their preferred method.

  ## New Tables
  
  ### `payment_methods`
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Payment method name (e.g., "Bitcoin", "Ethereum")
  - `type` (text) - Type of payment (e.g., "crypto", "bank")
  - `wallet_address` (text) - Cryptocurrency wallet address or account details
  - `network` (text, nullable) - Blockchain network (e.g., "BTC", "ETH", "TRC20")
  - `qr_code_url` (text, nullable) - URL to QR code image
  - `min_amount` (numeric) - Minimum deposit amount
  - `max_amount` (numeric, nullable) - Maximum deposit amount
  - `instructions` (text, nullable) - Additional instructions for users
  - `is_active` (boolean) - Whether method is currently active
  - `display_order` (integer) - Order for displaying methods
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Changes to Existing Tables
  
  ### `transactions` table
  - Add `payment_method_id` (uuid, nullable) - Reference to selected payment method
  - Add `payment_proof_url` (text, nullable) - URL to payment screenshot/proof
  - Add `transaction_hash` (text, nullable) - Blockchain transaction hash

  ## Security
  - Enable RLS on `payment_methods` table
  - Allow all authenticated users to read active payment methods
  - Only admins can create, update, or delete payment methods
  
  ## Important Notes
  - Payment methods can be cryptocurrency wallets or other payment types
  - Admins have full control over payment method management
  - Users can only view active payment methods
*/

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'crypto',
  wallet_address text NOT NULL,
  network text,
  qr_code_url text,
  min_amount numeric NOT NULL DEFAULT 10.00,
  max_amount numeric,
  instructions text,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CHECK (type IN ('crypto', 'bank', 'other')),
  CHECK (min_amount >= 0),
  CHECK (max_amount IS NULL OR max_amount >= min_amount)
);

-- Add new columns to transactions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'payment_method_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN payment_method_id uuid REFERENCES payment_methods(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'payment_proof_url'
  ) THEN
    ALTER TABLE transactions ADD COLUMN payment_proof_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'transaction_hash'
  ) THEN
    ALTER TABLE transactions ADD COLUMN transaction_hash text;
  END IF;
END $$;

-- Enable RLS on payment_methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read active payment methods
CREATE POLICY "Authenticated users can view active payment methods"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy: Admins can view all payment methods
CREATE POLICY "Admins can view all payment methods"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can insert payment methods
CREATE POLICY "Admins can create payment methods"
  ON payment_methods
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can update payment methods
CREATE POLICY "Admins can update payment methods"
  ON payment_methods
  FOR UPDATE
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

-- Policy: Admins can delete payment methods
CREATE POLICY "Admins can delete payment methods"
  ON payment_methods
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert some default cryptocurrency payment methods
INSERT INTO payment_methods (name, type, wallet_address, network, min_amount, max_amount, instructions, display_order) VALUES
('Bitcoin (BTC)', 'crypto', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'BTC', 10.00, 100000.00, 'Send BTC to this address. Minimum 1 confirmation required.', 1),
('Ethereum (ETH)', 'crypto', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'ETH', 10.00, 100000.00, 'Send ETH to this address. Minimum 12 confirmations required.', 2),
('USDT (TRC20)', 'crypto', 'TXhZKpXNvKZwmvKN5UMvKVhGQF8y9ZqRmD', 'TRC20', 10.00, 100000.00, 'Send USDT via TRC20 network only. Fast and low fees.', 3);
