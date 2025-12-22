/*
  # Update Commission Calculation to Fixed 1% of VIP Price

  1. Changes
    - Each regular product gives exactly 1% of VIP price as commission
    - COMBO products give 3x commission (3% of VIP price by default)
    - Remove dependency on product price for commission calculation
    - Total earnings after 25 products: ~25% of VIP price

  2. Logic
    - Base commission = VIP price * 1%
    - COMBO commission = Base commission * multiplier
    - Commission no longer tied to random product prices
    - Predictable earnings for users
*/

CREATE OR REPLACE FUNCTION process_product_purchase(
  p_category_id text,
  p_vip_level integer,
  p_product_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_progress record;
  v_product record;
  v_vip_purchase record;
  v_vip_level_info record;
  v_user_balance decimal;
  v_next_index integer;
  v_purchased_count integer;
  v_commission_multiplier integer;
  v_base_commission decimal;
  v_final_commission decimal;
  v_product_price decimal;
  v_is_combo_product boolean;
  v_requires_deposit boolean;
  v_total_products integer;
  v_is_completed boolean;
  v_vip_price decimal;
  v_needed_amount decimal;
  v_combo_position integer;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get VIP level info with combo settings
  SELECT * INTO v_vip_level_info
  FROM vip_levels
  WHERE level = p_vip_level AND category = p_category_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'VIP level not found';
  END IF;
  
  v_combo_position := COALESCE(v_vip_level_info.combo_product_position, 9);
  v_commission_multiplier := COALESCE(v_vip_level_info.commission_multiplier, 3);
  
  -- Get VIP purchase info with vip_price
  SELECT * INTO v_vip_purchase
  FROM vip_purchases
  WHERE user_id = v_user_id
    AND category_id = p_category_id
    AND vip_level = p_vip_level
    AND status = 'approved'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'VIP purchase not found or not approved';
  END IF;
  
  v_vip_price := v_vip_purchase.vip_price;
  
  IF v_vip_price IS NULL OR v_vip_price = 0 THEN
    v_vip_price := 100;
  END IF;
  
  -- Get user balance
  SELECT balance INTO v_user_balance
  FROM profiles
  WHERE id = v_user_id;
  
  SELECT products_count INTO v_total_products
  FROM vip_levels
  WHERE level = p_vip_level AND category = p_category_id;
  
  IF v_total_products IS NULL THEN
    v_total_products := 25;
  END IF;
  
  SELECT * INTO v_product
  FROM products
  WHERE id = p_product_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  SELECT * INTO v_progress
  FROM product_progress
  WHERE user_id = v_user_id 
    AND category_id = p_category_id 
    AND vip_level = p_vip_level;
  
  IF NOT FOUND THEN
    INSERT INTO product_progress (user_id, vip_level, category_id)
    VALUES (v_user_id, p_vip_level, p_category_id)
    RETURNING * INTO v_progress;
  END IF;
  
  v_purchased_count := v_progress.products_purchased + 1;
  
  IF v_purchased_count > v_total_products THEN
    RETURN jsonb_build_object(
      'error', 'All products in this category have been purchased',
      'is_completed', true
    );
  END IF;
  
  v_next_index := v_progress.current_product_index + 1;
  
  -- Check if this is a COMBO product based on combo_position setting
  v_is_combo_product := (v_purchased_count % v_combo_position = 0);
  
  -- DYNAMIC PRICING LOGIC FOR PRODUCT PRICE (for display/COMBO charge)
  IF v_is_combo_product THEN
    -- COMBO product: VIP price to 2x VIP price
    v_product_price := v_vip_price * (1.0 + random());
    v_requires_deposit := true;
    
    -- Check if user has enough balance for COMBO product
    IF v_user_balance < v_product_price THEN
      v_needed_amount := v_product_price - v_user_balance;
      v_base_commission := v_vip_price * 0.01;
      v_final_commission := v_base_commission * v_commission_multiplier;
      
      RETURN jsonb_build_object(
        'error', format('This COMBO product costs $%s with x%s commission ($%s). To purchase and continue tasks, please deposit the missing amount: $%s',
          round(v_product_price, 2), v_commission_multiplier, round(v_final_commission, 2), round(v_needed_amount, 2)),
        'requires_deposit', true,
        'product_price', v_product_price,
        'commission', v_final_commission,
        'needed_amount', v_needed_amount,
        'current_balance', v_user_balance
      );
    END IF;
  ELSE
    -- Regular product: 30% to 100% of VIP price (for display only)
    v_product_price := v_vip_price * (0.3 + random() * 0.7);
    v_requires_deposit := false;
  END IF;
  
  -- NEW COMMISSION LOGIC: Fixed 1% of VIP price per product
  v_base_commission := v_vip_price * 0.01;
  
  IF v_is_combo_product THEN
    v_final_commission := v_base_commission * v_commission_multiplier;
  ELSE
    v_final_commission := v_base_commission;
  END IF;
  
  -- Deduct product price from balance if it's COMBO product
  IF v_is_combo_product THEN
    UPDATE profiles
    SET balance = balance - v_product_price
    WHERE id = v_user_id;
  END IF;
  
  -- Insert product purchase record
  INSERT INTO product_purchases (
    user_id,
    vip_purchase_id,
    product_id,
    category_id,
    vip_level,
    price_paid,
    product_price,
    commission_earned,
    commission_percentage,
    is_ninth_product,
    quantity_count,
    status
  ) VALUES (
    v_user_id,
    v_vip_purchase.id,
    p_product_id,
    p_category_id,
    p_vip_level,
    v_product_price,
    v_product_price,
    v_final_commission,
    1.0,
    v_is_combo_product,
    1,
    'completed'
  );
  
  UPDATE product_progress
  SET 
    current_product_index = v_next_index,
    products_purchased = v_purchased_count,
    total_commission_earned = total_commission_earned + v_final_commission,
    last_product_at = now(),
    updated_at = now()
  WHERE id = v_progress.id;
  
  -- Add commission to balance and create transaction
  UPDATE profiles
  SET balance = balance + v_final_commission
  WHERE id = v_user_id;
  
  INSERT INTO transactions (user_id, type, amount, status, description)
  VALUES (
    v_user_id,
    'commission',
    v_final_commission,
    'completed',
    format('%sCommission earned: %s (VIP %s - 1%% of $%s)',
      CASE WHEN v_is_combo_product THEN 'COMBO x' || v_commission_multiplier || ' - ' ELSE '' END,
      v_product.name,
      p_vip_level,
      round(v_vip_price, 2))
  );
  
  v_is_completed := (v_purchased_count >= v_total_products);
  
  UPDATE vip_purchases
  SET 
    completed_products_count = v_purchased_count,
    is_completed = v_is_completed
  WHERE user_id = v_user_id
    AND category_id = p_category_id
    AND vip_level = p_vip_level
    AND status = 'approved'
    AND is_completed = false;
  
  RETURN jsonb_build_object(
    'success', true,
    'commission', v_final_commission,
    'base_commission', v_base_commission,
    'product_price', v_product_price,
    'is_ninth_product', v_is_combo_product,
    'requires_deposit', false,
    'products_purchased', v_purchased_count,
    'total_products', v_total_products,
    'next_product_index', v_next_index,
    'is_completed', v_is_completed,
    'message', CASE
      WHEN v_is_completed THEN 'All products in this category completed!'
      WHEN v_is_combo_product THEN 'COMBO product purchased for $' || round(v_product_price, 2) || '! Commission x' || v_commission_multiplier || ' (1% of $' || round(v_vip_price, 2) || '): $' || round(v_final_commission, 2) || ' credited to balance'
      ELSE 'Commission (1% of $' || round(v_vip_price, 2) || '): $' || round(v_final_commission, 2) || ' credited to balance'
    END
  );
END;
$$;
