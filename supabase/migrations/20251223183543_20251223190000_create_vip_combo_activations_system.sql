/*
  # Create VIP Combo Activations System

  1. Changes
    - Drop old complex combo overrides table
    - Create simple vip_combo_activations table
    - Each activation = one combo application for a VIP purchase
    - Admin can add multiple activations per VIP purchase
    - Each activation starts from a specific product position
    
  2. Fields
    - vip_purchase_id - which VIP purchase
    - start_position - from which product number combo starts (e.g., 9)
    - combo_multiplier - price multiplier (e.g., 2x, 3x)
    - deposit_percent - percentage of VIP price for deposit (e.g., 150%, 200%)
    - is_active - whether this combo is currently active
    - created_by - admin who added it
    - notes - optional notes
    
  3. Example
    - Client stuck at product 4
    - Admin adds activation: start_position=9, multiplier=2, deposit=150%
    - When client reaches product 9, combo activates
    - Client can complete all products with this combo
    - Later, admin can add another activation: start_position=20, multiplier=3, deposit=200%
*/

DROP TABLE IF EXISTS vip_purchase_combo_overrides CASCADE;

CREATE TABLE vip_combo_activations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vip_purchase_id uuid NOT NULL REFERENCES vip_purchases(id) ON DELETE CASCADE,
  start_position integer NOT NULL CHECK (start_position > 0),
  combo_multiplier integer NOT NULL DEFAULT 2 CHECK (combo_multiplier >= 1),
  deposit_percent integer NOT NULL DEFAULT 150 CHECK (deposit_percent >= 100),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  notes text
);

CREATE INDEX idx_vip_combo_activations_vip_purchase 
  ON vip_combo_activations(vip_purchase_id);

CREATE INDEX idx_vip_combo_activations_active 
  ON vip_combo_activations(vip_purchase_id, is_active, start_position) 
  WHERE is_active = true;

ALTER TABLE vip_combo_activations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all combo activations"
  ON vip_combo_activations
  FOR SELECT
  TO authenticated
  USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can insert combo activations"
  ON vip_combo_activations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can update combo activations"
  ON vip_combo_activations
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can delete combo activations"
  ON vip_combo_activations
  FOR DELETE
  TO authenticated
  USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );