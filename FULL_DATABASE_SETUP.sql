/*
  ============================================================
  FULL DATABASE SETUP SCRIPT
  ============================================================

  This script sets up the complete database structure for the
  VIP Purchase Management application.

  HOW TO USE:
  1. Go to your Supabase Dashboard: https://supabase.com/dashboard
  2. Select your project (zkvgdwfmpfubtqsbdqyh)
  3. Go to SQL Editor (left menu)
  4. Copy and paste this entire script
  5. Click "Run" to execute

  Tables created:
  - profiles (user accounts)
  - transactions (balance history)
  - deposits (deposit requests)
  - withdrawals (withdrawal requests)
  - categories (product categories)
  - products (items for purchase)
  - vip_levels (VIP membership tiers)
  - vip_purchases (VIP subscriptions)
  - vip_combo_settings (combo configurations)
  - product_purchases (individual purchases)
  - payment_methods (payment options)
  - orders (legacy orders)
  - order_items (legacy order items)
  - referrals (referral tracking)
  - category_access (user category permissions)
  - banners (promotional banners)
  - activity_log (system activity)

  ============================================================
*/

-- ============================================================
-- SECTION 1: BASE TABLES
-- ============================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  username text UNIQUE,
  full_name text DEFAULT '',
  role text DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  balance decimal(10,2) DEFAULT 0.00,
  referral_code text UNIQUE,
  referred_by uuid REFERENCES profiles(id),
  total_spent decimal(10,2) DEFAULT 0.00,
  total_orders integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'purchase', 'refund', 'referral_bonus', 'commission')),
  description text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create deposits table
CREATE TABLE IF NOT EXISTS deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL,
  payment_method text DEFAULT 'bank_transfer',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  proof_url text,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;

-- Create withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL,
  payment_method text DEFAULT 'bank_transfer',
  payment_details jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text,
  is_active boolean DEFAULT true,
  commission_rate numeric DEFAULT 5.0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL,
  image_url text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  commission_percentage decimal(5,2) DEFAULT 0.00,
  quantity_multiplier integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create vip_levels table
CREATE TABLE IF NOT EXISTS vip_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level integer UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL DEFAULT 0.00,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  category text,
  category_image_url text,
  commission numeric DEFAULT 5.0,
  products_count integer DEFAULT 0,
  image_url text,
  benefits jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vip_levels ENABLE ROW LEVEL SECURITY;

-- Create vip_purchases table
CREATE TABLE IF NOT EXISTS vip_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vip_level_id uuid REFERENCES vip_levels(id) ON DELETE CASCADE NOT NULL,
  amount_paid decimal(10,2) NOT NULL,
  products_completed integer DEFAULT 0,
  total_products integer NOT NULL DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  vip_level integer,
  category_id text,
  completed_products_count integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  vip_price numeric DEFAULT 0,
  approved_at timestamptz,
  approved_by uuid,
  combo_enabled_at_approval boolean,
  combo_position_at_approval integer,
  combo_multiplier_at_approval numeric,
  combo_deposit_percent_at_approval numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vip_purchases ENABLE ROW LEVEL SECURITY;

-- Create vip_combo_settings table
CREATE TABLE IF NOT EXISTS vip_combo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vip_purchase_id uuid REFERENCES vip_purchases(id) ON DELETE CASCADE NOT NULL,
  combo_position integer NOT NULL CHECK (combo_position >= 1 AND combo_position <= 100),
  combo_multiplier integer NOT NULL DEFAULT 3 CHECK (combo_multiplier >= 1 AND combo_multiplier <= 500),
  combo_deposit_percent numeric NOT NULL DEFAULT 50 CHECK (combo_deposit_percent >= 5 AND combo_deposit_percent <= 5000),
  is_completed boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES profiles(id),
  UNIQUE(vip_purchase_id, combo_position)
);

ALTER TABLE vip_combo_settings ENABLE ROW LEVEL SECURITY;

-- Create product_purchases table
CREATE TABLE IF NOT EXISTS product_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vip_purchase_id uuid REFERENCES vip_purchases(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price_paid decimal(10,2) NOT NULL,
  commission_earned decimal(10,2) DEFAULT 0.00,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_purchases ENABLE ROW LEVEL SECURITY;

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  type text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  wallet_address text DEFAULT '',
  network text,
  instructions text,
  min_amount numeric DEFAULT 10,
  max_amount numeric,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  payment_method text DEFAULT 'balance',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  referred_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  bonus_amount decimal(10,2) DEFAULT 10.00,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Create category_access table
CREATE TABLE IF NOT EXISTS category_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  is_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category)
);

ALTER TABLE category_access ENABLE ROW LEVEL SECURITY;

