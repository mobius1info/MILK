/*
  # Add Commission Percentage to VIP Levels
  
  1. Changes
    - Add commission_percentage column to vip_levels table
    - Set commission percentages:
      - VIP 1: 15%
      - VIP 2: 25%
      - VIP 3: 30%
      - VIP 4: 40%
      - VIP 5: 50%
  
  2. Notes
    - Commission percentage means: how much client earns from VIP price as total
    - Example: VIP 3 = $800, 30% = $240 total commission over 25 purchases
    - Each purchase gives: ($800 * 30% / 100) / 25 = $9.6
*/

-- Add commission_percentage column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vip_levels' AND column_name = 'commission_percentage'
  ) THEN
    ALTER TABLE vip_levels ADD COLUMN commission_percentage numeric DEFAULT 0;
  END IF;
END $$;

-- Update commission percentages for each VIP level
UPDATE vip_levels SET commission_percentage = 15 WHERE level = 1;
UPDATE vip_levels SET commission_percentage = 25 WHERE level = 2;
UPDATE vip_levels SET commission_percentage = 30 WHERE level = 3;
UPDATE vip_levels SET commission_percentage = 40 WHERE level = 4;
UPDATE vip_levels SET commission_percentage = 50 WHERE level = 5;
