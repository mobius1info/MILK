/*
  # Create function to add VIP combo activation

  1. Function
    - admin_add_vip_combo_activation - adds new combo activation
      - Parameters:
        - p_vip_purchase_id (uuid) - the VIP purchase
        - p_start_position (integer) - from which product number (e.g., 9, 15, 20)
        - p_combo_multiplier (integer) - price multiplier (e.g., 2, 3)
        - p_deposit_percent (integer) - percentage of VIP price (e.g., 150, 200)
        - p_notes (text) - optional notes
      - Returns success/error
      - Can add multiple activations per VIP purchase
*/

CREATE OR REPLACE FUNCTION admin_add_vip_combo_activation(
  p_vip_purchase_id uuid,
  p_start_position integer,
  p_combo_multiplier integer,
  p_deposit_percent integer,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_role text;
  v_activation_id uuid;
  v_current_position integer;
BEGIN
  IF p_start_position <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Start position must be greater than 0'
    );
  END IF;

  IF p_combo_multiplier < 1 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Combo multiplier must be at least 1'
    );
  END IF;

  IF p_deposit_percent < 100 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Deposit percent must be at least 100'
    );
  END IF;

  SELECT raw_app_meta_data->>'role' INTO v_admin_role
  FROM auth.users
  WHERE id = auth.uid();

  IF v_admin_role != 'admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only admins can add combo activations'
    );
  END IF;

  SELECT products_completed INTO v_current_position
  FROM vip_purchases
  WHERE id = p_vip_purchase_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'VIP purchase not found'
    );
  END IF;

  IF p_start_position <= v_current_position THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Start position must be greater than current position (%s)', v_current_position)
    );
  END IF;

  INSERT INTO vip_combo_activations (
    vip_purchase_id,
    start_position,
    combo_multiplier,
    deposit_percent,
    created_by,
    is_active,
    notes
  )
  VALUES (
    p_vip_purchase_id,
    p_start_position,
    p_combo_multiplier,
    p_deposit_percent,
    auth.uid(),
    true,
    p_notes
  )
  RETURNING id INTO v_activation_id;

  RETURN jsonb_build_object(
    'success', true,
    'activation_id', v_activation_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION admin_add_vip_combo_activation TO authenticated;