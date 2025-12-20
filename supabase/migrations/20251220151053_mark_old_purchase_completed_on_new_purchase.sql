/*
  # Mark old VIP purchase as completed when user purchases same VIP again

  1. Changes
    - Create trigger function that runs BEFORE INSERT on vip_purchases
    - When user purchases same VIP level + category again, mark old purchase as 'completed'
    - This allows old purchase to remain 'approved' until user makes new purchase
    
  2. Security
    - Maintains existing RLS policies
*/

CREATE OR REPLACE FUNCTION mark_old_vip_purchase_completed_on_new()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vip_purchases
  SET status = 'completed'
  WHERE user_id = NEW.user_id
    AND vip_level = NEW.vip_level
    AND category_id = NEW.category_id
    AND status = 'approved'
    AND is_completed = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_mark_old_purchase_completed ON vip_purchases;

CREATE TRIGGER trigger_mark_old_purchase_completed
  BEFORE INSERT ON vip_purchases
  FOR EACH ROW
  EXECUTE FUNCTION mark_old_vip_purchase_completed_on_new();