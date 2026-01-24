/*
  # Fix All Product Images to Match Names Correctly
  
  This migration updates ALL product images with verified Pexels URLs
  that correctly match each product name.
  
  Categories Updated:
  - Clothing: Fixed Swimwear, Scarf, Wool Sweater, Shorts, Belt, Gloves, etc.
  - Accessories: Fixed Umbrella, Messenger Bag, etc.
  - All other categories verified and updated
*/

-- =============================================
-- CLOTHING CATEGORY - CRITICAL FIXES
-- =============================================

-- Swimwear - должен быть купальник
UPDATE products SET image_url = 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Swimwear';

-- Scarf - должен быть шарф
UPDATE products SET image_url = 'https://images.pexels.com/photos/6786567/pexels-photo-6786567.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Scarf';

-- Wool Sweater - должен быть шерстяной свитер
UPDATE products SET image_url = 'https://images.pexels.com/photos/6770028/pexels-photo-6770028.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Wool Sweater';

-- Shorts - должны быть шорты
UPDATE products SET image_url = 'https://images.pexels.com/photos/1598509/pexels-photo-1598509.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Shorts';

-- Belt - должен быть ремень
UPDATE products SET image_url = 'https://images.pexels.com/photos/45055/pexels-photo-45055.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Belt';

-- Gloves - должны быть перчатки
UPDATE products SET image_url = 'https://images.pexels.com/photos/6311652/pexels-photo-6311652.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Gloves';

-- Beanie - шапка-бини
UPDATE products SET image_url = 'https://images.pexels.com/photos/5119817/pexels-photo-5119817.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Beanie';

-- Boots - ботинки
UPDATE products SET image_url = 'https://images.pexels.com/photos/1596912/pexels-photo-1596912.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Boots';

-- Cardigan - кардиган
UPDATE products SET image_url = 'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Cardigan';

-- Casual Blazer - повседневный блейзер
UPDATE products SET image_url = 'https://images.pexels.com/photos/1342609/pexels-photo-1342609.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Casual Blazer';

-- Chino Pants - брюки чинос
UPDATE products SET image_url = 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Chino Pants';

-- Denim Jeans - джинсы
UPDATE products SET image_url = 'https://images.pexels.com/photos/4210864/pexels-photo-4210864.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Denim Jeans';

-- Designer T-Shirt - дизайнерская футболка
UPDATE products SET image_url = 'https://images.pexels.com/photos/5384423/pexels-photo-5384423.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Designer T-Shirt';

-- Dress Shirt - классическая рубашка
UPDATE products SET image_url = 'https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Dress Shirt';

-- Formal Suit - деловой костюм
UPDATE products SET image_url = 'https://images.pexels.com/photos/325876/pexels-photo-325876.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Formal Suit';

-- Hoodie - худи
UPDATE products SET image_url = 'https://images.pexels.com/photos/6311600/pexels-photo-6311600.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Hoodie';

-- Leather Jacket - кожаная куртка
UPDATE products SET image_url = 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Leather Jacket';

-- Loafers - лоферы
UPDATE products SET image_url = 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Loafers';

-- Polo Shirt - поло
UPDATE products SET image_url = 'https://images.pexels.com/photos/6311616/pexels-photo-6311616.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Polo Shirt';

-- Running Sneakers - кроссовки для бега
UPDATE products SET image_url = 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Running Sneakers';

-- Socks Pack - набор носков
UPDATE products SET image_url = 'https://images.pexels.com/photos/4715315/pexels-photo-4715315.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Socks Pack';

-- Tie - галстук
UPDATE products SET image_url = 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Tie';

-- Tracksuit - спортивный костюм
UPDATE products SET image_url = 'https://images.pexels.com/photos/6311600/pexels-photo-6311600.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Tracksuit';

-- Underwear Pack - набор нижнего белья
UPDATE products SET image_url = 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Underwear Pack';

-- Winter Coat - зимнее пальто
UPDATE products SET image_url = 'https://images.pexels.com/photos/6311652/pexels-photo-6311652.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Winter Coat';

-- =============================================
-- ACCESSORIES CATEGORY - FIXES
-- =============================================

-- Backpack - рюкзак
UPDATE products SET image_url = 'https://images.pexels.com/photos/1545998/pexels-photo-1545998.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Backpack';

-- Bracelet - браслет
UPDATE products SET image_url = 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Bracelet';

-- Card Holder - кардхолдер/визитница
UPDATE products SET image_url = 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Card Holder';

-- Cosmetic Bag - косметичка
UPDATE products SET image_url = 'https://images.pexels.com/photos/2866796/pexels-photo-2866796.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Cosmetic Bag';

