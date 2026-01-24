/*
  # Update Product Prices by VIP Level
  
  1. Changes
    - Update product prices for VIP 2 (Clothing): random prices from 101 to 500
    - Update product prices for VIP 3 (Kitchen Appliances): random prices from 515 to 1950
    - Update product prices for VIP 4 (Apple Tech): random prices from 2050 to 4950
    - Update product prices for VIP 5 (Crypto Mining): random prices from 5050 to 9965
  
  2. Notes
    - Each product gets a unique random price within the specified range
    - Prices are rounded to 2 decimal places for consistency
*/

-- VIP 2 (Clothing): prices from 101 to 500
UPDATE products
SET price = ROUND((101 + random() * (500 - 101))::numeric, 2)
WHERE category_id = '33333333-3333-3333-3333-333333333333';

-- VIP 3 (Kitchen Appliances): prices from 515 to 1950
UPDATE products
SET price = ROUND((515 + random() * (1950 - 515))::numeric, 2)
WHERE category_id = '55555555-5555-5555-5555-555555555555';

-- VIP 4 (Apple Tech): prices from 2050 to 4950
UPDATE products
SET price = ROUND((2050 + random() * (4950 - 2050))::numeric, 2)
WHERE category_id = '22222222-2222-2222-2222-222222222222';

-- VIP 5 (Crypto Mining): prices from 5050 to 9965
UPDATE products
SET price = ROUND((5050 + random() * (9965 - 5050))::numeric, 2)
WHERE category_id = '44444444-4444-4444-4444-444444444444';
