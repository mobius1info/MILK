/*
  # Add Products Count to VIP Levels System

  1. Changes to Tables
    - Add `products_count` to `vip_levels` table
      - Defines how many products/tasks are available in this VIP level
      - Default value is 25
    - Add `completed_products_count` to `vip_purchases` table
      - Tracks how many products the user has completed in this VIP purchase
      - Default value is 0
    - Add `is_completed` to `vip_purchases` table
      - Boolean flag to mark if all products in this VIP purchase are completed
      - Default value is false

  2. Purpose
    - Allow admin to configure how many products/tasks each VIP level offers
    - Track user progress through VIP level products
    - Enable VIP level to be repurchased after all products are completed
*/

ALTER TABLE vip_levels 
ADD COLUMN IF NOT EXISTS products_count INTEGER DEFAULT 25 NOT NULL;

ALTER TABLE vip_purchases 
ADD COLUMN IF NOT EXISTS completed_products_count INTEGER DEFAULT 0 NOT NULL;

ALTER TABLE vip_purchases 
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vip_purchases_user_completed 
ON vip_purchases(user_id, is_completed);
