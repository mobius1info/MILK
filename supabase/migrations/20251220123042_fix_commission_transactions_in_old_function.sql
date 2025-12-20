/*
  # Fix Commission Transactions in Product Purchase Function
  
  ## Overview
  This migration fixes the `process_product_purchase` function to properly create
  commission transaction records with correct amounts instead of relying solely on
  balance updates.
  
  ## Changes
  1. Update `process_product_purchase(p_category_id, p_vip_level, p_product_id)` function
  2. Add transaction record creation for commission earnings
  3. Ensure commission amounts are properly tracked in transaction history
  
  ## Purpose
  - Fix issue where commission transactions show $0.00 in transaction history
  - Provide proper audit trail for all commission earnings
  - Match behavior with newer process_product_purchase function variant
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
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
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
    is_ninth_product
  ) VALUES (
    v_user_id,
    p_product_id,
    p_category_id,
    p_vip_level,
    v_product.price,
    v_final_commission,
    v_product.commission_percentage,
    v_is_ninth_product
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
  
  RETURN jsonb_build_object(
    'success', true,
    'commission', v_final_commission,
    'base_commission', v_base_commission,
    'is_ninth_product', v_is_ninth_product,
    'requires_deposit', v_requires_deposit,
    'products_purchased', v_purchased_count,
    'next_product_index', v_next_index,
    'message', CASE 
      WHEN v_requires_deposit THEN 'Нужно пополнить счет для перехода на уровень ВИП ' || (p_vip_level + 1)::text
      ELSE 'Комиссия зачислена на баланс'
    END
  );
END;
$$;