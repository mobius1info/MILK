/*
  # Fix Function Search Paths for Security

  1. Changes
    - Add explicit search_path to all functions
    - Prevents search path injection attacks
    - Functions updated:
      - update_updated_at_column
      - update_profile_stats_on_order
      - process_referral_bonus
      - handle_new_user
      - is_admin

  2. Security Impact
    - Protects against search_path manipulation
    - Ensures functions use correct schema
    - Follows PostgreSQL security best practices
*/

-- Recreate update_updated_at_column with explicit search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Recreate update_profile_stats_on_order with explicit search path
CREATE OR REPLACE FUNCTION public.update_profile_stats_on_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE profiles
    SET 
      total_spent = total_spent + NEW.total_amount,
      total_orders = total_orders + 1
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- Recreate process_referral_bonus with explicit search path
CREATE OR REPLACE FUNCTION public.process_referral_bonus()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    IF (SELECT COUNT(*) FROM orders WHERE user_id = NEW.user_id AND status = 'completed') = 1 THEN
      IF EXISTS (SELECT 1 FROM profiles WHERE id = NEW.user_id AND referred_by IS NOT NULL) THEN
        INSERT INTO referrals (referrer_id, referred_id, bonus_amount, status)
        SELECT referred_by, id, 10.00, 'paid'
        FROM profiles
        WHERE id = NEW.user_id;

        UPDATE profiles
        SET balance = balance + 10.00
        WHERE id = (SELECT referred_by FROM profiles WHERE id = NEW.user_id);
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Recreate handle_new_user with explicit search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  new_referral_code TEXT;
BEGIN
  new_referral_code := substring(md5(random()::text || NEW.id::text) from 1 for 8);

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
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Recreate is_admin with explicit search path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$function$;