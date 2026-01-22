/*
  # Create Demo VIP Level with Products from VIP 1

  1. New Category
    - Create "Demo" category for demo access

  2. New VIP Level
    - Create VIP Demo level with same settings as VIP 1
    - Price: 100
    - Products count: 25
    - Commission: 1%

  3. Products
    - Copy all products from Accessories (VIP 1) to Demo category
    - Maintain same prices and settings

  4. Security
    - No changes to RLS policies
*/

-- Create Demo category
INSERT INTO categories (
  id,
  name,
  description,
  image_url,
  is_active,
  commission_rate
)
VALUES (
  '99999999-9999-9999-9999-999999999999',
  'Demo',
  'Demo category for testing and trial access',
  'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg',
  true,
  5.0
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Create VIP Demo level
INSERT INTO vip_levels (
  id,
  level,
  name,
  description,
  price,
  category_id,
  category,
  products_count,
  image_url,
  category_image_url,
  commission_percentage,
  is_active
)
VALUES (
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  0,
  'VIP Demo',
  'Demo VIP level for testing',
  100,
  '99999999-9999-9999-9999-999999999999',
  'Demo',
  25,
  'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg',
  'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg',
  1.00,
  true
)
ON CONFLICT (level) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active;

-- Copy products from Accessories (VIP 1) to Demo category
INSERT INTO products (
  name,
  description,
  price,
  image_url,
  category_id,
  commission_percentage,
  quantity_multiplier,
  is_active
)
SELECT 
  name,
  description,
  price,
  image_url,
  '99999999-9999-9999-9999-999999999999', -- Demo category ID
  commission_percentage,
  quantity_multiplier,
  is_active
FROM products
WHERE category_id = '11111111-1111-1111-1111-111111111111' -- Accessories category ID
ON CONFLICT DO NOTHING;