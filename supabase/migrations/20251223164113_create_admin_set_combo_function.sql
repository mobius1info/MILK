/*
  # Create Admin Set Combo Function

  1. Purpose
    - Allows admin to manually set combo on any future product in active VIP purchase
    - Used for manually triggering combo for specific products

  2. Parameters
    - p_vip_purchase_id: The VIP purchase ID
    - p_product_index: The product index to set combo on (1-based)

  3. Validations
    - VIP purchase must be approved
    - Product index must be in valid range
    - Product must not be completed yet
    - Product must be after current position

  4. Security
    - Only admin can execute this function
*/

CREATE OR REPLACE FUNCTION admin_set_combo_on_product(
  p_vip_purchase_id UUID,
  p_product_index INT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vip_purchase RECORD;
  v_result JSON;
BEGIN
  -- Check admin role
  IF (auth.jwt()->>'role') != 'admin' AND 
     (auth.jwt()->'app_metadata'->>'role') != 'admin' THEN
    RAISE EXCEPTION 'Only admin can set combo manually';
  END IF;

  -- Get VIP purchase
  SELECT *
  INTO v_vip_purchase
  FROM vip_purchases
  WHERE id = p_vip_purchase_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'VIP purchase not found';
  END IF;

  -- Validate status
  IF v_vip_purchase.status != 'approved' THEN
    RAISE EXCEPTION 'VIP purchase must be approved to set combo';
  END IF;

  -- Validate product index
  IF p_product_index < 1 OR p_product_index > v_vip_purchase.total_products THEN
    RAISE EXCEPTION 'Product index must be between 1 and %', v_vip_purchase.total_products;
  END IF;

  -- Check if product is already completed
  IF p_product_index <= v_vip_purchase.products_completed THEN
    RAISE EXCEPTION 'Cannot set combo on completed product (product % is completed)', p_product_index;
  END IF;

  -- Update combo settings
  UPDATE vip_purchases
  SET 
    combo_enabled_at_approval = true,
    combo_position_at_approval = p_product_index,
    updated_at = now()
  WHERE id = p_vip_purchase_id;

  v_result := json_build_object(
    'success', true,
    'message', format('Combo set on product %s', p_product_index),
    'vip_purchase_id', p_vip_purchase_id,
    'combo_position', p_product_index
  );

  RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION admin_set_combo_on_product(UUID, INT) TO authenticated;
