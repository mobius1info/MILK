/*
  # Fix Product Prices to Not Exceed VIP Level Prices

  1. Changes
    - Update all product prices to ensure they don't exceed their VIP level price
    - VIP 1 ($100): Accessories products capped at $100
    - VIP 2 ($500): Clothing products capped at $500
    - VIP 3 ($2000): Kitchen products capped at $2000
    - VIP 4 ($5000): Apple Tech products capped at $5000
    - VIP 5 ($10000): Crypto Mining products capped at $10000

  2. Security
    - No security changes
*/

-- Update Accessories (VIP 1 - $100)
UPDATE products p
SET price = LEAST(p.price, 100)
FROM categories c, vip_levels vl
WHERE p.category_id = c.id
  AND c.name = vl.category
  AND vl.name = 'VIP 1'
  AND vl.category = 'Accessories';

-- Update Clothing (VIP 2 - $500)
UPDATE products p
SET price = LEAST(p.price, 500)
FROM categories c, vip_levels vl
WHERE p.category_id = c.id
  AND c.name = vl.category
  AND vl.name = 'VIP 2'
  AND vl.category = 'Clothing';

-- Update Kitchen Appliances (VIP 3 - $2000)
UPDATE products p
SET price = LEAST(p.price, 2000)
FROM categories c, vip_levels vl
WHERE p.category_id = c.id
  AND c.name = vl.category
  AND vl.name = 'VIP 3'
  AND vl.category = 'Kitchen Appliances';

-- Update Apple Tech (VIP 4 - $5000)
UPDATE products p
SET price = LEAST(p.price, 5000)
FROM categories c, vip_levels vl
WHERE p.category_id = c.id
  AND c.name = vl.category
  AND vl.name = 'VIP 4'
  AND vl.category = 'Apple Tech';

-- Update Crypto Mining (VIP 5 - $10000)
UPDATE products p
SET price = LEAST(p.price, 10000)
FROM categories c, vip_levels vl
WHERE p.category_id = c.id
  AND c.name = vl.category
  AND vl.name = 'VIP 5'
  AND vl.category = 'Crypto Mining';
