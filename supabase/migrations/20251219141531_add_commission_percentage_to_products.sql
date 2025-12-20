/*
  # Add Commission Percentage to Products

  1. Changes
    - Add `commission_percentage` column to `products` table
      - Type: decimal
      - Default: 0.00
      - Description: Commission percentage (0-100) earned when product is purchased
      - Example: 5.00 means 5% commission

  2. Notes
    - This allows each product to have its own commission rate
    - Admin can set commission as a percentage in the admin panel
    - Commission will be calculated as: (product_price * commission_percentage / 100)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'commission_percentage'
  ) THEN
    ALTER TABLE products ADD COLUMN commission_percentage decimal(5,2) DEFAULT 0.00 CHECK (commission_percentage >= 0 AND commission_percentage <= 100);
  END IF;
END $$;