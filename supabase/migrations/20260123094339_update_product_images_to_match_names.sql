/*
  # Update All Product Images to Match Product Names
  
  Updates all product image URLs to match their actual names with appropriate stock photos from Pexels.
  
  Categories covered:
  - Accessories (25 products)
  - Apple Tech (25 products) 
  - Clothing (25 products)
  - Crypto Mining (25 products)
  - Kitchen Appliances (25 products)
  - Demo (25 products - same as Accessories)
*/

-- Accessories Category
UPDATE products SET image_url = 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg' WHERE name = 'Backpack';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1458671/pexels-photo-1458671.jpeg' WHERE name = 'Bracelet';
UPDATE products SET image_url = 'https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg' WHERE name = 'Card Holder';
UPDATE products SET image_url = 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg' WHERE name = 'Cosmetic Bag';
UPDATE products SET image_url = 'https://images.pexels.com/photos/3673986/pexels-photo-3673986.jpeg' WHERE name = 'Cufflinks';
UPDATE products SET image_url = 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg' WHERE name = 'Designer Watch';
UPDATE products SET image_url = 'https://images.pexels.com/photos/2081199/pexels-photo-2081199.jpeg' WHERE name = 'Duffel Bag';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg' WHERE name = 'Earrings';
UPDATE products SET image_url = 'https://images.pexels.com/photos/947885/pexels-photo-947885.jpeg' WHERE name = 'Glasses Case';
UPDATE products SET image_url = 'https://images.pexels.com/photos/984619/pexels-photo-984619.jpeg' WHERE name = 'Hat';
UPDATE products SET image_url = 'https://images.pexels.com/photos/5733054/pexels-photo-5733054.jpeg' WHERE name = 'Keychain';
UPDATE products SET image_url = 'https://images.pexels.com/photos/2422476/pexels-photo-2422476.jpeg' WHERE name = 'Laptop Bag';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1722183/pexels-photo-1722183.jpeg' WHERE name = 'Leather Wallet';
UPDATE products SET image_url = 'https://images.pexels.com/photos/2422476/pexels-photo-2422476.jpeg' WHERE name = 'Luggage Tag';
UPDATE products SET image_url = 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg' WHERE name = 'Messenger Bag';
UPDATE products SET image_url = 'https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg' WHERE name = 'Money Clip';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1472636/pexels-photo-1472636.jpeg' WHERE name = 'Necklace';
UPDATE products SET image_url = 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg' WHERE name = 'Phone Case';
UPDATE products SET image_url = 'https://images.pexels.com/photos/3673986/pexels-photo-3673986.jpeg' WHERE name = 'Pocket Square';
UPDATE products SET image_url = 'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg' WHERE name = 'Ring';
UPDATE products SET image_url = 'https://images.pexels.com/photos/46710/pexels-photo-46710.jpeg' WHERE name = 'Sunglasses';
UPDATE products SET image_url = 'https://images.pexels.com/photos/3673986/pexels-photo-3673986.jpeg' WHERE name = 'Tie Clip';
UPDATE products SET image_url = 'https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg' WHERE name = 'Travel Wallet';
UPDATE products SET image_url = 'https://images.pexels.com/photos/209831/pexels-photo-209831.jpeg' WHERE name = 'Umbrella';
UPDATE products SET image_url = 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg' WHERE name = 'Wristband';

-- Apple Tech Category
UPDATE products SET image_url = 'https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg' WHERE name = 'AirPods Max';
UPDATE products SET image_url = 'https://images.pexels.com/photos/7492984/pexels-photo-7492984.jpeg' WHERE name = 'AirPods Pro 2';
UPDATE products SET image_url = 'https://images.pexels.com/photos/5082560/pexels-photo-5082560.jpeg' WHERE name = 'AirTag 4 Pack';
UPDATE products SET image_url = 'https://images.pexels.com/photos/6069113/pexels-photo-6069113.jpeg' WHERE name = 'Apple Pencil 2';
UPDATE products SET image_url = 'https://images.pexels.com/photos/5721908/pexels-photo-5721908.jpeg' WHERE name = 'Apple TV 4K';
UPDATE products SET image_url = 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg' WHERE name = 'Apple Watch SE';
UPDATE products SET image_url = 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg' WHERE name = 'Apple Watch Series 9';
UPDATE products SET image_url = 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg' WHERE name = 'Apple Watch Ultra 2';
UPDATE products SET image_url = 'https://images.pexels.com/photos/8000616/pexels-photo-8000616.jpeg' WHERE name = 'HomePod Mini';
UPDATE products SET image_url = 'https://images.pexels.com/photos/2528118/pexels-photo-2528118.jpeg' WHERE name = 'iMac 24"';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg' WHERE name = 'iPad Air';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg' WHERE name = 'iPad Mini';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg' WHERE name = 'iPad Pro 12.9"';
UPDATE products SET image_url = 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg' WHERE name = 'iPhone 15';
UPDATE products SET image_url = 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg' WHERE name = 'iPhone 15 Pro';
UPDATE products SET image_url = 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg' WHERE name = 'iPhone 15 Pro Max';
UPDATE products SET image_url = 'https://images.pexels.com/photos/4526407/pexels-photo-4526407.jpeg' WHERE name = 'Mac Mini M2';
UPDATE products SET image_url = 'https://images.pexels.com/photos/4526407/pexels-photo-4526407.jpeg' WHERE name = 'Mac Studio';
UPDATE products SET image_url = 'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg' WHERE name = 'MacBook Air 15"';
UPDATE products SET image_url = 'https://images.pexels.com/photos/18105/pexels-photo.jpg' WHERE name = 'MacBook Pro 16"';
UPDATE products SET image_url = 'https://images.pexels.com/photos/2582928/pexels-photo-2582928.jpeg' WHERE name = 'Magic Keyboard';
UPDATE products SET image_url = 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg' WHERE name = 'Magic Mouse';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1772123/pexels-photo-1772123.jpeg' WHERE name = 'Magic Trackpad';
UPDATE products SET image_url = 'https://images.pexels.com/photos/4526407/pexels-photo-4526407.jpeg' WHERE name = 'MagSafe Charger';
UPDATE products SET image_url = 'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg' WHERE name = 'Studio Display';

