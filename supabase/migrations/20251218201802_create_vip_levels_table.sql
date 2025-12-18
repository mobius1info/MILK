/*
  # Create VIP Levels Configuration Table
  
  1. New Tables
    - vip_levels: Stores VIP level configurations
      - id (uuid, primary key)
      - level (integer) - VIP level number (1, 2, 3)
      - name (text) - Display name (e.g., "VIP 1")
      - commission (decimal) - Commission amount per product
      - description (text) - Description of the level
      - categories (text array) - Array of category IDs
      - is_active (boolean) - Whether this level is active
      - created_at (timestamptz)
      - updated_at (timestamptz)
      
  2. Security
    - Enable RLS
    - All users can read VIP levels
    - Only admins can create, update, delete VIP levels
    
  3. Initial Data
    - Insert default VIP levels with configurable commissions
*/

CREATE TABLE IF NOT EXISTS vip_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level integer UNIQUE NOT NULL,
  name text NOT NULL,
  commission decimal(10,2) NOT NULL,
  description text NOT NULL,
  categories text[] NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE vip_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active VIP levels"
  ON vip_levels FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can view all VIP levels"
  ON vip_levels FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert VIP levels"
  ON vip_levels FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update VIP levels"
  ON vip_levels FOR UPDATE
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

CREATE POLICY "Admins can delete VIP levels"
  ON vip_levels FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

INSERT INTO vip_levels (level, name, commission, description, categories) VALUES
  (1, 'VIP 1', 5.00, 'Базовый уровень', ARRAY['fashion', 'sports']),
  (2, 'VIP 2', 10.00, 'Продвинутый уровень', ARRAY['home', 'beauty']),
  (3, 'VIP 3', 20.00, 'Премиум уровень', ARRAY['electronics', 'Crypto Mining Equipment'])
ON CONFLICT (level) DO NOTHING;