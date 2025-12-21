/*
  # Fix Commission Calculation to Use VIP Level Commission
  
  1. Changes
    - Update process_product_purchase function to use commission from VIP level
    - Previously used product.commission_percentage (incorrect)
    - Now uses VIP level commission (correct)
    
  2. Logic
    - Get commission percentage from vip_levels table
    - Calculate commission: product_price * vip_level_commission / 100
    - For COMBO products: multiply by 3
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
  v_commission_multiplier decimal;
  v_base_commission decimal;
  v_final_commission decimal;
  v_product_price decimal;
  v_is_ninth_product boolean;
  v_requires_deposit boolean;
  v_total_products integer;
  v_is_completed boolean;
  v_vip_price decimal;
  v_needed_amount decimal;
  v_vip_commission_percentage decimal;
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
  
  v_vip_commission_percentage := v_vip_level_info.commission;
  
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
    v_vip_price := 100; -- Default fallback
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
      'error', 'Все товары в этой категории уже куплены',
      'is_completed', true
    );
  END IF;
  
  v_next_index := v_progress.current_product_index + 1;
  v_is_ninth_product := (v_purchased_count % 9 = 0);
  
  -- DYNAMIC PRICING LOGIC
  IF v_is_ninth_product THEN
    -- COMBO product: VIP price to 2x VIP price
    v_product_price := v_vip_price * (1.0 + random());
    v_commission_multiplier := 3;
    v_requires_deposit := true;
    
    -- Check if user has enough balance for COMBO product
    IF v_user_balance < v_product_price THEN
      v_needed_amount := v_product_price - v_user_balance;
      v_base_commission := (v_product_price * v_vip_commission_percentage / 100.0);
      v_final_commission := v_base_commission * 3;
      
      RETURN jsonb_build_object(
        'error', format('Данный товар КОМБО стоит $%.2f и комиссия за него x3 ($%.2f). Для покупки и продолжения выполнения задач вы должны пополнить счет на недостающую сумму: $%.2f', 
          v_product_price, v_final_commission, v_needed_amount),
        'requires_deposit', true,
        'product_price', v_product_price,
        'commission', v_final_commission,
        'needed_amount', v_needed_amount,
        'current_balance', v_user_balance
      );
    END IF;
  ELSE
    -- Regular product: 30% to 100% of VIP price
    v_product_price := v_vip_price * (0.3 + random() * 0.7);
    v_commission_multiplier := 1;
    v_requires_deposit := false;
  END IF;
  
  -- Calculate commission using VIP level commission percentage
  v_base_commission := (v_product_price * v_vip_commission_percentage / 100.0);
  v_final_commission := v_base_commission * v_commission_multiplier;
  
  -- Deduct product price from balance if it's 9th product
  IF v_is_ninth_product THEN
    UPDATE profiles
    SET balance = balance - v_product_price
    WHERE id = v_user_id;
  END IF;
  
  INSERT INTO product_purchases (
    user_id,
    product_id,
    category_id,
    vip_level,
    product_price,
    commission_earned,
    commission_percentage,
    is_ninth_product,
    quantity_count
  ) VALUES (
    v_user_id,
    p_product_id,
    p_category_id,
    p_vip_level,
    v_product_price,
    v_final_commission,
    v_vip_commission_percentage,
    v_is_ninth_product,
    1
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
    'approved',
    format('%sCommission earned: %s (VIP %s - %s%%)', 
      CASE WHEN v_is_ninth_product THEN 'КОМБО x3 - ' ELSE '' END,
      v_product.name, 
      p_vip_level,
      v_vip_commission_percentage)
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
    'is_ninth_product', v_is_ninth_product,
    'requires_deposit', false,
    'products_purchased', v_purchased_count,
    'total_products', v_total_products,
    'next_product_index', v_next_index,
    'is_completed', v_is_completed,
    'message', CASE 
      WHEN v_is_completed THEN 'Все товары в этой категории завершены!'
      WHEN v_is_ninth_product THEN format('КОМБО товар куплен за $%.2f! Комиссия x3 (%s%%): $%.2f зачислена на баланс', v_product_price, v_vip_commission_percentage, v_final_commission)
      ELSE format('Комиссия (%s%%): $%.2f зачислена на баланс', v_vip_commission_percentage, v_final_commission)
    END
  );
END;
$$;
