/*
  # Update VIP Levels to Single Category with Image

  1. Changes
    - Replace `categories` array with single `category` text field
    - Add `category_image_url` for visual representation of category
    - Each VIP level now manages exactly one category
    
  2. Migration Strategy
    - Drop existing categories column
    - Add new category column (text)
    - Add category_image_url column
    
  3. Notes
    - Admin will need to set category and image for each VIP level
    - This simplifies the VIP level management
    - Each category gets its own visual identity
*/

-- Add new columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vip_levels' AND column_name = 'category'
  ) THEN
    ALTER TABLE vip_levels ADD COLUMN category text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vip_levels' AND column_name = 'category_image_url'
  ) THEN
    ALTER TABLE vip_levels ADD COLUMN category_image_url text DEFAULT '';
  END IF;
END $$;

-- Migrate data from categories array to single category
-- Take the first category from the array if it exists
UPDATE vip_levels
SET category = COALESCE(categories[1], '')
WHERE category = '';

-- Drop the old categories column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vip_levels' AND column_name = 'categories'
  ) THEN
    ALTER TABLE vip_levels DROP COLUMN categories;
  END IF;
END $$;