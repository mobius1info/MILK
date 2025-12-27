/*
  # Fix Category Access for VIP BONUS Users

  1. Problem
    - Users with demo access have old category names in category_access
    - This prevents them from accessing VIP BONUS tasks
  
  2. Solution
    - Update category_access to use correct category names
    - Map old categories to new ones
  
  3. Changes
    - Update all old category names to match product categories
*/

UPDATE category_access
SET category = CASE
  WHEN category = 'sports' THEN 'Accessories'
  WHEN category = 'electronics' THEN 'Apple Tech'
  WHEN category = 'fashion' THEN 'Clothing'
  WHEN category = 'home' THEN 'Kitchen Appliances'
  WHEN category = 'beauty' THEN 'Accessories'
  ELSE category
END
WHERE category IN ('sports', 'electronics', 'fashion', 'home', 'beauty');

DELETE FROM category_access
WHERE user_id IN (
  SELECT ca1.user_id
  FROM category_access ca1
  JOIN category_access ca2 ON ca1.user_id = ca2.user_id AND ca1.category = ca2.category
  WHERE ca1.id > ca2.id
);