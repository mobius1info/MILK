/*
  # Update All Product Images to Match Names
  
  1. Changes
    - Updates image_url for ALL products to properly match their names
    - Each product gets a relevant high-quality Pexels image
  
  2. Categories Updated
    - Accessories (VIP 1 & Demo)
    - Apple Tech (VIP 4)
    - Clothing (VIP 2)
    - Crypto Mining (VIP 5)
    - Kitchen Appliances (VIP 3)
*/

-- =============================================
-- ACCESSORIES (Category: 11111111-1111-1111-1111-111111111111)
-- =============================================

UPDATE products SET image_url = 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Backpack' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Bracelet' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/45057/pexels-photo-45057.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Card Holder' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/2866796/pexels-photo-2866796.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Cosmetic Bag' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1261422/pexels-photo-1261422.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Cufflinks' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Designer Watch' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Duffel Bag' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Earrings' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1314520/pexels-photo-1314520.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Glasses Case' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/984619/pexels-photo-984619.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Hat' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/4226881/pexels-photo-4226881.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Keychain' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/2422476/pexels-photo-2422476.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Laptop Bag' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/915915/pexels-photo-915915.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Leather Wallet' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/2393816/pexels-photo-2393816.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Luggage Tag' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Messenger Bag' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/4968391/pexels-photo-4968391.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Money Clip' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1395306/pexels-photo-1395306.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Necklace' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Phone Case' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/45055/pexels-photo-45055.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Pocket Square' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Ring' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/46710/pexels-photo-46710.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Sunglasses' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/45055/pexels-photo-45055.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Tie Clip' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/2393815/pexels-photo-2393815.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Travel Wallet' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Umbrella' AND category_id = '11111111-1111-1111-1111-111111111111';

UPDATE products SET image_url = 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Wristband' AND category_id = '11111111-1111-1111-1111-111111111111';

-- =============================================
-- APPLE TECH (Category: 22222222-2222-2222-2222-222222222222)
-- =============================================

UPDATE products SET image_url = 'https://images.pexels.com/photos/3945667/pexels-photo-3945667.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'AirPods Max' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'AirPods Pro 2' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/5082560/pexels-photo-5082560.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'AirTag 4 Pack' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/6205509/pexels-photo-6205509.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Apple Pencil 2' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/5721908/pexels-photo-5721908.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Apple TV 4K' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Apple Watch SE' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Apple Watch Series 9' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/4482900/pexels-photo-4482900.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Apple Watch Ultra 2' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/4790255/pexels-photo-4790255.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'HomePod Mini' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'iMac 24"' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'iPad Air' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1334598/pexels-photo-1334598.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'iPad Mini' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'iPad Pro 12.9"' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'iPhone 15' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'iPhone 15 Pro' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'iPhone 15 Pro Max' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/4158/apple-iphone-smartphone-desk.jpg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mac Mini M2' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/4158/apple-iphone-smartphone-desk.jpg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mac Studio' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'MacBook Air 15"' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'MacBook Pro 16"' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1772123/pexels-photo-1772123.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Magic Keyboard' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/5082579/pexels-photo-5082579.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Magic Mouse' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/5082579/pexels-photo-5082579.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Magic Trackpad' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/4526407/pexels-photo-4526407.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'MagSafe Charger' AND category_id = '22222222-2222-2222-2222-222222222222';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Studio Display' AND category_id = '22222222-2222-2222-2222-222222222222';

-- =============================================
-- CLOTHING (Category: 33333333-3333-3333-3333-333333333333)
-- =============================================

UPDATE products SET image_url = 'https://images.pexels.com/photos/6311652/pexels-photo-6311652.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Beanie' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Belt' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/267320/pexels-photo-267320.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Boots' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/6764040/pexels-photo-6764040.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Cardigan' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Casual Blazer' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Chino Pants' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Denim Jeans' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/5384423/pexels-photo-5384423.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Designer T-Shirt' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Dress Shirt' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/325876/pexels-photo-325876.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Formal Suit' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/45057/pexels-photo-45057.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Gloves' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Hoodie' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Leather Jacket' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Loafers' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/991509/pexels-photo-991509.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Polo Shirt' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Running Sneakers' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/45982/pexels-photo-45982.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Scarf' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1311518/pexels-photo-1311518.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Shorts' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/6046183/pexels-photo-6046183.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Socks Pack' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1630344/pexels-photo-1630344.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Swimwear' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/45055/pexels-photo-45055.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Tie' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Tracksuit' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Underwear Pack' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/5384966/pexels-photo-5384966.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Winter Coat' AND category_id = '33333333-3333-3333-3333-333333333333';

UPDATE products SET image_url = 'https://images.pexels.com/photos/6311652/pexels-photo-6311652.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Wool Sweater' AND category_id = '33333333-3333-3333-3333-333333333333';

