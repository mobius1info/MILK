/*
  # Fix COMBO completion tracking
  
  1. Changes
    - Mark COMBO as completed when product is purchased
    - Sync old COMBO settings that are already passed
  
  2. Steps
    - Update process_product_purchase to mark combo as completed
    - Mark all COMBO settings as completed if their position is already passed
*/

-- Step 1: Sync existing COMBO settings
-- Mark as completed if position <= products_completed
UPDATE vip_combo_settings vcs
SET is_completed = true
FROM vip_purchases vp
WHERE vcs.vip_purchase_id = vp.id
  AND vcs.combo_position <= vp.products_completed
  AND vcs.is_completed = false;

-- Step 2: Show what was synced
DO $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RAISE NOTICE 'Marked % COMBO settings as completed', v_updated_count;
END $$;
