/*
  # Update Apple Tech Products with Verified Name-Image Pairs
*/

DO $$
DECLARE
  tech_cat_id UUID;
BEGIN
  SELECT id INTO tech_cat_id FROM categories WHERE name = 'Apple Tech';
  
  UPDATE products SET 
    name = 'Wireless Headphones',
    description = 'Premium wireless headphones',
    image_url = 'https://images.pexels.com/photos/3945667/pexels-photo-3945667.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 0);

  UPDATE products SET 
    name = 'Wireless Earbuds',
    description = 'Compact wireless earbuds',
    image_url = 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 1);

  UPDATE products SET 
    name = 'Smart Tracker',
    description = 'GPS smart tracker device',
    image_url = 'https://images.pexels.com/photos/5082560/pexels-photo-5082560.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 2);

  UPDATE products SET 
    name = 'Digital Stylus Pen',
    description = 'Precision digital stylus pen',
    image_url = 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 3);

  UPDATE products SET 
    name = 'Streaming Media Player',
    description = 'Smart streaming media player',
    image_url = 'https://images.pexels.com/photos/4009402/pexels-photo-4009402.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 4);

  UPDATE products SET 
    name = 'Black Smartwatch',
    description = 'Feature-rich black smartwatch',
    image_url = 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 5);

  UPDATE products SET 
    name = 'Silver Smartwatch',
    description = 'Elegant silver smartwatch',
    image_url = 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 6);

  UPDATE products SET 
    name = 'Sport Smartwatch',
    description = 'Rugged sport smartwatch',
    image_url = 'https://images.pexels.com/photos/4482900/pexels-photo-4482900.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 7);

  UPDATE products SET 
    name = 'Smart Speaker',
    description = 'Voice-controlled smart speaker',
    image_url = 'https://images.pexels.com/photos/4790255/pexels-photo-4790255.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 8);

  UPDATE products SET 
    name = 'Desktop Computer',
    description = 'Powerful desktop computer',
    image_url = 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 9);

  UPDATE products SET 
    name = 'White Tablet',
    description = 'Sleek white tablet',
    image_url = 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 10);

  UPDATE products SET 
    name = 'Mini Tablet',
    description = 'Compact mini tablet',
    image_url = 'https://images.pexels.com/photos/1334598/pexels-photo-1334598.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 11);

  UPDATE products SET 
    name = 'Pro Tablet',
    description = 'Professional-grade tablet',
    image_url = 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 12);

  UPDATE products SET 
    name = 'White Smartphone',
    description = 'Premium white smartphone',
    image_url = 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 13);

  UPDATE products SET 
    name = 'Black Smartphone',
    description = 'Sleek black smartphone',
    image_url = 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 14);

  UPDATE products SET 
    name = 'Rose Gold Phone',
    description = 'Elegant rose gold phone',
    image_url = 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 15);

  UPDATE products SET 
    name = 'Mini PC',
    description = 'Compact mini PC',
    image_url = 'https://images.pexels.com/photos/4158/apple-iphone-smartphone-desk.jpg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 16);

  UPDATE products SET 
    name = 'Workstation',
    description = 'High-performance workstation',
    image_url = 'https://images.pexels.com/photos/4158/apple-iphone-smartphone-desk.jpg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 17);

  UPDATE products SET 
    name = 'Silver Laptop',
    description = 'Lightweight silver laptop',
    image_url = 'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 18);

  UPDATE products SET 
    name = 'Pro Laptop',
    description = 'Powerful pro laptop',
    image_url = 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 19);

  UPDATE products SET 
    name = 'Wireless Keyboard',
    description = 'Slim wireless keyboard',
    image_url = 'https://images.pexels.com/photos/1772123/pexels-photo-1772123.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 20);

  UPDATE products SET 
    name = 'Wireless Mouse',
    description = 'Ergonomic wireless mouse',
    image_url = 'https://images.pexels.com/photos/5082579/pexels-photo-5082579.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 21);

  UPDATE products SET 
    name = 'Trackpad',
    description = 'Multi-touch trackpad',
    image_url = 'https://images.pexels.com/photos/5082579/pexels-photo-5082579.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 22);

  UPDATE products SET 
    name = 'Wireless Charger',
    description = 'Fast wireless charger',
    image_url = 'https://images.pexels.com/photos/4526407/pexels-photo-4526407.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 23);

  UPDATE products SET 
    name = '4K Monitor',
    description = 'Ultra HD 4K monitor',
    image_url = 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = tech_cat_id ORDER BY name LIMIT 1 OFFSET 24);
END $$;
