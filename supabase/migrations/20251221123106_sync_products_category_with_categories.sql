/*
  # Sync products category field with categories table

  1. Data Migration
    - Update products.category to match categories.name based on category_id
    - This provides backward compatibility for code using the text category field
    
  2. Trigger
    - Add trigger to auto-sync category when category_id changes
*/

-- Update existing products with category name from categories table
UPDATE products p
SET category = c.name
FROM categories c
WHERE p.category_id = c.id
  AND p.category IS NULL;

-- Create function to sync category field when category_id changes
CREATE OR REPLACE FUNCTION sync_product_category()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.category_id IS NOT NULL THEN
    SELECT name INTO NEW.category
    FROM categories
    WHERE id = NEW.category_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS products_sync_category_trigger ON products;
CREATE TRIGGER products_sync_category_trigger
  BEFORE INSERT OR UPDATE OF category_id ON products
  FOR EACH ROW
  EXECUTE FUNCTION sync_product_category();