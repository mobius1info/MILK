/*
  # Fix commission percentage for sports category products

  1. Problem
    - All 50 products in 'sports' category have commission_percentage = 0
    - This causes zero commission earnings when purchasing these products
  
  2. Solution
    - Update all sports products to have commission_percentage between 5-8%
    - This matches the commission rates of other categories
  
  3. Changes
    - Set commission_percentage to random value between 5.00 and 8.00 for sports products
*/

UPDATE products
SET commission_percentage = (5.0 + random() * 3.0)
WHERE category = 'sports' AND commission_percentage = 0;