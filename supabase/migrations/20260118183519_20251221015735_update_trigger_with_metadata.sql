/*
  # Update Profile Creation Trigger to Use User Metadata

  1. Changes
    - Update handle_new_user() function to read full_name and referred_by from user metadata
    - Extract these values from NEW.raw_user_meta_data
    - Set them during profile creation

  2. Purpose
    - Allow registration form to pass full_name and referral info during sign up
    - Eliminate need to sign in immediately after registration to update profile
*/

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_referral_code TEXT;
  new_username TEXT;
  base_username TEXT;
  username_suffix TEXT;
  user_full_name TEXT;
  user_referred_by UUID;
BEGIN
  -- Generate unique referral code
  new_referral_code := substring(md5(random()::text || NEW.id::text) from 1 for 8);

  -- Generate base username from email (part before @)
  base_username := split_part(NEW.email, '@', 1);

  -- Add unique suffix from user ID (first 6 characters)
  username_suffix := substring(NEW.id::text from 1 for 6);

  -- Combine to create unique username
  new_username := base_username || '_' || username_suffix;

  -- Extract full_name from user metadata if provided
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');

  -- Extract referred_by from user metadata if provided
  IF NEW.raw_user_meta_data->>'referred_by' IS NOT NULL AND
     NEW.raw_user_meta_data->>'referred_by' != '' THEN
    user_referred_by := (NEW.raw_user_meta_data->>'referred_by')::UUID;
  ELSE
    user_referred_by := NULL;
  END IF;

  -- Insert new profile with all required fields
  INSERT INTO public.profiles (id, email, username, role, referral_code, full_name, referred_by)
  VALUES (
    NEW.id,
    NEW.email,
    new_username,
    'client',
    new_referral_code,
    user_full_name,
    user_referred_by
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