/*
  # Update Product Purchase Logic with Progress Tracking

  1. Changes
    - Update `process_product_purchase` function to track completed products
    - Increment `completed_products_count` on each product purchase
    - Set `is_completed` to true when all products are completed
    - When VIP is completed, allow it to be repurchased (reset progress)

  2. Purpose
    - Track user progress through VIP level products
    - Mark VIP purchase as completed when all tasks are done
    - Enable VIP level repurchase after completion
*/

CREATE OR REPLACE FUNCTION process_product_purchase(
  p_user_id UUID,
  p_product_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product RECORD;
  v_user_profile RECORD;
  v_commission DECIMAL;
  v_referrer_id UUID;
  v_referrer_commission DECIMAL;
  v_vip_purchase RECORD;
  v_vip_level RECORD;
  v_is_ninth_product BOOLEAN := false;
  v_product_number INTEGER := 0;
  v_total_products INTEGER := 0;
  v_result JSON;
BEGIN
  SELECT * INTO v_product FROM products WHERE id = p_product_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Product not found');
  END IF;

  SELECT * INTO v_user_profile FROM profiles WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User profile not found');
  END IF;

  IF v_user_profile.balance < v_product.price THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  SELECT vp.*, vl.commission, vl.products_count
  INTO v_vip_purchase
  FROM vip_purchases vp
  JOIN vip_levels vl ON vl.level = vp.vip_level
  WHERE vp.user_id = p_user_id
    AND vp.category_id = v_product.category
    AND vp.status = 'approved'
    AND vp.is_completed = false
  ORDER BY vp.created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'No active VIP purchase found for this category');
  END IF;

  SELECT COUNT(*) + 1
  INTO v_product_number
  FROM product_purchases
  WHERE vip_purchase_id = v_vip_purchase.id;

  v_is_ninth_product := (v_product_number = 9);

  IF v_is_ninth_product THEN
    v_commission := (v_product.price * v_vip_purchase.commission / 100) * 3;
  ELSE
    v_commission := v_product.price * v_vip_purchase.commission / 100;
  END IF;

  UPDATE profiles
  SET balance = balance - v_product.price
  WHERE id = p_user_id;

  UPDATE profiles
  SET balance = balance + v_commission
  WHERE id = p_user_id;

  INSERT INTO transactions (user_id, type, amount, description)
  VALUES (
    p_user_id,
    'commission',
    v_commission,
    format('Commission from %s purchase (Product #%s%s)',
      v_product.name,
      v_product_number,
      CASE WHEN v_is_ninth_product THEN ' - 3x BONUS!' ELSE '' END
    )
  );

  INSERT INTO product_purchases (user_id, product_id, vip_purchase_id, purchase_price, commission_earned)
  VALUES (p_user_id, p_product_id, v_vip_purchase.id, v_product.price, v_commission);

  UPDATE vip_purchases
  SET completed_products_count = completed_products_count + 1,
      is_completed = (completed_products_count + 1 >= v_vip_purchase.products_count)
  WHERE id = v_vip_purchase.id;

  SELECT referrer_id INTO v_referrer_id FROM profiles WHERE id = p_user_id;

  IF v_referrer_id IS NOT NULL THEN
    v_referrer_commission := v_commission * 0.10;

    UPDATE profiles
    SET balance = balance + v_referrer_commission
    WHERE id = v_referrer_id;

    INSERT INTO transactions (user_id, type, amount, description)
    VALUES (
      v_referrer_id,
      'referral_commission',
      v_referrer_commission,
      format('Referral commission from %s purchase', v_user_profile.email)
    );
  END IF;

  v_result := json_build_object(
    'success', true,
    'commission', v_commission,
    'new_balance', (SELECT balance FROM profiles WHERE id = p_user_id),
    'referral_commission', COALESCE(v_referrer_commission, 0),
    'is_ninth_product', v_is_ninth_product,
    'product_number', v_product_number,
    'completed_count', v_vip_purchase.completed_products_count + 1,
    'total_count', v_vip_purchase.products_count,
    'is_completed', (v_vip_purchase.completed_products_count + 1 >= v_vip_purchase.products_count)
  );

  RETURN v_result;
END;
$$;
