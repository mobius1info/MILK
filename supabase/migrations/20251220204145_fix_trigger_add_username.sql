/*
  # Fix Trigger to Include Username
  
  1. Changes
    - Update handle_new_user() function to include username field
    - Username is generated from email (part before @ sign)
    
  2. Purpose
    - Ensure profile creation via trigger includes all required fields
    - Fix registration errors due to missing username
*/

-- Drop and recreate the function with username support
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_referral_code TEXT;
  new_username TEXT;
BEGIN
  -- Generate unique referral code
  new_referral_code := substring(md5(random()::text || NEW.id::text) from 1 for 8);
  
  -- Generate username from email (part before @)
  new_username := split_part(NEW.email, '@', 1);
  
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
