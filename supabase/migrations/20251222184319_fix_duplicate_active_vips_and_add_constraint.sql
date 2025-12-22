/*
  # Fix Duplicate Active VIP Purchases and Add Constraint

  1. Purpose
    - Clean up existing duplicate active VIP purchases
    - Add constraint to prevent future duplicates
    - Ensures users complete their current VIP before starting a new one

  2. Changes
    - Mark older duplicate active VIPs as completed
    - Add partial unique index on (user_id, vip_level, category_id) WHERE status != 'rejected' AND is_completed = false

  3. Notes
    - Keeps the most recent VIP purchase active, marks older ones as completed
    - The partial index only applies to non-rejected and incomplete purchases
    - Users can have multiple completed or rejected purchases for the same category/level
*/

-- First, find and mark duplicate active VIP purchases as completed (keep only the newest one)
WITH ranked_vips AS (
  SELECT 
    id,
    user_id,
    vip_level,
    category_id,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, vip_level, category_id 
      ORDER BY created_at DESC
    ) as rn
  FROM vip_purchases
  WHERE status != 'rejected' AND is_completed = false
)
UPDATE vip_purchases
SET is_completed = true
WHERE id IN (
  SELECT id FROM ranked_vips WHERE rn > 1
);

-- Drop existing index if it exists
DROP INDEX IF EXISTS unique_active_vip_purchase;

-- Create partial unique index to prevent duplicate active VIP purchases
CREATE UNIQUE INDEX unique_active_vip_purchase
ON vip_purchases (user_id, vip_level, category_id)
WHERE status != 'rejected' AND is_completed = false;

-- Add comment to document the constraint
COMMENT ON INDEX unique_active_vip_purchase IS
  'Ensures users can only have one active (non-rejected, incomplete) VIP purchase per category and level';