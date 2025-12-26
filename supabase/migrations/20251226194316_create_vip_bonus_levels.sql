/*
  # Create VIP BONUS Levels

  1. New Data
    - Adds 5 VIP BONUS levels (levels 100-104)
    - Each VIP BONUS level has:
      - Different category (electronics, fashion, home, beauty, sports)
      - 25 products/tasks
      - 15% commission percentage
      - Price: $100
      - is_bonus = true flag
      - is_active = true
  
  2. Purpose
    - VIP BONUS levels are hidden from regular purchase
    - Only accessible through Demo Access grant by admin
    - Users can complete tasks and earn commission
    - These levels are not shown in VIP Levels Management tab
*/

-- Insert VIP BONUS levels
INSERT INTO vip_levels (
  level,
  name,
  commission,
  commission_percentage,
  price,
  description,
  category,
  category_image_url,
  products_count,
  is_active,
  is_bonus
) VALUES
  (
    100,
    'VIP BONUS - Electronics',
    15,
    15,
    100,
    'Demo access for Electronics category',
    'electronics',
    'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg',
    25,
    true,
    true
  ),
  (
    101,
    'VIP BONUS - Fashion',
    15,
    15,
    100,
    'Demo access for Fashion category',
    'fashion',
    'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg',
    25,
    true,
    true
  ),
  (
    102,
    'VIP BONUS - Home',
    15,
    15,
    100,
    'Demo access for Home & Living category',
    'home',
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
    25,
    true,
    true
  ),
  (
    103,
    'VIP BONUS - Beauty',
    15,
    15,
    100,
    'Demo access for Beauty category',
    'beauty',
    'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg',
    25,
    true,
    true
  ),
  (
    104,
    'VIP BONUS - Sports',
    15,
    15,
    100,
    'Demo access for Sports category',
    'sports',
    'https://images.pexels.com/photos/3758048/pexels-photo-3758048.jpeg',
    25,
    true,
    true
  )
ON CONFLICT (level) DO NOTHING;
