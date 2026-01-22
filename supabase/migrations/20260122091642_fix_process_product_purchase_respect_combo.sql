/*
  # Fix process_product_purchase to respect combo settings

  1. Changes
    - Update process_product_purchase to check combo settings from vip_purchases
    - If combo is enabled (combo_enabled_at_approval = true), skip balance check and deduction
    - Only deduct balance if combo is NOT enabled
    - Always credit commission regardless of combo status

  2. Security
    - No security changes
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
  SELECT balance INTO v_user_balance
  FROM profiles
  WHERE id = p_user_id;

  SELECT * INTO v_vip_purchase
  FROM vip_purchases
  WHERE id = p_vip_purchase_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'VIP purchase not found');
  END IF;

  -- Check if combo is enabled for this VIP purchase
  v_combo_enabled := COALESCE(v_vip_purchase.combo_enabled_at_approval, false);

  SELECT * INTO v_vip_level
  FROM vip_levels
  WHERE id = v_vip_purchase.vip_level_id;

  SELECT * INTO v_product
  FROM products
  WHERE id = p_product_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not found');
  END IF;

  v_quantity := COALESCE(v_product.quantity_multiplier, 1);
  v_total_price := v_product.price * v_quantity;

  -- Only check balance if combo is NOT enabled
  IF NOT v_combo_enabled AND v_user_balance < v_total_price THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  v_commission := v_total_price * (v_product.commission_percentage / 100.0);

  -- Only deduct balance if combo is NOT enabled
  IF NOT v_combo_enabled THEN
    UPDATE profiles
    SET balance = balance - v_total_price
    WHERE id = p_user_id;

    INSERT INTO transactions (user_id, amount, type, description, status)
    VALUES (
      p_user_id,
      -v_total_price,
      'purchase',
      format('Product purchase: %s (x%s)', v_product.name, v_quantity),
      'completed'
    );
  END IF;

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

  -- Always credit commission
  UPDATE profiles
  SET balance = balance + v_commission
  WHERE id = p_user_id;

  INSERT INTO transactions (user_id, amount, type, description, status)
  VALUES (
    p_user_id,
    v_commission,
    'commission',
    format('Commission from %s (x%s)', v_product.name, v_quantity),
    'completed'
  );

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
    'new_balance', v_user_balance - CASE WHEN v_combo_enabled THEN 0 ELSE v_total_price END + v_commission,
    'combo_enabled', v_combo_enabled,
    'progress', jsonb_build_object(
      'completed', v_products_completed,
      'total', v_total_products
    )
  );
END;
$$;
