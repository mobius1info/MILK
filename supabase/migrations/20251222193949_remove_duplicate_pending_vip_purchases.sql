/*
  # Remove Duplicate Pending VIP Purchases

  1. Problem
    - Users can accidentally create duplicate VIP purchase requests (double-clicking)
    - When a VIP is completed (status='approved', is_completed=true), 
      new pending requests can be created before the old one is marked as 'completed'

  2. Solution
    - Delete duplicate pending VIP purchases where:
      - User already has a completed VIP for same level and category
      - Keep only the most recent pending request
    - Update old completed VIPs to have status='completed' (not just is_completed=true)

  3. Changes
    - Mark all approved VIPs with is_completed=true as status='completed'
    - Delete older duplicate pending requests (keep newest one)
*/

-- First, mark all completed VIPs as status='completed'
UPDATE vip_purchases
SET status = 'completed'
WHERE status = 'approved' 
  AND is_completed = true;

-- Delete duplicate pending VIP purchases (keep only the newest one)
-- This handles cases where user double-clicked the purchase button
WITH ranked_pending AS (
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
  WHERE status = 'pending'
)
DELETE FROM vip_purchases
WHERE id IN (
  SELECT id FROM ranked_pending WHERE rn > 1
);
