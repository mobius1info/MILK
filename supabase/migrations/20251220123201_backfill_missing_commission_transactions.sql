/*
  # Backfill Missing Commission Transactions
  
  ## Overview
  This migration creates transaction records for all existing product purchases
  that don't have corresponding commission transaction entries.
  
  ## Changes
  1. Insert commission transactions for all product_purchases records
  2. Use commission_earned from product_purchases table
  3. Set status to 'approved' since commissions were already credited
  4. Match created_at timestamp from product_purchases
  
  ## Purpose
  - Fix missing commission entries in transaction history
  - Provide complete audit trail for all earnings
  - Ensure users can see their commission history properly
*/

INSERT INTO transactions (user_id, type, amount, status, description, created_at)
SELECT 
  pp.user_id,
  'commission',
  pp.commission_earned,
  'approved',
  CASE 
    WHEN pp.category_id IS NOT NULL AND pp.vip_level IS NOT NULL THEN
      format('Commission earned: %s (VIP %s)', COALESCE(p.name, 'Unknown Product'), pp.vip_level)
    ELSE
      format('Commission earned: %s', COALESCE(p.name, 'Unknown Product'))
  END,
  pp.created_at
FROM product_purchases pp
LEFT JOIN products p ON p.id = pp.product_id
WHERE NOT EXISTS (
  SELECT 1 FROM transactions t
  WHERE t.user_id = pp.user_id
    AND t.type = 'commission'
    AND t.created_at = pp.created_at
    AND t.amount = pp.commission_earned
)
ORDER BY pp.created_at;