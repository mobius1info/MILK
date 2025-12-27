/*
  # Fix VIP BONUS Categories to Match Products

  1. Problem
    - VIP BONUS levels use lowercase categories (electronics, fashion, home, beauty, sports)
    - Products table has categories with proper casing (Accessories, Clothing, Kitchen Appliances, Apple Tech, Crypto Mining)
    - This mismatch causes no products to be found when purchasing VIP BONUS tasks
  
  2. Solution
    - Update VIP BONUS levels to use existing product categories
    - Map VIP BONUS categories to real product categories
  
  3. Changes
    - VIP 6 BONUS: sports -> Accessories (first bonus level)
    - VIP BONUS - Electronics: electronics -> Apple Tech
    - VIP BONUS - Fashion: fashion -> Clothing
    - VIP BONUS - Home: home -> Kitchen Appliances
    - VIP BONUS - Beauty: beauty -> Accessories (duplicate for variety)
    - VIP BONUS - Sports: sports -> Crypto Mining
*/

UPDATE vip_levels
SET category = 'Accessories'
WHERE level = 6 AND is_bonus = true;

UPDATE vip_levels
SET category = 'Apple Tech'
WHERE level = 100 AND is_bonus = true;

UPDATE vip_levels
SET category = 'Clothing'
WHERE level = 101 AND is_bonus = true;

UPDATE vip_levels
SET category = 'Kitchen Appliances'
WHERE level = 102 AND is_bonus = true;

UPDATE vip_levels
SET category = 'Accessories'
WHERE level = 103 AND is_bonus = true;

UPDATE vip_levels
SET category = 'Crypto Mining'
WHERE level = 104 AND is_bonus = true;