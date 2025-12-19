/*
  # Category Access Control System

  1. New Tables
    - `category_access`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `category` (text) - category identifier
      - `is_enabled` (boolean) - whether user can access this category
      - `product_limit` (integer) - max number of products user can see in this category (0 = unlimited)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `banners`
      - `id` (uuid, primary key)
      - `title` (text) - banner title
      - `image_url` (text) - celebrity/promotional image
      - `order_position` (integer) - display order
      - `is_active` (boolean) - whether banner is visible
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can read their own category access
    - Only admins can modify category access
    - All users can view active banners
*/

-- Create category_access table
CREATE TABLE IF NOT EXISTS category_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  is_enabled boolean DEFAULT false,
  product_limit integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category)
);

-- Create banners table
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  order_position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE category_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Category Access Policies
CREATE POLICY "Users can view own category access"
  ON category_access FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all category access"
  ON category_access FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert category access"
  ON category_access FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update category access"
  ON category_access FOR UPDATE
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

CREATE POLICY "Admins can delete category access"
  ON category_access FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Banner Policies
CREATE POLICY "Anyone can view active banners"
  ON banners FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can view all banners"
  ON banners FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert banners"
  ON banners FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update banners"
  ON banners FOR UPDATE
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

CREATE POLICY "Admins can delete banners"
  ON banners FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default banners
INSERT INTO banners (title, image_url, order_position, is_active) VALUES
('Shope - Cristiano Ronaldo', 'https://images.pexels.com/photos/3886235/pexels-photo-3886235.jpeg?auto=compress&cs=tinysrgb&w=1200', 1, true),
('Shope - Lionel Messi', 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=1200', 2, true),
('Shope - Celebrity Style', 'https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg?auto=compress&cs=tinysrgb&w=1200', 3, true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_category_access_user_id ON category_access(user_id);
CREATE INDEX IF NOT EXISTS idx_category_access_category ON category_access(category);
CREATE INDEX IF NOT EXISTS idx_banners_order ON banners(order_position) WHERE is_active = true;
