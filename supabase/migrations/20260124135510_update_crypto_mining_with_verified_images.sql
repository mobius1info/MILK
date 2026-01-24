/*
  # Update Crypto Mining Products with Verified Name-Image Pairs
*/

DO $$
DECLARE
  crypto_cat_id UUID;
BEGIN
  SELECT id INTO crypto_cat_id FROM categories WHERE name = 'Crypto Mining';
  
  UPDATE products SET 
    name = 'Industrial AC Unit',
    description = 'Heavy-duty air conditioning unit',
    image_url = 'https://images.pexels.com/photos/5824901/pexels-photo-5824901.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 0);

  UPDATE products SET 
    name = 'Bitcoin Mining Rig',
    description = 'Professional bitcoin mining rig',
    image_url = 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 1);

  UPDATE products SET 
    name = 'Computer Motherboard',
    description = 'High-performance motherboard',
    image_url = 'https://images.pexels.com/photos/2582928/pexels-photo-2582928.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 2);

  UPDATE products SET 
    name = 'RAM Memory Module',
    description = 'High-speed RAM memory module',
    image_url = 'https://images.pexels.com/photos/4792733/pexels-photo-4792733.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 3);

  UPDATE products SET 
    name = 'Ethereum Mining Setup',
    description = 'Complete ethereum mining setup',
    image_url = 'https://images.pexels.com/photos/730564/pexels-photo-730564.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 4);

  UPDATE products SET 
    name = 'GPU Expansion Cards',
    description = 'PCI-E GPU expansion cards',
    image_url = 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 5);

  UPDATE products SET 
    name = 'Gaming Graphics Card',
    description = 'High-end gaming graphics card',
    image_url = 'https://images.pexels.com/photos/7915357/pexels-photo-7915357.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 6);

  UPDATE products SET 
    name = 'Circuit Board',
    description = 'Electronic circuit board',
    image_url = 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 7);

  UPDATE products SET 
    name = 'Liquid Cooling System',
    description = 'Advanced liquid cooling system',
    image_url = 'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 8);

  UPDATE products SET 
    name = 'Shipping Container',
    description = 'Industrial shipping container',
    image_url = 'https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 9);

  UPDATE products SET 
    name = 'AMD Processor',
    description = 'High-performance AMD processor',
    image_url = 'https://images.pexels.com/photos/2588757/pexels-photo-2588757.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 10);

  UPDATE products SET 
    name = 'Computer Monitor Setup',
    description = 'Multi-monitor computer setup',
    image_url = 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 11);

  UPDATE products SET 
    name = 'Dual Monitor Display',
    description = 'Professional dual monitor display',
    image_url = 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 12);

  UPDATE products SET 
    name = 'Server Motherboard',
    description = 'Enterprise server motherboard',
    image_url = 'https://images.pexels.com/photos/2582928/pexels-photo-2582928.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 13);

  UPDATE products SET 
    name = 'Power Supply Unit',
    description = 'High-wattage power supply unit',
    image_url = 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 14);

  UPDATE products SET 
    name = 'Network Router',
    description = 'High-speed network router',
    image_url = 'https://images.pexels.com/photos/4218546/pexels-photo-4218546.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 15);

  UPDATE products SET 
    name = 'Security Camera',
    description = 'HD security camera system',
    image_url = 'https://images.pexels.com/photos/430208/pexels-photo-430208.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 16);

  UPDATE products SET 
    name = 'Storage Shelving Unit',
    description = 'Heavy-duty storage shelving',
    image_url = 'https://images.pexels.com/photos/2881232/pexels-photo-2881232.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 17);

  UPDATE products SET 
    name = 'Software License Key',
    description = 'Professional software license',
    image_url = 'https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 18);

  UPDATE products SET 
    name = 'Industrial Ventilation',
    description = 'Industrial ventilation system',
    image_url = 'https://images.pexels.com/photos/5824901/pexels-photo-5824901.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 19);

  UPDATE products SET 
    name = 'NVMe SSD Drive',
    description = 'High-speed NVMe SSD storage',
    image_url = 'https://images.pexels.com/photos/4792731/pexels-photo-4792731.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 20);

  UPDATE products SET 
    name = 'Power Distribution Unit',
    description = 'Rack-mount power distribution unit',
    image_url = 'https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 21);

  UPDATE products SET 
    name = 'Thermal Compound',
    description = 'High-performance thermal compound',
    image_url = 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 22);

  UPDATE products SET 
    name = 'UPS Power Backup',
    description = 'Uninterruptible power supply',
    image_url = 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 23);

  UPDATE products SET 
    name = 'Voltage Stabilizer',
    description = 'Electronic voltage stabilizer',
    image_url = 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=800'
  WHERE id = (SELECT id FROM products WHERE category_id = crypto_cat_id ORDER BY name LIMIT 1 OFFSET 24);
END $$;
