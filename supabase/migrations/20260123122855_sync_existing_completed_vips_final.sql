/*
  # Sync Existing Completed VIPs
  
  Marks all VIP purchases as completed where products_completed >= total_products
  but is_completed is still false.
  
  This fixes any VIP purchases that are stuck in "Active" when they should be "Completed".
*/

UPDATE vip_purchases
SET 
  is_completed = true,
  updated_at = now()
WHERE products_completed >= total_products
  AND (is_completed IS NULL OR is_completed = false)
  AND status = 'approved';
