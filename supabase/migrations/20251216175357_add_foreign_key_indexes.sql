/*
  # Add Foreign Key Indexes for Performance

  1. Changes
    - Add indexes on all foreign key columns to improve query performance
    - Indexes added for:
      - order_items.order_id
      - order_items.product_id
      - orders.user_id
      - profiles.referred_by
      - referrals.referred_id
      - referrals.referrer_id
      - transactions.user_id

  2. Performance Impact
    - Significantly improves JOIN performance
    - Speeds up foreign key constraint checks
    - Optimizes queries filtering by foreign key columns
*/

-- Add index for order_items.order_id
CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
  ON order_items(order_id);

-- Add index for order_items.product_id
CREATE INDEX IF NOT EXISTS idx_order_items_product_id 
  ON order_items(product_id);

-- Add index for orders.user_id
CREATE INDEX IF NOT EXISTS idx_orders_user_id 
  ON orders(user_id);

-- Add index for profiles.referred_by
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by 
  ON profiles(referred_by);

-- Add index for referrals.referred_id
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id 
  ON referrals(referred_id);

-- Add index for referrals.referrer_id
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id 
  ON referrals(referrer_id);

-- Add index for transactions.user_id
CREATE INDEX IF NOT EXISTS idx_transactions_user_id 
  ON transactions(user_id);