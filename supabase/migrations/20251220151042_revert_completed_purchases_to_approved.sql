/*
  # Revert completed purchases back to approved status

  1. Changes
    - Change all purchases with status='completed' back to 'approved'
    - They will be marked as completed only when user purchases same VIP again
*/

UPDATE vip_purchases
SET status = 'approved'
WHERE status = 'completed';