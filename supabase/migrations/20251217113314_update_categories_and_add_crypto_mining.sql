/*
  # Update Product Categories and Add Crypto Mining Category

  ## Changes
  
  1. Remove Beauty category products
  2. Update category mappings for VIP levels:
     - VIP 1 (balance >= 100): Sports Equipment - 4% commission
     - VIP 2 (balance >= 500): Clothing - 10% commission
     - VIP 3 (balance >= 2000): Home & Living - 15% commission
     - VIP 4 (balance >= 5000): Electronics - 17% commission
     - VIP 5 (balance >= 20000): Crypto Mining Equipment - 20% commission
  
  3. Update existing products to match new category structure
*/

-- Delete all products from Beauty category
DELETE FROM products WHERE category = 'Beauty';

-- Update category names to match VIP levels
UPDATE products SET category = 'Sports Equipment' WHERE category = 'Sports' AND vip_level = 1;
UPDATE products SET category = 'Clothing' WHERE category IN ('Fashion', 'Clothing') AND vip_level = 2;
UPDATE products SET category = 'Home & Living' WHERE category IN ('Home', 'Home & Living') AND vip_level = 3;
UPDATE products SET category = 'Electronics' WHERE category = 'Electronics' AND vip_level = 4;

-- Note: Crypto Mining Equipment products will be added via the application code
