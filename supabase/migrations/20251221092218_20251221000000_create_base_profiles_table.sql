/*
  # Create Base Profiles Table
  
  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - references auth.users
      - `email` (text, unique, not null)
      - `username` (text, unique)
      - `full_name` (text)
      - `role` (text) - 'client' or 'admin'
      - `balance` (decimal) - user's balance
      - `referral_code` (text, unique) - unique referral code
      - `referred_by` (uuid) - who referred this user
      - `total_spent` (decimal) - total amount spent
      - `total_orders` (integer) - total number of orders
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on profiles table
    - Users can read their own profile
    - Users can update their own profile (except role and balance)
    - Admins can read and update all profiles
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  username text UNIQUE,
  full_name text DEFAULT '',
  role text DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  balance decimal(10,2) DEFAULT 0.00,
  referral_code text UNIQUE,
  referred_by uuid REFERENCES profiles(id),
  total_spent decimal(10,2) DEFAULT 0.00,
  total_orders integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();