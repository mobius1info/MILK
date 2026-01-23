/*
  # Add QR Code URL column to payment_methods
  
  1. Changes
    - Add `qr_code_url` column to `payment_methods` table
    - This column will store optional QR code image URLs for payment methods
  
  2. Notes
    - Column is nullable (optional)
    - Existing records will have NULL value
*/

ALTER TABLE payment_methods 
ADD COLUMN IF NOT EXISTS qr_code_url text;
