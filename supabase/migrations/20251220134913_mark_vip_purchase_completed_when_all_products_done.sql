/*
  # Mark VIP Purchase as Completed When All Products Are Done
  
  ## Overview
  This migration updates the `process_product_purchase` function to mark the corresponding
  VIP purchase as completed when all products have been purchased.
  
  ## Changes
  1. Find the corresponding vip_purchase record for the category and level
  2. Update the vip_purchase.is_completed flag when all products are done
  3. This allows users to repurchase the same VIP level after completion
  
  ## Purpose
  - Allow users to see "completed" status in Orders Record
  - Enable repurchase of the same VIP level after completing all products
  - Maintain consistency between product_progress and vip_purchases tables
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
  v_next_index integer;
  v_purchased_count integer;
  v_commission_multiplier decimal;
  v_base_commission decimal;
  v_final_commission decimal;
  v_is_ninth_product boolean;
  v_requires_deposit boolean;
  v_total_products integer;
  v_is_completed boolean;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
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
  
  v_base_commission := (v_product.price * v_product.commission_percentage / 100.0);
  
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
  
  IF v_is_ninth_product THEN
    v_commission_multiplier := 3;
    v_requires_deposit := true;
  ELSE
    v_commission_multiplier := 1;
    v_requires_deposit := false;
  END IF;
  
  v_final_commission := v_base_commission * v_commission_multiplier;
  
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
    v_product.price,
    v_final_commission,
    v_product.commission_percentage,
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
  
  IF NOT v_requires_deposit THEN
    UPDATE profiles
    SET balance = balance + v_final_commission
    WHERE id = v_user_id;
    
    INSERT INTO transactions (user_id, type, amount, status, description)
    VALUES (
      v_user_id,
      'commission',
      v_final_commission,
      'approved',
      format('Commission earned: %s (VIP %s)', v_product.name, p_vip_level)
    );
  END IF;
  
  v_is_completed := (v_purchased_count >= v_total_products);
  
  IF v_is_completed THEN
    UPDATE vip_purchases
    SET 
      is_completed = true,
      completed_products_count = v_total_products
    WHERE user_id = v_user_id
      AND category_id = p_category_id
      AND vip_level = p_vip_level
      AND status = 'approved'
      AND is_completed = false;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'commission', v_final_commission,
    'base_commission', v_base_commission,
    'is_ninth_product', v_is_ninth_product,
    'requires_deposit', v_requires_deposit,
    'products_purchased', v_purchased_count,
    'total_products', v_total_products,
    'next_product_index', v_next_index,
    'is_completed', v_is_completed,
    'message', CASE 
      WHEN v_is_completed THEN 'Все товары в этой категории завершены!'
      WHEN v_requires_deposit THEN 'Нужно пополнить счет для перехода на уровень ВИП ' || (p_vip_level + 1)::text
      ELSE 'Комиссия зачислена на баланс'
    END
  );
END;
$$;