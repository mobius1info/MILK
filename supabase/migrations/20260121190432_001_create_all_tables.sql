/*
  # Complete Database Schema Migration
  
  1. New Tables:
    - profiles: User profiles linked to auth.users
    - categories: Product categories
    - products: Product catalog
    - vip_levels: VIP membership tiers
    - vip_purchases: User VIP subscriptions
    - vip_combo_settings: Combo settings for VIP purchases
    - product_purchases: Individual product purchase records
    - transactions: Financial transaction log
    - deposits: User deposit requests
    - withdrawals: User withdrawal requests
    - orders: Order headers
    - order_items: Order line items
    - referrals: Referral tracking
    - payment_methods: Available payment methods
    - banners: Homepage banners
    - activity_log: System activity logging
    - category_access: User access to categories
    
  2. All constraints, foreign keys, and indexes included
*/

-- Create profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  username text UNIQUE,
  full_name text DEFAULT '',
  role text DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  balance numeric DEFAULT 0.00,
  referral_code text UNIQUE,
  referred_by uuid REFERENCES profiles(id),
  total_spent numeric DEFAULT 0.00,
  total_orders integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  combo_enabled boolean DEFAULT false,
  combo_deposit_percent numeric DEFAULT 50 CHECK (combo_deposit_percent >= 5 AND combo_deposit_percent <= 5000),
  combo_product_position integer DEFAULT 9 CHECK (combo_product_position >= 0 AND combo_product_position <= 100),
  combo_multiplier integer DEFAULT 3
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  commission_rate numeric DEFAULT 5.0
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL,
  image_url text,
  category_id uuid REFERENCES categories(id),
  commission_percentage numeric DEFAULT 0.00,
  quantity_multiplier integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create vip_levels table
CREATE TABLE IF NOT EXISTS vip_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level integer UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric DEFAULT 0.00,
  category_id uuid REFERENCES categories(id),
  products_count integer DEFAULT 0,
  image_url text,
  benefits jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  category text,
  category_image_url text,
  commission numeric DEFAULT 5.0
);

ALTER TABLE vip_levels ENABLE ROW LEVEL SECURITY;

-- Create vip_purchases table
CREATE TABLE IF NOT EXISTS vip_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  vip_level_id uuid NOT NULL REFERENCES vip_levels(id),
  amount_paid numeric NOT NULL,
  products_completed integer DEFAULT 0,
  total_products integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  vip_level integer,
  category_id text,
  completed_products_count integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  vip_price numeric DEFAULT 0,
  approved_at timestamptz,
  approved_by uuid,
  combo_enabled_at_approval boolean,
  combo_position_at_approval integer,
  combo_multiplier_at_approval numeric,
  combo_deposit_percent_at_approval numeric
);

ALTER TABLE vip_purchases ENABLE ROW LEVEL SECURITY;

-- Create vip_combo_settings table
CREATE TABLE IF NOT EXISTS vip_combo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vip_purchase_id uuid NOT NULL REFERENCES vip_purchases(id),
  combo_position integer NOT NULL CHECK (combo_position >= 1 AND combo_position <= 100),
  combo_multiplier integer DEFAULT 3,
  combo_deposit_percent numeric DEFAULT 50 CHECK (combo_deposit_percent >= 5 AND combo_deposit_percent <= 5000),
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  UNIQUE(vip_purchase_id, combo_position)
);

ALTER TABLE vip_combo_settings ENABLE ROW LEVEL SECURITY;

-- Create product_purchases table
CREATE TABLE IF NOT EXISTS product_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  vip_purchase_id uuid NOT NULL REFERENCES vip_purchases(id),
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer DEFAULT 1,
  price_paid numeric NOT NULL,
  commission_earned numeric DEFAULT 0.00,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_purchases ENABLE ROW LEVEL SECURITY;

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'purchase', 'refund', 'referral_bonus', 'commission', 'rejected')),
  description text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create deposits table
CREATE TABLE IF NOT EXISTS deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  amount numeric NOT NULL,
  payment_method text DEFAULT 'bank_transfer',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  proof_url text,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;

-- Create withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  amount numeric NOT NULL,
  payment_method text DEFAULT 'bank_transfer',
  payment_details jsonb DEFAULT '{}',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  total_amount numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  payment_method text DEFAULT 'balance',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id),
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer DEFAULT 1,
  price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES profiles(id),
  referred_id uuid NOT NULL REFERENCES profiles(id),
  bonus_amount numeric DEFAULT 10.00,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  type text NOT NULL,
  details jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  wallet_address text DEFAULT '',
  network text,
  instructions text,
  min_amount numeric DEFAULT 10,
  max_amount numeric,
  display_order integer DEFAULT 0
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Create banners table
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  link_url text,
  is_active boolean DEFAULT true,
  order_position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Create activity_log table
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type text NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Create category_access table
CREATE TABLE IF NOT EXISTS category_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  category text NOT NULL,
  is_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category)
);

ALTER TABLE category_access ENABLE ROW LEVEL SECURITY;