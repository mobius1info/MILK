/*
  # Fix product purchase - no balance deduction ever

  1. Changes
    - Remove ALL balance checks and deductions
    - Products are purchased without any cost
    - Only commission is credited to user balance
    - This applies regardless of combo settings

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
BEGIN
  -- Get current user balance (for return value only)
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

  -- Calculate quantity and total price (for record keeping only)
  v_quantity := COALESCE(v_product.quantity_multiplier, 1);
  v_total_price := v_product.price * v_quantity;

  -- Calculate commission
  v_commission := v_total_price * (v_product.commission_percentage / 100.0);

  -- NO BALANCE DEDUCTION - products are free

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
    'new_balance', v_user_balance + v_commission,
    'progress', jsonb_build_object(
      'completed', v_products_completed,
      'total', v_total_products
    )
  );
END;
$$;
