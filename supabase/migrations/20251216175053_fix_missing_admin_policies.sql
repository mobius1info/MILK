/*
  # Fix Missing Admin Policies

  1. Changes
    - Add admin policies for products (INSERT, UPDATE, DELETE)
    - Add admin policies for transactions (SELECT, UPDATE)
    - Add admin policies for profiles (UPDATE)
    - Add admin policies for order_items (INSERT)
    - Add admin policies for referrals (INSERT)

  2. Security
    - All admin policies use is_admin() function
    - Maintains proper access control for admin operations
*/

-- Products admin policies
CREATE POLICY "Admins can create products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (is_admin());

-- Transactions admin policies
CREATE POLICY "Admins can view all transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Profiles admin policies
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Order items admin policies
CREATE POLICY "Admins can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update order items"
  ON order_items FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete order items"
  ON order_items FOR DELETE
  TO authenticated
  USING (is_admin());

-- Referrals admin policies
CREATE POLICY "Admins can create referrals"
  ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Orders admin policies for DELETE
CREATE POLICY "Admins can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (is_admin());