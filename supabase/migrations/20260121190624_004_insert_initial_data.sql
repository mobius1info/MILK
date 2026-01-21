/*
  # Initial Data Migration
  
  Inserts all initial data:
  - Categories (5 categories)
  - VIP Levels (5 levels)
  - Payment Methods (3 methods)
  - Banners (3 banners)
*/

-- Insert Categories
INSERT INTO categories (id, name, description, image_url, is_active, commission_rate) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Accessories', 'Accessories and personal items', null, true, 4.0),
  ('22222222-2222-2222-2222-222222222222', 'Apple Tech', 'Apple devices and accessories', null, true, 5.0),
  ('33333333-3333-3333-3333-333333333333', 'Clothing', 'Clothing and fashion items', null, true, 6.0),
  ('44444444-4444-4444-4444-444444444444', 'Crypto Mining', 'Cryptocurrency mining equipment', null, true, 8.0),
  ('55555555-5555-5555-5555-555555555555', 'Kitchen Appliances', 'Kitchen appliances and cookware', null, true, 3.5)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  commission_rate = EXCLUDED.commission_rate;

-- Insert VIP Levels
INSERT INTO vip_levels (id, level, name, description, price, category_id, products_count, category, category_image_url, commission) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, 'VIP 1', 'Entry level VIP membership', 100.00, '11111111-1111-1111-1111-111111111111', 25, 'Accessories', 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg', 15.0),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, 'VIP 2', 'Intermediate VIP membership', 500.00, '33333333-3333-3333-3333-333333333333', 25, 'Clothing', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg', 25.0),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 'VIP 3', 'Advanced VIP membership', 2000.00, '55555555-5555-5555-5555-555555555555', 25, 'Kitchen Appliances', 'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg', 30.0),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 4, 'VIP 4', 'Premium VIP membership', 5000.00, '22222222-2222-2222-2222-222222222222', 25, 'Apple Tech', 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg', 35.0),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 5, 'VIP 5', 'Elite VIP membership', 10000.00, '44444444-4444-4444-4444-444444444444', 25, 'Crypto Mining', 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg', 40.0)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  products_count = EXCLUDED.products_count,
  category = EXCLUDED.category,
  category_image_url = EXCLUDED.category_image_url,
  commission = EXCLUDED.commission;

-- Insert Payment Methods
INSERT INTO payment_methods (id, name, type, details, is_active, wallet_address, network, min_amount, max_amount, display_order) VALUES
  ('f1ffb4c8-8c0c-48ca-b385-5514ed8c77a9', 'Cryptocurrency', 'crypto', '{"address":"0x1234567890abcdef","network":"USDT TRC20"}', true, 'TXhKz9QmJ5Y8pL3xR7sW2nV4bF6cG1dH8aK', 'USDT (TRC20)', 10, 100000, 1),
  ('2fca2d9b-2246-47da-ac2f-6e7bbf296451', 'Bank Transfer', 'bank_transfer', '{"bank":"Example Bank","account":"1234567890"}', true, 'Bank: Example Bank | Account: 1234567890 | SWIFT: EXAMPLESWIFT', null, 10, 50000, 2),
  ('1d5197c5-3065-46d7-948b-88ea4775cdd5', 'Card Payment', 'card', '{}', true, '4532 1234 5678 9010', null, 10, 10000, 3)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  details = EXCLUDED.details,
  wallet_address = EXCLUDED.wallet_address,
  network = EXCLUDED.network,
  min_amount = EXCLUDED.min_amount,
  max_amount = EXCLUDED.max_amount,
  display_order = EXCLUDED.display_order;

-- Insert Banners
INSERT INTO banners (id, title, description, image_url, is_active, order_position) VALUES
  ('32834620-2193-48b6-82d5-2d8e3bc78bc8', 'Shop the Latest Collections', 'Discover premium products', 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg', true, 1),
  ('c9c59516-578a-41c7-aabd-9a24b6ef2a88', 'Premium Quality Products', 'Best deals on top brands', 'https://images.pexels.com/photos/7679453/pexels-photo-7679453.jpeg', true, 2),
  ('ece88da2-d2dc-4d57-ab63-29cd71dfe0fe', 'Earn Commissions on Every Task', 'Start earning today', 'https://images.pexels.com/photos/6214476/pexels-photo-6214476.jpeg', true, 3)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  order_position = EXCLUDED.order_position;