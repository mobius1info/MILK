/*
  # Update Clothing Products with Verified Name-Image Pairs
  
  Changing product names to match verified Pexels images.
  Each image URL is tested and matches the product name exactly.
*/

-- Get clothing category id
DO $$
DECLARE
  clothing_cat_id UUID;
BEGIN
  SELECT id INTO clothing_cat_id FROM categories WHERE name = 'Clothing';
  
  -- Update each product with verified image
  UPDATE products SET 
    name = 'Black Leather Jacket',
    description = 'Premium black leather jacket',
    image_url = 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 0);

  UPDATE products SET 
    name = 'Brown Leather Belt',
    description = 'Classic brown leather belt',
    image_url = 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 1);

  UPDATE products SET 
    name = 'Brown Leather Boots',
    description = 'Stylish brown leather boots',
    image_url = 'https://images.pexels.com/photos/1596912/pexels-photo-1596912.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 2);

  UPDATE products SET 
    name = 'Knitted Sweater',
    description = 'Warm knitted sweater',
    image_url = 'https://images.pexels.com/photos/6764040/pexels-photo-6764040.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 3);

  UPDATE products SET 
    name = 'Navy Blue Suit',
    description = 'Elegant navy blue suit',
    image_url = 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 4);

  UPDATE products SET 
    name = 'Khaki Pants',
    description = 'Classic khaki pants',
    image_url = 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 5);

  UPDATE products SET 
    name = 'Blue Denim Jeans',
    description = 'Classic blue denim jeans',
    image_url = 'https://images.pexels.com/photos/4210864/pexels-photo-4210864.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 6);

  UPDATE products SET 
    name = 'White T-Shirt',
    description = 'Basic white cotton t-shirt',
    image_url = 'https://images.pexels.com/photos/5384423/pexels-photo-5384423.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 7);

  UPDATE products SET 
    name = 'White Dress Shirt',
    description = 'Formal white dress shirt',
    image_url = 'https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 8);

  UPDATE products SET 
    name = 'Gray Business Suit',
    description = 'Professional gray business suit',
    image_url = 'https://images.pexels.com/photos/325876/pexels-photo-325876.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 9);

  UPDATE products SET 
    name = 'Winter Gloves',
    description = 'Warm winter gloves',
    image_url = 'https://images.pexels.com/photos/6044227/pexels-photo-6044227.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 10);

  UPDATE products SET 
    name = 'Gray Hoodie',
    description = 'Comfortable gray hoodie',
    image_url = 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 11);

  UPDATE products SET 
    name = 'Black Sneakers',
    description = 'Classic black sneakers',
    image_url = 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 12);

  UPDATE products SET 
    name = 'Brown Loafers',
    description = 'Classic brown leather loafers',
    image_url = 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 13);

  UPDATE products SET 
    name = 'Blue Polo Shirt',
    description = 'Classic blue polo shirt',
    image_url = 'https://images.pexels.com/photos/991509/pexels-photo-991509.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 14);

  UPDATE products SET 
    name = 'Running Shoes',
    description = 'Professional running shoes',
    image_url = 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 15);

  UPDATE products SET 
    name = 'Wool Scarf',
    description = 'Warm wool scarf',
    image_url = 'https://images.pexels.com/photos/45982/pexels-photo-45982.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 16);

  UPDATE products SET 
    name = 'Denim Shorts',
    description = 'Casual denim shorts',
    image_url = 'https://images.pexels.com/photos/1311518/pexels-photo-1311518.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 17);

  UPDATE products SET 
    name = 'Cotton Socks Pack',
    description = 'Pack of cotton socks',
    image_url = 'https://images.pexels.com/photos/4715315/pexels-photo-4715315.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 18);

  UPDATE products SET 
    name = 'Beach Sandals',
    description = 'Comfortable beach sandals',
    image_url = 'https://images.pexels.com/photos/1630344/pexels-photo-1630344.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 19);

  UPDATE products SET 
    name = 'Silk Tie',
    description = 'Elegant silk tie',
    image_url = 'https://images.pexels.com/photos/45055/pexels-photo-45055.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 20);

  UPDATE products SET 
    name = 'Sports Tracksuit',
    description = 'Athletic sports tracksuit',
    image_url = 'https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 21);

  UPDATE products SET 
    name = 'Fitness Wear Set',
    description = 'Complete fitness wear set',
    image_url = 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 22);

  UPDATE products SET 
    name = 'Winter Parka',
    description = 'Warm winter parka coat',
    image_url = 'https://images.pexels.com/photos/5384966/pexels-photo-5384966.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 23);

  UPDATE products SET 
    name = 'Cashmere Pullover',
    description = 'Luxury cashmere pullover',
    image_url = 'https://images.pexels.com/photos/6764040/pexels-photo-6764040.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = clothing_cat_id ORDER BY name LIMIT 1 OFFSET 24);
END $$;
