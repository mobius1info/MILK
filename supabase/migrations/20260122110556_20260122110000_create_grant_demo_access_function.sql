/*
  # Create grant_demo_access Function

  1. New Function
    - grant_demo_access(user_email, vip_level_id) - Admin function to grant demo VIP access
    - Grants approved VIP purchase with $0 payment
    - Creates product progress tracking
    - Enables category access
    - Completes any existing active purchases for that category first

  2. Security
    - SECURITY DEFINER with search_path = public
    - Only admins can execute
    - Validates admin role from auth.users app_metadata
*/

CREATE OR REPLACE FUNCTION grant_demo_access(
  user_email text,
  vip_level_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
  vip_level_data record;
  existing_demo_purchase record;
  new_purchase_id uuid;
BEGIN
  -- Check if caller is admin
  IF (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) != 'admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only admins can grant demo access'
    );
  END IF;

  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found with email: ' || user_email
    );
  END IF;

  -- Get VIP level data
  SELECT * INTO vip_level_data
  FROM vip_levels
  WHERE id = grant_demo_access.vip_level_id
    AND is_active = true;

  IF vip_level_data IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'VIP level not found or inactive'
    );
  END IF;

  -- Check if user already has demo access for this level
  SELECT * INTO existing_demo_purchase
  FROM vip_purchases
  WHERE user_id = target_user_id
    AND vip_level = vip_level_data.level
    AND category_id = vip_level_data.category
    AND amount_paid = 0
  LIMIT 1;

  IF existing_demo_purchase IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User already received demo access for this VIP level'
    );
  END IF;

  -- Complete any existing active purchases for this category/level
  UPDATE vip_purchases
  SET is_completed = true
  WHERE user_id = target_user_id
    AND vip_level = vip_level_data.level
    AND category_id = vip_level_data.category
    AND status != 'rejected'
    AND is_completed = false;

  -- Create new VIP purchase with demo access
  INSERT INTO vip_purchases (
    user_id,
    vip_level_id,
    vip_level,
    category_id,
    vip_price,
    amount_paid,
    total_products,
    completed_products_count,
    status,
    is_completed,
    combo_enabled_at_approval,
    combo_position_at_approval,
    combo_multiplier_at_approval,
    combo_deposit_percent_at_approval
  )
  VALUES (
    target_user_id,
    grant_demo_access.vip_level_id,
    vip_level_data.level,
    vip_level_data.category,
    vip_level_data.price,
    0,
    vip_level_data.products_count,
    0,
    'approved',
    false,
    false,
    NULL,
    NULL,
    NULL
  )
  RETURNING id INTO new_purchase_id;

  -- Create product progress tracking
  INSERT INTO product_progress (
    user_id,
    vip_purchase_id,
    current_product_index,
    products_purchased,
    total_commission_earned,
    last_product_at,
    total_products
  )
  VALUES (
    target_user_id,
    new_purchase_id,
    0,
    0,
    0,
    now(),
    vip_level_data.products_count
  );

  -- Enable category access
  INSERT INTO category_access (
    user_id,
    category,
    is_enabled
  )
  VALUES (
    target_user_id,
    vip_level_data.category,
    true
  )
  ON CONFLICT (user_id, category)
  DO UPDATE SET
    is_enabled = true;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Demo access granted successfully',
    'purchase_id', new_purchase_id
  );
END;
$$;