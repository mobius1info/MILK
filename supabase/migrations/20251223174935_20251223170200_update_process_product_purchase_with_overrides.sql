/*
  # Update process_product_purchase to use individual combo overrides

  1. Changes
    - Check for active combo override for the VIP purchase first
    - If override exists, use its settings
    - If no override, fall back to profile's global combo settings
    - Keep all other logic the same
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
  v_is_combo boolean := false;
  v_combo_multiplier integer := 1;
  v_override RECORD;
  v_combo_price numeric;
  v_actual_price numeric;
BEGIN
  -- Get product details
  SELECT * INTO v_product
  FROM products
  WHERE id = p_product_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Product not found'
    );
  END IF;

  -- Get user profile
  SELECT * INTO v_profile
  FROM profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Profile not found'
    );
  END IF;

  -- Get VIP purchase details
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

  -- Check for individual combo override first
  SELECT * INTO v_override
  FROM vip_purchase_combo_overrides
  WHERE vip_purchase_id = p_vip_purchase_id
    AND is_active = true
  ORDER BY created_at DESC
  LIMIT 1;

  -- If override exists, use its settings
  IF FOUND THEN
    v_is_combo := v_override.combo_enabled;
    v_combo_multiplier := v_override.combo_multiplier;
  ELSE
    -- Fall back to profile's global combo settings
    v_is_combo := COALESCE(v_profile.combo_enabled, false);
    v_combo_multiplier := COALESCE(v_profile.combo_multiplier, 1);
  END IF;

  -- Get or create progress record for this product
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

  -- Check if already completed
  IF v_progress.completed_count >= COALESCE(v_product.quantity_multiplier, 1) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Product already completed'
    );
  END IF;

  -- Calculate actual price
  v_actual_price := v_product.price;

  -- Check if this is a combo (enabled AND position > 1)
  IF v_is_combo AND v_combo_multiplier > 1 THEN
    v_combo_price := v_vip_purchase.vip_price * v_combo_multiplier;
    v_actual_price := v_combo_price;
  END IF;

  -- Update progress
  UPDATE product_progress
  SET completed_count = completed_count + 1,
      updated_at = now()
  WHERE user_id = p_user_id
    AND product_id = p_product_id
    AND vip_purchase_id = p_vip_purchase_id;

  -- Calculate commission
  v_commission := v_vip_purchase.vip_price * (COALESCE(v_product.commission_percentage, 0) / 100.0);

  -- Credit commission
  UPDATE profiles
  SET balance = balance + v_commission
  WHERE id = p_user_id;

  -- Record commission transaction
  INSERT INTO transactions (user_id, type, amount, status, description)
  VALUES (
    p_user_id,
    'commission',
    v_commission,
    'completed',
    format('Commission from %s (%.2f%%)', v_product.name, COALESCE(v_product.commission_percentage, 0))
  );

  -- Handle referral commission
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

  -- Update VIP purchase completion count
  UPDATE vip_purchases
  SET completed_products_count = (
    SELECT COALESCE(SUM(completed_count), 0)
    FROM product_progress
    WHERE vip_purchase_id = p_vip_purchase_id
  )
  WHERE id = p_vip_purchase_id;

  -- Check if VIP purchase is fully completed
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
    'new_balance', (SELECT balance FROM profiles WHERE id = p_user_id)
  );
END;
$$;