-- Create banners table
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  link_url text,
  is_active boolean DEFAULT true,
  order_position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Create activity_log table
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- SECTION 2: INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_vip_combo_settings_vip_purchase
  ON vip_combo_settings(vip_purchase_id);

CREATE INDEX IF NOT EXISTS idx_vip_combo_settings_position
  ON vip_combo_settings(vip_purchase_id, combo_position);


-- ============================================================
-- SECTION 3: RLS POLICIES
-- ============================================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Transactions policies
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Deposits policies
CREATE POLICY "Users can view own deposits"
  ON deposits FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create deposits"
  ON deposits FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all deposits"
  ON deposits FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can update deposits"
  ON deposits FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Withdrawals policies
CREATE POLICY "Users can view own withdrawals"
  ON withdrawals FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create withdrawals"
  ON withdrawals FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all withdrawals"
  ON withdrawals FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can update withdrawals"
  ON withdrawals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Categories policies
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Products policies
CREATE POLICY "Users can view active products"
  ON products FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- VIP levels policies
CREATE POLICY "Users can view active VIP levels"
  ON vip_levels FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage VIP levels"
  ON vip_levels FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- VIP purchases policies
CREATE POLICY "Users can view own VIP purchases"
  ON vip_purchases FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create VIP purchases"
  ON vip_purchases FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all VIP purchases"
  ON vip_purchases FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can update VIP purchases"
  ON vip_purchases FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- VIP combo settings policies
CREATE POLICY "Admins can view all combo settings"
  ON vip_combo_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can insert combo settings"
  ON vip_combo_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can update combo settings"
  ON vip_combo_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can delete combo settings"
  ON vip_combo_settings FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Users can view own combo settings"
  ON vip_combo_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vip_purchases
      WHERE vip_purchases.id = vip_combo_settings.vip_purchase_id
      AND vip_purchases.user_id = auth.uid()
    )
  );

-- Product purchases policies
CREATE POLICY "Users can view own product purchases"
  ON product_purchases FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all product purchases"
  ON product_purchases FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can update product purchases"
  ON product_purchases FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Payment methods policies
CREATE POLICY "Users can view active payment methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage payment methods"
  ON payment_methods FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Order items policies
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Referrals policies
CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Admins can view all referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can update referrals"
  ON referrals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Category access policies
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

-- Banners policies
CREATE POLICY "Anyone can view active banners"
  ON banners FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage banners"
  ON banners FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Activity log policies
CREATE POLICY "Admins can view activity logs"
  ON activity_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );


-- ============================================================
-- SECTION 4: TRIGGERS AND FUNCTIONS
-- ============================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Handle new user function (creates profile on registration)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

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

-- Keep database active function (for pg_cron)
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
-- SECTION 5: INITIAL DATA
-- ============================================================

