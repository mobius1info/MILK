/*
  # Create VIP Purchase System
  
  1. New Tables
    - vip_purchases: Tracks VIP level purchase requests
      - id (uuid, primary key)
      - user_id (uuid, references profiles)
      - vip_level (integer) - VIP level number (1, 2, 3)
      - status (text) - pending, approved, rejected
      - category_id (text) - Category to unlock
      - created_at (timestamptz)
      - approved_at (timestamptz)
      - approved_by (uuid, references profiles)
      
    - product_progress: Tracks user progress through products
      - id (uuid, primary key)
      - user_id (uuid, references profiles)
      - vip_level (integer)
      - category_id (text)
      - current_product_index (integer) - Current product being shown
      - products_purchased (integer) - Number of products purchased
      - total_commission_earned (decimal)
      - last_product_at (timestamptz)
      - created_at (timestamptz)
      - updated_at (timestamptz)
      
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add admin policies for approval
    
  3. Functions
    - Function to process product purchase with commission
    - Function to check if 9th product for 3x bonus
*/

-- Create vip_purchases table
CREATE TABLE IF NOT EXISTS vip_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vip_level integer NOT NULL CHECK (vip_level >= 1 AND vip_level <= 3),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  category_id text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  approved_at timestamptz,
  approved_by uuid REFERENCES profiles(id)
);

-- Create product_progress table
CREATE TABLE IF NOT EXISTS product_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vip_level integer NOT NULL,
  category_id text NOT NULL,
  current_product_index integer DEFAULT 0 NOT NULL,
  products_purchased integer DEFAULT 0 NOT NULL,
  total_commission_earned decimal(10,2) DEFAULT 0 NOT NULL,
  last_product_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, vip_level, category_id)
);

-- Enable RLS
ALTER TABLE vip_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vip_purchases
CREATE POLICY "Users can view own VIP purchases"
  ON vip_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create VIP purchase requests"
  ON vip_purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all VIP purchases"
  ON vip_purchases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update VIP purchases"
  ON vip_purchases FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for product_progress
CREATE POLICY "Users can view own product progress"
  ON product_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own product progress"
  ON product_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own product progress"
  ON product_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all product progress"
  ON product_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to process product purchase with commission
CREATE OR REPLACE FUNCTION process_product_purchase(
  p_category_id text,
  p_vip_level integer,
  p_commission decimal
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_progress record;
  v_next_index integer;
  v_purchased_count integer;
  v_commission_multiplier decimal;
  v_final_commission decimal;
  v_is_ninth_product boolean;
  v_requires_deposit boolean;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get or create progress record
  SELECT * INTO v_progress
  FROM product_progress
  WHERE user_id = v_user_id 
    AND category_id = p_category_id 
    AND vip_level = p_vip_level;
  
  IF NOT FOUND THEN
    INSERT INTO product_progress (user_id, vip_level, category_id)
    VALUES (v_user_id, p_vip_level, p_category_id)
    RETURNING * INTO v_progress;
  END IF;
  
  v_purchased_count := v_progress.products_purchased + 1;
  v_next_index := v_progress.current_product_index + 1;
  
  -- Check if this is the 9th product (every 9th: 9, 18, 27, etc.)
  v_is_ninth_product := (v_purchased_count % 9 = 0);
  
  IF v_is_ninth_product THEN
    v_commission_multiplier := 3;
    v_requires_deposit := true;
  ELSE
    v_commission_multiplier := 1;
    v_requires_deposit := false;
  END IF;
  
  v_final_commission := p_commission * v_commission_multiplier;
  
  -- Update progress
  UPDATE product_progress
  SET 
    current_product_index = v_next_index,
    products_purchased = v_purchased_count,
    total_commission_earned = total_commission_earned + v_final_commission,
    last_product_at = now(),
    updated_at = now()
  WHERE id = v_progress.id;
  
  -- Credit balance only if not requiring deposit
  IF NOT v_requires_deposit THEN
    UPDATE profiles
    SET balance = balance + v_final_commission
    WHERE id = v_user_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'commission', v_final_commission,
    'is_ninth_product', v_is_ninth_product,
    'requires_deposit', v_requires_deposit,
    'products_purchased', v_purchased_count,
    'next_product_index', v_next_index,
    'message', CASE 
      WHEN v_requires_deposit THEN 'Нужно пополнить счет для перехода на уровень ВИП ' || (p_vip_level + 1)::text
      ELSE 'Комиссия зачислена на баланс'
    END
  );
END;
$$;