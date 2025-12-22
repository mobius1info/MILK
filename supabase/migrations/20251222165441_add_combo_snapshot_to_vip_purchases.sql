/*
  # Add Combo Snapshot to VIP Purchases

  1. New Fields in vip_purchases
    - combo_enabled_at_approval - Snapshot of combo_enabled when VIP was approved
    - combo_position_at_approval - Snapshot of combo_product_position when VIP was approved
    - combo_multiplier_at_approval - Snapshot of combo_multiplier when VIP was approved
    - combo_deposit_percent_at_approval - Snapshot of combo_deposit_percent when VIP was approved

  2. Logic
    - When admin approves VIP purchase, copy current combo settings from profile
    - COMBO only works if combo_enabled_at_approval = true
    - This ensures:
      - If combo was enabled BEFORE approval → works for this VIP
      - If combo was enabled AFTER approval → does NOT work for this VIP (only for new VIPs)

  3. Security
    - These fields are snapshots and cannot be modified after approval
    - Only admins can approve VIP purchases
*/

-- Add combo snapshot fields to vip_purchases
ALTER TABLE vip_purchases 
ADD COLUMN IF NOT EXISTS combo_enabled_at_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS combo_position_at_approval INTEGER DEFAULT 9,
ADD COLUMN IF NOT EXISTS combo_multiplier_at_approval INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS combo_deposit_percent_at_approval INTEGER DEFAULT 50;

-- Update existing approved VIP purchases to copy current combo settings
UPDATE vip_purchases vp
SET 
  combo_enabled_at_approval = COALESCE(p.combo_enabled, false),
  combo_position_at_approval = COALESCE(p.combo_product_position, 9),
  combo_multiplier_at_approval = COALESCE(p.combo_multiplier, 3),
  combo_deposit_percent_at_approval = COALESCE(p.combo_deposit_percent, 50)
FROM profiles p
WHERE vp.user_id = p.id 
  AND vp.status = 'approved'
  AND vp.combo_enabled_at_approval IS NULL;
