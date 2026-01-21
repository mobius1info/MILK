/*
  # Recreate combo_multiplier column without constraints
  
  Drop and recreate the column to remove any hidden constraints.
*/

ALTER TABLE profiles 
  DROP COLUMN IF EXISTS combo_multiplier;

ALTER TABLE profiles 
  ADD COLUMN combo_multiplier integer DEFAULT 3;
