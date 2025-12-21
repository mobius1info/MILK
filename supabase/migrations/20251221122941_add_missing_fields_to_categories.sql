/*
  # Add missing fields to categories table

  1. Changes
    - Add `display_name` column for user-friendly category names
    - Add `updated_at` column to track last modification time
    - Update existing categories with display_name based on name
    
  2. Data Migration
    - Set display_name to capitalized version of name for existing categories
*/

-- Add missing fields
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update existing categories to have display_name
UPDATE categories 
SET display_name = INITCAP(name)
WHERE display_name IS NULL;

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS categories_updated_at_trigger ON categories;
CREATE TRIGGER categories_updated_at_trigger
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();