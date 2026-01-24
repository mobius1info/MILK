/*
  # Round Product Prices to Whole Numbers
  
  Remove decimal places from all product prices.
*/

UPDATE products SET price = ROUND(price);
