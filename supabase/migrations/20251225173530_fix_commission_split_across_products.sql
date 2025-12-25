/*
  # Fix Commission - Split Total VIP Commission Across All Products

  Changes commission calculation to split the total VIP commission evenly across all products.
  
  Formula: Commission per product = (VIP Price × VIP Commission %) ÷ Products Count
  
  Examples:
  - VIP 1: ($100 × 15%) ÷ 25 = $0.60 per product
  - VIP 2: ($500 × 25%) ÷ 25 = $5.00 per product
  - VIP 3: ($2000 × 30%) ÷ 25 = $24.00 per product
  
  Product price does NOT affect commission - all products in a VIP level earn the same commission.
*/

CREATE OR REPLACE FUNCTION process_product_purchase(p_user_id uuid, p_vip_purchase_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  IF v_current_product_index >= v_all_products_count THEN
    UPDATE vip_purchases
    SET completed_products_count = COALESCE(completed_products_count, 0) + 1
    WHERE id = p_vip_purchase_id;

    IF v_is_combo_product THEN
      UPDATE vip_combo_settings
      SET is_completed = true
      WHERE id = v_combo_setting.id;
    END IF;

    IF v_is_combo_product AND v_combo_deposit_required > 0 THEN
      IF v_new_balance < v_combo_deposit_required THEN
        RETURN jsonb_build_object(
          'success', true,
          'product_complete', true,
          'commission_earned', v_total_commission,
          'commission', v_total_commission,
          'product_price', v_product.price,
          'new_balance', v_new_balance,
          'is_combo', true,
          'combo_multiplier', v_combo_multiplier,
          'requires_deposit', true,
          'deposit_amount', v_combo_deposit_required,
          'current_balance', v_new_balance,
          'products_purchased', v_current_product_index,
          'total_products', v_all_products_count,
          'is_completed', (v_current_product_index >= v_all_products_count),
          'message', format('COMBO x%s! Earned $%s. Deposit $%s required to continue.', 
            v_combo_multiplier, 
            v_total_commission,
            v_combo_deposit_required
          )
        );
      END IF;
    END IF;

    RETURN jsonb_build_object(
      'success', true,
      'product_complete', true,
      'commission_earned', v_total_commission,
      'commission', v_total_commission,
      'product_price', v_product.price,
      'new_balance', v_new_balance,
      'is_combo', v_is_combo_product,
      'combo_multiplier', v_combo_multiplier,
      'products_purchased', v_current_product_index,
      'total_products', v_all_products_count,
      'is_completed', (v_current_product_index >= v_all_products_count),
      'message', format('Product completed! Earned $%s%s', 
        v_total_commission,
        CASE WHEN v_is_combo_product THEN format(' (COMBO x%s)', v_combo_multiplier) ELSE '' END
      )
    );
  ELSE
    RETURN jsonb_build_object(
      'success', true,
      'product_complete', false,
      'product_price', v_product.price,
      'commission', 0,
      'new_balance', v_new_balance,
      'quantity_count', v_quantity_multiplier,
      'products_purchased', v_current_product_index,
      'total_products', v_all_products_count,
      'is_completed', false,
      'message', format('Processing %s (%s/%s)...', v_product.name, v_current_product_index, v_all_products_count)
    );
  END IF;
END;
$$;
