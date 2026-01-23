/*
  # Fix commission calculation - use VIP level price
  
  1. Problem
    - amount_paid in vip_purchases is 0
    - Calculating commission as 0 * percentage = 0
  
  2. Solution
    - Use vip_level.price instead of vip_purchase.amount_paid
    - This ensures correct commission calculation
  
  3. Formula
    - Base commission = (VIP level price × commission%) ÷ products count
    - COMBO commission = base commission × combo_multiplier
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
BEGIN
  -- Get current user balance
  SELECT balance INTO v_user_balance
  FROM profiles
  WHERE id = p_user_id;

  -- Get VIP purchase details with combo snapshot
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

  -- Calculate base commission (use VIP LEVEL PRICE, not amount_paid!)
  v_base_commission := ROUND(
    (v_vip_level.price * (v_vip_level.commission_percentage / 100.0) / v_vip_level.products_count),
    2
  );

  -- Check if this is the combo position
  IF v_vip_purchase.combo_enabled_at_approval = true 
     AND v_current_position = v_vip_purchase.combo_position_at_approval THEN
    v_is_combo_position := true;
    
    -- Calculate required balance: VIP price × combo_deposit_percent%
    v_required_balance := v_vip_level.price * (v_vip_purchase.combo_deposit_percent_at_approval / 100.0);
    
    -- CHECK BALANCE - user must have enough (but we don't deduct it!)
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
    v_combo_earnings := v_base_commission * v_vip_purchase.combo_multiplier_at_approval;
    v_commission := v_combo_earnings;
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
      'COMBO commission from ' || v_product.name || ' (x' || ROUND(v_vip_purchase.combo_multiplier_at_approval) || ' multiplier)',
      'completed'
    );
  ELSE
    INSERT INTO transactions (user_id, amount, type, description, status)
    VALUES (
      p_user_id,
      v_commission,
      'commission',
      'Commission from ' || v_product.name || ' (x' || v_quantity || ')',
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

  UPDATE vip_purchases
  SET
    products_completed = v_products_completed,
    total_products = v_total_products,
    updated_at = now()
  WHERE id = p_vip_purchase_id;

  RETURN jsonb_build_object(
    'success', true,
    'purchase_id', v_purchase_id,
    'commission', v_commission,
    'combo_earnings', v_combo_earnings,
    'base_commission', v_base_commission,
    'is_combo_position', v_is_combo_position,
    'current_position', v_current_position,
    'combo_multiplier', COALESCE(v_vip_purchase.combo_multiplier_at_approval, 1),
    'new_balance', v_user_balance,
    'progress', jsonb_build_object(
      'completed', v_products_completed,
      'total', v_total_products
    )
  );
END;
$$;
