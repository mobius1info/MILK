/*
  # Fix Unique Username Generation
  
  1. Changes
    - Update handle_new_user() function to generate truly unique usernames
    - Add random suffix to username to ensure uniqueness
    - Use first 6 characters of user ID as suffix
    
  2. Purpose
    - Prevent duplicate key violations on profiles_username_key
    - Ensure each user gets a unique username even with similar emails
*/

-- Drop and recreate the function with unique username generation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_referral_code TEXT;
  new_username TEXT;
  base_username TEXT;
  username_suffix TEXT;
BEGIN
  -- Generate unique referral code
  new_referral_code := substring(md5(random()::text || NEW.id::text) from 1 for 8);
  
  -- Generate base username from email (part before @)
  base_username := split_part(NEW.email, '@', 1);
  
  -- Add unique suffix from user ID (first 6 characters)
  username_suffix := substring(NEW.id::text from 1 for 6);
  
  -- Combine to create unique username
  new_username := base_username || '_' || username_suffix;
  
  -- Insert new profile with all required fields
  INSERT INTO public.profiles (id, email, username, role, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    new_username,
    'client',
    new_referral_code
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth.users insert
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();