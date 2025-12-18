/*
  # Fix Function Security - Set Secure search_path
  
  1. Security Improvements
    - Add explicit search_path to all SECURITY DEFINER functions
    - Set search_path to 'public, pg_temp' to prevent search_path attacks
    - This prevents malicious users from creating schemas/functions that could hijack function calls
  
  2. Functions Updated
    - update_updated_at_column
    - handle_new_user
    - is_admin
    - update_profile_stats_on_order
    - process_referral_bonus
    - update_balance_on_transaction_approval
  
  3. Why This Matters
    - Functions with SECURITY DEFINER run with the privileges of the function owner
    - Without explicit search_path, attackers could create malicious objects in other schemas
    - Setting search_path = 'public, pg_temp' ensures functions only use trusted schemas
*/

-- Fix update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix handle_new_user
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
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix is_admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix update_profile_stats_on_order
CREATE OR REPLACE FUNCTION update_profile_stats_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.profiles
    SET 
      total_spent = total_spent + NEW.total_amount,
      total_orders = total_orders + 1
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix process_referral_bonus
CREATE OR REPLACE FUNCTION process_referral_bonus()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Check if this is user's first completed order
    IF (SELECT COUNT(*) FROM public.orders WHERE user_id = NEW.user_id AND status = 'completed') = 1 THEN
      -- Check if user was referred
      IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.user_id AND referred_by IS NOT NULL) THEN
        -- Create referral bonus record
        INSERT INTO public.referrals (referrer_id, referred_id, bonus_amount, status)
        SELECT referred_by, id, 10.00, 'paid'
        FROM public.profiles
        WHERE id = NEW.user_id;
        
        -- Add bonus to referrer's balance
        UPDATE public.profiles
        SET balance = balance + 10.00
        WHERE id = (SELECT referred_by FROM public.profiles WHERE id = NEW.user_id);
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix update_balance_on_transaction_approval
CREATE OR REPLACE FUNCTION update_balance_on_transaction_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    IF NEW.type = 'deposit' THEN
      UPDATE public.profiles
      SET balance = balance + NEW.amount
      WHERE id = NEW.user_id;
    ELSIF NEW.type = 'withdrawal' THEN
      UPDATE public.profiles
      SET balance = balance - NEW.amount
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;
