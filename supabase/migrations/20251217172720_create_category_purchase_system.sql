/*
  # Category Purchase System with Manual Approval

  ## Overview
  This migration creates a system where users purchase access to categories,
  and administrators manually approve access before users can see products.

  ## Changes

  1. **New Table: category_access_requests**
     - `id` (uuid, primary key)
     - `user_id` (uuid, references profiles) - who requested access
     - `category` (text) - which category they want to access
     - `price_paid` (decimal) - amount paid for access
     - `status` (text) - 'pending', 'approved', 'rejected'
     - `requested_at` (timestamptz) - when the request was made
     - `processed_at` (timestamptz) - when admin approved/rejected
     - `processed_by` (uuid, references profiles) - which admin processed it
     - `admin_notes` (text) - notes from admin

  2. **Modify category_access Table**
     - Add `access_request_id` to link approved access to original request
     - Keep existing structure for manual admin control

  3. **New Table: category_prices**
     - `id` (uuid, primary key)
     - `category` (text, unique) - category identifier
     - `price` (decimal) - price to purchase access
     - `description` (text) - what this category includes
     - `is_available` (boolean) - whether users can purchase
     - `created_at` (timestamptz)

  ## Security
  - Users can view their own requests
  - Users can create new requests (purchase)
  - Only admins can approve/reject requests
  - Only admins can modify category_access

  ## Notes
  - Users must have sufficient balance to purchase category access
  - After approval, users see products in that category
  - Rejected requests can be re-attempted
*/

-- Create category_prices table
CREATE TABLE IF NOT EXISTS category_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text UNIQUE NOT NULL,
  price decimal(10, 2) NOT NULL DEFAULT 0,
  description text DEFAULT '',
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create category_access_requests table
CREATE TABLE IF NOT EXISTS category_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  price_paid decimal(10, 2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid REFERENCES profiles(id),
  admin_notes text DEFAULT '',
  UNIQUE(user_id, category, status)
);

-- Add access_request_id to category_access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'category_access' AND column_name = 'access_request_id'
  ) THEN
    ALTER TABLE category_access ADD COLUMN access_request_id uuid REFERENCES category_access_requests(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE category_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_access_requests ENABLE ROW LEVEL SECURITY;

-- Category Prices Policies (everyone can view available categories)
CREATE POLICY "Anyone can view available category prices"
  ON category_prices FOR SELECT
  TO authenticated
  USING (is_available = true);

CREATE POLICY "Admins can view all category prices"
  ON category_prices FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert category prices"
  ON category_prices FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update category prices"
  ON category_prices FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete category prices"
  ON category_prices FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Category Access Requests Policies
CREATE POLICY "Users can view own access requests"
  ON category_access_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all access requests"
  ON category_access_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create access requests"
  ON category_access_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.balance >= price_paid
    )
  );

CREATE POLICY "Admins can update access requests"
  ON category_access_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_category_requests_user_id ON category_access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_category_requests_status ON category_access_requests(status);
CREATE INDEX IF NOT EXISTS idx_category_requests_category ON category_access_requests(category);
CREATE INDEX IF NOT EXISTS idx_category_prices_category ON category_prices(category);

-- Insert default category prices
INSERT INTO category_prices (category, price, description, is_available) VALUES
('Electronics', 100.00, 'Access to all electronics products', true),
('Fashion', 50.00, 'Access to all fashion products', true),
('Sports', 75.00, 'Access to all sports equipment', true),
('Books', 25.00, 'Access to all books and educational materials', true),
('Home & Garden', 60.00, 'Access to home and garden products', true),
('Crypto Mining', 200.00, 'Access to crypto mining equipment and services', true)
ON CONFLICT (category) DO NOTHING;

-- Function to handle category access approval
CREATE OR REPLACE FUNCTION approve_category_access_request(
  request_id uuid,
  admin_id uuid,
  notes text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_category text;
  v_price decimal;
BEGIN
  -- Get request details
  SELECT user_id, category, price_paid
  INTO v_user_id, v_category, v_price
  FROM category_access_requests
  WHERE id = request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;

  -- Update request status
  UPDATE category_access_requests
  SET status = 'approved',
      processed_at = now(),
      processed_by = admin_id,
      admin_notes = notes
  WHERE id = request_id;

  -- Create or update category access
  INSERT INTO category_access (user_id, category, is_enabled, access_request_id, updated_at)
  VALUES (v_user_id, v_category, true, request_id, now())
  ON CONFLICT (user_id, category)
  DO UPDATE SET is_enabled = true, access_request_id = request_id, updated_at = now();
END;
$$;

-- Function to handle category access rejection
CREATE OR REPLACE FUNCTION reject_category_access_request(
  request_id uuid,
  admin_id uuid,
  notes text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_price decimal;
BEGIN
  -- Get request details
  SELECT user_id, price_paid
  INTO v_user_id, v_price
  FROM category_access_requests
  WHERE id = request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;

  -- Update request status
  UPDATE category_access_requests
  SET status = 'rejected',
      processed_at = now(),
      processed_by = admin_id,
      admin_notes = notes
  WHERE id = request_id;

  -- Refund the user
  UPDATE profiles
  SET balance = balance + v_price
  WHERE id = v_user_id;
END;
$$;