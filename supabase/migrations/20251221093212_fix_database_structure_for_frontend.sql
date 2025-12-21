/*
  # Fix Database Structure to Match Frontend

  1. Changes to payment_methods
    - Add wallet_address, network, instructions columns
    - Add min_amount, max_amount, display_order columns
  
  2. Changes to categories
    - Add commission_rate column
  
  3. Changes to vip_levels
    - Add category text column
    - Add category_image_url column
    - Add commission column
  
  4. Changes to vip_purchases
    - Add vip_level integer column
    - Add category_id text column
    - Add completed_products_count column
    - Add is_completed column
    - Add vip_price column
  
  5. Create banners table
    - For displaying promotional banners
*/

-- 1. Update payment_methods
ALTER TABLE payment_methods 
ADD COLUMN IF NOT EXISTS wallet_address text DEFAULT '',
ADD COLUMN IF NOT EXISTS network text,
ADD COLUMN IF NOT EXISTS instructions text,
ADD COLUMN IF NOT EXISTS min_amount numeric DEFAULT 10,
ADD COLUMN IF NOT EXISTS max_amount numeric,
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- 2. Update categories
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS commission_rate numeric DEFAULT 5.0;

-- 3. Update vip_levels
ALTER TABLE vip_levels 
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS category_image_url text,
ADD COLUMN IF NOT EXISTS commission numeric DEFAULT 5.0;

-- 4. Update vip_purchases
ALTER TABLE vip_purchases 
ADD COLUMN IF NOT EXISTS vip_level integer,
ADD COLUMN IF NOT EXISTS category_id text,
ADD COLUMN IF NOT EXISTS completed_products_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS vip_price numeric DEFAULT 0;

-- 5. Create banners table
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  link_url text,
  is_active boolean DEFAULT true,
  order_position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on banners
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Create policy for banners
DROP POLICY IF EXISTS "Anyone can view active banners" ON banners;
CREATE POLICY "Anyone can view active banners"
  ON banners FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Update existing payment_methods with wallet addresses
UPDATE payment_methods 
SET 
  wallet_address = CASE 
    WHEN name = 'Bank Transfer' THEN 'Bank: Example Bank | Account: 1234567890 | SWIFT: EXAMPLESWIFT'
    WHEN name = 'Cryptocurrency' THEN 'TXhKz9QmJ5Y8pL3xR7sW2nV4bF6cG1dH8aK'
    WHEN name = 'Card Payment' THEN '4532 1234 5678 9010'
    ELSE ''
  END,
  network = CASE
    WHEN name = 'Cryptocurrency' THEN 'USDT (TRC20)'
    ELSE NULL
  END,
  min_amount = 10,
  max_amount = CASE
    WHEN name = 'Bank Transfer' THEN 50000
    WHEN name = 'Cryptocurrency' THEN 100000
    WHEN name = 'Card Payment' THEN 10000
    ELSE 10000
  END,
  display_order = CASE
    WHEN name = 'Cryptocurrency' THEN 1
    WHEN name = 'Bank Transfer' THEN 2
    WHEN name = 'Card Payment' THEN 3
    ELSE 999
  END
WHERE wallet_address = '';

-- Update categories with commission rates
UPDATE categories 
SET commission_rate = CASE 
  WHEN name = 'Fashion' THEN 4.0
  WHEN name = 'Electronics' THEN 5.0
  WHEN name = 'Sports' THEN 6.0
  WHEN name = 'Crypto Mining' THEN 8.0
  WHEN name = 'Food' THEN 3.5
  ELSE 5.0
END
WHERE commission_rate IS NULL OR commission_rate = 5.0;

-- Update vip_levels with category info from categories table
UPDATE vip_levels vl
SET 
  category = c.name,
  category_image_url = COALESCE(c.image_url, 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg'),
  commission = c.commission_rate
FROM categories c
WHERE vl.category_id = c.id
AND vl.category IS NULL;

-- Update vip_purchases with vip_level from vip_levels
UPDATE vip_purchases vp
SET 
  vip_level = vl.level,
  category_id = vl.category,
  vip_price = vp.amount_paid,
  completed_products_count = vp.products_completed,
  is_completed = (vp.products_completed >= vp.total_products)
FROM vip_levels vl
WHERE vp.vip_level_id = vl.id
AND vp.vip_level IS NULL;