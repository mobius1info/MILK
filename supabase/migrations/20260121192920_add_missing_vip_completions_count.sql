/*
  # Add Missing vip_completions_count Column

  1. Problem
    - Frontend expects vip_completions_count column but it's missing from profiles table
    - This causes client details modal to fail
  
  2. Solution
    - Add vip_completions_count column to profiles table
*/

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS vip_completions_count INTEGER DEFAULT 0;
