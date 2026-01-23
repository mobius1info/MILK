/*
  # Fix COMBO - deduct balance when purchasing combo product
  
  1. Changes
    - Check if this is a combo position
    - Calculate combo cost (VIP price × combo_deposit_percent%)
    - Deduct combo cost from user balance
    - Return error if insufficient balance
  
  2. Security
    - Maintains existing security definer
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
  v_combo_enabled BOOLEAN;
  v_current_position INTEGER;
  v_combo_deposit DECIMAL(10,2);
  v_combo_cost DECIMAL(10,2);
  v_is_combo_position BOOLEAN := false;
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

  -- Check if this is the combo position
  IF v_vip_purchase.combo_enabled_at_approval = true 
     AND v_current_position = v_vip_purchase.combo_position_at_approval THEN
    v_is_combo_position := true;
    
    -- Calculate combo cost: VIP price × combo_deposit_percent%
    v_combo_cost := v_vip_purchase.amount_paid * (v_vip_purchase.combo_deposit_percent_at_approval / 100.0);
    
    -- CHECK BALANCE - user must have enough to pay for combo
    IF v_user_balance < v_combo_cost THEN
      RETURN jsonb_build_object(
        'success', false, 
        'error', 'Insufficient balance for COMBO product',
        'required', v_combo_cost,
        'current', v_user_balance,
        'needed', v_combo_cost - v_user_balance
      );
    END IF;

    -- DEDUCT COMBO COST FROM BALANCE
    UPDATE profiles
    SET balance = balance - v_combo_cost
    WHERE id = p_user_id;

    -- Record combo payment transaction
    INSERT INTO transactions (user_id, amount, type, description, status)
    VALUES (
      p_user_id,
      -v_combo_cost,
      'purchase',
      'COMBO product purchase at position ' || v_current_position,
      'completed'
    );

    -- Update balance for calculations
    v_user_balance := v_user_balance - v_combo_cost;
  END IF;

  -- Calculate commission using VIP level settings (FIXED AMOUNT FOR ALL PRODUCTS)
  -- Formula: (VIP price × VIP commission%) / products count
  v_commission := ROUND(
    (v_vip_purchase.amount_paid * (v_vip_level.commission_percentage / 100.0) / v_vip_level.products_count),
    2
  );

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
  INSERT INTO transactions (user_id, amount, type, description, status)
  VALUES (
    p_user_id,
    v_commission,
    'commission',
    'Commission from ' || v_product.name || ' (x' || v_quantity || ')',
    'completed'
  );

  -- Update balance for return
  v_user_balance := v_user_balance + v_commission;

  -- If this was combo position, credit the combo deposit bonus
  IF v_is_combo_position = true THEN
    v_combo_deposit := v_vip_purchase.amount_paid * (v_vip_purchase.combo_deposit_percent_at_approval / 100.0);
    
    -- Credit combo deposit to balance
    UPDATE profiles
    SET balance = balance + v_combo_deposit
    WHERE id = p_user_id;
    
    -- Record combo deposit transaction
    INSERT INTO transactions (user_id, amount, type, description, status)
    VALUES (
      p_user_id,
      v_combo_deposit,
      'combo_deposit',
      'Combo bonus at position ' || v_current_position || ' (' || ROUND(v_vip_purchase.combo_deposit_percent_at_approval) || '%)',
      'completed'
    );
    
    -- Update balance for return value
    v_user_balance := v_user_balance + v_combo_deposit;
  ELSE
    v_combo_deposit := 0;
  END IF;

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
    'combo_deposit', v_combo_deposit,
    'combo_cost', COALESCE(v_combo_cost, 0),
    'is_combo_position', v_is_combo_position,
    'current_position', v_current_position,
    'new_balance', v_user_balance,
    'progress', jsonb_build_object(
      'completed', v_products_completed,
      'total', v_total_products
    )
  );
END;
$$;
