/*
  # Remove Old Version of process_product_purchase Function

  ## Overview
  Remove the old version of process_product_purchase that accepts p_commission parameter,
  keeping only the newer version that accepts p_product_id.

  ## Changes
  1. Drop the old function signature with (p_category_id text, p_vip_level integer, p_commission numeric)
  2. Keep the new function signature with (p_category_id text, p_vip_level integer, p_product_id uuid)

  ## Purpose
  - Eliminate function overload confusion
  - Ensure only the correct version is called
  - Fix transaction constraint violations
*/

-- Drop the old version of the function
DROP FUNCTION IF EXISTS process_product_purchase(text, integer, numeric);
