/*
  # Update process_product_purchase to use position-based combo overrides

  1. Changes
    - Check current product position (completed_products_count + 1)
    - Look for active override for that specific position
    - If found, calculate price as: vip_price * (vip_price_percentage/100) * combo_multiplier
    - If not found, fall back to profile's global combo settings
    - All other logic remains the same
*/

CREATE OR REPLACE FUNCTION process_product_purchase(
  p_user_id uuid,
  p_product_id uuid,
  p_vip_purchase_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product RECORD;
  v_profile RECORD;
  v_vip_purchase RECORD;
  v_progress RECORD;
  v_commission numeric;
  v_referrer_id uuid;
  v_override RECORD;
  v_actual_price numeric;
  v_current_position integer;
BEGIN
  SELECT * INTO v_product
  FROM products
  WHERE id = p_product_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Product not found'
    );
  END IF;

  SELECT * INTO v_profile
  FROM profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Profile not found'
    );
  END IF;

  SELECT * INTO v_vip_purchase
  FROM vip_purchases
  WHERE id = p_vip_purchase_id
    AND user_id = p_user_id
    AND status = 'approved';

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No approved VIP purchase found'
    );
  END IF;

  SELECT * INTO v_progress
  FROM product_progress
  WHERE user_id = p_user_id
    AND product_id = p_product_id
    AND vip_purchase_id = p_vip_purchase_id;

  IF NOT FOUND THEN
    INSERT INTO product_progress (user_id, product_id, completed_count, vip_purchase_id)
    VALUES (p_user_id, p_product_id, 0, p_vip_purchase_id)
    RETURNING * INTO v_progress;
  END IF;

  IF v_progress.completed_count >= COALESCE(v_product.quantity_multiplier, 1) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Product already completed'
    );
  END IF;

  v_actual_price := v_product.price;
  v_current_position := v_vip_purchase.products_completed + 1;

  SELECT * INTO v_override
  FROM vip_purchase_combo_overrides
  WHERE vip_purchase_id = p_vip_purchase_id
    AND product_position = v_current_position
    AND is_active = true
  LIMIT 1;

  IF FOUND THEN
    v_actual_price := v_vip_purchase.vip_price 
                      * (v_override.vip_price_percentage / 100.0) 
                      * v_override.combo_multiplier;
  ELSIF COALESCE(v_profile.combo_enabled, false) 
        AND v_profile.combo_multiplier > 1 THEN
    v_actual_price := v_vip_purchase.vip_price * v_profile.combo_multiplier;
  END IF;

  UPDATE product_progress
  SET completed_count = completed_count + 1,
      updated_at = now()
  WHERE user_id = p_user_id
    AND product_id = p_product_id
    AND vip_purchase_id = p_vip_purchase_id;

  v_commission := v_vip_purchase.vip_price * (COALESCE(v_product.commission_percentage, 0) / 100.0);

  UPDATE profiles
  SET balance = balance + v_commission
  WHERE id = p_user_id;

  INSERT INTO transactions (user_id, type, amount, status, description)
  VALUES (
    p_user_id,
    'commission',
    v_commission,
    'completed',
    format('Commission from %s (%.2f%%)', v_product.name, COALESCE(v_product.commission_percentage, 0))
  );

  SELECT referred_by INTO v_referrer_id
  FROM profiles
  WHERE id = p_user_id;

  IF v_referrer_id IS NOT NULL THEN
    UPDATE profiles
    SET balance = balance + v_commission
    WHERE id = v_referrer_id;

    INSERT INTO transactions (user_id, type, amount, status, description)
    VALUES (
      v_referrer_id,
      'referral_commission',
      v_commission,
      'completed',
      format('Referral commission from %s', v_profile.email)
    );
  END IF;

  UPDATE vip_purchases
  SET completed_products_count = (
    SELECT COALESCE(SUM(completed_count), 0)
    FROM product_progress
    WHERE vip_purchase_id = p_vip_purchase_id
  ),
  products_completed = products_completed + 1
  WHERE id = p_vip_purchase_id;

  DECLARE
    v_total_completed integer;
    v_total_required integer;
  BEGIN
    SELECT 
      COALESCE(SUM(pp.completed_count), 0),
      vp.total_products
    INTO v_total_completed, v_total_required
    FROM vip_purchases vp
    LEFT JOIN product_progress pp ON pp.vip_purchase_id = vp.id
    WHERE vp.id = p_vip_purchase_id
    GROUP BY vp.total_products;

    IF v_total_completed >= v_total_required THEN
      UPDATE vip_purchases
      SET status = 'completed',
          is_completed = true
      WHERE id = p_vip_purchase_id;
    END IF;
  END;

  RETURN jsonb_build_object(
    'success', true,
    'commission', v_commission,
    'new_balance', (SELECT balance FROM profiles WHERE id = p_user_id),
    'price_paid', v_actual_price,
    'position', v_current_position,
    'combo_applied', FOUND
  );
END;
$$;