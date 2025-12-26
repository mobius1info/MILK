/*
  # Fix combo balance check - verify before purchase
  
  1. Changes
    - Move balance check to the beginning for combo products
    - Check CURRENT balance (before commission), not after
    - Reject immediately if insufficient funds
    - Allow purchase if sufficient funds WITHOUT deducting balance
  
  2. Logic Flow
    - Regular products (#1, #3, #4, #5): Already approved, no balance check needed ✅
    - Combo product (#2): 
      * Check if user has required amount on balance
      * If insufficient → Return error "Please top up your balance"
      * If sufficient → Allow purchase and earn commission, but DON'T deduct money
      * This is just a "proof of funds" check, not an actual deduction
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
  -- Get product
  SELECT * INTO v_product FROM products WHERE id = p_product_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not found');
  END IF;

  -- Get VIP purchase
  SELECT * INTO v_vip_purchase FROM vip_purchases WHERE id = p_vip_purchase_id AND user_id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'VIP purchase not found');
  END IF;

  IF v_vip_purchase.status != 'approved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'VIP purchase not approved');
  END IF;

  -- Get VIP level
  SELECT * INTO v_vip_level 
  FROM vip_levels 
  WHERE level = v_vip_purchase.vip_level 
    AND category = v_vip_purchase.category_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'VIP level not found');
  END IF;

  -- Get user profile
  SELECT * INTO v_user_profile FROM profiles WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User profile not found');
  END IF;

  -- Determine current product position
  v_current_product_index := COALESCE(v_vip_purchase.completed_products_count, 0) + 1;
  v_total_products := v_vip_level.products_count;

  -- Check if this is a combo product
  SELECT * INTO v_combo_setting
  FROM vip_combo_settings
  WHERE vip_purchase_id = p_vip_purchase_id
    AND combo_position = v_current_product_index
    AND is_completed = false;

  IF FOUND THEN
    v_is_combo_product := true;
    v_combo_multiplier := v_combo_setting.combo_multiplier;
    v_combo_deposit_required := (v_vip_purchase.vip_price * v_combo_setting.combo_deposit_percent / 100.0);
    
    -- ⚠️ CRITICAL: For combo products, check balance BEFORE allowing purchase
    -- This is a "proof of funds" check - we verify the user HAS the money
    -- but we DON'T actually deduct it from their balance
    IF v_combo_deposit_required > 0 AND v_user_profile.balance < v_combo_deposit_required THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Insufficient balance',
        'message', format('Please top up your balance. Required: $%s, Current: $%s', 
          v_combo_deposit_required,
          v_user_profile.balance
        ),
        'required_amount', v_combo_deposit_required,
        'current_balance', v_user_profile.balance,
        'is_combo', true,
        'combo_multiplier', v_combo_multiplier
      );
    END IF;
  END IF;

  -- Insert product purchase record (no balance deduction for any product)
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

  -- Check if product is fully purchased
  SELECT COALESCE(SUM(quantity), 0) INTO v_quantity_purchased
  FROM product_purchases
  WHERE user_id = p_user_id
    AND product_id = p_product_id
    AND vip_purchase_id = p_vip_purchase_id
    AND status = 'completed';

  v_quantity_needed := v_product.quantity_multiplier;
  v_is_product_complete := (v_quantity_purchased >= v_quantity_needed);

  -- If product is complete, award commission
  IF v_is_product_complete THEN
    -- Calculate base commission from VIP price
    v_commission_amount := (v_vip_purchase.vip_price * v_vip_level.commission_percentage / 100.0);
    
    -- Apply combo multiplier if this is a combo product
    IF v_is_combo_product THEN
      v_commission_amount := v_commission_amount * v_combo_multiplier;
    END IF;

    v_total_commission := v_commission_amount;

    -- Add referral bonus if applicable
    SELECT referred_by INTO v_referrer_id FROM profiles WHERE id = p_user_id;
    
    IF v_referrer_id IS NOT NULL THEN
      v_total_commission := v_total_commission * 1.50;
    END IF;

    -- Credit commission to user's balance
    UPDATE profiles 
    SET balance = balance + v_total_commission
    WHERE id = p_user_id
    RETURNING balance INTO v_new_balance;

    -- Record commission transaction
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

    -- Update completed products count
    UPDATE vip_purchases
    SET completed_products_count = COALESCE(completed_products_count, 0) + 1
    WHERE id = p_vip_purchase_id;

    -- Mark combo setting as completed
    IF v_is_combo_product THEN
      UPDATE vip_combo_settings
      SET is_completed = true
      WHERE id = v_combo_setting.id;
    END IF;

    -- Return success with commission details
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
    -- Product not yet complete
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
