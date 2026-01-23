/*
  # Fix VIP Auto-Complete When All Products Done
  
  1. Problem
    - When user completes all products in VIP purchase, it stays in "Active" status
    - Should automatically move to "Completed" when all products are finished
  
  2. Changes
    - Update process_product_purchase to set is_completed = true when all products done
    - Check if products_completed >= total_products
    - Mark VIP purchase as completed automatically
  
  3. Result
    - VIP purchases will automatically move from Active Tasks to Completed when finished
    - User sees progress correctly
*/

CREATE OR REPLACE FUNCTION process_product_purchase(p_user_id uuid, p_vip_purchase_id uuid, p_product_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_product RECORD;
  v_vip_purchase RECORD;
  v_vip_level RECORD;
  v_user_balance DECIMAL(10,2);
  v_commission DECIMAL(10,2);
  v_quantity INTEGER;
  v_total_price DECIMAL(10,2);
  v_products_completed INTEGER;
  v_total_products INTEGER;
  v_purchase_id UUID;
  v_current_position INTEGER;
  v_required_balance DECIMAL(10,2);
  v_combo_earnings DECIMAL(10,2);
  v_is_combo_position BOOLEAN := false;
  v_base_commission DECIMAL(10,2);
  v_combo_settings RECORD;
BEGIN
  -- Get current user balance
  SELECT balance INTO v_user_balance
  FROM profiles
  WHERE id = p_user_id;

  -- Get VIP purchase details
  SELECT * INTO v_vip_purchase
  FROM vip_purchases
  WHERE id = p_vip_purchase_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'VIP purchase not found');
  END IF;

  -- Get VIP level details
  SELECT * INTO v_vip_level
  FROM vip_levels
  WHERE id = v_vip_purchase.vip_level_id;

  -- Get product details
  SELECT * INTO v_product
  FROM products
  WHERE id = p_product_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not found');
  END IF;

  -- Calculate quantity and total price
  v_quantity := COALESCE(v_product.quantity_multiplier, 1);
  v_total_price := v_product.price * v_quantity;

  -- Count current position (how many products purchased + 1 for this purchase)
  SELECT COUNT(*)::INTEGER + 1 INTO v_current_position
  FROM product_purchases
  WHERE vip_purchase_id = p_vip_purchase_id
    AND status = 'completed';

  -- Calculate base commission (use VIP LEVEL PRICE)
  v_base_commission := ROUND(
    (v_vip_level.price * (v_vip_level.commission_percentage / 100.0) / v_vip_level.products_count),
    2
  );

  -- Check if this position has a COMBO configured
  SELECT * INTO v_combo_settings
  FROM vip_combo_settings
  WHERE vip_purchase_id = p_vip_purchase_id
    AND combo_position = v_current_position
    AND is_completed = false
  LIMIT 1;

  IF FOUND THEN
    v_is_combo_position := true;
    
    -- Calculate required balance: VIP price × combo_deposit_percent / 100
    v_required_balance := ROUND(v_vip_level.price * (v_combo_settings.combo_deposit_percent::DECIMAL / 100.0), 2);
    
    -- CHECK BALANCE - user must have enough
    IF v_user_balance < v_required_balance THEN
      RETURN jsonb_build_object(
        'success', false, 
        'error', 'Insufficient balance for COMBO product',
        'required', v_required_balance,
        'current', v_user_balance,
        'needed', v_required_balance - v_user_balance
      );
    END IF;

    -- Calculate combo earnings = base commission × combo_multiplier
    v_combo_earnings := ROUND(v_base_commission * v_combo_settings.combo_multiplier, 2);
    v_commission := v_combo_earnings;

    -- Mark this combo as completed
    UPDATE vip_combo_settings
    SET is_completed = true
    WHERE id = v_combo_settings.id;
  ELSE
    -- Regular product - just base commission
    v_commission := v_base_commission;
    v_combo_earnings := 0;
  END IF;

  -- Record the purchase
  INSERT INTO product_purchases (
    user_id,
    vip_purchase_id,
    product_id,
    quantity,
    price_paid,
    commission_earned,
    status,
    completed_at
  ) VALUES (
    p_user_id,
    p_vip_purchase_id,
    p_product_id,
    v_quantity,
    v_total_price,
    v_commission,
    'completed',
    now()
  ) RETURNING id INTO v_purchase_id;

  -- Credit commission to user balance
  UPDATE profiles
  SET balance = balance + v_commission
  WHERE id = p_user_id;

  -- Record commission transaction
  IF v_is_combo_position THEN
    INSERT INTO transactions (user_id, amount, type, description, status)
    VALUES (
      p_user_id,
      v_commission,
      'commission',
      'COMBO commission from ' || v_product.name || ' (x' || v_combo_settings.combo_multiplier || ' multiplier)',
      'completed'
    );
  ELSE
    INSERT INTO transactions (user_id, amount, type, description, status)
    VALUES (
      p_user_id,
      v_commission,
      'commission',
      'Commission from ' || v_product.name,
      'completed'
    );
  END IF;

  -- Update balance for return
  v_user_balance := v_user_balance + v_commission;

  -- Update progress
  SELECT
    COUNT(*)::INTEGER,
    v_vip_level.products_count
  INTO
    v_products_completed,
    v_total_products
  FROM product_purchases
  WHERE vip_purchase_id = p_vip_purchase_id
    AND status = 'completed';

  -- AUTO-MARK AS COMPLETED when all products done
  IF v_products_completed >= v_total_products THEN
    UPDATE vip_purchases
    SET
      products_completed = v_products_completed,
      completed_products_count = v_products_completed,
      total_products = v_total_products,
      is_completed = true,
      updated_at = now()
    WHERE id = p_vip_purchase_id;
  ELSE
    UPDATE vip_purchases
    SET
      products_completed = v_products_completed,
      completed_products_count = v_products_completed,
      total_products = v_total_products,
      updated_at = now()
    WHERE id = p_vip_purchase_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'purchase_id', v_purchase_id,
    'commission', v_commission,
    'combo_earnings', v_combo_earnings,
    'base_commission', v_base_commission,
    'is_combo_position', v_is_combo_position,
    'current_position', v_current_position,
    'combo_multiplier', CASE WHEN v_is_combo_position THEN v_combo_settings.combo_multiplier ELSE 1 END,
    'new_balance', v_user_balance,
    'progress', jsonb_build_object(
      'completed', v_products_completed,
      'total', v_total_products,
      'is_completed', v_products_completed >= v_total_products
    )
  );
END;
$$;
