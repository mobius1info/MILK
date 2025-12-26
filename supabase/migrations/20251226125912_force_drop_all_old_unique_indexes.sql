/*
  # Force Drop All Old Unique Indexes

  Ensures all old unique constraint indexes are removed.
  Only keeps the correct unique_active_vip_purchase index.
*/

-- Drop all possible variations of old unique indexes
DROP INDEX IF EXISTS idx_vip_purchases_unique_active CASCADE;
DROP INDEX IF EXISTS idx_vip_purchases_unique CASCADE;
DROP INDEX IF EXISTS vip_purchases_unique_active CASCADE;
DROP INDEX IF EXISTS vip_purchases_user_level_active CASCADE;

-- Verify the correct index exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'unique_active_vip_purchase'
  ) THEN
    CREATE UNIQUE INDEX unique_active_vip_purchase
    ON vip_purchases (user_id, vip_level, category_id)
    WHERE status != 'rejected' AND is_completed = false;
  END IF;
END $$;