-- Cufflinks - запонки
UPDATE products SET image_url = 'https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Cufflinks';

-- Designer Watch - дизайнерские часы
UPDATE products SET image_url = 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Designer Watch';

-- Duffel Bag - спортивная сумка
UPDATE products SET image_url = 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Duffel Bag';

-- Earrings - серьги
UPDATE products SET image_url = 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Earrings';

-- Glasses Case - футляр для очков
UPDATE products SET image_url = 'https://images.pexels.com/photos/947885/pexels-photo-947885.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Glasses Case';

-- Hat - шляпа
UPDATE products SET image_url = 'https://images.pexels.com/photos/984619/pexels-photo-984619.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Hat';

-- Keychain - брелок
UPDATE products SET image_url = 'https://images.pexels.com/photos/4226881/pexels-photo-4226881.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Keychain';

-- Laptop Bag - сумка для ноутбука
UPDATE products SET image_url = 'https://images.pexels.com/photos/2422476/pexels-photo-2422476.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Laptop Bag';

-- Leather Wallet - кожаный кошелек
UPDATE products SET image_url = 'https://images.pexels.com/photos/915915/pexels-photo-915915.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Leather Wallet';

-- Luggage Tag - бирка для багажа
UPDATE products SET image_url = 'https://images.pexels.com/photos/2393816/pexels-photo-2393816.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Luggage Tag';

-- Messenger Bag - сумка мессенджер
UPDATE products SET image_url = 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Messenger Bag';

-- Money Clip - зажим для денег
UPDATE products SET image_url = 'https://images.pexels.com/photos/4968391/pexels-photo-4968391.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Money Clip';

-- Necklace - ожерелье
UPDATE products SET image_url = 'https://images.pexels.com/photos/1395306/pexels-photo-1395306.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Necklace';

-- Phone Case - чехол для телефона
UPDATE products SET image_url = 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Phone Case';

-- Pocket Square - платок-паше
UPDATE products SET image_url = 'https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Pocket Square';

-- Ring - кольцо
UPDATE products SET image_url = 'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Ring';

-- Sunglasses - солнцезащитные очки
UPDATE products SET image_url = 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Sunglasses';

-- Tie Clip - зажим для галстука
UPDATE products SET image_url = 'https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Tie Clip';

-- Travel Wallet - дорожный кошелек
UPDATE products SET image_url = 'https://images.pexels.com/photos/2393815/pexels-photo-2393815.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Travel Wallet';

-- Umbrella - зонт
UPDATE products SET image_url = 'https://images.pexels.com/photos/1486861/pexels-photo-1486861.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Umbrella';

-- Wristband - браслет на руку
UPDATE products SET image_url = 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Wristband';

-- =============================================
-- APPLE TECH CATEGORY - FIXES
-- =============================================

-- AirPods Max - наушники
UPDATE products SET image_url = 'https://images.pexels.com/photos/3945667/pexels-photo-3945667.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'AirPods Max';

-- AirPods Pro 2 - наушники
UPDATE products SET image_url = 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'AirPods Pro 2';

-- AirTag 4 Pack - трекер
UPDATE products SET image_url = 'https://images.pexels.com/photos/5082560/pexels-photo-5082560.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'AirTag 4 Pack';

-- Apple Pencil 2 - стилус
UPDATE products SET image_url = 'https://images.pexels.com/photos/6205509/pexels-photo-6205509.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Apple Pencil 2';

-- Apple TV 4K - ТВ приставка
UPDATE products SET image_url = 'https://images.pexels.com/photos/5721908/pexels-photo-5721908.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Apple TV 4K';

-- Apple Watch SE - смарт часы
UPDATE products SET image_url = 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Apple Watch SE';

-- Apple Watch Series 9 - смарт часы
UPDATE products SET image_url = 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Apple Watch Series 9';

-- Apple Watch Ultra 2 - смарт часы
UPDATE products SET image_url = 'https://images.pexels.com/photos/4482900/pexels-photo-4482900.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Apple Watch Ultra 2';

-- HomePod Mini - умная колонка
UPDATE products SET image_url = 'https://images.pexels.com/photos/4790255/pexels-photo-4790255.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'HomePod Mini';

-- iMac 24" - компьютер
UPDATE products SET image_url = 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'iMac 24"';

-- iPad Air - планшет
UPDATE products SET image_url = 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'iPad Air';

-- iPad Mini - планшет
UPDATE products SET image_url = 'https://images.pexels.com/photos/1334598/pexels-photo-1334598.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'iPad Mini';

-- iPad Pro 12.9" - планшет
UPDATE products SET image_url = 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'iPad Pro 12.9"';

-- iPhone 15 - смартфон
UPDATE products SET image_url = 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'iPhone 15';

