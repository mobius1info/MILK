/*
  # Add price field to VIP levels

  1. Changes
    - Add `price` column to `vip_levels` table (decimal, not null, default 0)
    - Price represents the cost for purchasing access to this VIP level
  
  2. Security
    - No changes to RLS policies needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vip_levels' AND column_name = 'price'
  ) THEN
    ALTER TABLE vip_levels ADD COLUMN price decimal(10,2) NOT NULL DEFAULT 0;
  END IF;
END $$;
