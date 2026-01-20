/*
  # Database Functions and Triggers
  
  1. Functions:
    - handle_new_user: Creates profile when new user registers
    - update_updated_at_column: Updates timestamp on row changes
    - add_balance_to_user: Adds balance to user account
    - approve_vip_purchase: Approves VIP purchase with combo settings
    - process_product_purchase: Processes product purchase with commission
    - keep_database_active: Keeps database active for cron jobs
    
  2. Triggers:
    - on_auth_user_created: Creates profile on user signup
    - update_profiles_updated_at: Updates timestamp on profile changes
*/

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_referral_code TEXT;
  new_username TEXT;
  base_username TEXT;
  username_suffix TEXT;
  user_full_name TEXT;
  user_referred_by UUID;
BEGIN
  new_referral_code := substring(md5(random()::text || NEW.id::text) from 1 for 8);
  base_username := split_part(NEW.email, '@', 1);
  username_suffix := substring(NEW.id::text from 1 for 6);
  new_username := base_username || '_' || username_suffix;
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');

  IF NEW.raw_user_meta_data->>'referred_by' IS NOT NULL AND
     NEW.raw_user_meta_data->>'referred_by' != '' THEN
    user_referred_by := (NEW.raw_user_meta_data->>'referred_by')::UUID;
  ELSE
    user_referred_by := NULL;
  END IF;

  INSERT INTO public.profiles (id, email, username, role, referral_code, full_name, referred_by)
  VALUES (
    NEW.id,
    NEW.email,
    new_username,
    'client',
    new_referral_code,
    user_full_name,
    user_referred_by
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Function to add balance to user
CREATE OR REPLACE FUNCTION add_balance_to_user(p_user_id uuid, p_amount numeric, p_description text DEFAULT 'Manual balance credit')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_new_balance DECIMAL(10,2);
BEGIN
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Amount must be positive'
    );
  END IF;

  UPDATE profiles
  SET balance = balance + p_amount
  WHERE id = p_user_id
  RETURNING balance INTO v_new_balance;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  INSERT INTO transactions (user_id, amount, type, description, status)
  VALUES (p_user_id, p_amount, 'deposit', p_description, 'completed');

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance
  );
END;
$$;

-- Function to approve VIP purchase
CREATE OR REPLACE FUNCTION approve_vip_purchase(
  p_vip_purchase_id uuid,
  p_admin_id uuid,
  p_combo_enabled boolean,
  p_combo_position integer,
  p_combo_multiplier numeric,
  p_combo_deposit_percent numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_vip_purchase vip_purchases%ROWTYPE;
  v_user_balance numeric;
  v_vip_price numeric;
  v_completed_count integer := 0;
BEGIN
  SELECT * INTO v_vip_purchase
  FROM vip_purchases
  WHERE id = p_vip_purchase_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'VIP purchase not found'
    );
  END IF;

  SELECT balance INTO v_user_balance
  FROM profiles
  WHERE id = v_vip_purchase.user_id;

  v_vip_price := COALESCE(v_vip_purchase.vip_price, 0);

  IF v_user_balance < v_vip_price THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient balance',
      'required', v_vip_price,
      'available', v_user_balance
    );
  END IF;

  WITH completed_vips AS (
    UPDATE vip_purchases
    SET is_completed = true
    WHERE user_id = v_vip_purchase.user_id
      AND vip_level = v_vip_purchase.vip_level
      AND category_id = v_vip_purchase.category_id
      AND status != 'rejected'
      AND is_completed = false
      AND id != p_vip_purchase_id
    RETURNING id
  )
  SELECT COUNT(*) INTO v_completed_count FROM completed_vips;

  UPDATE vip_purchases
  SET
    status = 'approved',
    approved_at = now(),
    approved_by = p_admin_id,
    combo_enabled_at_approval = p_combo_enabled,
    combo_position_at_approval = p_combo_position,
    combo_multiplier_at_approval = p_combo_multiplier,
    combo_deposit_percent_at_approval = p_combo_deposit_percent
  WHERE id = p_vip_purchase_id;

  INSERT INTO category_access (user_id, category, is_enabled)
  VALUES (v_vip_purchase.user_id, v_vip_purchase.category_id, true)
  ON CONFLICT (user_id, category) DO UPDATE
  SET is_enabled = true;

  IF p_combo_enabled THEN
    INSERT INTO vip_combo_settings (
      vip_purchase_id,
      combo_position,
      combo_multiplier,
      combo_deposit_percent,
      is_completed,
      created_by
    ) VALUES (
      p_vip_purchase_id,
      p_combo_position,
      p_combo_multiplier,
      p_combo_deposit_percent,
      false,
      p_admin_id
    )
    ON CONFLICT (vip_purchase_id, combo_position) DO UPDATE
    SET
      combo_multiplier = p_combo_multiplier,
      combo_deposit_percent = p_combo_deposit_percent;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'completed_old_vips', v_completed_count,
    'combo_updated', p_combo_enabled,
    'message', format('VIP approved. %s old VIP(s) completed. Combo %s.',
      v_completed_count,
      CASE WHEN p_combo_enabled THEN 'ENABLED' ELSE 'DISABLED' END)
  );
END;
$$;

-- Function to process product purchase
CREATE OR REPLACE FUNCTION process_product_purchase(p_user_id uuid, p_vip_purchase_id uuid, p_product_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
  SELECT balance INTO v_user_balance
  FROM profiles
  WHERE id = p_user_id;

  SELECT * INTO v_vip_purchase
  FROM vip_purchases
  WHERE id = p_vip_purchase_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'VIP purchase not found');
  END IF;

  SELECT * INTO v_vip_level
  FROM vip_levels
  WHERE id = v_vip_purchase.vip_level_id;

  SELECT * INTO v_product
  FROM products
  WHERE id = p_product_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not found');
  END IF;

  v_quantity := COALESCE(v_product.quantity_multiplier, 1);
  v_total_price := v_product.price * v_quantity;

  IF v_user_balance < v_total_price THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  v_commission := v_total_price * (v_product.commission_percentage / 100.0);

  UPDATE profiles
  SET balance = balance - v_total_price
  WHERE id = p_user_id;

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

  INSERT INTO transactions (user_id, amount, type, description, status)
  VALUES (
    p_user_id,
    -v_total_price,
    'purchase',
    format('Product purchase: %s (x%s)', v_product.name, v_quantity),
    'completed'
  );

  UPDATE profiles
  SET balance = balance + v_commission
  WHERE id = p_user_id;

  INSERT INTO transactions (user_id, amount, type, description, status)
  VALUES (
    p_user_id,
    v_commission,
    'commission',
    format('Commission from %s (x%s)', v_product.name, v_quantity),
    'completed'
  );

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
$$;

-- Function to keep database active
CREATE OR REPLACE FUNCTION keep_database_active()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO activity_log (activity_type, details)
  VALUES (
    'keep_alive_ping',
    jsonb_build_object(
      'timestamp', now(),
      'user_count', (SELECT COUNT(*) FROM profiles),
      'vip_purchases_count', (SELECT COUNT(*) FROM vip_purchases)
    )
  );

  DELETE FROM activity_log
  WHERE created_at < now() - interval '30 days';
END;
$$;

-- Create trigger on auth.users for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create trigger for updating profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
