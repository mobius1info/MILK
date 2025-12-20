/*
  # Add Quantity Multiplier to Products and Product Purchases

  1. Changes to Tables
    - Add `quantity_multiplier` to `products` table
      - Defines how many units this product counts as (1, 2, 3, 4, or 5)
      - Default value is 1
    - Add `quantity_count` to `product_purchases` table
      - Stores the multiplier value at time of purchase
      - Default value is 1

  2. Purpose
    - Allow products to count as multiple units (x2, x3, x4, x5)
    - Track progress accurately with multipliers
    - Display products with their multiplier badges
*/

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS quantity_multiplier INTEGER DEFAULT 1 NOT NULL;

ALTER TABLE product_purchases 
ADD COLUMN IF NOT EXISTS quantity_count INTEGER DEFAULT 1 NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_quantity_multiplier 
ON products(quantity_multiplier);
