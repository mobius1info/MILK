/*
  # Create Database Functions

  1. Functions Created
    - add_balance_to_user - Adds balance to user account
    - process_product_purchase - Processes product purchase with commission
    
  2. Purpose
    - Admin can manually add balance to users
    - System can process VIP product purchases with commission tracking
*/

-- Function to add balance to user
CREATE OR REPLACE FUNCTION add_balance_to_user(
  p_user_id UUID,
  p_amount DECIMAL(10,2),
  p_description TEXT DEFAULT 'Manual balance credit'
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_new_balance DECIMAL(10,2);
BEGIN
  -- Validate amount is positive
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Amount must be positive'
    );
  END IF;

  -- Update user balance
  UPDATE profiles
  SET balance = balance + p_amount
  WHERE id = p_user_id
  RETURNING balance INTO v_new_balance;

  -- Check if user exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Create transaction record
  INSERT INTO transactions (user_id, amount, type, description, status)
  VALUES (p_user_id, p_amount, 'deposit', p_description, 'completed');

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process product purchase
CREATE OR REPLACE FUNCTION process_product_purchase(
  p_user_id UUID,
  p_vip_purchase_id UUID,
  p_product_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_product RECORD;
  v_vip_purchase RECORD;
  v_vip_level RECORD;
  v_user_balance DECIMAL(10,2);
  v_commission DECIMAL(10,2);
  v_quantity INTEGER;
  v_total_price DECIMAL(10,2);
  v_products_completed INTEGER;
  v_total_products INTEGER;
  v_purchase_id UUID;
BEGIN
  -- Get user balance
  SELECT balance INTO v_user_balance
  FROM profiles
  WHERE id = p_user_id;

  -- Get VIP purchase details
  SELECT * INTO v_vip_purchase
  FROM vip_purchases
  WHERE id = p_vip_purchase_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'VIP purchase not found');
  END IF;

  -- Get VIP level details
  SELECT * INTO v_vip_level
  FROM vip_levels
  WHERE id = v_vip_purchase.vip_level_id;

  -- Get product details
  SELECT * INTO v_product
  FROM products
  WHERE id = p_product_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not found');
  END IF;

  -- Calculate quantity and total price
  v_quantity := COALESCE(v_product.quantity_multiplier, 1);
  v_total_price := v_product.price * v_quantity;

  -- Check if user has enough balance
  IF v_user_balance < v_total_price THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  -- Calculate commission
  v_commission := v_total_price * (v_product.commission_percentage / 100.0);

  -- Deduct from balance
  UPDATE profiles
  SET balance = balance - v_total_price
  WHERE id = p_user_id;

  -- Create product purchase record
  INSERT INTO product_purchases (
    user_id,
    vip_purchase_id,
    product_id,
    quantity,
    price_paid,
    commission_earned,
    status,
    completed_at
  ) VALUES (
    p_user_id,
    p_vip_purchase_id,
    p_product_id,
    v_quantity,
    v_total_price,
    v_commission,
    'completed',
    now()
  ) RETURNING id INTO v_purchase_id;

  -- Create transaction for purchase
  INSERT INTO transactions (user_id, amount, type, description, status)
  VALUES (
    p_user_id,
    -v_total_price,
    'purchase',
    format('Product purchase: %s (x%s)', v_product.name, v_quantity),
    'completed'
  );

  -- Add commission to balance
  UPDATE profiles
  SET balance = balance + v_commission
  WHERE id = p_user_id;

  -- Create transaction for commission
  INSERT INTO transactions (user_id, amount, type, description, status)
  VALUES (
    p_user_id,
    v_commission,
    'commission',
    format('Commission from %s (x%s)', v_product.name, v_quantity),
    'completed'
  );

  -- Update VIP purchase progress
  SELECT 
    COUNT(*)::INTEGER,
    v_vip_level.products_count
  INTO 
    v_products_completed,
    v_total_products
  FROM product_purchases
  WHERE vip_purchase_id = p_vip_purchase_id 
    AND status = 'completed';

  UPDATE vip_purchases
  SET 
    products_completed = v_products_completed,
    total_products = v_total_products,
    updated_at = now()
  WHERE id = p_vip_purchase_id;

  RETURN jsonb_build_object(
    'success', true,
    'purchase_id', v_purchase_id,
    'commission', v_commission,
    'new_balance', v_user_balance - v_total_price + v_commission,
    'progress', jsonb_build_object(
      'completed', v_products_completed,
      'total', v_total_products
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;