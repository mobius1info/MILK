/*
  # Update Existing VIP BONUS Purchases to Use Correct Categories

  1. Problem
    - Existing VIP BONUS purchases use old incorrect categories
    - This causes no products to be found
  
  2. Solution
    - Update all VIP BONUS purchases to use correct categories from vip_levels
    - Update product_progress records as well
  
  3. Changes
    - Sync category_id in vip_purchases with vip_levels.category
    - Update product_progress to match
*/

UPDATE vip_purchases vp
SET category_id = vl.category
FROM vip_levels vl
WHERE vp.vip_level_id = vl.id
  AND vl.is_bonus = true
  AND vp.category_id != vl.category;

UPDATE product_progress pp
SET category_id = vl.category
FROM vip_purchases vp
JOIN vip_levels vl ON vp.vip_level_id = vl.id
WHERE pp.vip_purchase_id = vp.id
  AND vl.is_bonus = true
  AND pp.category_id != vl.category;