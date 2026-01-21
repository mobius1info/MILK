/*
  # Drop Old approve_vip_purchase Function
  
  Remove the old version of approve_vip_purchase that has numeric parameters.
  This old version may contain code that updates profiles table with combo_multiplier.
*/

DROP FUNCTION IF EXISTS approve_vip_purchase(uuid, uuid, boolean, integer, numeric, numeric);
