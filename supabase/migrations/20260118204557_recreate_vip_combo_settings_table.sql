/*
  # Recreate VIP Combo Settings Table

  1. New Tables
    - `vip_combo_settings`
      - `id` (uuid, primary key)
      - `vip_purchase_id` (uuid, references vip_purchases)
      - `combo_position` (integer) - which product number is a combo (1-100)
      - `combo_multiplier` (integer) - commission multiplier (1-500)
      - `combo_deposit_percent` (numeric) - deposit requirement % (5-5000)
      - `is_completed` (boolean) - whether this combo has been used
      - `created_at` (timestamptz)
      - `created_by` (uuid) - admin who created this combo

  2. Security
    - Enable RLS on `vip_combo_settings` table
    - Add policies for admins to manage combo settings
    - Add policies for users to view their own combo settings

  3. Notes
    - This allows multiple combos per VIP purchase
    - Each combo can be on different products with different settings
    - Admins can add/edit/remove combos at any time
*/

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

-- Enable RLS
ALTER TABLE vip_combo_settings ENABLE ROW LEVEL SECURITY;

-- Policies for admins
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

-- Policies for users
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_vip_combo_settings_vip_purchase 
  ON vip_combo_settings(vip_purchase_id);

CREATE INDEX IF NOT EXISTS idx_vip_combo_settings_position 
  ON vip_combo_settings(vip_purchase_id, combo_position);