-- Insert categories
INSERT INTO categories (id, name, description, commission_rate, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Fashion', 'Fashion and clothing items', 4.0, true),
  ('22222222-2222-2222-2222-222222222222', 'Electronics', 'Electronic devices and gadgets', 5.0, true),
  ('33333333-3333-3333-3333-333333333333', 'Sports', 'Sports equipment and gear', 6.0, true),
  ('44444444-4444-4444-4444-444444444444', 'Crypto Mining', 'Cryptocurrency mining equipment', 8.0, true),
  ('55555555-5555-5555-5555-555555555555', 'Food', 'Food and beverages', 3.5, true)
ON CONFLICT (id) DO NOTHING;

-- Insert VIP levels with ACTUAL data from production
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

-- Insert sample products for Fashion (VIP 1)
INSERT INTO products (name, description, price, category_id, commission_percentage, quantity_multiplier, is_active) VALUES
  ('T-Shirt', 'Cotton t-shirt', 2.50, '11111111-1111-1111-1111-111111111111', 1.30, 1, true),
  ('Jeans', 'Denim jeans', 2.50, '11111111-1111-1111-1111-111111111111', 1.30, 1, true),
  ('Sneakers', 'Sport sneakers', 2.50, '11111111-1111-1111-1111-111111111111', 1.30, 1, true),
  ('Jacket', 'Winter jacket', 2.50, '11111111-1111-1111-1111-111111111111', 1.30, 1, true),
  ('Hat', 'Baseball cap', 2.50, '11111111-1111-1111-1111-111111111111', 1.30, 1, true)
ON CONFLICT DO NOTHING;

-- Insert sample products for Electronics (VIP 2)
INSERT INTO products (name, description, price, category_id, commission_percentage, quantity_multiplier, is_active) VALUES
  ('Smartphone', 'Latest smartphone', 7.50, '22222222-2222-2222-2222-222222222222', 1.30, 1, true),
  ('Laptop', 'Gaming laptop', 7.50, '22222222-2222-2222-2222-222222222222', 1.30, 1, true),
  ('Headphones', 'Wireless headphones', 7.50, '22222222-2222-2222-2222-222222222222', 1.30, 1, true),
  ('Tablet', 'Tablet device', 7.50, '22222222-2222-2222-2222-222222222222', 1.30, 1, true),
  ('Smartwatch', 'Smart watch', 7.50, '22222222-2222-2222-2222-222222222222', 1.30, 1, true)
ON CONFLICT DO NOTHING;

-- Insert sample products for Sports (VIP 3)
INSERT INTO products (name, description, price, category_id, commission_percentage, quantity_multiplier, is_active) VALUES
  ('Basketball', 'Professional basketball', 20.00, '33333333-3333-3333-3333-333333333333', 1.30, 1, true),
  ('Tennis Racket', 'Pro tennis racket', 20.00, '33333333-3333-3333-3333-333333333333', 1.30, 1, true),
  ('Running Shoes', 'Marathon running shoes', 20.00, '33333333-3333-3333-3333-333333333333', 1.30, 1, true),
  ('Yoga Mat', 'Premium yoga mat', 20.00, '33333333-3333-3333-3333-333333333333', 1.30, 1, true),
  ('Dumbbell Set', 'Adjustable dumbbells', 20.00, '33333333-3333-3333-3333-333333333333', 1.30, 1, true)
ON CONFLICT DO NOTHING;

-- Insert sample products for Crypto Mining (VIP 4)
INSERT INTO products (name, description, price, category_id, commission_percentage, quantity_multiplier, is_active) VALUES
  ('ASIC Miner', 'Bitcoin ASIC miner', 50.00, '44444444-4444-4444-4444-444444444444', 1.30, 1, true),
  ('GPU Rig', 'Ethereum GPU mining rig', 50.00, '44444444-4444-4444-4444-444444444444', 1.30, 1, true),
  ('Cooling System', 'Mining cooling system', 50.00, '44444444-4444-4444-4444-444444444444', 1.30, 1, true),
  ('Power Supply', 'High efficiency PSU', 50.00, '44444444-4444-4444-4444-444444444444', 1.30, 1, true),
  ('Mining Frame', 'Open air mining frame', 50.00, '44444444-4444-4444-4444-444444444444', 1.30, 1, true)
ON CONFLICT DO NOTHING;

-- Insert sample products for Food (VIP 5)
INSERT INTO products (name, description, price, category_id, commission_percentage, quantity_multiplier, is_active) VALUES
  ('Organic Fruits', 'Fresh organic fruits basket', 125.00, '55555555-5555-5555-5555-555555555555', 1.30, 1, true),
  ('Premium Coffee', 'Gourmet coffee beans', 125.00, '55555555-5555-5555-5555-555555555555', 1.30, 1, true),
  ('Fine Wine', 'Premium wine collection', 125.00, '55555555-5555-5555-5555-555555555555', 1.30, 1, true),
  ('Artisan Cheese', 'Imported cheese selection', 125.00, '55555555-5555-5555-5555-555555555555', 1.30, 1, true),
  ('Seafood Platter', 'Fresh seafood assortment', 125.00, '55555555-5555-5555-5555-555555555555', 1.30, 1, true)
ON CONFLICT DO NOTHING;

-- Insert payment methods
INSERT INTO payment_methods (name, type, wallet_address, network, min_amount, max_amount, display_order, is_active) VALUES
  ('Cryptocurrency', 'crypto', 'TXhKz9QmJ5Y8pL3xR7sW2nV4bF6cG1dH8aK', 'USDT (TRC20)', 10, 100000, 1, true),
  ('Bank Transfer', 'bank_transfer', 'Bank: Example Bank | Account: 1234567890 | SWIFT: EXAMPLESWIFT', NULL, 10, 50000, 2, true),
  ('Card Payment', 'card', '4532 1234 5678 9010', NULL, 10, 10000, 3, true)
ON CONFLICT (name) DO NOTHING;


-- ============================================================
-- SECTION 6: OPTIONAL - Enable pg_cron (run separately if needed)
-- ============================================================
-- NOTE: pg_cron may need to be enabled in Dashboard > Extensions first
-- Uncomment the lines below after enabling pg_cron extension

-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- SELECT cron.schedule(
--   'keep-database-active',
--   '0 0 */5 * *',
--   'SELECT keep_database_active();'
-- );


-- ============================================================
-- DONE! Your database is now set up.
-- ============================================================
--
-- Next steps:
-- 1. Create an admin user through Auth in Supabase Dashboard
-- 2. Update the user's role to 'admin' in the profiles table
-- 3. Or use the create-admin Edge Function
--
-- ============================================================