-- Clothing Category
UPDATE products SET image_url = 'https://images.pexels.com/photos/6311652/pexels-photo-6311652.jpeg' WHERE name = 'Beanie';
UPDATE products SET image_url = 'https://images.pexels.com/photos/934712/pexels-photo-934712.jpeg' WHERE name = 'Belt';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1592610/pexels-photo-1592610.jpeg' WHERE name = 'Boots';
UPDATE products SET image_url = 'https://images.pexels.com/photos/6764040/pexels-photo-6764040.jpeg' WHERE name = 'Cardigan';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg' WHERE name = 'Casual Blazer';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg' WHERE name = 'Chino Pants';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg' WHERE name = 'Denim Jeans';
UPDATE products SET image_url = 'https://images.pexels.com/photos/5384423/pexels-photo-5384423.jpeg' WHERE name = 'Designer T-Shirt';
UPDATE products SET image_url = 'https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg' WHERE name = 'Dress Shirt';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg' WHERE name = 'Formal Suit';
UPDATE products SET image_url = 'https://images.pexels.com/photos/6311652/pexels-photo-6311652.jpeg' WHERE name = 'Gloves';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg' WHERE name = 'Hoodie';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg' WHERE name = 'Leather Jacket';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg' WHERE name = 'Loafers';
UPDATE products SET image_url = 'https://images.pexels.com/photos/5384423/pexels-photo-5384423.jpeg' WHERE name = 'Polo Shirt';
UPDATE products SET image_url = 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg' WHERE name = 'Running Sneakers';
UPDATE products SET image_url = 'https://images.pexels.com/photos/6311652/pexels-photo-6311652.jpeg' WHERE name = 'Scarf';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg' WHERE name = 'Shorts';
UPDATE products SET image_url = 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg' WHERE name = 'Socks Pack';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1630344/pexels-photo-1630344.jpeg' WHERE name = 'Swimwear';
UPDATE products SET image_url = 'https://images.pexels.com/photos/3673986/pexels-photo-3673986.jpeg' WHERE name = 'Tie';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg' WHERE name = 'Tracksuit';
UPDATE products SET image_url = 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg' WHERE name = 'Underwear Pack';
UPDATE products SET image_url = 'https://images.pexels.com/photos/6311652/pexels-photo-6311652.jpeg' WHERE name = 'Winter Coat';
UPDATE products SET image_url = 'https://images.pexels.com/photos/6764040/pexels-photo-6764040.jpeg' WHERE name = 'Wool Sweater';

