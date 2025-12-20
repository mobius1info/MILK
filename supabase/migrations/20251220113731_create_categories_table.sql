/*
  # Create Categories Table

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Category name
      - `display_name` (text) - Display name for UI
      - `description` (text) - Category description
      - `image_url` (text) - Category image URL
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `categories` table
    - Add policy for public read access (anyone can view categories)
    - Add policy for admins to manage categories

  3. Initial Data
    - Insert default categories from existing products
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
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

INSERT INTO categories (name, display_name, description) VALUES
  ('electronics', 'Electronics', 'Electronic devices and gadgets'),
  ('fashion', 'Fashion', 'Clothing and accessories'),
  ('home', 'Home & Living', 'Home decor and furniture'),
  ('beauty', 'Beauty', 'Beauty and personal care products'),
  ('sports', 'Sports', 'Sports equipment and accessories'),
  ('Crypto Mining Equipment', 'Crypto Mining', 'Cryptocurrency mining hardware')
ON CONFLICT (name) DO NOTHING;

CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();