-- =============================================
-- CRYPTO MINING (Category: 44444444-4444-4444-4444-444444444444)
-- =============================================

UPDATE products SET image_url = 'https://images.pexels.com/photos/5824901/pexels-photo-5824901.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Air Conditioning Unit' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'ASIC Miner M30S' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/2582928/pexels-photo-2582928.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Cooling Fan Set' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/4792733/pexels-photo-4792733.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'DDR5 RAM 64GB' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/730564/pexels-photo-730564.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Ethereum Miner E9' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'GPU Riser Cards 10pk' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/7915357/pexels-photo-7915357.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'GPU RTX 4090' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Hashboard Repair Kit' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Immersion Cooling Tank' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mining Container' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/2588757/pexels-photo-2588757.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mining CPU Ryzen 9' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mining Frame 12GPU' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mining Monitor' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/2582928/pexels-photo-2582928.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mining Motherboard' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mining PSU 2000W' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/4218546/pexels-photo-4218546.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mining Router' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/430208/pexels-photo-430208.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mining Security Camera' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/2881232/pexels-photo-2881232.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mining Shelves' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mining Software License' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/5824901/pexels-photo-5824901.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mining Ventilation' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/4792731/pexels-photo-4792731.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'NVMe SSD 2TB' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'PDU Power Strip' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Thermal Paste Kit' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'UPS Battery' AND category_id = '44444444-4444-4444-4444-444444444444';

UPDATE products SET image_url = 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Voltage Regulator' AND category_id = '44444444-4444-4444-4444-444444444444';

-- =============================================
-- KITCHEN APPLIANCES (Category: 55555555-5555-5555-5555-555555555555)
-- =============================================

UPDATE products SET image_url = 'https://images.pexels.com/photos/6996150/pexels-photo-6996150.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Air Fryer XL' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1797105/pexels-photo-1797105.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Blender Pro' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Bread Maker' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/3992206/pexels-photo-3992206.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Cast Iron Skillet' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Coffee Grinder' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/4226870/pexels-photo-4226870.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Cookware Set' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/4226863/pexels-photo-4226863.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Cutting Board Set' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/6996083/pexels-photo-6996083.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Deep Fryer' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/5824518/pexels-photo-5824518.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Dishwasher' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/2544829/pexels-photo-2544829.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Dutch Oven' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1251198/pexels-photo-1251198.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Electric Grill' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Electric Kettle' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Espresso Machine' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/4397919/pexels-photo-4397919.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Food Processor' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/4397893/pexels-photo-4397893.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Hand Mixer' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Ice Cream Maker' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/6996083/pexels-photo-6996083.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Instant Pot Duo' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Juicer Machine' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/3622614/pexels-photo-3622614.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Knife Set' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/6996142/pexels-photo-6996142.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Microwave Oven' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/6996150/pexels-photo-6996150.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Rice Cooker' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/6996083/pexels-photo-6996083.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Slow Cooker' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/4397919/pexels-photo-4397919.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Stand Mixer Pro' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/7937007/pexels-photo-7937007.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Toaster Oven' AND category_id = '55555555-5555-5555-5555-555555555555';

UPDATE products SET image_url = 'https://images.pexels.com/photos/6287211/pexels-photo-6287211.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Waffle Maker' AND category_id = '55555555-5555-5555-5555-555555555555';

-- =============================================
-- DEMO ACCESSORIES (Category: 99999999-9999-9999-9999-999999999999)
-- =============================================

UPDATE products SET image_url = 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Backpack' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Bracelet' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/45057/pexels-photo-45057.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Card Holder' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/2866796/pexels-photo-2866796.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Cosmetic Bag' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1261422/pexels-photo-1261422.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Cufflinks' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Designer Watch' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Duffel Bag' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Earrings' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1314520/pexels-photo-1314520.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Glasses Case' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/984619/pexels-photo-984619.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Hat' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/4226881/pexels-photo-4226881.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Keychain' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/2422476/pexels-photo-2422476.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Laptop Bag' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/915915/pexels-photo-915915.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Leather Wallet' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/2393816/pexels-photo-2393816.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Luggage Tag' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Messenger Bag' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/4968391/pexels-photo-4968391.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Money Clip' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1395306/pexels-photo-1395306.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Necklace' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Phone Case' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/45055/pexels-photo-45055.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Pocket Square' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Ring' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/46710/pexels-photo-46710.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Sunglasses' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/45055/pexels-photo-45055.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Tie Clip' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/2393815/pexels-photo-2393815.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Travel Wallet' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Umbrella' AND category_id = '99999999-9999-9999-9999-999999999999';

UPDATE products SET image_url = 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Wristband' AND category_id = '99999999-9999-9999-9999-999999999999';
