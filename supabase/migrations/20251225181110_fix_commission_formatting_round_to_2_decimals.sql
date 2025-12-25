/*
  # Fix Commission Number Formatting

  Round commission amounts to 2 decimal places to prevent
  displaying numbers like $24.000000000000000
*/

CREATE OR REPLACE FUNCTION process_product_purchase(p_user_id uuid, p_vip_purchase_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_vip_purchase vip_purchases%ROWTYPE;
  v_vip_level vip_levels%ROWTYPE;
  v_product products%ROWTYPE;
  v_current_progress product_progress%ROWTYPE;
  v_all_products_count integer;
  v_current_product_index integer;
  v_quantity_multiplier integer;
  v_commission_amount numeric;
  v_total_commission numeric;
  v_referrer_id uuid;
  v_new_balance numeric;
  v_is_combo_product boolean := false;
  v_combo_multiplier numeric := 1;
  v_combo_deposit_required numeric := 0;
  v_combo_setting vip_combo_settings%ROWTYPE;
BEGIN
  SELECT * INTO v_vip_purchase FROM vip_purchases WHERE id = p_vip_purchase_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'VIP purchase not found');
  END IF;

  IF v_vip_purchase.status != 'approved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'VIP purchase not approved');
  END IF;

  SELECT * INTO v_vip_level FROM vip_levels 
  WHERE category = v_vip_purchase.category_id AND level = v_vip_purchase.vip_level;

  v_all_products_count := v_vip_level.products_count;

  SELECT * INTO v_current_progress FROM product_progress 
  WHERE user_id = p_user_id AND vip_purchase_id = p_vip_purchase_id;

  IF NOT FOUND THEN
    INSERT INTO product_progress (user_id, vip_purchase_id, current_product_index, total_products)
    VALUES (p_user_id, p_vip_purchase_id, 0, v_all_products_count)
    RETURNING * INTO v_current_progress;
  END IF;

  v_current_product_index := COALESCE(v_current_progress.current_product_index, 0);

  IF v_current_product_index >= v_all_products_count THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'All products already completed',
      'products_purchased', v_all_products_count,
      'total_products', v_all_products_count,
      'is_completed', true
    );
  END IF;

  SELECT * INTO v_product FROM products 
  WHERE category = v_vip_purchase.category_id
  ORDER BY name
  OFFSET v_current_product_index
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not found');
  END IF;

  v_quantity_multiplier := COALESCE(v_product.quantity_multiplier, 1);

  SELECT * INTO v_combo_setting FROM vip_combo_settings
  WHERE vip_purchase_id = p_vip_purchase_id
  AND combo_position = (v_current_product_index + 1)
  AND is_completed = false
  LIMIT 1;

  IF FOUND THEN
    v_is_combo_product := true;
    v_combo_multiplier := v_combo_setting.combo_multiplier;
    v_combo_deposit_required := (v_vip_purchase.vip_price * v_combo_setting.combo_deposit_percent / 100.0);
  END IF;

  -- Commission per product = (VIP Price × VIP Commission %) ÷ Products Count
  v_commission_amount := (v_vip_purchase.vip_price * v_vip_level.commission_percentage / 100.0) / v_all_products_count;

  IF v_is_combo_product THEN
    v_commission_amount := v_commission_amount * v_combo_multiplier;
  END IF;

  v_total_commission := v_commission_amount;

  SELECT referred_by INTO v_referrer_id FROM profiles WHERE id = p_user_id;

  IF v_referrer_id IS NOT NULL THEN
    v_total_commission := v_total_commission * 1.50;
  END IF;

  -- Round to 2 decimal places
  v_total_commission := round(v_total_commission::numeric, 2);

  INSERT INTO product_purchases (
    user_id,
    product_id,
    vip_purchase_id,
    quantity,
    price_paid,
    commission_earned,
    status
  ) VALUES (
    p_user_id,
    v_product.id,
    p_vip_purchase_id,
    v_quantity_multiplier,
    v_product.price,
    v_total_commission,
    'completed'
  );

  INSERT INTO transactions (user_id, type, amount, description, status)
  VALUES (
    p_user_id,
    'commission',
    v_total_commission,
    format('Commission from %s', v_product.name),
    'completed'
  );

  UPDATE profiles
  SET balance = balance + v_total_commission
  WHERE id = p_user_id
  RETURNING balance INTO v_new_balance;

  v_current_product_index := v_current_product_index + 1;

  UPDATE product_progress
  SET 
    current_product_index = v_current_product_index,
    total_commission_earned = COALESCE(total_commission_earned, 0) + v_total_commission,
    updated_at = now()
  WHERE user_id = p_user_id AND vip_purchase_id = p_vip_purchase_id;

  -- Check if all products are now completed
  IF v_current_product_index >= v_all_products_count THEN
    UPDATE vip_purchases
    SET completed_products_count = COALESCE(completed_products_count, 0) + 1
    WHERE id = p_vip_purchase_id;
  END IF;

  IF v_is_combo_product THEN
    UPDATE vip_combo_settings
    SET is_completed = true
    WHERE id = v_combo_setting.id;
  END IF;

  -- Always return product completion info with rounded values
  RETURN jsonb_build_object(
    'success', true,
    'commission', round(v_total_commission::numeric, 2),
    'product_price', round(v_product.price::numeric, 2),
    'new_balance', round(v_new_balance::numeric, 2),
    'is_combo', v_is_combo_product,
    'combo_multiplier', v_combo_multiplier,
    'products_purchased', v_current_product_index,
    'total_products', v_all_products_count,
    'is_completed', (v_current_product_index >= v_all_products_count),
    'message', format('Product completed! Earned $%s%s', 
      round(v_total_commission::numeric, 2),
      CASE WHEN v_is_combo_product THEN format(' (COMBO x%s)', v_combo_multiplier) ELSE '' END
    )
  );
END;
$$;