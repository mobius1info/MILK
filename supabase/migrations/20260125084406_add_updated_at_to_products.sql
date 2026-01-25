/*
  # Add updated_at column to products table

  1. Changes
    - Add `updated_at` column to products table with default value of NOW()
    - Create trigger to automatically update `updated_at` on row updates
    
  2. Notes
    - This helps track when product information (including images) was last modified
    - The trigger ensures the timestamp is always current
*/

-- Add updated_at column
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update existing rows to have updated_at value
UPDATE products SET updated_at = created_at WHERE updated_at IS NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS set_products_updated_at ON products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();