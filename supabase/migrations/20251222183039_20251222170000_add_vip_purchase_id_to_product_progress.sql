/*
  # Add VIP Purchase ID to Product Progress

  1. Changes
    - Add vip_purchase_id column to product_progress table
    - Update unique constraint to include vip_purchase_id
    - This allows users to repeat the same VIP level multiple times
    - Each VIP purchase will have its own independent progress tracking
  
  2. Benefits
    - Users can purchase the same VIP level multiple times
    - Each purchase has independent 25 products to complete
    - No "products finished" error when starting new VIP purchase
*/

-- Add vip_purchase_id column to product_progress
ALTER TABLE product_progress
ADD COLUMN IF NOT EXISTS vip_purchase_id uuid REFERENCES vip_purchases(id) ON DELETE CASCADE;

-- Drop old unique constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'product_progress_user_id_vip_level_category_id_key'
  ) THEN
    ALTER TABLE product_progress 
    DROP CONSTRAINT product_progress_user_id_vip_level_category_id_key;
  END IF;
END $$;

-- Create new unique constraint with vip_purchase_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'product_progress_user_vip_purchase_unique'
  ) THEN
    ALTER TABLE product_progress 
    ADD CONSTRAINT product_progress_user_vip_purchase_unique 
    UNIQUE (user_id, vip_purchase_id);
  END IF;
END $$;

-- Update existing records to link with vip_purchases
UPDATE product_progress pp
SET vip_purchase_id = vp.id
FROM vip_purchases vp
WHERE pp.user_id = vp.user_id
  AND pp.vip_level = vp.vip_level
  AND pp.category_id = vp.category_id
  AND pp.vip_purchase_id IS NULL
  AND vp.status = 'approved'
  AND vp.id = (
    SELECT id FROM vip_purchases vp2
    WHERE vp2.user_id = pp.user_id
      AND vp2.vip_level = pp.vip_level
      AND vp2.category_id = pp.category_id
      AND vp2.status = 'approved'
    ORDER BY created_at DESC
    LIMIT 1
  );
