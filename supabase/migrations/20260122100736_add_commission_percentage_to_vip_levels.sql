/*
  # Add commission_percentage to vip_levels

  1. Changes
    - Add commission_percentage column to vip_levels
    - Copy existing commission values to commission_percentage
    - Drop old commission column
  
  2. Notes
    - This fixes the admin panel error when updating VIP level commission
*/

-- Add new column
ALTER TABLE vip_levels 
ADD COLUMN IF NOT EXISTS commission_percentage NUMERIC(5,2) DEFAULT 1.00;

-- Copy existing commission values to commission_percentage
UPDATE vip_levels 
SET commission_percentage = commission 
WHERE commission IS NOT NULL;

-- Drop old commission column
ALTER TABLE vip_levels 
DROP COLUMN IF EXISTS commission;
