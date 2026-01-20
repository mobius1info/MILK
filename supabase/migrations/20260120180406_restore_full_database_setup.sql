/*
  # Restore Full Database Setup
  
  This migration restores the complete database structure to match
  FULL_DATABASE_SETUP.sql - ensuring all tables, functions, policies,
  and initial data are in place.
*/

-- ============================================================
-- SECTION 1: Ensure all table structures are correct
-- ============================================================

-- Add missing columns to profiles if needed
DO $$
BEGIN
  -- Check and add combo columns if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'combo_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN combo_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'combo_deposit_percent'
  ) THEN
    ALTER TABLE profiles ADD COLUMN combo_deposit_percent numeric DEFAULT 50;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'combo_product_position'
  ) THEN
    ALTER TABLE profiles ADD COLUMN combo_product_position integer DEFAULT 9;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'combo_multiplier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN combo_multiplier integer DEFAULT 3;
  END IF;
END $$;

-- Add missing columns to vip_purchases if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vip_purchases' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE vip_purchases ADD COLUMN approved_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vip_purchases' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE vip_purchases ADD COLUMN approved_by uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vip_purchases' AND column_name = 'combo_enabled_at_approval'
  ) THEN
    ALTER TABLE vip_purchases ADD COLUMN combo_enabled_at_approval boolean;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vip_purchases' AND column_name = 'combo_position_at_approval'
  ) THEN
    ALTER TABLE vip_purchases ADD COLUMN combo_position_at_approval integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vip_purchases' AND column_name = 'combo_multiplier_at_approval'
  ) THEN
    ALTER TABLE vip_purchases ADD COLUMN combo_multiplier_at_approval numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vip_purchases' AND column_name = 'combo_deposit_percent_at_approval'
  ) THEN
    ALTER TABLE vip_purchases ADD COLUMN combo_deposit_percent_at_approval numeric;
  END IF;
END $$;

-- Create category_access table if not exists
CREATE TABLE IF NOT EXISTS category_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  is_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category)
);

ALTER TABLE category_access ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SECTION 2: Recreate all functions
-- ============================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Handle new user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add balance to user function
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Process product purchase function
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Approve VIP purchase function
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

-- Keep database active function
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

-- ============================================================
-- SECTION 3: RLS Policies (drop and recreate)
-- ============================================================

-- Category access policies
DROP POLICY IF EXISTS "Users can view own category access" ON category_access;
DROP POLICY IF EXISTS "Admins can manage category access" ON category_access;

CREATE POLICY "Users can view own category access"
  ON category_access FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage category access"
  ON category_access FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ============================================================
-- SECTION 4: Ensure initial data exists
-- ============================================================

-- Insert categories if missing
INSERT INTO categories (id, name, description, commission_rate, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Fashion', 'Fashion and clothing items', 4.0, true),
  ('22222222-2222-2222-2222-222222222222', 'Electronics', 'Electronic devices and gadgets', 5.0, true),
  ('33333333-3333-3333-3333-333333333333', 'Sports', 'Sports equipment and gear', 6.0, true),
  ('44444444-4444-4444-4444-444444444444', 'Crypto Mining', 'Cryptocurrency mining equipment', 8.0, true),
  ('55555555-5555-5555-5555-555555555555', 'Food', 'Food and beverages', 3.5, true)
ON CONFLICT (id) DO NOTHING;

-- Insert VIP levels
INSERT INTO vip_levels (id, level, name, description, price, category_id, category, category_image_url, commission, products_count, is_active) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, 'VIP 1', 'Entry level VIP membership', 100.00, '11111111-1111-1111-1111-111111111111', 'Accessories', 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg', 15.0, 25, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, 'VIP 2', 'Intermediate VIP membership', 500.00, '22222222-2222-2222-2222-222222222222', 'Clothing', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg', 25.0, 25, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 'VIP 3', 'Advanced VIP membership', 2000.00, '33333333-3333-3333-3333-333333333333', 'Kitchen Appliances', 'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg', 30.0, 25, true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 4, 'VIP 4', 'Premium VIP membership', 5000.00, '44444444-4444-4444-4444-444444444444', 'Apple Tech', 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg', 35.0, 25, true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 5, 'VIP 5', 'Elite VIP membership', 10000.00, '55555555-5555-5555-5555-555555555555', 'Crypto Mining', 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg', 40.0, 25, true)
ON CONFLICT (level) DO UPDATE SET
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  category_image_url = EXCLUDED.category_image_url,
  commission = EXCLUDED.commission,
  products_count = EXCLUDED.products_count;

-- Insert payment methods
INSERT INTO payment_methods (name, type, wallet_address, network, min_amount, max_amount, display_order, is_active) VALUES
  ('Cryptocurrency', 'crypto', 'TXhKz9QmJ5Y8pL3xR7sW2nV4bF6cG1dH8aK', 'USDT (TRC20)', 10, 100000, 1, true),
  ('Bank Transfer', 'bank_transfer', 'Bank: Example Bank | Account: 1234567890 | SWIFT: EXAMPLESWIFT', NULL, 10, 50000, 2, true),
  ('Card Payment', 'card', '4532 1234 5678 9010', NULL, 10, 10000, 3, true)
ON CONFLICT (name) DO NOTHING;