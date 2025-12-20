/*
  # Update Product Prices and Add Quantity Multipliers

  1. Changes
    - Update all product prices to new values (from $2 to $8)
    - Add quantity multipliers (x1, x2, x3, x4, x5)
    - Set commission percentages to ensure 130-150% ROI
    - Total cost of all products ~$100
    - Total commission earned ~$130-150

  2. Product Distribution
    - 15 products with x1 multiplier
    - 5 products with x2 multiplier
    - 3 products with x3 multiplier
    - 1 product with x4 multiplier
    - 1 product with x5 multiplier

  3. Logic
    - VIP purchase costs $100
    - Client gets $100 balance
    - Client buys products for ~$100 total
    - Client earns ~$130-150 in commission
*/

UPDATE products SET price = 3.50, quantity_multiplier = 1, commission_percentage = 5.5 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 0);
UPDATE products SET price = 4.00, quantity_multiplier = 1, commission_percentage = 6.0 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 1);
UPDATE products SET price = 3.00, quantity_multiplier = 2, commission_percentage = 5.0 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 2);
UPDATE products SET price = 4.50, quantity_multiplier = 1, commission_percentage = 6.5 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 3);
UPDATE products SET price = 5.00, quantity_multiplier = 1, commission_percentage = 7.0 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 4);
UPDATE products SET price = 3.50, quantity_multiplier = 3, commission_percentage = 5.5 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 5);
UPDATE products SET price = 4.00, quantity_multiplier = 1, commission_percentage = 6.0 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 6);
UPDATE products SET price = 2.50, quantity_multiplier = 1, commission_percentage = 5.0 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 7);
UPDATE products SET price = 5.50, quantity_multiplier = 1, commission_percentage = 7.5 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 8);
UPDATE products SET price = 3.00, quantity_multiplier = 4, commission_percentage = 5.5 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 9);
UPDATE products SET price = 4.50, quantity_multiplier = 1, commission_percentage = 6.5 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 10);
UPDATE products SET price = 3.50, quantity_multiplier = 2, commission_percentage = 6.0 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 11);
UPDATE products SET price = 4.00, quantity_multiplier = 1, commission_percentage = 6.0 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 12);
UPDATE products SET price = 5.00, quantity_multiplier = 1, commission_percentage = 7.0 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 13);
UPDATE products SET price = 3.00, quantity_multiplier = 2, commission_percentage = 5.5 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 14);
UPDATE products SET price = 4.50, quantity_multiplier = 1, commission_percentage = 6.5 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 15);
UPDATE products SET price = 2.50, quantity_multiplier = 3, commission_percentage = 5.0 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 16);
UPDATE products SET price = 5.50, quantity_multiplier = 1, commission_percentage = 7.5 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 17);
UPDATE products SET price = 3.50, quantity_multiplier = 1, commission_percentage = 6.0 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 18);
UPDATE products SET price = 4.00, quantity_multiplier = 2, commission_percentage = 6.0 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 19);
UPDATE products SET price = 3.00, quantity_multiplier = 5, commission_percentage = 5.5 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 20);
UPDATE products SET price = 4.50, quantity_multiplier = 1, commission_percentage = 6.5 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 21);
UPDATE products SET price = 5.00, quantity_multiplier = 3, commission_percentage = 7.0 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 22);
UPDATE products SET price = 3.50, quantity_multiplier = 2, commission_percentage = 6.0 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 23);
UPDATE products SET price = 4.00, quantity_multiplier = 1, commission_percentage = 6.0 WHERE id = (SELECT id FROM products ORDER BY created_at LIMIT 1 OFFSET 24);
