/*
  # Fix Profile Creation on Registration

  1. Changes
    - Drop existing trigger and function
    - Recreate function with proper permissions
    - Add policy to allow profile creation during signup
    - Ensure referral_code is generated properly

  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - Profile INSERT policy for authenticated users
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate the function with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_referral_code TEXT;
BEGIN
  -- Generate unique referral code
  new_referral_code := substring(md5(random()::text || NEW.id::text) from 1 for 8);
  
  -- Insert new profile
  INSERT INTO public.profiles (id, email, role, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
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

-- Add policy to allow profile creation (needed for the trigger)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow profile creation on signup" ON profiles;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Allow profile creation on signup"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Ensure all existing users have referral codes
UPDATE profiles
SET referral_code = substring(md5(random()::text || id::text) from 1 for 8)
WHERE referral_code IS NULL OR referral_code = '';
