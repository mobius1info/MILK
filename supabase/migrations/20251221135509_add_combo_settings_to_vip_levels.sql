/*
  # Add Combo Settings to VIP Levels

  1. New Fields
    - `combo_product_position` (integer) - Which product number gets COMBO pricing (default: 9)
      Example: If set to 9, every 9th product will be a COMBO product
    - `commission_multiplier` (integer) - Commission multiplier for COMBO products (2x, 3x, 4x, 5x)
      Example: If set to 3, COMBO products earn 3x commission
  
  2. Purpose
    - Allows admins to customize COMBO mechanics per VIP level
    - Different VIP levels can have different COMBO positions and multipliers
  
  3. Default Values
    - combo_product_position: 9 (maintains current behavior)
    - commission_multiplier: 3 (maintains current 3x commission)
*/

-- Add combo settings columns to vip_levels
ALTER TABLE vip_levels 
ADD COLUMN IF NOT EXISTS combo_product_position integer DEFAULT 9 CHECK (combo_product_position > 0),
ADD COLUMN IF NOT EXISTS commission_multiplier integer DEFAULT 3 CHECK (commission_multiplier IN (2, 3, 4, 5));

-- Update existing records to have default values
UPDATE vip_levels 
SET 
  combo_product_position = 9,
  commission_multiplier = 3
WHERE combo_product_position IS NULL OR commission_multiplier IS NULL;
