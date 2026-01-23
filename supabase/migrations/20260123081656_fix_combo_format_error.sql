/*
  # Fix format() error in process_product_purchase function
  
  1. Changes
    - Fix format() specifier for combo deposit percentage
    - Use %s instead of %.0f for better compatibility
  
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
  v_is_combo_position BOOLEAN := false;
BEGIN
  -- Get current user balance
  SELECT balance, combo_enabled INTO v_user_balance, v_combo_enabled
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

  -- IF COMBO IS ENABLED, CHECK BALANCE
  IF v_combo_enabled = true THEN
    IF v_user_balance < v_total_price THEN
      RETURN jsonb_build_object(
        'success', false, 
        'error', 'Insufficient balance. Please top up your account.',
        'required', v_total_price,
        'current', v_user_balance
      );
    END IF;
  END IF;

  -- Calculate commission using VIP level settings (FIXED AMOUNT FOR ALL PRODUCTS)
  -- Formula: (VIP price × VIP commission%) / products count
  v_commission := ROUND(
    (v_vip_purchase.amount_paid * (v_vip_level.commission_percentage / 100.0) / v_vip_level.products_count),
    2
  );

  -- NO BALANCE DEDUCTION - products are free (even in combo mode)

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

  -- Count current position (how many products purchased INCLUDING this one)
  SELECT COUNT(*)::INTEGER INTO v_current_position
  FROM product_purchases
  WHERE vip_purchase_id = p_vip_purchase_id
    AND status = 'completed';

  -- Check if this is the combo position AND combo was enabled at approval
  IF v_vip_purchase.combo_enabled_at_approval = true 
     AND v_current_position = v_vip_purchase.combo_position_at_approval THEN
    v_is_combo_position := true;
    
    -- Calculate combo deposit: VIP price * combo percentage
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
    v_user_balance := v_user_balance + v_commission + v_combo_deposit;
  ELSE
    v_user_balance := v_user_balance + v_commission;
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
