/*
  # Insert Initial Data

  1. Data Inserted
    - Categories (Fashion, Electronics, Sports, Crypto Mining, Food)
    - VIP Levels (1-5) with proper pricing
    - Sample products for each category
    - Payment methods

  2. Purpose
    - Provide initial data for the application to function
*/

-- Insert categories
INSERT INTO categories (id, name, description, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Fashion', 'Fashion and clothing items', true),
  ('22222222-2222-2222-2222-222222222222', 'Electronics', 'Electronic devices and gadgets', true),
  ('33333333-3333-3333-3333-333333333333', 'Sports', 'Sports equipment and gear', true),
  ('44444444-4444-4444-4444-444444444444', 'Crypto Mining', 'Cryptocurrency mining equipment', true),
  ('55555555-5555-5555-5555-555555555555', 'Food', 'Food and beverages', true)
ON CONFLICT (id) DO NOTHING;

-- Insert VIP levels
INSERT INTO vip_levels (id, level, name, description, price, category_id, products_count, is_active) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, 'VIP 1', 'Entry level VIP membership', 100.00, '11111111-1111-1111-1111-111111111111', 40, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, 'VIP 2', 'Intermediate VIP membership', 300.00, '22222222-2222-2222-2222-222222222222', 40, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 'VIP 3', 'Advanced VIP membership', 800.00, '33333333-3333-3333-3333-333333333333', 40, true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 4, 'VIP 4', 'Premium VIP membership', 2000.00, '44444444-4444-4444-4444-444444444444', 40, true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 5, 'VIP 5', 'Elite VIP membership', 5000.00, '55555555-5555-5555-5555-555555555555', 40, true)
ON CONFLICT (level) DO NOTHING;

-- Insert sample products for Fashion (VIP 1)
INSERT INTO products (name, description, price, category_id, commission_percentage, quantity_multiplier, is_active) VALUES
  ('T-Shirt', 'Cotton t-shirt', 2.50, '11111111-1111-1111-1111-111111111111', 1.30, 1, true),
  ('Jeans', 'Denim jeans', 2.50, '11111111-1111-1111-1111-111111111111', 1.30, 1, true),
  ('Sneakers', 'Sport sneakers', 2.50, '11111111-1111-1111-1111-111111111111', 1.30, 1, true),
  ('Jacket', 'Winter jacket', 2.50, '11111111-1111-1111-1111-111111111111', 1.30, 1, true),
  ('Hat', 'Baseball cap', 2.50, '11111111-1111-1111-1111-111111111111', 1.30, 1, true);

-- Insert sample products for Electronics (VIP 2)
INSERT INTO products (name, description, price, category_id, commission_percentage, quantity_multiplier, is_active) VALUES
  ('Smartphone', 'Latest smartphone', 7.50, '22222222-2222-2222-2222-222222222222', 1.30, 1, true),
  ('Laptop', 'Gaming laptop', 7.50, '22222222-2222-2222-2222-222222222222', 1.30, 1, true),
  ('Headphones', 'Wireless headphones', 7.50, '22222222-2222-2222-2222-222222222222', 1.30, 1, true),
  ('Tablet', 'Tablet device', 7.50, '22222222-2222-2222-2222-222222222222', 1.30, 1, true),
  ('Smartwatch', 'Smart watch', 7.50, '22222222-2222-2222-2222-222222222222', 1.30, 1, true);

-- Insert sample products for Sports (VIP 3)
INSERT INTO products (name, description, price, category_id, commission_percentage, quantity_multiplier, is_active) VALUES
  ('Basketball', 'Professional basketball', 20.00, '33333333-3333-3333-3333-333333333333', 1.30, 1, true),
  ('Tennis Racket', 'Pro tennis racket', 20.00, '33333333-3333-3333-3333-333333333333', 1.30, 1, true),
  ('Running Shoes', 'Marathon running shoes', 20.00, '33333333-3333-3333-3333-333333333333', 1.30, 1, true),
  ('Yoga Mat', 'Premium yoga mat', 20.00, '33333333-3333-3333-3333-333333333333', 1.30, 1, true),
  ('Dumbbell Set', 'Adjustable dumbbells', 20.00, '33333333-3333-3333-3333-333333333333', 1.30, 1, true);

-- Insert sample products for Crypto Mining (VIP 4)
INSERT INTO products (name, description, price, category_id, commission_percentage, quantity_multiplier, is_active) VALUES
  ('ASIC Miner', 'Bitcoin ASIC miner', 50.00, '44444444-4444-4444-4444-444444444444', 1.30, 1, true),
  ('GPU Rig', 'Ethereum GPU mining rig', 50.00, '44444444-4444-4444-4444-444444444444', 1.30, 1, true),
  ('Cooling System', 'Mining cooling system', 50.00, '44444444-4444-4444-4444-444444444444', 1.30, 1, true),
  ('Power Supply', 'High efficiency PSU', 50.00, '44444444-4444-4444-4444-444444444444', 1.30, 1, true),
  ('Mining Frame', 'Open air mining frame', 50.00, '44444444-4444-4444-4444-444444444444', 1.30, 1, true);

-- Insert sample products for Food (VIP 5)
INSERT INTO products (name, description, price, category_id, commission_percentage, quantity_multiplier, is_active) VALUES
  ('Organic Fruits', 'Fresh organic fruits basket', 125.00, '55555555-5555-5555-5555-555555555555', 1.30, 1, true),
  ('Premium Coffee', 'Gourmet coffee beans', 125.00, '55555555-5555-5555-5555-555555555555', 1.30, 1, true),
  ('Fine Wine', 'Premium wine collection', 125.00, '55555555-5555-5555-5555-555555555555', 1.30, 1, true),
  ('Artisan Cheese', 'Imported cheese selection', 125.00, '55555555-5555-5555-5555-555555555555', 1.30, 1, true),
  ('Seafood Platter', 'Fresh seafood assortment', 125.00, '55555555-5555-5555-5555-555555555555', 1.30, 1, true);

-- Insert payment methods
INSERT INTO payment_methods (name, type, details, is_active) VALUES
  ('Bank Transfer', 'bank_transfer', '{"account": "1234567890", "bank": "Example Bank"}'::jsonb, true),
  ('Cryptocurrency', 'crypto', '{"address": "0x1234567890abcdef", "network": "USDT TRC20"}'::jsonb, true),
  ('Card Payment', 'card', '{}'::jsonb, true)
ON CONFLICT (name) DO NOTHING;