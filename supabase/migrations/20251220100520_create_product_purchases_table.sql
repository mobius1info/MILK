/*
  # Create Product Purchases Table

  ## Overview
  Creates a table to track individual product purchases made through the VIP task system.
  Each purchase represents a user completing a product task and earning commission.

  ## New Tables
  - `product_purchases`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `product_id` (uuid, references products)
    - `category_id` (text) - The category of the product
    - `vip_level` (integer) - VIP level at time of purchase
    - `product_price` (numeric) - Price of product at purchase
    - `commission_earned` (numeric) - Commission earned from this purchase
    - `commission_percentage` (numeric) - Percentage used for commission
    - `is_ninth_product` (boolean) - Whether this was a 9th product (3x multiplier)
    - `created_at` (timestamptz) - When the purchase was made

  ## Security
  - Enable RLS on `product_purchases` table
  - Users can view their own purchases
  - Admins can view all purchases
*/

-- Create product_purchases table
CREATE TABLE IF NOT EXISTS product_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id text NOT NULL DEFAULT '',
  vip_level integer NOT NULL DEFAULT 0,
  product_price numeric NOT NULL DEFAULT 0,
  commission_earned numeric NOT NULL DEFAULT 0,
  commission_percentage numeric NOT NULL DEFAULT 0,
  is_ninth_product boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_purchases ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own purchases
CREATE POLICY "Users can view own purchases"
  ON product_purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for admins to view all purchases
CREATE POLICY "Admins can view all purchases"
  ON product_purchases
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_purchases_user_id ON product_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_product_purchases_created_at ON product_purchases(created_at DESC);