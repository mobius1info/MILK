/*
  # Fix Demo Product Images - Same as Accessories
  
  Updating all Demo products with same images as Accessories.
*/

-- Backpack
UPDATE products SET image_url = 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Backpack' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Bracelet
UPDATE products SET image_url = 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Bracelet' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Card Holder
UPDATE products SET image_url = 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Card Holder' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Cosmetic Bag
UPDATE products SET image_url = 'https://images.pexels.com/photos/2866796/pexels-photo-2866796.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Cosmetic Bag' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Cufflinks
UPDATE products SET image_url = 'https://images.pexels.com/photos/1261422/pexels-photo-1261422.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Cufflinks' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Designer Watch
UPDATE products SET image_url = 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Designer Watch' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Duffel Bag
UPDATE products SET image_url = 'https://images.pexels.com/photos/1545998/pexels-photo-1545998.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Duffel Bag' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Earrings
UPDATE products SET image_url = 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Earrings' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Glasses Case
UPDATE products SET image_url = 'https://images.pexels.com/photos/947885/pexels-photo-947885.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Glasses Case' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Hat
UPDATE products SET image_url = 'https://images.pexels.com/photos/984619/pexels-photo-984619.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Hat' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Keychain
UPDATE products SET image_url = 'https://images.pexels.com/photos/4226881/pexels-photo-4226881.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Keychain' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Laptop Bag
UPDATE products SET image_url = 'https://images.pexels.com/photos/2422476/pexels-photo-2422476.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Laptop Bag' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Leather Wallet
UPDATE products SET image_url = 'https://images.pexels.com/photos/915915/pexels-photo-915915.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Leather Wallet' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Luggage Tag
UPDATE products SET image_url = 'https://images.pexels.com/photos/2393816/pexels-photo-2393816.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Luggage Tag' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Messenger Bag
UPDATE products SET image_url = 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Messenger Bag' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Money Clip
UPDATE products SET image_url = 'https://images.pexels.com/photos/4968391/pexels-photo-4968391.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Money Clip' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Necklace
UPDATE products SET image_url = 'https://images.pexels.com/photos/1395306/pexels-photo-1395306.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Necklace' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Phone Case
UPDATE products SET image_url = 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Phone Case' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Pocket Square
UPDATE products SET image_url = 'https://images.pexels.com/photos/45055/pexels-photo-45055.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Pocket Square' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Ring
UPDATE products SET image_url = 'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Ring' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Sunglasses
UPDATE products SET image_url = 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Sunglasses' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Tie Clip
UPDATE products SET image_url = 'https://images.pexels.com/photos/45055/pexels-photo-45055.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Tie Clip' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Travel Wallet
UPDATE products SET image_url = 'https://images.pexels.com/photos/2393815/pexels-photo-2393815.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Travel Wallet' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Umbrella
UPDATE products SET image_url = 'https://images.pexels.com/photos/1486861/pexels-photo-1486861.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Umbrella' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');

-- Wristband
UPDATE products SET image_url = 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=800' 
WHERE name = 'Wristband' AND category_id = (SELECT id FROM categories WHERE name = 'Demo');
