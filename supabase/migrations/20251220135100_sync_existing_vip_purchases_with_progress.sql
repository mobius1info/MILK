/*
  # Sync Existing VIP Purchases with Product Progress
  
  ## Overview
  This migration syncs existing vip_purchases records with the actual progress
  from product_progress table to show correct progress bars and completion status.
  
  ## Changes
  1. Update all vip_purchases with current progress from product_progress
  2. Mark purchases as completed if all products are done
  
  ## Purpose
  - Fix existing data to show correct progress
  - Enable users to repurchase completed VIP levels
*/

DO $$
DECLARE
  v_purchase RECORD;
  v_progress RECORD;
BEGIN
  FOR v_purchase IN 
    SELECT * FROM vip_purchases WHERE status = 'approved'
  LOOP
    SELECT * INTO v_progress
    FROM product_progress
    WHERE user_id = v_purchase.user_id
      AND category_id = v_purchase.category_id
      AND vip_level = v_purchase.vip_level;
    
    IF FOUND THEN
      UPDATE vip_purchases
      SET 
        completed_products_count = v_progress.products_purchased,
        is_completed = (
          v_progress.products_purchased >= (
            SELECT products_count 
            FROM vip_levels 
            WHERE level = v_purchase.vip_level 
              AND category = v_purchase.category_id
            LIMIT 1
          )
        )
      WHERE id = v_purchase.id;
    END IF;
  END LOOP;
END $$;