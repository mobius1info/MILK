/*
  # Add Username Field to Profiles

  1. Changes
    - Add `username` column to profiles table
    - Make username unique and not null
    - Populate existing profiles with username from email (before @ sign)
    
  2. Purpose
    - Allow users to have a display username separate from email
    - Show both username and email in profile view
*/

-- Add username column (nullable initially to allow populating existing records)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username text;

-- Populate username from email for existing records
UPDATE profiles 
SET username = split_part(email, '@', 1)
WHERE username IS NULL;

-- Make username not null and unique
ALTER TABLE profiles 
ALTER COLUMN username SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key ON profiles(username);