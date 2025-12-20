/*
  # Add VIP Price and Dynamic Product Pricing System

  1. Changes to vip_purchases table
    - Add `vip_price` column to store the price paid for VIP level
    - This is used to calculate dynamic product prices

  2. Purpose
    - Store VIP purchase price for dynamic product pricing
    - Products will be priced based on VIP level cost:
      * Regular products (1-8, 10-17, 19-24): 30%-100% of VIP price
      * COMBO products (9th, 18th): 100%-200% of VIP price with 3x commission
*/

-- Add vip_price column to vip_purchases
ALTER TABLE vip_purchases 
ADD COLUMN IF NOT EXISTS vip_price decimal DEFAULT 0;

-- Update existing records with price from vip_levels
UPDATE vip_purchases vp
SET vip_price = (
  SELECT price 
  FROM vip_levels 
  WHERE level = vp.vip_level AND category = vp.category_id
  LIMIT 1
)
WHERE vip_price = 0;