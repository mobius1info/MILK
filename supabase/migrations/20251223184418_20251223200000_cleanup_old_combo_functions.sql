/*
  # Cleanup old combo functions

  1. Changes
    - Drop old combo functions that are no longer used
    - Keep only: admin_add_vip_combo_activation and process_product_purchase
    
  2. Functions to remove
    - admin_manage_vip_combo_override
    - admin_set_combo_on_product
    - is_combo_enabled_for_user
*/

DROP FUNCTION IF EXISTS admin_manage_vip_combo_override CASCADE;
DROP FUNCTION IF EXISTS admin_set_combo_on_product CASCADE;
DROP FUNCTION IF EXISTS is_combo_enabled_for_user CASCADE;