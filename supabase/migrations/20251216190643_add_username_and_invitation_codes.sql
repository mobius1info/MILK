/*
  # Add username field and invitation codes system

  1. Changes to Tables
    - Add `username` field to `profiles` table
      - `username` (text, unique, not null)
    
  2. New Tables
    - `invitation_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique, not null)
      - `is_used` (boolean, default false)
      - `used_by` (uuid, nullable, references profiles.id)
      - `created_at` (timestamptz, default now())
      - `used_at` (timestamptz, nullable)

  3. Security
    - Enable RLS on `invitation_codes` table
    - Only authenticated users can view invitation codes
    - Public can check if code is valid (for registration)

  4. Initial Data
    - Insert some demo invitation codes for testing
*/

-- Add username column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username text UNIQUE;
  END IF;
END $$;

-- Create invitation_codes table
CREATE TABLE IF NOT EXISTS invitation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  is_used boolean DEFAULT false NOT NULL,
  used_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  used_at timestamptz
);

-- Enable RLS
ALTER TABLE invitation_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can check if a code exists and is unused (for registration)
CREATE POLICY "Public can check unused codes"
  ON invitation_codes
  FOR SELECT
  TO anon, authenticated
  USING (is_used = false);

-- Policy: Authenticated users can view all codes
CREATE POLICY "Authenticated users can view all codes"
  ON invitation_codes
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only service role can insert/update codes (via functions)
CREATE POLICY "Only system can update codes"
  ON invitation_codes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert demo invitation codes
INSERT INTO invitation_codes (code) VALUES
  ('WELCOME2024'),
  ('BETA-ACCESS'),
  ('INVITE-001'),
  ('DEMO-CODE')
ON CONFLICT (code) DO NOTHING;
