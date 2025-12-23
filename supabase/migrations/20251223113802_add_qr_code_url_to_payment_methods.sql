/*
  # Add QR Code URL to Payment Methods

  1. Changes
    - Add `qr_code_url` column to `payment_methods` table
      - Stores URL or path to QR code image for cryptocurrency payments
      - Optional field (nullable)
      - Text type for storing URLs

  2. Notes
    - This allows admins to upload/set QR code images for crypto payment methods
    - Useful for displaying QR codes to users during deposit process
*/

-- Add qr_code_url column to payment_methods table
ALTER TABLE payment_methods 
ADD COLUMN IF NOT EXISTS qr_code_url text;

-- Add comment for documentation
COMMENT ON COLUMN payment_methods.qr_code_url IS 'URL or path to QR code image for cryptocurrency payments';
