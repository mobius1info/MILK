/*
  # Sync Existing Completed Products Count

  Update all existing vip_purchases records to sync completed_products_count
  with actual progress from product_progress table.
*/

-- Update completed_products_count based on product_progress
UPDATE vip_purchases vp
SET completed_products_count = COALESCE(pp.current_product_index, 0)
FROM product_progress pp
WHERE vp.id = pp.vip_purchase_id
  AND vp.status = 'approved';

-- Set to 0 for approved purchases that don't have progress yet
UPDATE vip_purchases
SET completed_products_count = 0
WHERE status = 'approved'
  AND completed_products_count IS NULL;