/*
  # Add approval fields to vip_purchases table

  1. Changes
    - Add `approved_at` column (timestamp) to track when VIP purchase was approved/rejected
    - Add `approved_by` column (uuid) to track which admin approved/rejected the purchase
    
  2. Security
    - No RLS changes needed, existing policies remain
*/

-- Add approval tracking fields
ALTER TABLE vip_purchases 
ADD COLUMN IF NOT EXISTS approved_at timestamptz,
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id);