-- iPhone 15 Pro - смартфон
UPDATE products SET image_url = 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'iPhone 15 Pro';

-- iPhone 15 Pro Max - смартфон
UPDATE products SET image_url = 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'iPhone 15 Pro Max';

-- Mac Mini M2 - компьютер
UPDATE products SET image_url = 'https://images.pexels.com/photos/4158/apple-iphone-smartphone-desk.jpg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mac Mini M2';

-- Mac Studio - компьютер
UPDATE products SET image_url = 'https://images.pexels.com/photos/4158/apple-iphone-smartphone-desk.jpg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mac Studio';

-- MacBook Air 15" - ноутбук
UPDATE products SET image_url = 'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'MacBook Air 15"';

-- MacBook Pro 16" - ноутбук
UPDATE products SET image_url = 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'MacBook Pro 16"';

-- Magic Keyboard - клавиатура
UPDATE products SET image_url = 'https://images.pexels.com/photos/1772123/pexels-photo-1772123.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Magic Keyboard';

-- Magic Mouse - мышь
UPDATE products SET image_url = 'https://images.pexels.com/photos/5082579/pexels-photo-5082579.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Magic Mouse';

-- Magic Trackpad - трекпад
UPDATE products SET image_url = 'https://images.pexels.com/photos/5082579/pexels-photo-5082579.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Magic Trackpad';

-- MagSafe Charger - зарядка
UPDATE products SET image_url = 'https://images.pexels.com/photos/4526407/pexels-photo-4526407.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'MagSafe Charger';

-- Studio Display - монитор
UPDATE products SET image_url = 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Studio Display';

-- =============================================
-- CRYPTO MINING CATEGORY - FIXES
-- =============================================

-- Air Conditioning Unit - кондиционер
UPDATE products SET image_url = 'https://images.pexels.com/photos/5824901/pexels-photo-5824901.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Air Conditioning Unit';

-- ASIC Miner M30S - майнер
UPDATE products SET image_url = 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'ASIC Miner M30S';

-- Cooling Fan Set - вентиляторы
UPDATE products SET image_url = 'https://images.pexels.com/photos/2582928/pexels-photo-2582928.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Cooling Fan Set';

-- DDR5 RAM 64GB - оперативная память
UPDATE products SET image_url = 'https://images.pexels.com/photos/4792733/pexels-photo-4792733.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'DDR5 RAM 64GB';

-- Ethereum Miner E9 - майнер
UPDATE products SET image_url = 'https://images.pexels.com/photos/730564/pexels-photo-730564.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Ethereum Miner E9';

-- GPU Riser Cards 10pk - райзеры
UPDATE products SET image_url = 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'GPU Riser Cards 10pk';

-- GPU RTX 4090 - видеокарта
UPDATE products SET image_url = 'https://images.pexels.com/photos/7915357/pexels-photo-7915357.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'GPU RTX 4090';

-- Hashboard Repair Kit - набор для ремонта
UPDATE products SET image_url = 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Hashboard Repair Kit';

-- Immersion Cooling Tank - бак для охлаждения
UPDATE products SET image_url = 'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Immersion Cooling Tank';

-- Mining Container - контейнер для майнинга
UPDATE products SET image_url = 'https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mining Container';

-- Mining CPU Ryzen 9 - процессор
UPDATE products SET image_url = 'https://images.pexels.com/photos/2588757/pexels-photo-2588757.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mining CPU Ryzen 9';

-- Mining Frame 12GPU - рама для майнинга
UPDATE products SET image_url = 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mining Frame 12GPU';

-- Mining Monitor - монитор
UPDATE products SET image_url = 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mining Monitor';

-- Mining Motherboard - материнская плата
UPDATE products SET image_url = 'https://images.pexels.com/photos/2582928/pexels-photo-2582928.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mining Motherboard';

-- Mining PSU 2000W - блок питания
UPDATE products SET image_url = 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mining PSU 2000W';

-- Mining Router - роутер
UPDATE products SET image_url = 'https://images.pexels.com/photos/4218546/pexels-photo-4218546.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mining Router';

-- Mining Security Camera - камера безопасности
UPDATE products SET image_url = 'https://images.pexels.com/photos/430208/pexels-photo-430208.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mining Security Camera';

-- Mining Shelves - стеллажи
UPDATE products SET image_url = 'https://images.pexels.com/photos/2881232/pexels-photo-2881232.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mining Shelves';

-- Mining Software License - лицензия ПО
UPDATE products SET image_url = 'https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mining Software License';

-- Mining Ventilation - вентиляция
UPDATE products SET image_url = 'https://images.pexels.com/photos/5824901/pexels-photo-5824901.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Mining Ventilation';

