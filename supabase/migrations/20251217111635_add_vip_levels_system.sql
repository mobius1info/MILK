/*
  # Add VIP Levels System for Orders

  ## Overview
  This migration adds a VIP levels system that restricts access to certain products
  based on user balance. Users must maintain minimum balance requirements to access
  products at different VIP levels.

  ## Changes

  1. **Products Table**
     - Add `vip_level` column (integer, 0-5)
       - 0 = Available to all users (default)
       - 1 = VIP 1 - Requires $100 balance
       - 2 = VIP 2 - Requires $500 balance
       - 3 = VIP 3 - Requires $2000 balance
       - 4 = VIP 4 - Requires $5000 balance
       - 5 = VIP 5 - Requires $20000 balance

  ## Security
  - No additional RLS policies needed as existing policies already cover product access
  - Balance checks will be enforced at application level

  ## Notes
  - Existing products will default to VIP level 0 (available to all)
  - VIP levels create a progression system encouraging users to maintain higher balances
*/

-- Add vip_level column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'vip_level'
  ) THEN
    ALTER TABLE products ADD COLUMN vip_level integer DEFAULT 0;
    
    -- Add constraint to ensure vip_level is between 0 and 5
    ALTER TABLE products ADD CONSTRAINT products_vip_level_check 
      CHECK (vip_level >= 0 AND vip_level <= 5);
  END IF;
END $$;

-- Create index on vip_level for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_vip_level ON products(vip_level);

-- Update existing products to have a mix of VIP levels (for demo purposes)
-- This distributes products across different VIP levels
UPDATE products 
SET vip_level = CASE 
  WHEN price >= 500 THEN 5
  WHEN price >= 300 THEN 4
  WHEN price >= 200 THEN 3
  WHEN price >= 100 THEN 2
  WHEN price >= 50 THEN 1
  ELSE 0
END
WHERE vip_level IS NULL OR vip_level = 0;