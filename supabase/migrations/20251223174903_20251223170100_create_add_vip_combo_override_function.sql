/*
  # Create function to add/update VIP combo overrides

  1. Function
    - admin_add_vip_combo_override - adds a new combo override for a specific VIP purchase
      - Parameters:
        - p_vip_purchase_id (uuid) - the VIP purchase to override
        - p_combo_enabled (boolean) - whether combo is enabled
        - p_combo_multiplier (integer) - the multiplier value
      - Deactivates previous overrides for the same VIP purchase
      - Creates new active override
  
  2. Security
    - Only admins can execute this function
*/

CREATE OR REPLACE FUNCTION admin_add_vip_combo_override(
  p_vip_purchase_id uuid,
  p_combo_enabled boolean,
  p_combo_multiplier integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_role text;
  v_override_id uuid;
BEGIN
  -- Check if user is admin
  SELECT raw_app_meta_data->>'role' INTO v_admin_role
  FROM auth.users
  WHERE id = auth.uid();

  IF v_admin_role != 'admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only admins can add combo overrides'
    );
  END IF;

  -- Deactivate previous overrides for this VIP purchase
  UPDATE vip_purchase_combo_overrides
  SET is_active = false
  WHERE vip_purchase_id = p_vip_purchase_id
    AND is_active = true;

  -- Create new override
  INSERT INTO vip_purchase_combo_overrides (
    vip_purchase_id,
    combo_enabled,
    combo_multiplier,
    created_by,
    is_active
  )
  VALUES (
    p_vip_purchase_id,
    p_combo_enabled,
    p_combo_multiplier,
    auth.uid(),
    true
  )
  RETURNING id INTO v_override_id;

  RETURN jsonb_build_object(
    'success', true,
    'override_id', v_override_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION admin_add_vip_combo_override TO authenticated;