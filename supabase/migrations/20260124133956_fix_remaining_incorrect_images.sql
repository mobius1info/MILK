/*
  # Fix Remaining Incorrect Product Images
  
  Additional fixes for products that still have incorrect images.
  Using verified Pexels URLs that match product names.
*/

-- Tie - галстук (правильное фото галстука)
UPDATE products SET image_url = 'https://images.pexels.com/photos/45055/pexels-photo-45055.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Tie';

-- Belt - ремень (правильное фото ремня)
UPDATE products SET image_url = 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Belt';

-- Swimwear - купальник/плавки (фото пляжной одежды)
UPDATE products SET image_url = 'https://images.pexels.com/photos/1038000/pexels-photo-1038000.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Swimwear';

-- Scarf - шарф (фото шарфа)
UPDATE products SET image_url = 'https://images.pexels.com/photos/7691072/pexels-photo-7691072.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Scarf';

-- Wool Sweater - шерстяной свитер
UPDATE products SET image_url = 'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Wool Sweater';

-- Shorts - шорты
UPDATE products SET image_url = 'https://images.pexels.com/photos/6311613/pexels-photo-6311613.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Shorts';

-- Gloves - перчатки (зимние перчатки)
UPDATE products SET image_url = 'https://images.pexels.com/photos/5119803/pexels-photo-5119803.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Gloves';

-- Beanie - шапка-бини
UPDATE products SET image_url = 'https://images.pexels.com/photos/5119817/pexels-photo-5119817.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Beanie';

-- Cardigan - кардиган
UPDATE products SET image_url = 'https://images.pexels.com/photos/6311645/pexels-photo-6311645.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Cardigan';

-- Winter Coat - зимнее пальто
UPDATE products SET image_url = 'https://images.pexels.com/photos/6311389/pexels-photo-6311389.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Winter Coat';

-- Hoodie - худи
UPDATE products SET image_url = 'https://images.pexels.com/photos/6311606/pexels-photo-6311606.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Hoodie';

-- Tracksuit - спортивный костюм
UPDATE products SET image_url = 'https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Tracksuit';

-- Polo Shirt - поло
UPDATE products SET image_url = 'https://images.pexels.com/photos/6311616/pexels-photo-6311616.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Polo Shirt';

-- Denim Jeans - джинсы
UPDATE products SET image_url = 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Denim Jeans';

-- Designer T-Shirt - дизайнерская футболка
UPDATE products SET image_url = 'https://images.pexels.com/photos/6311475/pexels-photo-6311475.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Designer T-Shirt';

-- Dress Shirt - классическая рубашка
UPDATE products SET image_url = 'https://images.pexels.com/photos/6311653/pexels-photo-6311653.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Dress Shirt';

-- Chino Pants - брюки чинос
UPDATE products SET image_url = 'https://images.pexels.com/photos/6311614/pexels-photo-6311614.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Chino Pants';

-- Loafers - лоферы (обувь)
UPDATE products SET image_url = 'https://images.pexels.com/photos/293405/pexels-photo-293405.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Loafers';

-- Boots - ботинки
UPDATE products SET image_url = 'https://images.pexels.com/photos/267242/pexels-photo-267242.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Boots';

-- Socks Pack - носки
UPDATE products SET image_url = 'https://images.pexels.com/photos/6046183/pexels-photo-6046183.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Socks Pack';

-- Casual Blazer - повседневный блейзер
UPDATE products SET image_url = 'https://images.pexels.com/photos/1342609/pexels-photo-1342609.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Casual Blazer';

-- Formal Suit - деловой костюм
UPDATE products SET image_url = 'https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Formal Suit';

-- Leather Jacket - кожаная куртка
UPDATE products SET image_url = 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Leather Jacket';

-- Running Sneakers - кроссовки
UPDATE products SET image_url = 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Running Sneakers';

-- Underwear Pack - нижнее белье
UPDATE products SET image_url = 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Underwear Pack';

-- =============================================
-- ACCESSORIES FIXES
-- =============================================

-- Backpack - рюкзак
UPDATE products SET image_url = 'https://images.pexels.com/photos/1545998/pexels-photo-1545998.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Backpack';

-- Umbrella - зонт
UPDATE products SET image_url = 'https://images.pexels.com/photos/1486861/pexels-photo-1486861.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Umbrella';

-- Messenger Bag - сумка через плечо
UPDATE products SET image_url = 'https://images.pexels.com/photos/1204464/pexels-photo-1204464.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Messenger Bag';

-- Duffel Bag - дорожная сумка
UPDATE products SET image_url = 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Duffel Bag';

-- Card Holder - визитница/кардхолдер
UPDATE products SET image_url = 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Card Holder';

-- Sunglasses - солнцезащитные очки
UPDATE products SET image_url = 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Sunglasses';

-- Glasses Case - футляр для очков
UPDATE products SET image_url = 'https://images.pexels.com/photos/947885/pexels-photo-947885.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Glasses Case';

-- Cufflinks - запонки
UPDATE products SET image_url = 'https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Cufflinks';

-- Tie Clip - зажим для галстука
UPDATE products SET image_url = 'https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Tie Clip';

-- Pocket Square - нагрудный платок
UPDATE products SET image_url = 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Pocket Square';

-- Cosmetic Bag - косметичка
UPDATE products SET image_url = 'https://images.pexels.com/photos/2866796/pexels-photo-2866796.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Cosmetic Bag';

-- Designer Watch - часы
UPDATE products SET image_url = 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Designer Watch';

-- Bracelet - браслет
UPDATE products SET image_url = 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Bracelet';

-- Earrings - серьги
UPDATE products SET image_url = 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Earrings';

-- Necklace - ожерелье
UPDATE products SET image_url = 'https://images.pexels.com/photos/1395306/pexels-photo-1395306.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Necklace';

-- Ring - кольцо
UPDATE products SET image_url = 'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Ring';

-- Leather Wallet - кожаный кошелек
UPDATE products SET image_url = 'https://images.pexels.com/photos/915915/pexels-photo-915915.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Leather Wallet';

-- Travel Wallet - дорожный кошелек
UPDATE products SET image_url = 'https://images.pexels.com/photos/2393815/pexels-photo-2393815.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Travel Wallet';

-- Phone Case - чехол для телефона
UPDATE products SET image_url = 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Phone Case';

-- Hat - шляпа
UPDATE products SET image_url = 'https://images.pexels.com/photos/984619/pexels-photo-984619.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Hat';

-- Keychain - брелок
UPDATE products SET image_url = 'https://images.pexels.com/photos/4226881/pexels-photo-4226881.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Keychain';

-- Laptop Bag - сумка для ноутбука
UPDATE products SET image_url = 'https://images.pexels.com/photos/2422476/pexels-photo-2422476.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Laptop Bag';

-- Luggage Tag - бирка для багажа
UPDATE products SET image_url = 'https://images.pexels.com/photos/2393816/pexels-photo-2393816.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Luggage Tag';

-- Money Clip - зажим для денег
UPDATE products SET image_url = 'https://images.pexels.com/photos/4968391/pexels-photo-4968391.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Money Clip';

-- Wristband - браслет на руку
UPDATE products SET image_url = 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Wristband';
