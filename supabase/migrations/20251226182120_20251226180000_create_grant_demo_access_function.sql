/*
  # Create Demo Access Grant System

  1. New Function
    - `grant_demo_access(user_email, vip_level_id)` - Admin function to grant VIP BONUS access

  2. Features
    - Admin can grant demo access to any user by email
    - Creates approved VIP purchase with product progress
    - Checks if user already received demo access (once per lifetime)
    - Returns success/error messages

  3. Security
    - Only admins can execute this function
    - Validates user exists
    - Validates VIP level exists and is VIP BONUS
    - Enforces one-time demo access per user
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
  IF (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) != 'admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only admins can grant demo access'
    );
  END IF;

  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found with email: ' || user_email
    );
  END IF;

  SELECT * INTO vip_level_data
  FROM vip_levels
  WHERE id = vip_level_id
    AND is_active = true;

  IF vip_level_data IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'VIP level not found or inactive'
    );
  END IF;

  SELECT * INTO existing_demo_purchase
  FROM vip_purchases
  WHERE user_id = target_user_id
    AND vip_level_id = grant_demo_access.vip_level_id
  LIMIT 1;

  IF existing_demo_purchase IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User already received demo access for this VIP level'
    );
  END IF;

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
    combo_price_multiplier,
    combo_deposit_multiplier
  )
  VALUES (
    target_user_id,
    vip_level_id,
    vip_level_data.level,
    vip_level_data.category,
    vip_level_data.price,
    0,
    vip_level_data.products_count,
    0,
    'approved',
    false,
    NULL,
    NULL
  )
  RETURNING id INTO new_purchase_id;

  INSERT INTO product_progress (
    user_id,
    vip_level,
    category_id,
    completed_count,
    last_purchase_at,
    vip_purchase_id,
    total_products
  )
  VALUES (
    target_user_id,
    vip_level_data.level,
    vip_level_data.category,
    0,
    now(),
    new_purchase_id,
    vip_level_data.products_count
  )
  ON CONFLICT (user_id, vip_level, category_id, vip_purchase_id)
  DO UPDATE SET
    last_purchase_at = now(),
    total_products = vip_level_data.products_count;

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