/*
  # Recreate Commission Calculation Function
  
  1. Changes
    - Drop old process_product_purchase function
    - Create new function with VIP percentage-based commission
    - Commission per purchase = (vip_price * commission_percentage / 100) / 25
  
  2. Example
    - VIP 3: $800, 30% commission
    - Total commission: $800 * 30% = $240
    - Per purchase (25 total): $240 / 25 = $9.6
  
  3. Notes
    - Product price doesn't affect commission anymore
    - Only VIP price and VIP commission percentage matter
*/

-- Drop old function
DROP FUNCTION IF EXISTS process_product_purchase(uuid, uuid, uuid);

-- Create new function with updated commission logic
CREATE OR REPLACE FUNCTION process_product_purchase(
  p_user_id uuid,
  p_product_id uuid,
  p_vip_purchase_id uuid
) RETURNS jsonb AS $$
DECLARE
  v_product RECORD;
  v_vip_purchase RECORD;
  v_vip_level RECORD;
  v_user_progress RECORD;
  v_commission_amount numeric;
  v_new_balance numeric;
  v_total_commission numeric;
  v_commission_per_purchase numeric;
BEGIN
  -- Get product details
  SELECT * INTO v_product FROM products WHERE id = p_product_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  -- Get VIP purchase details
  SELECT * INTO v_vip_purchase FROM vip_purchases WHERE id = p_vip_purchase_id AND user_id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'VIP purchase not found';
  END IF;

  -- Check if VIP purchase is approved
  IF v_vip_purchase.status != 'approved' THEN
    RAISE EXCEPTION 'VIP purchase must be approved before making purchases';
  END IF;

  -- Get VIP level details with commission percentage
  SELECT * INTO v_vip_level FROM vip_levels WHERE id = v_vip_purchase.vip_level_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'VIP level not found';
  END IF;

  -- Get or create user progress
  SELECT * INTO v_user_progress FROM vip_purchase_progress 
  WHERE vip_purchase_id = p_vip_purchase_id AND user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO vip_purchase_progress (vip_purchase_id, user_id, products_completed, total_products)
    VALUES (p_vip_purchase_id, p_user_id, 0, v_vip_purchase.total_products)
    RETURNING * INTO v_user_progress;
  END IF;

  -- Check if already completed all products
  IF v_user_progress.products_completed >= v_user_progress.total_products THEN
    RAISE EXCEPTION 'All products already completed for this VIP purchase';
  END IF;

  -- Calculate commission based on VIP price and commission percentage
  -- Total commission = vip_price * commission_percentage / 100
  -- Commission per purchase = total_commission / 25
  v_total_commission := v_vip_purchase.vip_price * (v_vip_level.commission_percentage / 100);
  v_commission_per_purchase := v_total_commission / 25;
  v_commission_amount := v_commission_per_purchase;

  -- Update user balance
  UPDATE profiles 
  SET balance = balance + v_commission_amount
  WHERE id = p_user_id
  RETURNING balance INTO v_new_balance;

  -- Record the purchase
  INSERT INTO product_purchases (
    user_id,
    product_id,
    vip_purchase_id,
    price_paid,
    commission_earned,
    status
  ) VALUES (
    p_user_id,
    p_product_id,
    p_vip_purchase_id,
    0,
    v_commission_amount,
    'completed'
  );

  -- Create commission transaction
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    description,
    status
  ) VALUES (
    p_user_id,
    'commission',
    v_commission_amount,
    format('Commission from VIP %s task (%.2f%% of $%.2f)', 
      v_vip_level.level, 
      v_vip_level.commission_percentage,
      v_vip_purchase.vip_price
    ),
    'completed'
  );

  -- Update progress
  UPDATE vip_purchase_progress
  SET products_completed = products_completed + 1,
      last_purchase_at = now()
  WHERE vip_purchase_id = p_vip_purchase_id AND user_id = p_user_id;

  -- If user completed all products, mark purchase as completed
  IF v_user_progress.products_completed + 1 >= v_user_progress.total_products THEN
    UPDATE vip_purchases
    SET status = 'completed'
    WHERE id = p_vip_purchase_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'commission_earned', v_commission_amount,
    'new_balance', v_new_balance,
    'products_completed', v_user_progress.products_completed + 1,
    'total_products', v_user_progress.total_products,
    'total_commission_earned', v_total_commission,
    'commission_percentage', v_vip_level.commission_percentage
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
