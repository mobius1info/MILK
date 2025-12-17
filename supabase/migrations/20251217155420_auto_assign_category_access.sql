/*
  # Auto-assign category access to new users
  
  1. Changes
    - Update the handle_new_user function to automatically grant access to all categories
    - New users will have full access to all categories by default
  
  2. Security
    - Maintains existing RLS policies
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Grant access to all categories for new users
  INSERT INTO public.category_access (user_id, category, is_enabled, product_limit)
  VALUES 
    (NEW.id, 'sports', true, 0),
    (NEW.id, 'fashion', true, 0),
    (NEW.id, 'home', true, 0),
    (NEW.id, 'electronics', true, 0),
    (NEW.id, 'crypto', true, 0);
  
  RETURN NEW;
END;
$$;
