/*
  # Fix Commission Calculation - Use VIP Level Settings
  
  1. Changes
    - Calculate commission based on VIP level settings, not product settings
    - Formula: (vip_price * vip_commission_percentage / 100) / products_count
    - For VIP 1: ($100 * 15%) / 25 products = $0.60 per product
  
  2. Why
    - Current function uses product.commission_percentage (1%) instead of vip_level.commission_percentage (15%)
    - This causes incorrect earnings: users get ~$0.56 instead of $0.60 per product
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
BEGIN
  -- Get current user balance
  SELECT balance, combo_enabled INTO v_user_balance, v_combo_enabled
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

  -- Calculate commission based on VIP level settings
  -- Formula: (vip_price * vip_commission_percentage / 100) / products_count
  v_commission := ROUND(
    (v_vip_level.price * v_vip_level.commission_percentage / 100.0) / v_vip_level.products_count,
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
    format('Commission from %s (x%s)', v_product.name, v_quantity),
    'completed'
  );

  -- Update progress - COUNT UNIQUE PRODUCTS
  SELECT
    COUNT(DISTINCT product_id)::INTEGER,
    v_vip_level.products_count
  INTO
    v_products_completed,
    v_total_products
  FROM product_purchases
  WHERE vip_purchase_id = p_vip_purchase_id
    AND status = 'completed'
    AND quantity > 0;

  UPDATE vip_purchases
  SET
    completed_products_count = v_products_completed,
    updated_at = now()
  WHERE id = p_vip_purchase_id;

  RETURN jsonb_build_object(
    'success', true,
    'purchase_id', v_purchase_id,
    'commission', v_commission,
    'new_balance', v_user_balance + v_commission,
    'progress', jsonb_build_object(
      'completed', v_products_completed,
      'total', v_total_products
    )
  );
END;
$$;
