/*
  # Change VIP purchase status to completed when all products are done

  1. Changes
    - Update the trigger function to change status from 'approved' to 'completed' when is_completed becomes true
    - This allows users to purchase the same VIP level again after completing all tasks
    
  2. Security
    - Maintains existing RLS policies
*/

CREATE OR REPLACE FUNCTION mark_vip_purchase_completed_when_all_products_done()
RETURNS TRIGGER AS $$
DECLARE
  expected_count integer;
BEGIN
  IF NEW.is_completed = true AND OLD.is_completed = false THEN
    SELECT products_count INTO expected_count
    FROM vip_levels
    WHERE category = NEW.category_id AND level = NEW.vip_level;
    
    IF NEW.completed_products_count >= expected_count THEN
      NEW.status = 'completed';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_mark_vip_purchase_completed ON vip_purchases;

CREATE TRIGGER trigger_mark_vip_purchase_completed
  BEFORE UPDATE ON vip_purchases
  FOR EACH ROW
  WHEN (NEW.is_completed = true AND OLD.is_completed = false)
  EXECUTE FUNCTION mark_vip_purchase_completed_when_all_products_done();