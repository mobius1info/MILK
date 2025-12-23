/*
  # Recreate VIP Combo Overrides with Product Position Support

  1. Changes
    - Drop old table and recreate with proper structure
    - Add product_position field - which product number should trigger combo
    - Add vip_price_percentage field - what percentage of VIP price to use (e.g., 150, 200)
    - Remove combo_enabled field - if record exists, combo is enabled for that position
    - Keep combo_multiplier for price multiplication
    
  2. Example Usage
    - Admin adds: position 9, multiplier 2, vip_price_percentage 150
    - When user completes 9th product, price = vip_price * 1.5 * 2
    - Admin can add multiple positions: 9, 15, 20, etc.
*/

DROP TABLE IF EXISTS vip_purchase_combo_overrides CASCADE;

CREATE TABLE vip_purchase_combo_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vip_purchase_id uuid NOT NULL REFERENCES vip_purchases(id) ON DELETE CASCADE,
  product_position integer NOT NULL CHECK (product_position > 0),
  combo_multiplier integer NOT NULL DEFAULT 2 CHECK (combo_multiplier >= 1),
  vip_price_percentage integer NOT NULL DEFAULT 100 CHECK (vip_price_percentage >= 100),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  is_active boolean NOT NULL DEFAULT true,
  notes text
);

CREATE INDEX idx_vip_combo_overrides_vip_purchase 
  ON vip_purchase_combo_overrides(vip_purchase_id);

CREATE INDEX idx_vip_combo_overrides_position 
  ON vip_purchase_combo_overrides(vip_purchase_id, product_position, is_active) 
  WHERE is_active = true;

CREATE UNIQUE INDEX idx_vip_combo_overrides_unique_active_position
  ON vip_purchase_combo_overrides(vip_purchase_id, product_position)
  WHERE is_active = true;

ALTER TABLE vip_purchase_combo_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all combo overrides"
  ON vip_purchase_combo_overrides
  FOR SELECT
  TO authenticated
  USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can insert combo overrides"
  ON vip_purchase_combo_overrides
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can update combo overrides"
  ON vip_purchase_combo_overrides
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can delete combo overrides"
  ON vip_purchase_combo_overrides
  FOR DELETE
  TO authenticated
  USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );