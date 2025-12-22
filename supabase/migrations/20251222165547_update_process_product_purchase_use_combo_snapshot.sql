/*
  # Update process_product_purchase to Use Combo Snapshot

  1. Changes
    - Read combo settings from vip_purchase.combo_*_at_approval fields
    - Only use combo if combo_enabled_at_approval = true
    - This ensures combo only works for VIPs approved AFTER admin enabled combo
  
  2. Logic
    - If VIP was approved before admin enabled combo → no combo for this VIP
    - If VIP was approved after admin enabled combo → combo works
    - Each VIP purchase has independent combo settings from approval time
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
  v_user_profile record;
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
  v_vip_commission_percentage decimal;
  v_combo_position integer;
  v_combo_enabled boolean;
  v_combo_deposit_percent integer;
  v_required_deposit decimal;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get VIP level info with commission percentage
  SELECT * INTO v_vip_level_info
  FROM vip_levels
  WHERE level = p_vip_level AND category = p_category_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'VIP level not found';
  END IF;
  
  v_vip_commission_percentage := COALESCE(v_vip_level_info.commission_percentage, 15);
  
  -- Get user profile for balance
  SELECT * INTO v_user_profile
  FROM profiles
  WHERE id = v_user_id;
  
  v_user_balance := v_user_profile.balance;
  
  -- Get VIP purchase info WITH COMBO SNAPSHOT from approval time
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
  
  -- Use combo settings from APPROVAL TIME (snapshot)
  v_combo_enabled := COALESCE(v_vip_purchase.combo_enabled_at_approval, false);
  v_combo_position := COALESCE(v_vip_purchase.combo_position_at_approval, 9);
  v_commission_multiplier := COALESCE(v_vip_purchase.combo_multiplier_at_approval, 3);
  v_combo_deposit_percent := COALESCE(v_vip_purchase.combo_deposit_percent_at_approval, 50);
  
  v_vip_price := v_vip_purchase.vip_price;
  
  IF v_vip_price IS NULL OR v_vip_price = 0 THEN
    v_vip_price := 100;
  END IF;
  
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
  
  -- Check if this is a COMBO product using SNAPSHOT settings
  v_is_combo_product := (v_purchased_count % v_combo_position = 0) AND v_combo_enabled;
  
  -- Calculate required deposit for COMBO (% of VIP price)
  v_required_deposit := (v_vip_price * v_combo_deposit_percent / 100.0);
  
  -- DYNAMIC PRICING LOGIC
  IF v_is_combo_product THEN
    -- COMBO product: VIP price to 2x VIP price
    v_product_price := v_vip_price * (1.0 + random());
    v_requires_deposit := (v_combo_deposit_percent > 0);
    
    -- Check if user has enough balance for COMBO product + required deposit
    IF v_requires_deposit AND v_user_balance < (v_product_price + v_required_deposit) THEN
      v_needed_amount := (v_product_price + v_required_deposit) - v_user_balance;
      
      -- Calculate commission using VIP commission percentage
      v_base_commission := (v_vip_price * v_vip_commission_percentage / 100.0) / v_total_products;
      v_final_commission := v_base_commission * v_commission_multiplier;
      
      RETURN jsonb_build_object(
        'error', format('COMBO product! Price: $%s, Commission: x%s ($%s). To continue, deposit %s%% of VIP price ($%s). Missing: $%s',
          round(v_product_price, 2), 
          v_commission_multiplier, 
          round(v_final_commission, 2),
          v_combo_deposit_percent,
          round(v_required_deposit, 2),
          round(v_needed_amount, 2)),
        'requires_deposit', true,
        'product_price', v_product_price,
        'commission', v_final_commission,
        'needed_amount', v_needed_amount,
        'current_balance', v_user_balance,
        'required_deposit', v_required_deposit
      );
    END IF;
  ELSE
    -- Regular product: 30% to 100% of VIP price
    v_product_price := v_vip_price * (0.3 + random() * 0.7);
    v_requires_deposit := false;
  END IF;
  
  -- Calculate commission using NEW formula: VIP price * commission_percentage / 25 tasks
  v_base_commission := (v_vip_price * v_vip_commission_percentage / 100.0) / v_total_products;
  
  IF v_is_combo_product THEN
    v_final_commission := v_base_commission * v_commission_multiplier;
  ELSE
    v_final_commission := v_base_commission;
  END IF;
  
  -- Deduct product price + deposit from balance if it's COMBO product with deposit requirement
  IF v_is_combo_product THEN
    IF v_requires_deposit THEN
      UPDATE profiles
      SET balance = balance - v_product_price - v_required_deposit
      WHERE id = v_user_id;
    ELSE
      UPDATE profiles
      SET balance = balance - v_product_price
      WHERE id = v_user_id;
    END IF;
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
    CASE WHEN v_is_combo_product AND v_requires_deposit THEN v_product_price + v_required_deposit ELSE v_product_price END,
    v_product_price,
    v_final_commission,
    v_vip_commission_percentage,
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
    format('%sCommission earned: %s (VIP %s - %s%%)',
      CASE WHEN v_is_combo_product THEN 'COMBO x' || v_commission_multiplier || ' - ' ELSE '' END,
      v_product.name,
      p_vip_level,
      v_vip_commission_percentage)
  );
  
  v_is_completed := (v_purchased_count >= v_total_products);
  
  -- If VIP purchase is completed, increment the user's VIP completions count
  IF v_is_completed THEN
    PERFORM increment_vip_completions(v_user_id);
  END IF;
  
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
      WHEN v_is_combo_product THEN format('COMBO product purchased for $%s! Commission x%s: $%s credited to balance', round(v_product_price, 2), v_commission_multiplier, round(v_final_commission, 2))
      ELSE format('Commission: $%s credited to balance', round(v_final_commission, 2))
    END
  );
END;
$$;
