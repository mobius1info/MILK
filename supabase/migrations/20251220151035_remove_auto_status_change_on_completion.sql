/*
  # Remove automatic status change on completion

  1. Changes
    - Drop trigger that automatically changes status to 'completed'
    - Status will remain 'approved' when is_completed = true
    - Only when user purchases same VIP again, old purchase status will change to 'completed'
    
  2. Reasoning
    - Prevents errors when loading products after completion
    - Allows smooth transition from completed to new purchase
*/

DROP TRIGGER IF EXISTS trigger_mark_vip_purchase_completed ON vip_purchases;
DROP FUNCTION IF EXISTS mark_vip_purchase_completed_when_all_products_done();