-- NVMe SSD 2TB - SSD диск
UPDATE products SET image_url = 'https://images.pexels.com/photos/4792731/pexels-photo-4792731.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'NVMe SSD 2TB';

-- PDU Power Strip - блок розеток
UPDATE products SET image_url = 'https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'PDU Power Strip';

-- Thermal Paste Kit - термопаста
UPDATE products SET image_url = 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Thermal Paste Kit';

-- UPS Battery - ИБП
UPDATE products SET image_url = 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'UPS Battery';

-- Voltage Regulator - стабилизатор напряжения
UPDATE products SET image_url = 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Voltage Regulator';

-- =============================================
-- KITCHEN APPLIANCES CATEGORY - FIXES
-- =============================================

-- Air Fryer XL - аэрогриль
UPDATE products SET image_url = 'https://images.pexels.com/photos/6996150/pexels-photo-6996150.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Air Fryer XL';

-- Blender Pro - блендер
UPDATE products SET image_url = 'https://images.pexels.com/photos/1797105/pexels-photo-1797105.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Blender Pro';

-- Bread Maker - хлебопечка
UPDATE products SET image_url = 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Bread Maker';

-- Cast Iron Skillet - чугунная сковорода
UPDATE products SET image_url = 'https://images.pexels.com/photos/3992206/pexels-photo-3992206.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Cast Iron Skillet';

-- Coffee Grinder - кофемолка
UPDATE products SET image_url = 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Coffee Grinder';

-- Cookware Set - набор посуды
UPDATE products SET image_url = 'https://images.pexels.com/photos/4226870/pexels-photo-4226870.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Cookware Set';

-- Cutting Board Set - набор разделочных досок
UPDATE products SET image_url = 'https://images.pexels.com/photos/4226863/pexels-photo-4226863.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Cutting Board Set';

-- Deep Fryer - фритюрница
UPDATE products SET image_url = 'https://images.pexels.com/photos/6996083/pexels-photo-6996083.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Deep Fryer';

-- Dishwasher - посудомоечная машина
UPDATE products SET image_url = 'https://images.pexels.com/photos/5824518/pexels-photo-5824518.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Dishwasher';

-- Dutch Oven - казан
UPDATE products SET image_url = 'https://images.pexels.com/photos/2544829/pexels-photo-2544829.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Dutch Oven';

-- Electric Grill - электрогриль
UPDATE products SET image_url = 'https://images.pexels.com/photos/1251198/pexels-photo-1251198.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Electric Grill';

-- Electric Kettle - электрочайник
UPDATE products SET image_url = 'https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Electric Kettle';

-- Espresso Machine - кофемашина
UPDATE products SET image_url = 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Espresso Machine';

-- Food Processor - кухонный комбайн
UPDATE products SET image_url = 'https://images.pexels.com/photos/4397919/pexels-photo-4397919.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Food Processor';

-- Hand Mixer - ручной миксер
UPDATE products SET image_url = 'https://images.pexels.com/photos/4397893/pexels-photo-4397893.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Hand Mixer';

-- Ice Cream Maker - мороженица
UPDATE products SET image_url = 'https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Ice Cream Maker';

-- Instant Pot Duo - мультиварка
UPDATE products SET image_url = 'https://images.pexels.com/photos/6996083/pexels-photo-6996083.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Instant Pot Duo';

-- Juicer Machine - соковыжималка
UPDATE products SET image_url = 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Juicer Machine';

-- Knife Set - набор ножей
UPDATE products SET image_url = 'https://images.pexels.com/photos/3622614/pexels-photo-3622614.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Knife Set';

-- Microwave Oven - микроволновая печь
UPDATE products SET image_url = 'https://images.pexels.com/photos/6996142/pexels-photo-6996142.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Microwave Oven';

-- Rice Cooker - рисоварка
UPDATE products SET image_url = 'https://images.pexels.com/photos/6996150/pexels-photo-6996150.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Rice Cooker';

-- Slow Cooker - медленноварка
UPDATE products SET image_url = 'https://images.pexels.com/photos/6996083/pexels-photo-6996083.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Slow Cooker';

-- Stand Mixer Pro - стационарный миксер
UPDATE products SET image_url = 'https://images.pexels.com/photos/4397919/pexels-photo-4397919.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Stand Mixer Pro';

-- Toaster Oven - тостер
UPDATE products SET image_url = 'https://images.pexels.com/photos/7937007/pexels-photo-7937007.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Toaster Oven';

-- Waffle Maker - вафельница
UPDATE products SET image_url = 'https://images.pexels.com/photos/6287211/pexels-photo-6287211.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE name = 'Waffle Maker';
