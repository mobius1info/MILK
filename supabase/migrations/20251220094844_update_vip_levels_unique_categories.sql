/*
  # Update VIP Levels with Unique Categories

  1. Changes
    - Update each VIP level to have a unique category
    - Add category images for each VIP level
    - VIP 1 → Fashion (clothing and accessories)
    - VIP 2 → Home (home decor and furniture)
    - VIP 3 → Electronics (tech gadgets)
    - VIP 4 → Beauty (cosmetics and skincare)
    - VIP 5 → Crypto Mining Equipment (mining hardware)
  
  2. Security
    - No security changes needed
*/

-- Update VIP 1 - Fashion
UPDATE vip_levels 
SET 
  category = 'fashion',
  category_image_url = 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'
WHERE level = 1;

-- Update VIP 2 - Home
UPDATE vip_levels 
SET 
  category = 'home',
  category_image_url = 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'
WHERE level = 2;

-- Update VIP 3 - Electronics
UPDATE vip_levels 
SET 
  category = 'electronics',
  category_image_url = 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg'
WHERE level = 3;

-- Update VIP 4 - Beauty
UPDATE vip_levels 
SET 
  category = 'beauty',
  category_image_url = 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg'
WHERE level = 4;

-- Update VIP 5 - Crypto Mining Equipment
UPDATE vip_levels 
SET 
  category = 'Crypto Mining Equipment',
  category_image_url = 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg'
WHERE level = 5;