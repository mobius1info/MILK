/*
  # Mark Already Completed VIP Purchases

  Find all VIP purchases where all products are completed
  and mark them as is_completed = true
*/

-- Mark VIP purchases as completed where progress matches total products
UPDATE vip_purchases vp
SET is_completed = true
FROM product_progress pp, vip_levels vl
WHERE vp.id = pp.vip_purchase_id
  AND vp.status = 'approved'
  AND vp.is_completed = false
  AND vl.category = vp.category_id
  AND vl.level = vp.vip_level
  AND pp.current_product_index >= vl.products_count;