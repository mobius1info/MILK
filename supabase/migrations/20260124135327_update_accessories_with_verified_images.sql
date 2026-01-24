/*
  # Update Accessories Products with Verified Name-Image Pairs
*/

DO $$
DECLARE
  acc_cat_id UUID;
BEGIN
  SELECT id INTO acc_cat_id FROM categories WHERE name = 'Accessories';
  
  UPDATE products SET 
    name = 'Black Backpack',
    description = 'Stylish black backpack',
    image_url = 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 0);

  UPDATE products SET 
    name = 'Gold Bracelet',
    description = 'Elegant gold bracelet',
    image_url = 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 1);

  UPDATE products SET 
    name = 'Leather Card Wallet',
    description = 'Slim leather card wallet',
    image_url = 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 2);

  UPDATE products SET 
    name = 'Pink Makeup Bag',
    description = 'Stylish pink makeup bag',
    image_url = 'https://images.pexels.com/photos/2866796/pexels-photo-2866796.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 3);

  UPDATE products SET 
    name = 'Silver Cufflinks',
    description = 'Classic silver cufflinks',
    image_url = 'https://images.pexels.com/photos/1261422/pexels-photo-1261422.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 4);

  UPDATE products SET 
    name = 'Luxury Wristwatch',
    description = 'Premium luxury wristwatch',
    image_url = 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 5);

  UPDATE products SET 
    name = 'Travel Duffel Bag',
    description = 'Spacious travel duffel bag',
    image_url = 'https://images.pexels.com/photos/1545998/pexels-photo-1545998.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 6);

  UPDATE products SET 
    name = 'Diamond Earrings',
    description = 'Sparkling diamond earrings',
    image_url = 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 7);

  UPDATE products SET 
    name = 'Eyeglasses Case',
    description = 'Protective eyeglasses case',
    image_url = 'https://images.pexels.com/photos/947885/pexels-photo-947885.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 8);

  UPDATE products SET 
    name = 'Straw Sun Hat',
    description = 'Classic straw sun hat',
    image_url = 'https://images.pexels.com/photos/984619/pexels-photo-984619.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 9);

  UPDATE products SET 
    name = 'Metal Keychain',
    description = 'Durable metal keychain',
    image_url = 'https://images.pexels.com/photos/4226881/pexels-photo-4226881.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 10);

  UPDATE products SET 
    name = 'Laptop Messenger Bag',
    description = 'Professional laptop bag',
    image_url = 'https://images.pexels.com/photos/2422476/pexels-photo-2422476.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 11);

  UPDATE products SET 
    name = 'Brown Leather Wallet',
    description = 'Classic brown leather wallet',
    image_url = 'https://images.pexels.com/photos/915915/pexels-photo-915915.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 12);

  UPDATE products SET 
    name = 'Leather Luggage Tag',
    description = 'Premium leather luggage tag',
    image_url = 'https://images.pexels.com/photos/2393816/pexels-photo-2393816.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 13);

  UPDATE products SET 
    name = 'Canvas Shoulder Bag',
    description = 'Casual canvas shoulder bag',
    image_url = 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 14);

  UPDATE products SET 
    name = 'Gold Money Clip',
    description = 'Elegant gold money clip',
    image_url = 'https://images.pexels.com/photos/4968391/pexels-photo-4968391.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 15);

  UPDATE products SET 
    name = 'Pearl Necklace',
    description = 'Elegant pearl necklace',
    image_url = 'https://images.pexels.com/photos/1395306/pexels-photo-1395306.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 16);

  UPDATE products SET 
    name = 'iPhone Case',
    description = 'Protective iPhone case',
    image_url = 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 17);

  UPDATE products SET 
    name = 'Silk Pocket Square',
    description = 'Elegant silk pocket square',
    image_url = 'https://images.pexels.com/photos/45055/pexels-photo-45055.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 18);

  UPDATE products SET 
    name = 'Diamond Ring',
    description = 'Stunning diamond ring',
    image_url = 'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 19);

  UPDATE products SET 
    name = 'Aviator Sunglasses',
    description = 'Classic aviator sunglasses',
    image_url = 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 20);

  UPDATE products SET 
    name = 'Gold Tie Clip',
    description = 'Elegant gold tie clip',
    image_url = 'https://images.pexels.com/photos/45055/pexels-photo-45055.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 21);

  UPDATE products SET 
    name = 'Passport Holder',
    description = 'Leather passport holder',
    image_url = 'https://images.pexels.com/photos/2393815/pexels-photo-2393815.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 22);

  UPDATE products SET 
    name = 'Black Umbrella',
    description = 'Classic black umbrella',
    image_url = 'https://images.pexels.com/photos/1486861/pexels-photo-1486861.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 23);

  UPDATE products SET 
    name = 'Sports Wristband',
    description = 'Athletic sports wristband',
    image_url = 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = acc_cat_id ORDER BY name LIMIT 1 OFFSET 24);
END $$;
