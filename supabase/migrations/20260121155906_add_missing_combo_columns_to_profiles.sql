/*
  # Add missing combo columns to profiles table
  
  1. Changes
    - Add combo_enabled (boolean) for admin to enable/disable combo per user
    - Add combo_deposit_percent (numeric) for combo deposit percentage
    
  2. Notes
    - These columns are needed for the frontend admin panel to load/save combo settings
    - Default values ensure existing profiles work correctly
*/

-- Add combo columns if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS combo_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS combo_deposit_percent NUMERIC(10,2) DEFAULT 50;

-- Update existing profiles with default values
UPDATE profiles
SET 
  combo_enabled = COALESCE(combo_enabled, false),
  combo_deposit_percent = COALESCE(combo_deposit_percent, 50)
WHERE combo_enabled IS NULL OR combo_deposit_percent IS NULL;
