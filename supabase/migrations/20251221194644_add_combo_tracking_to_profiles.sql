/*
  # Add Combo Tracking System to Profiles

  1. Changes to profiles table
    - Add `combo_enabled` (boolean) - Admin can enable/disable combo for each client
    - Add `vip_completions_count` (integer) - Tracks how many times client completed VIP levels
  
  2. New Function
    - `increment_vip_completions()` - Increments completion count when VIP purchase is fully completed
  
  3. Logic
    - Combo only works if:
      - combo_enabled = true (set by admin)
      - vip_completions_count >= 1 (completed at least once before, so works from 2nd time)
    - Counter increases automatically when all products in VIP purchase are completed
  
  4. Security
    - Only admins can modify combo_enabled
    - Counter is automatically managed by database
*/

-- Add combo tracking fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS combo_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS vip_completions_count INTEGER DEFAULT 0;

-- Create function to increment VIP completions count
CREATE OR REPLACE FUNCTION increment_vip_completions(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET vip_completions_count = vip_completions_count + 1,
      updated_at = now()
  WHERE id = p_user_id;
END;
$$;

-- Create function to check if combo is enabled for user
CREATE OR REPLACE FUNCTION is_combo_enabled_for_user(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_combo_enabled BOOLEAN;
  v_completions INTEGER;
BEGIN
  SELECT combo_enabled, vip_completions_count
  INTO v_combo_enabled, v_completions
  FROM profiles
  WHERE id = p_user_id;
  
  -- Combo works if enabled AND user has completed VIP at least once (so works from 2nd time)
  RETURN v_combo_enabled AND v_completions >= 1;
END;
$$;

-- Add RLS policy for admin to update combo_enabled
CREATE POLICY "Admins can update combo settings"
ON profiles
FOR UPDATE
TO authenticated
USING ((SELECT auth.jwt()->>'role') = 'admin')
WITH CHECK ((SELECT auth.jwt()->>'role') = 'admin');