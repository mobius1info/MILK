/*
  # Fix Profiles RLS Policies - Remove Infinite Recursion

  1. Problem
    - Admin policies cause infinite recursion by querying profiles table within policies
    
  2. Solution
    - Drop all existing policies
    - Create simple non-recursive policies
    - Users can read/update their own profile
*/

-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create simple policies without recursion
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

-- Admin can view all profiles using JWT metadata
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin');

-- Admin can update all profiles using JWT metadata
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin');

-- VIP purchases policies
DROP POLICY IF EXISTS "Users can view own vip purchases" ON vip_purchases;
DROP POLICY IF EXISTS "Users can create vip purchases" ON vip_purchases;
DROP POLICY IF EXISTS "Admins can view all vip purchases" ON vip_purchases;
DROP POLICY IF EXISTS "Admins can update all vip purchases" ON vip_purchases;

CREATE POLICY "Users can view own vip purchases"
  ON vip_purchases FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create vip purchases"
  ON vip_purchases FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all vip purchases"
  ON vip_purchases FOR SELECT
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin');

CREATE POLICY "Admins can update all vip purchases"
  ON vip_purchases FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin');

-- Product purchases policies
DROP POLICY IF EXISTS "Users can view own product purchases" ON product_purchases;
DROP POLICY IF EXISTS "Users can create product purchases" ON product_purchases;

CREATE POLICY "Users can view own product purchases"
  ON product_purchases FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create product purchases"
  ON product_purchases FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Transactions policies
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can insert transactions" ON transactions;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin');

CREATE POLICY "Admins can insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');

-- Deposits policies
DROP POLICY IF EXISTS "Users can view own deposits" ON deposits;
DROP POLICY IF EXISTS "Users can create deposits" ON deposits;
DROP POLICY IF EXISTS "Admins can view all deposits" ON deposits;
DROP POLICY IF EXISTS "Admins can update all deposits" ON deposits;

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
  USING ((auth.jwt()->>'role')::text = 'admin');

CREATE POLICY "Admins can update all deposits"
  ON deposits FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin');

-- Withdrawals policies
DROP POLICY IF EXISTS "Users can view own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Users can create withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Admins can view all withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Admins can update all withdrawals" ON withdrawals;

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
  USING ((auth.jwt()->>'role')::text = 'admin');

CREATE POLICY "Admins can update all withdrawals"
  ON withdrawals FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin');

-- Public read access for certain tables
CREATE POLICY "Public can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view vip levels"
  ON vip_levels FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view payment methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view banners"
  ON banners FOR SELECT
  TO authenticated
  USING (true);

-- Admin write access
CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin')
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin')
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');

CREATE POLICY "Admins can manage vip levels"
  ON vip_levels FOR ALL
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin')
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');

CREATE POLICY "Admins can manage payment methods"
  ON payment_methods FOR ALL
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin')
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');

CREATE POLICY "Admins can manage banners"
  ON banners FOR ALL
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin')
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');

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
  USING ((auth.jwt()->>'role')::text = 'admin')
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');

-- VIP combo settings policies
DROP POLICY IF EXISTS "Users can view own combo settings" ON vip_combo_settings;
DROP POLICY IF EXISTS "Admins can manage combo settings" ON vip_combo_settings;

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

CREATE POLICY "Admins can manage combo settings"
  ON vip_combo_settings FOR ALL
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin')
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');