/*
  # Add Missing Fields and Create Product Progress Table

  1. Problem
    - product_purchases table is missing category_id, vip_level, quantity_count fields
    - product_progress table doesn't exist
    - process_product_purchase function expects these tables/fields
    
  2. Solution
    - Add missing fields to product_purchases table
    - Create product_progress table to track user progress
    
  3. Changes to product_purchases
    - Add category_id (text)
    - Add vip_level (integer)
    - Add product_price (numeric)
    - Add commission_percentage (numeric)
    - Add is_ninth_product (boolean)
    - Add quantity_count (integer) - tracks purchases of same product
    
  4. New Table: product_progress
    - Tracks user progress through VIP categories
    - Stores current product index and total earned commission
    
  5. Security
    - Maintain existing RLS policies
    - Users can only see their own progress
*/

-- Add missing fields to product_purchases if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_purchases' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE product_purchases ADD COLUMN category_id text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_purchases' AND column_name = 'vip_level'
  ) THEN
    ALTER TABLE product_purchases ADD COLUMN vip_level integer NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_purchases' AND column_name = 'product_price'
  ) THEN
    ALTER TABLE product_purchases ADD COLUMN product_price numeric NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_purchases' AND column_name = 'commission_percentage'
  ) THEN
    ALTER TABLE product_purchases ADD COLUMN commission_percentage numeric NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_purchases' AND column_name = 'is_ninth_product'
  ) THEN
    ALTER TABLE product_purchases ADD COLUMN is_ninth_product boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_purchases' AND column_name = 'quantity_count'
  ) THEN
    ALTER TABLE product_purchases ADD COLUMN quantity_count integer NOT NULL DEFAULT 1;
  END IF;
END $$;

-- Create product_progress table
CREATE TABLE IF NOT EXISTS product_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vip_level integer NOT NULL DEFAULT 0,
  category_id text NOT NULL DEFAULT '',
  current_product_index integer NOT NULL DEFAULT 0,
  products_purchased integer NOT NULL DEFAULT 0,
  total_commission_earned numeric NOT NULL DEFAULT 0,
  last_product_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, vip_level, category_id)
);

-- Enable RLS on product_progress
ALTER TABLE product_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view own progress"
  ON product_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all progress
CREATE POLICY "Admins can view all progress"
  ON product_progress FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Function can insert/update progress
CREATE POLICY "Function can manage progress"
  ON product_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_progress_user_id ON product_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_product_progress_category ON product_progress(category_id, vip_level);
CREATE INDEX IF NOT EXISTS idx_product_purchases_category_vip ON product_purchases(user_id, category_id, vip_level);