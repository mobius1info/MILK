/*
  # Add total_products column to product_progress

  Adds the missing total_products field to track the total number of products
  in the VIP level for progress tracking.
*/

-- Add total_products column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_progress' AND column_name = 'total_products'
  ) THEN
    ALTER TABLE product_progress 
    ADD COLUMN total_products integer DEFAULT 25 NOT NULL;
  END IF;
END $$;
