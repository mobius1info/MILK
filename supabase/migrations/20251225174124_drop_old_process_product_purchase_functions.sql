/*
  # Remove Old Product Purchase Functions

  Drops outdated versions of the process_product_purchase function to avoid confusion.
  Only the version with signature (p_user_id uuid, p_vip_purchase_id uuid) should remain.
*/

-- Drop old function with 3 parameters including p_product_id
DROP FUNCTION IF EXISTS process_product_purchase(p_user_id uuid, p_product_id uuid, p_vip_purchase_id uuid);

-- Drop old function with category_id and vip_level
DROP FUNCTION IF EXISTS process_product_purchase(p_category_id text, p_vip_level integer, p_product_id uuid);
