/*
  # Add category text field to products table

  1. Changes
    - Add `category` column (text) for backward compatibility with existing code
    - Add indexes for better performance
    - Keep category_id for foreign key relationships
    
  2. Notes
    - Both fields can coexist: category_id for relational data, category for quick access
    - Future code can migrate to use category_id exclusively
*/

-- Add category text field
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category text;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Add other missing fields that might be needed
ALTER TABLE products
ADD COLUMN IF NOT EXISTS rating decimal(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS reviews integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS vip_level integer DEFAULT 0;