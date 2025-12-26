/*
  # Add is_bonus field to VIP Levels

  1. Changes
    - Add `is_bonus` boolean field to `vip_levels` table
    - Default value is `false`
    - VIP BONUS levels will have `is_bonus = true`
    - These levels won't be shown to clients in purchase list
    - Only visible in admin panel and in client's tasks if granted
  
  2. Notes
    - Admins can create/edit VIP BONUS as regular VIP level
    - Client cannot see or purchase VIP BONUS directly
    - Only admin can grant access via Demo Access tab
*/

-- Add is_bonus field to vip_levels
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vip_levels' AND column_name = 'is_bonus'
  ) THEN
    ALTER TABLE vip_levels ADD COLUMN is_bonus boolean DEFAULT false NOT NULL;
  END IF;
END $$;