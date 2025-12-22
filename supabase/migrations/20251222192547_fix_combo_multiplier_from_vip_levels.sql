/*
  # Fix Combo Multiplier to Use VIP Levels

  1. Changes
    - Update all approved VIP purchases to use commission_multiplier from vip_levels table
    - This ensures combo commission multiplier matches the VIP level settings, not user profile

  2. Logic
    - For each approved VIP purchase, get the commission_multiplier from vip_levels
    - Update combo_multiplier_at_approval with the correct value from vip_levels
    - Also update combo_position_at_approval to use combo_product_position from vip_levels

  3. Why This Matters
    - Combo multiplier should be based on VIP level tier (VIP 1, VIP 2, etc.)
    - Not on user profile settings (which only control enabled/disabled and deposit percent)
*/

-- Update all approved VIP purchases to use correct multiplier and position from vip_levels
UPDATE vip_purchases vp
SET
  combo_multiplier_at_approval = COALESCE(vl.commission_multiplier, 3),
  combo_position_at_approval = COALESCE(vl.combo_product_position, 9)
FROM vip_levels vl
WHERE vp.vip_level = vl.level
  AND vp.category_id = vl.category
  AND vp.status = 'approved';
