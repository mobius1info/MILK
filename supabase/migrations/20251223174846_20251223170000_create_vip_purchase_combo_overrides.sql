/*
  # Create VIP Purchase Combo Overrides System

  1. New Table
    - vip_purchase_combo_overrides - stores individual combo settings for specific VIP purchases
      - id (uuid, primary key)
      - vip_purchase_id (uuid, foreign key to vip_purchases)
      - combo_enabled (boolean) - whether combo is enabled for this specific purchase
      - combo_multiplier (integer) - custom multiplier for this purchase
      - created_at (timestamptz) - when this override was created
      - created_by (uuid, foreign key to profiles) - which admin created it
      - is_active (boolean) - whether this override is currently active
  
  2. Security
    - Enable RLS
    - Admin can view all overrides
    - Admin can insert/update/delete overrides
*/

CREATE TABLE IF NOT EXISTS vip_purchase_combo_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vip_purchase_id uuid NOT NULL REFERENCES vip_purchases(id) ON DELETE CASCADE,
  combo_enabled boolean NOT NULL DEFAULT false,
  combo_multiplier integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  is_active boolean NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_vip_purchase_combo_overrides_vip_purchase 
  ON vip_purchase_combo_overrides(vip_purchase_id);

CREATE INDEX IF NOT EXISTS idx_vip_purchase_combo_overrides_active 
  ON vip_purchase_combo_overrides(vip_purchase_id, is_active) 
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