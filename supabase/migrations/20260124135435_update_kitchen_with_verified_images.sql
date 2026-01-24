/*
  # Update Kitchen Appliances Products with Verified Name-Image Pairs
*/

DO $$
DECLARE
  kitchen_cat_id UUID;
BEGIN
  SELECT id INTO kitchen_cat_id FROM categories WHERE name = 'Kitchen Appliances';
  
  UPDATE products SET 
    name = 'Digital Air Fryer',
    description = 'Modern digital air fryer',
    image_url = 'https://images.pexels.com/photos/6996150/pexels-photo-6996150.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 0);

  UPDATE products SET 
    name = 'High-Speed Blender',
    description = 'Professional high-speed blender',
    image_url = 'https://images.pexels.com/photos/1797105/pexels-photo-1797105.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 1);

  UPDATE products SET 
    name = 'Fresh Bread Loaf',
    description = 'Homemade bread maker',
    image_url = 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 2);

  UPDATE products SET 
    name = 'Cast Iron Pan',
    description = 'Heavy-duty cast iron pan',
    image_url = 'https://images.pexels.com/photos/3992206/pexels-photo-3992206.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 3);

  UPDATE products SET 
    name = 'Coffee Bean Grinder',
    description = 'Electric coffee bean grinder',
    image_url = 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 4);

  UPDATE products SET 
    name = 'Stainless Cookware Set',
    description = 'Premium stainless steel cookware',
    image_url = 'https://images.pexels.com/photos/4226870/pexels-photo-4226870.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 5);

  UPDATE products SET 
    name = 'Bamboo Cutting Board',
    description = 'Eco-friendly bamboo cutting board',
    image_url = 'https://images.pexels.com/photos/4226863/pexels-photo-4226863.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 6);

  UPDATE products SET 
    name = 'Electric Cooker',
    description = 'Multi-function electric cooker',
    image_url = 'https://images.pexels.com/photos/6996083/pexels-photo-6996083.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 7);

  UPDATE products SET 
    name = 'Built-in Dishwasher',
    description = 'Energy-efficient dishwasher',
    image_url = 'https://images.pexels.com/photos/5824518/pexels-photo-5824518.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 8);

  UPDATE products SET 
    name = 'Red Dutch Oven',
    description = 'Enameled cast iron dutch oven',
    image_url = 'https://images.pexels.com/photos/2544829/pexels-photo-2544829.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 9);

  UPDATE products SET 
    name = 'BBQ Grill',
    description = 'Outdoor BBQ grill',
    image_url = 'https://images.pexels.com/photos/1251198/pexels-photo-1251198.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 10);

  UPDATE products SET 
    name = 'Glass Electric Kettle',
    description = 'Modern glass electric kettle',
    image_url = 'https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 11);

  UPDATE products SET 
    name = 'Espresso Coffee Machine',
    description = 'Professional espresso machine',
    image_url = 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 12);

  UPDATE products SET 
    name = 'Kitchen Food Processor',
    description = 'Multi-blade food processor',
    image_url = 'https://images.pexels.com/photos/4397919/pexels-photo-4397919.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 13);

  UPDATE products SET 
    name = 'Electric Hand Mixer',
    description = 'Powerful electric hand mixer',
    image_url = 'https://images.pexels.com/photos/4397893/pexels-photo-4397893.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 14);

  UPDATE products SET 
    name = 'Ice Cream Scoop',
    description = 'Professional ice cream scoop',
    image_url = 'https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 15);

  UPDATE products SET 
    name = 'Multi Cooker',
    description = 'Programmable multi cooker',
    image_url = 'https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 16);

  UPDATE products SET 
    name = 'Fresh Orange Juicer',
    description = 'Electric citrus juicer',
    image_url = 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 17);

  UPDATE products SET 
    name = 'Chef Knife Set',
    description = 'Professional chef knife set',
    image_url = 'https://images.pexels.com/photos/3622614/pexels-photo-3622614.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 18);

  UPDATE products SET 
    name = 'Compact Microwave',
    description = 'Space-saving microwave oven',
    image_url = 'https://images.pexels.com/photos/6996142/pexels-photo-6996142.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 19);

  UPDATE products SET 
    name = 'Rice Steamer',
    description = 'Digital rice steamer',
    image_url = 'https://images.pexels.com/photos/6996150/pexels-photo-6996150.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 20);

  UPDATE products SET 
    name = 'Slow Cooker Pot',
    description = 'Large capacity slow cooker',
    image_url = 'https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 21);

  UPDATE products SET 
    name = 'Stand Mixer',
    description = 'Professional stand mixer',
    image_url = 'https://images.pexels.com/photos/4397919/pexels-photo-4397919.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 22);

  UPDATE products SET 
    name = 'Toaster Oven',
    description = 'Compact toaster oven',
    image_url = 'https://images.pexels.com/photos/7937007/pexels-photo-7937007.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 23);

  UPDATE products SET 
    name = 'Belgian Waffle Maker',
    description = 'Classic Belgian waffle maker',
    image_url = 'https://images.pexels.com/photos/6287211/pexels-photo-6287211.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = kitchen_cat_id ORDER BY name LIMIT 1 OFFSET 24);
END $$;
