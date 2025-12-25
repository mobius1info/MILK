/*
  # Fix process_product_purchase return fields
  
  1. Changes
    - Update return fields to match client expectations
    - Add product_price, commission, is_completed, products_purchased, total_products
    - Keep backward compatibility with is_combo and combo_multiplier
  
  2. Notes
    - Client expects: product_price, commission, is_completed, products_purchased, total_products
    - Keep new fields for combo support
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
  v_vip_purchase RECORD;
  v_vip_level RECORD;
  v_user_profile RECORD;
  v_quantity_purchased integer;
  v_quantity_needed integer;
  v_is_product_complete boolean;
  v_current_product_index integer;
  v_commission_amount decimal(10,2);
  v_is_combo_product boolean := false;
  v_combo_multiplier integer := 1;
  v_combo_deposit_required decimal(10,2) := 0;
  v_combo_setting RECORD;
  v_total_commission decimal(10,2);
  v_referrer_id uuid;
  v_new_balance decimal(10,2);
  v_total_products integer;
BEGIN
  SELECT * INTO v_product FROM products WHERE id = p_product_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not found');
  END IF;

  SELECT * INTO v_vip_purchase FROM vip_purchases WHERE id = p_vip_purchase_id AND user_id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'VIP purchase not found');
  END IF;

  IF v_vip_purchase.status != 'approved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'VIP purchase not approved');
  END IF;

  SELECT * INTO v_vip_level 
  FROM vip_levels 
  WHERE level = v_vip_purchase.vip_level 
    AND category = v_vip_purchase.category_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'VIP level not found');
  END IF;

  SELECT * INTO v_user_profile FROM profiles WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User profile not found');
  END IF;

  v_current_product_index := COALESCE(v_vip_purchase.completed_products_count, 0) + 1;
  v_total_products := v_vip_level.products_count;

  SELECT * INTO v_combo_setting
  FROM vip_combo_settings
  WHERE vip_purchase_id = p_vip_purchase_id
    AND combo_position = v_current_product_index
    AND is_completed = false;

  IF FOUND THEN
    v_is_combo_product := true;
    v_combo_multiplier := v_combo_setting.combo_multiplier;
    v_combo_deposit_required := (v_vip_purchase.vip_price * v_combo_setting.combo_deposit_percent / 100.0);
  END IF;

  -- Insert product purchase record (no balance deduction)
  INSERT INTO product_purchases (
    user_id,
    product_id,
    vip_purchase_id,
    quantity,
    price_paid,
    status
  ) VALUES (
    p_user_id,
    p_product_id,
    p_vip_purchase_id,
    v_product.quantity_multiplier,
    v_product.price,
    'completed'
  );

  SELECT COALESCE(SUM(quantity), 0) INTO v_quantity_purchased
  FROM product_purchases
  WHERE user_id = p_user_id
    AND product_id = p_product_id
    AND vip_purchase_id = p_vip_purchase_id
    AND status = 'completed';

  v_quantity_needed := v_product.quantity_multiplier;
  v_is_product_complete := (v_quantity_purchased >= v_quantity_needed);

  IF v_is_product_complete THEN
    v_commission_amount := (v_vip_purchase.vip_price * v_vip_level.commission_percentage / 100.0);
    
    IF v_is_combo_product THEN
      v_commission_amount := v_commission_amount * v_combo_multiplier;
    END IF;

    v_total_commission := v_commission_amount;

    SELECT referred_by INTO v_referrer_id FROM profiles WHERE id = p_user_id;
    
    IF v_referrer_id IS NOT NULL THEN
      v_total_commission := v_total_commission * 1.50;
    END IF;

    UPDATE profiles 
    SET balance = balance + v_total_commission
    WHERE id = p_user_id
    RETURNING balance INTO v_new_balance;

    INSERT INTO transactions (user_id, type, amount, status, description)
    VALUES (
      p_user_id,
      'commission',
      v_total_commission,
      'completed',
      format('Commission for %s (VIP %s) - Product #%s%s%s', 
        v_vip_purchase.category_id,
        v_vip_purchase.vip_level,
        v_current_product_index,
        CASE WHEN v_is_combo_product THEN format(' COMBO x%s', v_combo_multiplier) ELSE '' END,
        CASE WHEN v_referrer_id IS NOT NULL THEN ' +50% referral bonus' ELSE '' END
      )
    );

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
          'total_products', v_total_products,
          'is_completed', (v_current_product_index >= v_total_products),
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
      'total_products', v_total_products,
      'is_completed', (v_current_product_index >= v_total_products),
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
      'quantity_purchased', v_quantity_purchased,
      'quantity_needed', v_quantity_needed,
      'products_purchased', v_current_product_index - 1,
      'total_products', v_total_products,
      'is_completed', false,
      'message', format('Purchase successful. Progress: %s/%s', v_quantity_purchased, v_quantity_needed)
    );
  END IF;
END;
$$;