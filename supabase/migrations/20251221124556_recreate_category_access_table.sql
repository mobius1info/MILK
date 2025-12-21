/*
  # Recreate category_access table

  1. Problem
    - The category_access table is missing from the database
    - Admin code tries to insert records when approving VIP purchases
    - Old RLS policies had infinite recursion issues
    
  2. Solution
    - Create category_access table with proper structure
    - Use JWT metadata for RLS policies to avoid recursion
    
  3. New Table
    - `category_access`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `category` (text) - category identifier
      - `is_enabled` (boolean) - whether user can access this category
      - `product_limit` (integer) - max products user can see (0 = unlimited)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
  4. Security
    - Enable RLS
    - Users can view their own category access
    - Admins can view/modify all category access using JWT metadata
*/

-- Drop table if exists (in case it was partially created)
DROP TABLE IF EXISTS category_access CASCADE;

-- Create category_access table
CREATE TABLE category_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  is_enabled boolean DEFAULT false,
  product_limit integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category)
);

-- Enable RLS
ALTER TABLE category_access ENABLE ROW LEVEL SECURITY;

-- Users can view their own category access
CREATE POLICY "Users can view own category access"
  ON category_access FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all category access (using JWT metadata)
CREATE POLICY "Admins can view all category access"
  ON category_access FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admins can insert category access (using JWT metadata)
CREATE POLICY "Admins can insert category access"
  ON category_access FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admins can update category access (using JWT metadata)
CREATE POLICY "Admins can update category access"
  ON category_access FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admins can delete category access (using JWT metadata)
CREATE POLICY "Admins can delete category access"
  ON category_access FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Create indexes for better performance
CREATE INDEX idx_category_access_user_id ON category_access(user_id);
CREATE INDEX idx_category_access_category ON category_access(category);
CREATE INDEX idx_category_access_enabled ON category_access(user_id, category) WHERE is_enabled = true;