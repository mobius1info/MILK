/*
  # Sync existing completed VIPs
  
  1. Update
    - Set is_completed = true for all VIP purchases where completed_products_count >= products_count
  
  2. Why
    - Users who already completed all products need the flag updated
    - This moves them from Active to Completed section
*/

UPDATE vip_purchases vp
SET is_completed = true
FROM vip_levels vl
WHERE vp.vip_level_id = vl.id
  AND vp.completed_products_count >= vl.products_count
  AND vp.is_completed = false
  AND vp.status = 'approved';
