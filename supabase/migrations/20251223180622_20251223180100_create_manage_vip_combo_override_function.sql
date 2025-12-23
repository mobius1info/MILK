/*
  # Create function to manage VIP combo overrides

  1. Function
    - admin_manage_vip_combo_override - adds or updates combo for specific product position
      - Parameters:
        - p_vip_purchase_id (uuid) - the VIP purchase
        - p_product_position (integer) - which product number (1, 2, 3, etc.)
        - p_combo_multiplier (integer) - price multiplier
        - p_vip_price_percentage (integer) - percentage of VIP price (100, 150, 200, etc.)
        - p_notes (text) - optional notes
      - If combo exists for this position, deactivates it and creates new one
      - Returns success/error
*/

DROP FUNCTION IF EXISTS admin_add_vip_combo_override;

CREATE OR REPLACE FUNCTION admin_manage_vip_combo_override(
  p_vip_purchase_id uuid,
  p_product_position integer,
  p_combo_multiplier integer,
  p_vip_price_percentage integer,
  p_notes text DEFAULT NULL
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
  IF p_product_position <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Product position must be greater than 0'
    );
  END IF;

  IF p_combo_multiplier < 1 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Combo multiplier must be at least 1'
    );
  END IF;

  IF p_vip_price_percentage < 100 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'VIP price percentage must be at least 100'
    );
  END IF;

  SELECT raw_app_meta_data->>'role' INTO v_admin_role
  FROM auth.users
  WHERE id = auth.uid();

  IF v_admin_role != 'admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only admins can manage combo overrides'
    );
  END IF;

  UPDATE vip_purchase_combo_overrides
  SET is_active = false
  WHERE vip_purchase_id = p_vip_purchase_id
    AND product_position = p_product_position
    AND is_active = true;

  INSERT INTO vip_purchase_combo_overrides (
    vip_purchase_id,
    product_position,
    combo_multiplier,
    vip_price_percentage,
    created_by,
    is_active,
    notes
  )
  VALUES (
    p_vip_purchase_id,
    p_product_position,
    p_combo_multiplier,
    p_vip_price_percentage,
    auth.uid(),
    true,
    p_notes
  )
  RETURNING id INTO v_override_id;

  RETURN jsonb_build_object(
    'success', true,
    'override_id', v_override_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION admin_manage_vip_combo_override TO authenticated;