/*
  # Fix approve_vip_purchase - Remove Profile Table Update
  
  The function was incorrectly updating the profiles table with combo settings,
  causing constraint violations. Combo settings should only be stored in:
  1. vip_purchases (as snapshot at approval time)
  2. vip_combo_settings (for the specific VIP)
  
  The profiles table combo settings should only be updated by admin directly
  through the Combo Settings modal.
*/

CREATE OR REPLACE FUNCTION approve_vip_purchase(
  p_vip_purchase_id uuid,
  p_admin_id uuid,
  p_combo_enabled boolean,
  p_combo_position integer,
  p_combo_multiplier numeric,
  p_combo_deposit_percent numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_vip_purchase vip_purchases%ROWTYPE;
  v_user_balance numeric;
  v_vip_price numeric;
  v_completed_count integer := 0;
BEGIN
  SELECT * INTO v_vip_purchase
  FROM vip_purchases
  WHERE id = p_vip_purchase_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'VIP purchase not found'
    );
  END IF;

  SELECT balance INTO v_user_balance
  FROM profiles
  WHERE id = v_vip_purchase.user_id;

  v_vip_price := COALESCE(v_vip_purchase.vip_price, 0);

  IF v_user_balance < v_vip_price THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient balance',
      'required', v_vip_price,
      'available', v_user_balance
    );
  END IF;

  WITH completed_vips AS (
    UPDATE vip_purchases
    SET is_completed = true
    WHERE user_id = v_vip_purchase.user_id
      AND vip_level = v_vip_purchase.vip_level
      AND category_id = v_vip_purchase.category_id
      AND status != 'rejected'
      AND is_completed = false
      AND id != p_vip_purchase_id
    RETURNING id
  )
  SELECT COUNT(*) INTO v_completed_count FROM completed_vips;

  UPDATE vip_purchases
  SET
    status = 'approved',
    approved_at = now(),
    approved_by = p_admin_id,
    combo_enabled_at_approval = p_combo_enabled,
    combo_position_at_approval = p_combo_position,
    combo_multiplier_at_approval = p_combo_multiplier,
    combo_deposit_percent_at_approval = p_combo_deposit_percent
  WHERE id = p_vip_purchase_id;

  INSERT INTO category_access (user_id, category, is_enabled)
  VALUES (v_vip_purchase.user_id, v_vip_purchase.category_id, true)
  ON CONFLICT (user_id, category) DO UPDATE
  SET is_enabled = true;

  IF p_combo_enabled THEN
    INSERT INTO vip_combo_settings (
      vip_purchase_id,
      combo_position,
      combo_multiplier,
      combo_deposit_percent,
      is_completed,
      created_by
    ) VALUES (
      p_vip_purchase_id,
      p_combo_position,
      p_combo_multiplier,
      p_combo_deposit_percent,
      false,
      p_admin_id
    )
    ON CONFLICT (vip_purchase_id, combo_position) DO UPDATE
    SET
      combo_multiplier = p_combo_multiplier,
      combo_deposit_percent = p_combo_deposit_percent;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'completed_old_vips', v_completed_count,
    'combo_updated', p_combo_enabled,
    'message', format('VIP approved. %s old VIP(s) completed. Combo %s.',
      v_completed_count,
      CASE WHEN p_combo_enabled THEN 'ENABLED' ELSE 'DISABLED' END)
  );
END;
$$;