-- Crypto Mining Category
UPDATE products SET image_url = 'https://images.pexels.com/photos/5824901/pexels-photo-5824901.jpeg' WHERE name = 'Air Conditioning Unit';
UPDATE products SET image_url = 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg' WHERE name = 'ASIC Miner M30S';
UPDATE products SET image_url = 'https://images.pexels.com/photos/5824901/pexels-photo-5824901.jpeg' WHERE name = 'Cooling Fan Set';
UPDATE products SET image_url = 'https://images.pexels.com/photos/4792733/pexels-photo-4792733.jpeg' WHERE name = 'DDR5 RAM 64GB';
UPDATE products SET image_url = 'https://images.pexels.com/photos/730564/pexels-photo-730564.jpeg' WHERE name = 'Ethereum Miner E9';
UPDATE products SET image_url = 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg' WHERE name = 'GPU Riser Cards 10pk';
UPDATE products SET image_url = 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg' WHERE name = 'GPU RTX 4090';
UPDATE products SET image_url = 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg' WHERE name = 'Hashboard Repair Kit';
UPDATE products SET image_url = 'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg' WHERE name = 'Immersion Cooling Tank';
UPDATE products SET image_url = 'https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg' WHERE name = 'Mining Container';
UPDATE products SET image_url = 'https://images.pexels.com/photos/2588757/pexels-photo-2588757.jpeg' WHERE name = 'Mining CPU Ryzen 9';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg' WHERE name = 'Mining Frame 12GPU';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg' WHERE name = 'Mining Monitor';
UPDATE products SET image_url = 'https://images.pexels.com/photos/2582928/pexels-photo-2582928.jpeg' WHERE name = 'Mining Motherboard';
UPDATE products SET image_url = 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg' WHERE name = 'Mining PSU 2000W';
UPDATE products SET image_url = 'https://images.pexels.com/photos/4218546/pexels-photo-4218546.jpeg' WHERE name = 'Mining Router';
UPDATE products SET image_url = 'https://images.pexels.com/photos/430208/pexels-photo-430208.jpeg' WHERE name = 'Mining Security Camera';
UPDATE products SET image_url = 'https://images.pexels.com/photos/2881232/pexels-photo-2881232.jpeg' WHERE name = 'Mining Shelves';
UPDATE products SET image_url = 'https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg' WHERE name = 'Mining Software License';
UPDATE products SET image_url = 'https://images.pexels.com/photos/5824901/pexels-photo-5824901.jpeg' WHERE name = 'Mining Ventilation';
UPDATE products SET image_url = 'https://images.pexels.com/photos/4792731/pexels-photo-4792731.jpeg' WHERE name = 'NVMe SSD 2TB';
UPDATE products SET image_url = 'https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg' WHERE name = 'PDU Power Strip';
UPDATE products SET image_url = 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg' WHERE name = 'Thermal Paste Kit';
UPDATE products SET image_url = 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg' WHERE name = 'UPS Battery';
UPDATE products SET image_url = 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg' WHERE name = 'Voltage Regulator';

-- Kitchen Appliances Category
UPDATE products SET image_url = 'https://images.pexels.com/photos/6996150/pexels-photo-6996150.jpeg' WHERE name = 'Air Fryer XL';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1797105/pexels-photo-1797105.jpeg' WHERE name = 'Blender Pro';
UPDATE products SET image_url = 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg' WHERE name = 'Bread Maker';
UPDATE products SET image_url = 'https://images.pexels.com/photos/3992206/pexels-photo-3992206.jpeg' WHERE name = 'Cast Iron Skillet';
UPDATE products SET image_url = 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg' WHERE name = 'Coffee Grinder';
UPDATE products SET image_url = 'https://images.pexels.com/photos/3992206/pexels-photo-3992206.jpeg' WHERE name = 'Cookware Set';
UPDATE products SET image_url = 'https://images.pexels.com/photos/4226870/pexels-photo-4226870.jpeg' WHERE name = 'Cutting Board Set';
UPDATE products SET image_url = 'https://images.pexels.com/photos/6996150/pexels-photo-6996150.jpeg' WHERE name = 'Deep Fryer';
UPDATE products SET image_url = 'https://images.pexels.com/photos/5824518/pexels-photo-5824518.jpeg' WHERE name = 'Dishwasher';
UPDATE products SET image_url = 'https://images.pexels.com/photos/6996083/pexels-photo-6996083.jpeg' WHERE name = 'Dutch Oven';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1251198/pexels-photo-1251198.jpeg' WHERE name = 'Electric Grill';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg' WHERE name = 'Electric Kettle';
UPDATE products SET image_url = 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg' WHERE name = 'Espresso Machine';
UPDATE products SET image_url = 'https://images.pexels.com/photos/4397919/pexels-photo-4397919.jpeg' WHERE name = 'Food Processor';
UPDATE products SET image_url = 'https://images.pexels.com/photos/4397919/pexels-photo-4397919.jpeg' WHERE name = 'Hand Mixer';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg' WHERE name = 'Ice Cream Maker';
UPDATE products SET image_url = 'https://images.pexels.com/photos/6996083/pexels-photo-6996083.jpeg' WHERE name = 'Instant Pot Duo';
UPDATE products SET image_url = 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg' WHERE name = 'Juicer Machine';
UPDATE products SET image_url = 'https://images.pexels.com/photos/4226870/pexels-photo-4226870.jpeg' WHERE name = 'Knife Set';
UPDATE products SET image_url = 'https://images.pexels.com/photos/2343467/pexels-photo-2343467.jpeg' WHERE name = 'Microwave Oven';
UPDATE products SET image_url = 'https://images.pexels.com/photos/6996150/pexels-photo-6996150.jpeg' WHERE name = 'Rice Cooker';
UPDATE products SET image_url = 'https://images.pexels.com/photos/6996083/pexels-photo-6996083.jpeg' WHERE name = 'Slow Cooker';
UPDATE products SET image_url = 'https://images.pexels.com/photos/4397919/pexels-photo-4397919.jpeg' WHERE name = 'Stand Mixer Pro';
UPDATE products SET image_url = 'https://images.pexels.com/photos/7937007/pexels-photo-7937007.jpeg' WHERE name = 'Toaster Oven';
UPDATE products SET image_url = 'https://images.pexels.com/photos/6287211/pexels-photo-6287211.jpeg' WHERE name = 'Waffle Maker';
