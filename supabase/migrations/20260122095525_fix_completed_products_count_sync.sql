/*
  # Sync completed_products_count field

  1. Updates
    - Sync completed_products_count in vip_purchases with actual unique products purchased
    - Update all existing records to show correct progress
  
  2. Notes
    - This fixes the display issue where admin and client see 0/25 instead of actual progress
    - Counts only unique products with quantity > 0
*/

-- Update all vip_purchases with correct completed_products_count
UPDATE vip_purchases vp
SET completed_products_count = (
  SELECT COUNT(DISTINCT pp.product_id)
  FROM product_purchases pp
  WHERE pp.vip_purchase_id = vp.id
  AND pp.quantity > 0
)
WHERE EXISTS (
  SELECT 1 
  FROM product_purchases pp 
  WHERE pp.vip_purchase_id = vp.id
);
